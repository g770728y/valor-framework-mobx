type ID = string | number;

interface Identity {
  id: ID;
}

interface BaseTreeNode extends Identity {
  pid?: ID;
  children?: BaseTreeNode[];
}

interface PageMeta {
  pageNo: number;
  pageSize: number;
  // 记录总数
  total: number;
}

interface Paged<T = any> {
  entities: T[];
  meta: PageMeta;
}
