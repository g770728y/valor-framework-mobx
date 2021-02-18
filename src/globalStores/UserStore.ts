import { action, computed, observable, reaction } from 'mobx';
import { navigate } from '@reach/router';
import DisposableModel from '../baseModels/DisposableModel';
import * as rgac from '../rbac';

interface UserStoreData {
  currentUser?: CurrentUser;
}

export class UserStore extends DisposableModel {
  private loginF: (userInput: any) => Promise<CurrentUser>;
  private logoutF: () => Promise<void>;

  @observable
  data: UserStoreData = {};

  constructor(loginF: (userInput: any) => Promise<CurrentUser>, logoutF: () => Promise<void>) {
    super();
    this.loginF = loginF;
    this.logoutF = logoutF;
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

    this.fetch().then(() => {
      if (!this.data.currentUser) navigate('/auth', { replace: true });
    });
  }

  @computed
  get isLogin() {
    return !!this.data.currentUser;
  }

  init = () => {
    this.fetch();
  };

  login = (user: any) => {
    const self = this;
    return self.loginF(user).then(result => self.resetCurrentUser(result));
  };

  @action
  logout = () => {
    const self = this;
    self.logoutF().then(() => {
      self.data = {};
    });
  };

  @action
  resetCurrentUser = (currentUser: CurrentUser) => {
    this.data.currentUser = currentUser;
  };

  fetch = () => {
    const self = this;
    return Promise.resolve().then(() => {
      self.resetCurrentUser(rgac.getCurrentUser());
    });
  };
}
