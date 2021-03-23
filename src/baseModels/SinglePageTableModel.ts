import { observable, computed, action, toJS, reaction } from 'mobx';
import * as R from 'rambdax';
import { insertIndex } from 'valor-app-utils';
import { settingsStore } from '../globalStores/SettingsStore';
import { tojs } from '../utils';
import DisposableModel from './DisposableModel';
import SingleTableModel, { SingleTableModelData } from './SingleTableModel';

type SinglePageTableModelData<T extends Identity> = {
  meta: PageMeta;
} & SingleTableModelData<T>;

/**
 * 注意: 如果继承SingleTableModel, 则mobx会出现莫名其妙的问题: 具体为:
 * 1. 设置一个computed entities, 用queries确定entities
 * 2. 在quereis里输入, 报错: 严格模式下 无法在Action外改
 * 最终只好取消继承
 */
abstract class SinglePageTableModel<T extends Identity> extends DisposableModel {
  abstract getPageParams(): any;
  abstract fetch(): void;
  abstract delete(id?: ID): void;

  @computed
  get selected(): T | null | undefined {
    const selectedId = this.data.selection.length > 0 ? this.data.selection[0] : null;
    return selectedId ? this.data.entities.find(entity => entity.id === selectedId) : null;
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
  deleteEntity = (id: ID) => {
    const idx = this.data.entities.findIndex(it => it.id === id);
    const nextIdx = idx === this.data.entities.length - 1 ? idx - 1 : idx;
    const nextId = this.data.entities[nextIdx]?.id;

    this.data.entities = this.data.entities.filter(it => it.id !== id);
    if (this.data.entities.length > 0 && nextIdx >= 0) {
      this.resetSelection([nextId!]);
    }
  };

  @action
  createEntity = (entity: T, idx = 0 /*默认放到顶部*/) => {
    this.data.entities = insertIndex(this.data.entities, idx, entity);
    this.resetSelection([entity.id]);
  };

  @action
  patchEntity = (id: ID, entity: Partial<T>) => {
    const index = this.data.entities.findIndex(it => it.id === id);
    const newEntity = { ...this.data.entities[index], ...entity };
    this.data.entities = R.update(index, newEntity, this.data.entities) as T[];
  };

  getEntity(id: ID): T | undefined {
    return this.data.entities.find(it => it!.id === id);
  }

  getEntityIndex(id: ID): number {
    return this.data.entities.findIndex(it => it.id === id);
  }

  getSelectedIndex(): number {
    if (!this.selected) return -1;
    return this.getEntityIndex(this.selected.id);
  }

  ////////////////////////////////////////////
  @observable
  data: SinglePageTableModelData<T> = {
    queries: {},
    entities: [],
    meta: { pageSize: settingsStore.data.pageSize, pageNo: 1, total: 0 },
    selection: [],
  };

  constructor() {
    super();
  }

  // 用途: 在创建新记录前, 最好先clear一下
  // 原因: 创建了新记录, 如果直接刷新, 那么这条记录很可能被过滤了, 无法显示
  @action
  clearQueriesAndMeta = () => {
    this.resetQueries({});
    this.patchMeta({ pageNo: 1 });
  };

  @action
  resetQueries = (queries: Partial<T>) => {
    this.data.queries = queries;
    // 总是搜第1页
    this.patchMeta({ pageNo: 1 });
  };

  @action
  resetMeta = (meta: PageMeta) => {
    this.data.meta = meta;
  };

  @action
  patchMeta = (patch: Partial<PageMeta>) => {
    console.log('patch', tojs(patch));
    this.resetMeta({ ...this.data.meta, ...patch });
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
