// 直接在屏幕上显示日志
// 主要用于企业微信调试
// 不用时请注释此方法
export function logOnScreen(msg: string) {
  // let div = document.getElementById('valor-logger');
  // if (!div) {
  //   div = document.createElement('div');
  //   div.setAttribute('id', 'valor-logger');
  //   div.setAttribute(
  //     'style',
  //     'padding:10px; background: #333;position:fixed;top:0;right:0;color:#fff;max-width:200px;',
  //   );
  // }
  // const msgDiv = document.createElement('div');
  // msgDiv.innerHTML = msg;
  // div.appendChild(msgDiv);
  // document.body.appendChild(div);
}

export function dbg<T>(x: T): T {
  console.log('dbg:', x);
  return x;
}
