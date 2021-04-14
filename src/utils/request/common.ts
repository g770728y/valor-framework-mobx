import { notification } from 'antd';
import * as R from 'rambdax';

export const handleError = R.debounce((e: any) => {
  notification.error({
    message: '错误',
    description: e.errorMsg,
  });
}, 300);

export function processClientHttpError(e: any) {
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
        // 也有可能由跨域引起
        errorMsg: '服务器没有响应, 可能正在停机维护',
      };
      return errorResult;
    }
  }
}

export function processPagedIfPresent(data: any) {
  if (R.is(Number, data?.pageNo)) {
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
