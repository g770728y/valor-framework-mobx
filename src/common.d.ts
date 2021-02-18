type ID = string;

interface CurrentUser {
  id: ID;
  account: string;
  name: string;
  roles: string[];
}

interface IUser {
  id: ID;
  name: string;
  account: string;
}
