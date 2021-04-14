type ID = number | string;

interface CurrentUser<U = any> {
  id: ID;
  account: string;
  name: string;
  roles: string[];
  // 这里可以保存后台返回的用户
  user?: U;
}

interface IUser {
  id: ID;
  name: string;
  account: string;
}

interface PageRequest {
  pageNo: number;
  pageSize: number;
}
