import { notification } from 'antd';
import { navigate } from '@reach/router';
import * as R from 'rambdax';
import { appStore } from '../../globalStores/AppStore';
import { extend, RequestOptionsInit } from 'umi-request';
import { handleError, processClientHttpError, processPagedIfPresent } from './common';

/// 总是返回200, result like {status:201, message:"", data: any}
type NormalizedResult<T = any> = {
  status: number;
  data: T;
  message?: string;
};
export function getRequestPopular({
  prefix,
  normalize,
}: {
  prefix: string;
  normalize?: (result: any) => NormalizedResult;
}) {
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
      .then(({ response, data: rawData }) => {
        appStore.afterLoading();
        if (response.ok) {
          const data: NormalizedResult = (normalize || R.identity)(rawData);
          console.log('response,', response, rawData, data);
          if (data.status >= 200 && data.status < 300 && !data.message) {
            console.log(11);
            const token = response.headers.get('X-Valor-Token');
            if (token) {
              localStorage.setItem('token', token);
            }
            return processPagedIfPresent(data.data);
          } else {
            console.log(21);
            const token = response.headers.get('X-Valor-Token');
            if (useErrorHandler && data.status === 401) {
              setTimeout(() => {
                // 让错误显示等生效后再进入/auth
                navigate('/auth', { replace: true });
              });
              return {};
            }
            const serverErrorResult = {
              code: data.status,
              errorMsg: data.message || '服务端未知错, 请查明原因',
            };
            throw serverErrorResult;
          }
        }
      })
      .catch(e => {
        console.log('e', e);
        // e有两种: request返回的e, 及上面throw serverErrorResult 返回的e

        if (e.code && e.errorMsg) {
          console.log(31);
          //这是第一种情况: 服务端返回的不是200
          useErrorHandler && handleError(e);
          throw e;
        }

        // 以下是第二种情况: 客户端错
        appStore.afterLoading();
        /// 客户端错
        const clientErrorResult:
          | { code: number; errorMsg: string }
          | undefined = processClientHttpError(e);
        if (clientErrorResult) {
          useErrorHandler && handleError(clientErrorResult);
          throw clientErrorResult;
        }

        // 以下是第三种情况: 服务端用http-code报错, 这种情况通常不存在, 所以暂时console
        console.error(
          '服务端通过code返回错误信息, 实际通过http-code返回错误, 请查明原因, response如下:',
          e.response,
        );
        const serverErrorResult = { code: 500, errorMsg: '服务端未知错' };
        useErrorHandler && handleError(serverErrorResult);
        throw serverErrorResult;
      });
  };
}

// 打开注释后可测试
// getRequestPopular({ prefix: 'http://117.78.28.239/digitcons/v1' })('/user/auth/login', {
//   method: 'post',
//   data: { account: 'admi', password: 'admin' },
// });
