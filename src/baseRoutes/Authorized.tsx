import * as React from 'react';
import { Redirect } from '@reach/router';
import { isAuthorized } from '../rbac';

interface Props {
  user: CurrentUser;
  // 要认证的路由, 需要什么权限
  // 例: 用户管理页面, authority=['admin']
  authority?: string[];
  noMatch?: React.ReactElement | null;
}

// 此组件实际承担两个职责, 有待思考是否拆分
// 1. 认证职责(顺带实现)
// 2. 判断权限职责(这是本意)
// 3. authority 可以从 settingsStore 中读取
export const Authorized: React.FC<Props> = ({
  user,
  children,
  noMatch,
  authority = [],
  ...props
}) => {
  return isAuthorized(authority, user) ? (
    <>{children}</>
  ) : noMatch === undefined ? (
    <Redirect to="/auth" />
  ) : (
    noMatch
  );
};
