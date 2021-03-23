import { observable, computed, action, toJS, reaction } from 'mobx';
import * as R from 'rambdax';
import DisposableModel from './DisposableModel';
import { settingsStore } from '../globalStores/SettingsStore';
import { insertIndex } from 'valor-app-utils';

export interface SingleTableModelData<T extends Identity> {
  queries: Partial<T> & { [k: string]: any };
  entities: T[];
  selection: ID[];
}

abstract class SingleTableModel<T extends Identity> extends DisposableModel {
  @observable
  data: SingleTableModelData<T> = {
    queries: {},
    entities: [],
    selection: [],
  };

  abstract getPageParams(): any;

  constructor() {
    super();
  }

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
  resetQueries = (queries: Partial<T>) => {
    this.data.queries = queries;
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
}

export default SingleTableModel;
