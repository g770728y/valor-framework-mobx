import { toJS } from 'mobx';

// 封装mobx.toJS
export function tojs(o: any) {
  return toJS(o, { recurseEverything: true });
}
