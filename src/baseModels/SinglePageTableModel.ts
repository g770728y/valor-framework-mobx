import { observable, computed, action, toJS, reaction } from 'mobx';
import * as R from 'rambdax';
import { settingsStore } from '../globalStores/SettingsStore';
import SingleTableModel, { SingleTableModelData } from './SingleTableModel';

type SinglePageTableModelData<T extends Identity> = {
  meta: PageMeta;
} & SingleTableModelData<T>;

abstract class SinglePageTableModel<T extends Identity> extends SingleTableModel<T> {
  @observable
  data: SinglePageTableModelData<T> = {
    queries: {},
    entities: [],
    meta: { pageSize: settingsStore.data.pageSize, pageNo: 1, total: 0 },
    selection: [],
  };

  constructor() {
    super();
    this.clearQueriesAndMeta = this.clearQueriesAndMeta.bind(this);
  }

  // 用途: 在创建新记录前, 最好先clear一下
  // 原因: 创建了新记录, 如果直接刷新, 那么这条记录很可能被过滤了, 无法显示
  @action
  clearQueriesAndMeta() {
    this.resetQueries({});
    this.patchMeta({ pageNo: 1 });
  }

  @action
  resetQueries = (queries: Partial<T>) => {
    this.data.queries = queries;
    // 总是搜第1页
    this.data.meta.pageNo = 1;
  };

  @action
  resetMeta = (meta: PageMeta) => {
    this.data.meta = meta;
  };

  @action
  patchMeta = (patch: Partial<PageMeta>) => {
    Object.assign(this.data.meta, patch);
  };

  @action
  resetPaged = (result: Paged<T>) => {
    this.resetEntities(result.entities);
    const newMeta = {
      pageNo: result.meta.pageNo || 1,
      pageSize: this.data.meta.pageSize,
      total: result.meta.total,
    };
    this.resetMeta(newMeta);
  };
}

export default SinglePageTableModel;
