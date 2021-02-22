import * as React from 'react';
import styles from './index.module.less';
import { HSpacer } from 'valor-random-ui';
import { observer } from 'mobx-react-lite';
import { ModalContext } from 'react-promisify-modal';
import { Button } from 'antd';
import { toJS } from 'mobx';
import { confirm } from '../../utils/ui';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface Props {
  createConfig?: {
    title?: string;
    DialogComponent: any;
    dialogTitle: string;
    onSubmit: any;
    // 附加参数, 比如 添加 Resource,需要附加 {classifyId}
    entity?: any;
  };
  updateConfig?: {
    title?: string;
    DialogComponent: any;
    dialogTitle: string;
    onSubmit: any;
    entity: any;
  };
  deleteConfig?: {
    title?: string;
    msg?: string;
    entity: any;
    onSubmit: any;
  };
}

const Action: React.FC<Props> = ({ createConfig, updateConfig, deleteConfig }) => {
  const { openModal } = React.useContext(ModalContext);

  const onCreate = () => {
    if (!createConfig) return;
    const CreateDialog = createConfig.DialogComponent;
    // 创建时提供的entity, 肯定 是 object, 所以不需要 toJS
    openModal!(args => (
      <CreateDialog
        title={createConfig.dialogTitle}
        {...args}
        values={{ ...createConfig.entity }}
        onSubmit={createConfig.onSubmit}
      />
    ));
  };

  const onUpdate = () => {
    if (!updateConfig) return;
    const UpdateDialog = updateConfig.DialogComponent;
    openModal!(args => (
      <UpdateDialog
        title={updateConfig.dialogTitle}
        {...args}
        values={toJS(updateConfig.entity, { recurseEverything: true }) as any}
        onSubmit={updateConfig.onSubmit}
      />
    ));
  };

  const onDelete = () => {
    if (!deleteConfig) return;
    confirm(deleteConfig.msg || '删除后不可恢复。是否确定删除?').then(result => {
      if (result) {
        deleteConfig.onSubmit();
      }
    });
  };

  return (
    <div className={styles['container']}>
      {createConfig && (
        <>
          <Button onClick={onCreate} type="primary" icon={<PlusOutlined />}>
            {createConfig.title || '新建'}
          </Button>
          <HSpacer size={10} />
        </>
      )}
      {updateConfig && (
        <>
          <Button
            disabled={!updateConfig.entity}
            onClick={onUpdate}
            type="default"
            icon={<EditOutlined />}
          >
            {updateConfig.title || '修改'}
          </Button>
          <HSpacer size={10} />
        </>
      )}
      {deleteConfig && (
        <Button
          disabled={!deleteConfig.entity}
          onClick={onDelete}
          type="default"
          icon={<DeleteOutlined />}
        >
          {deleteConfig.title || '删除'}
        </Button>
      )}
    </div>
  );
};

export default observer(Action);
