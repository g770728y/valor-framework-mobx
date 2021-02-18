import { notification } from 'antd';
import getRequest, { ConfigProps } from 'valor-request';
import { navigate } from '@reach/router';
import * as R from 'rambda';
import * as Rx from 'rambdax';
import { isPlainObject } from 'valor-app-utils';
import { appStore } from '../globalStores/AppStore';

export function formatErrorMsg(msg: any) {
  return isPlainObject(msg)
    ? msg.errors
      ? msg.errors.join(', \n')
      : JSON.stringify(msg.errors)
    : msg;
}

const handleError = Rx.debounce((e: any) => {
  notification.error({
    message: '错误',
    description: formatErrorMsg(e.errorMsg),
  });
}, 400);

const httpCode: ConfigProps = {
  timeout: 60 * 1000,

  onError: e => {
    console.error('后台返回错误:', e);

    if (e.code === 401) navigate('/auth', { replace: true });

    handleError(e);
  },

  beforeRequest: appStore.beforeLoading.bind(appStore),
  afterResponse: appStore.afterLoading.bind(appStore),
  normalize: (result: any) => {
    console.log('后台返回 result:', result);

    if (R.isNil(result)) {
      console.error('返回result为空, 是否网络错? ');
      return { code: 502 };
    }

    // 统一处理分页
    // const data =
    //   result.data && result.data.pageTool ? normalizePagedData(result.data) : result.data;

    return {
      code: 200,
      data: result,
    };
  },

  normalizeHttpError: (code: number, messageBody: any) => {
    console.error('code', code, 'messageBody', messageBody);
    return {
      code,
      errorMsg: messageBody,
    };
  },
};

// const request = getRequest({...commonParams,   prefix: ApiPath});
// export default request;

const requestConfigProps = {
  /// 通过httpCode返回错误码
  /// 返回值格式: 裸data, 比如: 数组, 数字, json
  classics: httpCode,
  /// 总是返回200, 错误码体现在返回值
  /// 返回值格式: {data,code,msg}
  // fashion : 总是返回200
};
export default requestConfigProps;
