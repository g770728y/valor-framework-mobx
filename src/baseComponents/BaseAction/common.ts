import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

export const propsByAction = {
  create: {
    type: 'primary' as any,
    title: '新建',
    Icon: PlusOutlined,
  },
  update: {
    type: 'default' as any,
    title: '修改',
    Icon: EditOutlined,
  },
  delete: {
    type: 'default' as any,
    title: '删除',
    Icon: DeleteOutlined,
  },
};
