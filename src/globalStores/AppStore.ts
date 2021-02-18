import { action, computed, observable } from 'mobx';

export interface GlobalStoreData {
  loadingCount: number;
  initialized: boolean;
}

export class AppStore {
  @observable
  data: GlobalStoreData = { loadingCount: 0, initialized: false };

  constructor() {}

  @action
  setInitialized(initialized: boolean) {
    this.data.initialized = true;
  }

  @computed
  get loading() {
    return this.data.loadingCount > 0;
  }

  @action.bound
  beforeLoading() {
    this.data.loadingCount = this.data.loadingCount + 1;
  }

  @action.bound
  afterLoading() {
    this.data.loadingCount = this.data.loadingCount - 1;
  }
}

export const appStore = new AppStore();
