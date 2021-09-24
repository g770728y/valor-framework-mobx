import * as React from 'react';
import { ColumnProps } from 'antd/es/table';
import {
  RowSelectionType,
  TablePaginationConfig,
  TableRowSelection,
} from 'antd/es/table/interface';
import { Table, TableProps } from 'antd';
import { observer } from 'mobx-react';

interface Props {
  selectable?: boolean;
  dataSource: any[];
  columns: ColumnProps<any>[];
  selectedRowKeys: ID[];
  resetSelectedRowKeys: (keys: ID[]) => void;
  patchMeta?: (info: { pageNo?: number; pageSize?: number }) => void;
  meta?: PageMeta;
  selectType?: 'radio' | 'checkbox';
  onDoubleClick?: (keys: ID[]) => void;
  renderSelectionCell?: TableRowSelection<any>['renderCell'];
  // 控制checkbox的props, 比如disabled
  getCheckboxProps?: (record: any) => any;
}

const BaseTable: React.FC<Props & TableProps<any>> = ({
  selectable,
  dataSource,
  columns,
  selectedRowKeys,
  resetSelectedRowKeys,
  patchMeta,
  meta,
  onDoubleClick,
  selectType = 'radio',
  renderSelectionCell,
  getCheckboxProps,
  ...tableProps
}) => {
  const rowSelection: TableProps<any>['rowSelection'] = {
    selectedRowKeys,
    onChange(selectedRowKeys: any[]) {
      selectable && resetSelectedRowKeys(selectedRowKeys);
    },
    type: selectType,
    renderCell: renderSelectionCell || undefined,
    getCheckboxProps,
  };

  const onChange = (pagination: TablePaginationConfig) => {
    patchMeta && patchMeta({ pageNo: pagination.current, pageSize: pagination.pageSize || 10 });
  };

  const pagination: TablePaginationConfig | false = meta
    ? {
        defaultCurrent: meta.pageNo,
        current: meta.pageNo,
        pageSize: meta.pageSize,
        total: meta.total,
      }
    : false;

  return (
    <Table
      rowKey="id"
      dataSource={dataSource}
      columns={columns}
      rowSelection={selectable ? rowSelection : undefined}
      onChange={onChange}
      onRow={(record: any) => ({
        onClick: () => selectable && resetSelectedRowKeys([record.id]),
        onDoubleClick: () => selectable && onDoubleClick && onDoubleClick([record.id]),
      })}
      pagination={pagination}
      size={'middle'}
      {...tableProps}
    />
  );
};

export default observer(BaseTable);
