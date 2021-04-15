import { observable, action, computed, toJS, runInAction } from 'mobx';
import { findTreeNode, max, tree2Array, array2tree_byLevel, insertIndex } from 'valor-app-utils';
import { TreeRootID } from '../constants';
import DisposableModel from './DisposableModel';
import * as R from 'rambdax';

interface SingleTreeModelData<T extends BaseTreeNode> {
  tree: T;
  selection: ID[];
  queries: Partial<T> & { [k: string]: any };
}
abstract class SingleTreeModel<T extends BaseTreeNode> extends DisposableModel {
  loading = false;

  @observable
  data: SingleTreeModelData<T> = {
    tree: ({ id: -1 } as any) as T,
    selection: [],
    queries: {},
  };

  constructor() {
    super();
  }

  @computed
  get isEmpty() {
    const children = (this.data.tree as any)['children'];
    return !children || children.length === 0;
  }

  @computed
  get selected(): T | null {
    const selectedId =
      this.data && this.data.selection && this.data.selection.length > 0
        ? this.data.selection[0]
        : null;
    if (selectedId) {
      const selectedItem = findTreeNode(this.data.tree, (item: any) => item.id === selectedId)!;
      return selectedItem as T;
    }
    return null;
  }

  getFlated = () => {
    return tree2Array(this.data.tree);
  };

  fetch = (): Promise<void> => {
    throw new Error('not implemented');
  };
  delete = (): Promise<void> | undefined => {
    throw new Error('not implemented');
  };
  update = (entity: Partial<T>): Promise<void> => {
    throw new Error('not implemented');
  };
  create = (entity: Partial<T>): Promise<T> => {
    throw new Error('not implemented');
  };
  swap = (params: { id: ID; [key: string]: any }[]): Promise<void> => {
    throw new Error('not implemented');
  };

  getDefaultSelection = (): ID[] => {
    return [];
  };

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
  list2tree = (entities: any): T => {
    throw new Error('暂未完成本方法');
    // return array2tree_byLevel(entities);
  };

  // 将tree转为后台数据
  tree2list = (tree: T) => {
    return tree2Array(tree);
  };
  /************* end: 转换树与后台数据 *********************************/

  @action
  resetQueries = (queries: Partial<T>) => {
    this.data.queries = queries;
  };

  @action
  reset = (entities: T[]) => {
    this.resetTree(this.list2tree(entities));
  };

  getTreeNode = (id: ID): T | undefined => {
    return findTreeNode(this.data.tree as any, node => node.id + '' === id + '') as any;
  };

  @action
  onSelect = (id: ID) => {
    this.data.selection.push(id);
  };

  // 创建选中节点的最后一个孩子
  createChild = (values: Partial<T>) => {
    if (this.loading) return;

    const selectedItem = this.selected;
    if (selectedItem) {
      this.loading = true;
      const children = (selectedItem as any)['children'] || [];
      const idx =
        max(
          children.map((it: any) => it['index']),
          0,
        ) + 1;
      this.create({
        ...values,
        pid: selectedItem.id,
        index: idx,
      }).then(item => {
        this.loading = false;
        runInAction(() => {
          selectedItem.children = [...(selectedItem.children || []), item];
        });
        return item;
      });
    }
  };

  getRootId = () => {
    return TreeRootID;
  };

  // 创建下一个相邻节点
  createAdjacent = (values: Partial<T>) => {
    if (this.loading) return;

    if (this.isEmpty) {
      this.loading = true;
      this!.create({ ...values, parentId: this.getRootId() }).then(result => {
        this.loading = false;
        return result;
      });
    } else {
      this.loading = true;
      const selectedItem = this.selected;
      const parentItem = this.getTreeNode((selectedItem! as any)['pid']);
      const idx = (selectedItem! as any).index + 1;

      if (selectedItem) {
        this.create({
          ...values,
          pid: (selectedItem as any)['pid'],
          index: idx,
        }).then(item => {
          this.loading = false;
          runInAction(() => {
            parentItem!.children = insertIndex(parentItem!.children!, idx, item);
            // 移动下面的节点
            parentItem!.children = parentItem!.children.map(it =>
              it.index! > idx ? { ...it, index: it.index! + 1 } : it,
            );
          });
          return item;
        });
      }
    }
  };

  getNode = (id: ID): T => {
    return findTreeNode(this.data.tree, (item: any) => item.id === id)! as T;
  };

  getParent = (id: ID): T => {
    const _item = this.getNode(id);
    const parentItem = findTreeNode(this.data.tree, (item: any) => {
      return item.id === (_item as any)['pid'];
    })!;
    return parentItem as T;
  };

  getSiblings = (id: ID): T[] => {
    const parent = this.getParent(id);
    return ((parent as any)['children'] || []).sort(
      (it1: any, it2: any) => (it1 as any)['index'] - (it2 as any)['index'],
    );
  };

  getPrev = (id: ID): T | null => {
    const _item = this.getNode(id);
    const prevSiblings = this.getSiblings(id).filter(
      it => (it as any)['index'] < (_item as any)['index'],
    );
    if (prevSiblings.length === 0) return null;
    return prevSiblings[prevSiblings.length - 1];
  };

  getNext = (id: ID) => {
    const _item = this.getNode(id);
    const nextSiblings = this.getSiblings(id).filter(
      it => (it as any)['index'] > (_item as any)['index'],
    );
    if (nextSiblings.length === 0) return null;
    return nextSiblings[0];
  };
}

export default SingleTreeModel;
