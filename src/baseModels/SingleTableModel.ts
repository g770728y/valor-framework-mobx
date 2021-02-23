import { observable, computed, action, toJS, reaction } from 'mobx';
import * as RX from 'rambdax';
import * as R from 'rambda';
import DisposableModel from './DisposableModel';
import { settingsStore } from '../globalStores/SettingsStore';

interface SingleTableModelData<T extends Identity> {
  queries: Partial<T> & { [k: string]: any };
  entities: T[];
  meta: PageMeta;
  selection: ID[];
}

abstract class SingleTableModel<T extends Identity> extends DisposableModel {
  @observable
  data: SingleTableModelData<T> = {
    queries: {},
    entities: [],
    meta: { pageSize: settingsStore.data.pageSize, pageNo: 1, total: 0 },
    selection: [],
  };

  fetchByDebounce: any;

  abstract getPageParams(): any;

  constructor() {
    super();
    this.fetchByDebounce = RX.debounce(() => this.fetch(), 300);
    this.clearQueriesAndMeta = this.clearQueriesAndMeta.bind(this);

    // hack: settimeout的目的: 确保子类的getPageParams抽象方法加载上来
    setTimeout(() => {
      this.disposers.push(
        reaction(
          () => toJS(this.getPageParams(), { recurseEverything: true }),
          args => {
            this.fetchByDebounce();
          },
          { equals: R.equals },
        ),
      );
    }, 0);
  }

  abstract fetch(): void;

  abstract delete(id?: ID): void;

  @computed
  get selected(): T | null | undefined {
    const selectedId = this.data.selection.length > 0 ? this.data.selection[0] : null;
    return selectedId ? this.data.entities.find(entity => entity.id === selectedId) : null;
  }

  // 用途: 在创建新记录前, 最好先clear一下
  // 原因: 创建了新记录, 如果直接刷新, 那么这条记录很可能被过滤了, 无法显示
  @action
  clearQueriesAndMeta() {
    this.resetQueries({});
    this.patchMeta({ pageNo: 1 });
  }

  @action
  resetEntities = (entities: T[]) => {
    // 复位后, 可能有选择已失效
    const ids = entities.map(it => it.id);
    const selection = this.data.selection.filter(it => ids.includes(it));
    this.data.selection = selection.length > 0 ? selection : ids.length > 0 ? [ids[0]] : [];

    this.data.entities = entities;
  };

  @action
  resetQueries = (queries: Partial<T>) => {
    this.data.queries = queries;
    // 总是搜第1页
    this.data.meta.pageNo = 1;
  };

  @action
  resetSelection = (ids: ID[]) => {
    const oldSelection = toJS(this.data.selection).sort();
    const newSelection = ids.sort();
    if (!R.equals(oldSelection, newSelection)) {
      this.data.selection = newSelection;
    }
  };

  @action
  clearSelection = () => {
    this.data.selection = [];
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

  getEntity(id: ID): T | undefined {
    return this.data.entities.find(it => it!.id === id);
  }
}

export default SingleTableModel;
