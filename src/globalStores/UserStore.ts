import { action, computed, observable, reaction, runInAction } from 'mobx';
import { navigate } from '@reach/router';
import DisposableModel from '../baseModels/DisposableModel';
import * as rbac from '../rbac';

interface UserStoreData {
  currentUser?: CurrentUser;
}

export class UserStore extends DisposableModel {
  private loginF: (userInput: any) => Promise<CurrentUser>;
  private logoutF: () => Promise<void>;
  private loginByTokenF: (token: string) => Promise<CurrentUser>;

  @observable
  data: UserStoreData = {};

  constructor(
    loginF: (userInput: any) => Promise<CurrentUser>,
    loginByTokenF: (token: string) => Promise<CurrentUser>,
    logoutF: () => Promise<void>,
  ) {
    super();
    this.loginF = loginF;
    this.logoutF = logoutF;
    this.loginByTokenF = loginByTokenF;
    this.disposers.push(
      reaction(
        () => !(this.data && this.data.currentUser),
        currentUserNotExists => {
          if (currentUserNotExists) {
            navigate('/auth', { replace: true });
          }
        },
      ),
    );
  }

  @computed
  get isLogin() {
    return !!this.data.currentUser;
  }

  loginByToken = (): Promise<any> => {
    const self = this;
    const token = rbac.getToken();
    if (token) {
      return this.loginByTokenF(token)
        .then(result => {
          self.resetCurrentUser(result);
          return result;
        })
        .catch(e => {
          throw new Error(e);
        });
    } else {
      return Promise.resolve().then(() => {
        throw new Error('不存在token');
      });
    }
  };

  login = (user: any) => {
    const self = this;
    return self.loginF(user).then(result => self.resetCurrentUser(result));
  };

  @action
  logout = () => {
    const self = this;
    return self.logoutF().then(() => {
      runInAction(() => {
        // self.data = {};
        rbac.removeCurrentUser();
      });
    });
  };

  @action
  resetCurrentUser = (currentUser: CurrentUser) => {
    this.data.currentUser = currentUser;
    rbac.setCurrentUser(currentUser);
  };
}
