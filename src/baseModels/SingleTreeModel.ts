import { observable, action, computed, toJS } from 'mobx';
import { findTreeNode, max, tree2Array, array2tree_byLevel } from 'valor-app-utils';
import { TreeRootID } from '../constants';
import DisposableModel from './DisposableModel';
import * as R from 'rambdax';

interface SingleTreeModelData<T extends BaseTreeNode> {
  tree: T;
  selection: ID[];
  queries: Partial<T> & { [k: string]: any };
  meta: PageMeta;
}
interface KeyMapping {
  index: string;
  pid: string;
  children: string;
}

abstract class SingleTreeModel<T extends BaseTreeNode> extends DisposableModel {
  loading = false;

  @observable
  data: SingleTreeModelData<T> = {
    tree: ({ id: -1 } as any) as T,
    selection: [],
    queries: {},
    meta: { pageNo: 1, pageSize: 100000, total: 0 },
  };

  keyMapping: KeyMapping;

  constructor(config: { keyMapping: Partial<KeyMapping> }) {
    super();
    console.info(
      '注意: SingleTreePageModel启用了KeyMapping , 但 其中用到的 findTreeNode 方法 其实限定死了 id /pid /children, 后期改进',
    );
    this.keyMapping = {
      index: 'index',
      pid: 'pid',
      children: 'children',
      ...config.keyMapping,
    };

    this.createChild = this.createChild.bind(this);
    this.createAdjacent = this.createAdjacent.bind(this);
  }

  @computed
  get isEmpty() {
    const children = (this.data.tree as any)[this.keyMapping.children];
    return !children || children.length === 0;
  }

  @computed
  get selected(): T | null {
    const selectedId =
      this.data && this.data.selection && this.data.selection.length > 0
        ? this.data.selection[0]
        : null;
    if (selectedId) {
      // TODO: 注意: findTreeNode 限定死了 children 命名, 需要改进
      const selectedItem = findTreeNode(this.data.tree, (item: any) => item.id === selectedId)!;
      return selectedItem as T;
    }
    return null;
  }

  getFlated = () => {
    return tree2Array(this.data.tree);
  };

  abstract fetch(): Promise<void>;
  abstract delete(): Promise<void> | undefined;
  abstract update(entity: Partial<T>): Promise<void>;
  abstract create(entity: Partial<T>): Promise<void>;
  abstract swap(params: { id: ID; [key: string]: any }[]): Promise<void>;

  getDefaultSelection(): ID[] {
    return [];
  }

  @action
  resetTree = (tree: T) => {
    const flatedIds = tree2Array(tree).map(it => it.id);
    // 复位后, 可能有选择已失效
    const selection = this.data.selection.filter(it => flatedIds.includes(it));
    const defaultSelection = this.getDefaultSelection();
    this.data.selection =
      selection.length > 0
        ? selection
        : !R.isEmpty(defaultSelection)
        ? defaultSelection
        : flatedIds.length > 0
        ? [flatedIds[0]]
        : [];
    this.data.tree = tree;
  };
  @action
  resetSelection = (ids: ID[]) => {
    if (ids && ids.length > 0) {
      this.data.selection = ids;
    }
  };
  @action
  clearSelection = () => {
    this.data.selection = [];
  };

  /************* begin: 转换树与后台数据 *********************************/
  // 将后台数据返回的result.data转为tree
  normalize = (entities: any): T => {
    throw new Error('暂未完成本方法');
    // return array2tree_byLevel(entities);
  };

  // 将tree转为后台数据
  serialize = (tree: T) => {
    return tree2Array(tree);
  };
  /************* end: 转换树与后台数据 *********************************/

  /************* begin: 支持分页和查询条件 *********************************/
  @action
  resetQueries = (queries: Partial<T>) => {
    this.data.queries = queries;
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
    this.resetTree(this.normalize(result.entities));
    const newMeta = {
      pageNo: result.meta.pageNo || 1,
      pageSize: this.data.meta.pageSize,
      total: result.meta.total,
    };
    this.resetMeta(newMeta);
    throw new Error('上述分页与查询方法未经过验证');
  };

  /************* end: 支持分页和查询条件 *********************************/

  getTreeNode(id: ID): T | undefined {
    return findTreeNode(this.data.tree as any, node => node.id + '' === id + '') as any;
  }

  @action
  onSelect = (id: ID) => {
    this.data.selection.push(id);
  };

  // 创建选中节点的最后一个孩子
  createChild(values: Partial<T>) {
    if (this.loading) return;

    const selectedItem = this.selected;
    if (selectedItem) {
      this.loading = true;
      const childrenName = this.keyMapping['children'];
      const children = (selectedItem as any)[childrenName] || [];
      const idx =
        max(
          children.map((it: any) => it[this.keyMapping['index']]),
          0,
        ) + 1;
      this.create({
        ...values,
        [this.keyMapping['pid']]: selectedItem.id,
        [this.keyMapping['index']]: idx,
      }).then(result => {
        this.loading = false;
        return result;
      });
    }
  }

  getRootId() {
    return TreeRootID;
  }

  // 创建下一个相邻节点
  createAdjacent(values: Partial<T>) {
    if (this.loading) return;

    if (this.isEmpty) {
      this.loading = true;
      this!.create({ ...values, parentId: this.getRootId(), showNum: 0 }).then(result => {
        this.loading = false;
        return result;
      });
    } else {
      this.loading = true;
      const selectedItem = this.selected;
      const parentItem = this.getTreeNode((selectedItem! as any)[this.keyMapping['pid']]);
      const children = (parentItem as any)[this.keyMapping['children']] || [];
      const idx = max(children.map((it: any) => it[this.keyMapping['index']])) + 1;

      if (selectedItem) {
        this.create({
          ...values,
          [this.keyMapping['pid']]: (selectedItem as any)[this.keyMapping['pid']],
          [this.keyMapping['index']]: idx,
        }).then(result => {
          this.loading = false;
          return result;
        });
      }
    }
  }

  // 上移
  moveUp = () => {
    if (this.loading) return;

    // console.log('moveup');
    if (!this.selected) return;
    const selectedItem = this.selected!;

    const prevItem = this.getPrev(selectedItem.id);
    if (selectedItem && prevItem) {
      this.loading = true;
      this.swap([
        {
          id: selectedItem.id,
          [this.keyMapping['index']]: (prevItem as any)[this.keyMapping['index']],
        },
        {
          id: prevItem.id,
          [this.keyMapping['index']]: (selectedItem as any)[this.keyMapping['index']],
        },
      ]).then(result => {
        this.loading = false;
        return result;
      });
    }
  };

  moveDown = () => {
    if (this.loading) return;

    if (!this.selected) return;
    const selectedItem = this.selected;

    const nextItem = this.getNext(selectedItem.id);
    if (selectedItem && nextItem) {
      this.loading = true;
      this.swap([
        {
          id: selectedItem.id,
          [this.keyMapping['index']]: (nextItem as any)[this.keyMapping['index']],
        },
        {
          id: nextItem.id,
          [this.keyMapping['index']]: (selectedItem as any)[this.keyMapping['index']],
        },
      ]).then(result => {
        this.loading = false;
        return result;
      });
    }
  };

  getNode = (id: ID): T => {
    return findTreeNode(this.data.tree, (item: any) => item.id === id)! as T;
  };

  getParent = (id: ID): T => {
    const _item = this.getNode(id);
    const parentItem = findTreeNode(this.data.tree, (item: any) => {
      return item.id === (_item as any)[this.keyMapping['pid']];
    })!;
    return parentItem as T;
  };

  getSiblings = (id: ID): T[] => {
    const parent = this.getParent(id);
    return ((parent as any)[this.keyMapping['children']] || []).sort(
      (it1: any, it2: any) =>
        (it1 as any)[this.keyMapping['index']] - (it2 as any)[this.keyMapping['index']],
    );
  };

  getPrev = (id: ID): T | null => {
    const _item = this.getNode(id);
    const prevSiblings = this.getSiblings(id).filter(
      it => (it as any)[this.keyMapping['index']] < (_item as any)[this.keyMapping['index']],
    );
    if (prevSiblings.length === 0) return null;
    return prevSiblings[prevSiblings.length - 1];
  };

  getNext = (id: ID) => {
    const _item = this.getNode(id);
    const nextSiblings = this.getSiblings(id).filter(
      it => (it as any)[this.keyMapping['index']] > (_item as any)[this.keyMapping['index']],
    );
    if (nextSiblings.length === 0) return null;
    return nextSiblings[0];
  };
}

export default SingleTreeModel;
