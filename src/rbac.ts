export function isAuthorized(_authority: string | string[], user: CurrentUser): boolean {
  const authority = 'string' === typeof _authority ? [_authority] : _authority;

  if (_authority.indexOf('*') >= 0) return true;

  const roles = user ? user.roles || [] : [];

  return roles.some(it => authority.includes(it));
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function getCurrentUser(): CurrentUser {
  const str = localStorage.getItem('current-user');
  return str && JSON.parse(str);
}

export function setCurrentUser(user: CurrentUser) {
  localStorage.setItem('current-user', JSON.stringify(user));
}

export function removeCurrentUser() {
  localStorage.removeItem('current-user');
}
