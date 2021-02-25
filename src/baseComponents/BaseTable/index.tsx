import * as React from 'react';
import { ColumnProps } from 'antd/lib/table';
import { RowSelectionType, TablePaginationConfig } from 'antd/lib/table/interface';
import { Table, TableProps } from 'antd';
import { observer } from 'mobx-react';

interface Props {
  selectable?: boolean;
  dataSource: any[];
  columns: ColumnProps<any>[];
  selectedRowKeys: ID[];
  resetSelectedRowKeys: (keys: ID[]) => void;
  patchMeta: (info: { pageNo?: number; pageSize?: number }) => void;
  meta: PageMeta;
}

const BaseTable: React.FC<Props & TableProps<any>> = ({
  selectable,
  dataSource,
  columns,
  selectedRowKeys,
  resetSelectedRowKeys,
  patchMeta,
  meta,
  ...tableProps
}) => {
  const rowSelection = {
    selectedRowKeys,
    onChange(selectedRowKeys: any[]) {
      selectable && resetSelectedRowKeys(selectedRowKeys);
    },
    type: 'radio' as RowSelectionType,
  };

  const onChange = (pagination: TablePaginationConfig) => {
    patchMeta({ pageNo: pagination.current });
  };

  const pagination: TablePaginationConfig = {
    defaultCurrent: meta.pageNo,
    current: meta.pageNo,
    pageSize: meta.pageSize,
    total: meta.total,
  };
  return (
    <Table
      rowKey="id"
      dataSource={dataSource}
      columns={columns}
      rowSelection={selectable ? rowSelection : undefined}
      onChange={onChange}
      onRow={(record: any) => ({
        onClick: () => selectable && resetSelectedRowKeys([record.id]),
      })}
      pagination={pagination}
      size={'middle'}
      {...tableProps}
    />
  );
};

export default observer(BaseTable);
