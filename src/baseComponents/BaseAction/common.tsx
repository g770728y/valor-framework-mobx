import * as React from 'react';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

export const propsByAction = {
  create: {
    type: 'primary' as any,
    title: '新建',
    icon: <PlusOutlined />,
  },
  update: {
    type: 'default' as any,
    title: '修改',
    icon: <EditOutlined />,
  },
  delete: {
    type: 'default' as any,
    title: '删除',
    icon: <DeleteOutlined />,
  },
};
