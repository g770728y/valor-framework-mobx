import * as React from 'react';
import { ModalProvider } from 'react-promisify-modal';

export function wrapModalProvider<P = {}>(C: React.ComponentClass<P> | React.FC<P>) {
  return (props: P) => (
    <ModalProvider>
      <C {...props} />
    </ModalProvider>
  );
}
