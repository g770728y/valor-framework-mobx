import { notification } from 'antd';
import { navigate } from '@reach/router';
import * as R from 'rambda';
import * as Rx from 'rambdax';
import { appStore } from '../globalStores/AppStore';
import { extend, RequestOptionsInit } from 'umi-request';

const handleError = Rx.debounce((e: any) => {
  notification.error({
    message: '错误',
    description: e.errorMsg,
  });
}, 300);

/// 错误使用http-code返回(对应的情况是总是返回200)
export function getRequestClassics({ prefix }: { prefix: string }) {
  const request = extend({
    prefix,
    useCache: false,
    timeout: 15_000,
    maxCache: 0,
    ttl: 60_000,
    credentials: 'omit',
    // 为true, 则在then里可直接使用原始的response
    getResponse: true,
  });

  return (
    url: string,
    _options: RequestOptionsInit = {},
    /// 如果为true, 则handleError生效, 一般用于弹窗
    /// 无论为true还是false, 都需抛出错误 ( 如果不throw, 则可能进入 then->catch->then 的then这一步 )
    useErrorHandler = true,
  ) => {
    appStore.beforeLoading();

    const options = {
      ..._options,
      headers: (() => {
        const token = localStorage.getItem('token');
        return { Authorization: `Bearer ${token}` };
      })(),
    };

    return request(url, options)
      .then(result => {
        appStore.afterLoading();
        const token = result.response.headers.get('X-Valor-Token');
        if (token) {
          localStorage.setItem('token', token);
        }

        return processPagedIfPresent(result.data);
      })
      .catch(e => {
        appStore.afterLoading();
        /// 客户端错
        const clientErrorResult:
          | { code: number; errorMsg: string }
          | undefined = processClientHttpError(e);
        if (clientErrorResult) {
          useErrorHandler && handleError(clientErrorResult);
          return;
        }

        /// 服务端错
        return e.response.json().then((errorBody: any) => {
          const code = e.response.status;

          const error = errorBody.error || errorBody.errors;
          const errorMsg = error
            ? Array.isArray(error)
              ? error.join(',')
              : error
            : '服务端返回未知错误';

          const serverErrorResult = {
            code,
            errorMsg,
          };

          // 处理401 (注意: loginByToken时显然不需要navigate)
          if (useErrorHandler && code === 401) {
            setTimeout(() => {
              // 让错误显示等生效后再进入/auth
              navigate('/auth', { replace: true });
            });
          }

          useErrorHandler && handleError(serverErrorResult);
          throw serverErrorResult;
        });
      });
  };
}

// 打开注释后可测试
// getRequest({})('/auth/login', {
//   method: 'post',
//   data: { account: 'admin', password1: 'admin' },
// });

function processClientHttpError(e: any) {
  if (e.name === 'RequestError' && (e.message || '').startsWith('timeout')) {
    const errorResult = {
      code: 502,
      errorMsg: '网络请求超时, 请稍后重试',
    };
    return errorResult;
  }

  if (e.name === 'TypeError') {
    if (e.message === 'Network request failed') {
      const errorResult = {
        code: 1000,
        errorMsg: '断网了, 请检查网络',
      };
      return errorResult;
    } else {
      const errorResult = {
        code: 1000,
        errorMsg: '网络问题, 可能是跨域引起',
      };
      return errorResult;
    }
  }
}

function processPagedIfPresent(data: any) {
  if (R.is(Number, data.pageNo)) {
    // 需要分页
    return {
      meta: {
        pageNo: data.pageNo,
        pageSize: data.pageSize,
        total: data.total,
      },
      entities: data.entities,
    };
  } else {
    return data;
  }
}

export function mapPageEntities<F, T>(mapf: (f: F) => T) {
  return (pageData: Paged<F>): Paged<T> => {
    return {
      ...pageData,
      entities: pageData.entities.map(mapf),
    };
  };
}
