import { IReactionDisposer } from 'mobx';

class DisposableModel {
  constructor() {
    this.dispose = this.dispose.bind(this);
  }

  disposers: IReactionDisposer[] = [];

  dispose() {
    this.disposers.forEach(it => it());
  }
}

export default DisposableModel;
