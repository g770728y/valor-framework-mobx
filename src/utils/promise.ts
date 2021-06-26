export function delay(ms: number, f: () => void | PromiseLike<void>): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(f());
    }, ms);
  });
}
