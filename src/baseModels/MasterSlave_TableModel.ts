import SingleTreeModel from './SingleTreeModel';
import SingleTableModel from './SingleTableModel';
import DisposableModel from './DisposableModel';

abstract class MasterSlave_TableModel<
  S1 extends Identity,
  S2 extends Identity
> extends DisposableModel {
  abstract master: SingleTableModel<S1>;
  abstract slave: SingleTableModel<S2>;

  constructor() {
    super();
    // 必须等初始化完成再调用
    setTimeout(() => {
      this.fetchSlaveWhenMasterChange();
    }, 0);
    this.dispose = this.dispose.bind(this);
  }

  // 当Master改变时, 重新提取slave的数据. 请使用 computed(() => ...) 风格
  abstract fetchSlaveWhenMasterChange(): void;

  dispose() {
    super.dispose();
    this.master.dispose();
    this.slave.dispose();
  }
}

export default MasterSlave_TableModel;
