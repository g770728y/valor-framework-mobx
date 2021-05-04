import { action, autorun, observable } from 'mobx';
interface AppSettings {
  appTitle: string;
  appLogo: any;
  pageSize: number;
  menus: { key: string; title: string; component: any }[];
  //是否支持顶部tabs
  useTabs?: boolean;
}
export class SettingsStore {
  @observable
  data: AppSettings = {} as any;

  @observable
  activeMenuKey: string = '';

  // 仅表示显示哪些tab
  @observable
  tabKeys: string[] = [];

  @action
  init(props: AppSettings) {
    this.data = props;
  }

  constructor() {}

  @action
  setActiveMenu = (menuKey: string) => {
    if (this.data.useTabs) {
      // 不允许出现的
      if ((this.data.menus || []).map(it => it.key).indexOf(menuKey) < 0) return;

      // 确保显示tab
      const index = this.tabKeys.indexOf(menuKey);
      if (index < 0) {
        this.tabKeys.push(menuKey);
        this.activeMenuKey = menuKey;
      } else {
        this.activeMenuKey = menuKey;
      }
    } else {
      this.activeMenuKey = menuKey;
    }
  };

  // 用于关闭标签tab
  @action
  unsetActiveMenu = (menuKey: string) => {
    if (this.data.useTabs && this.tabKeys.length >= 2) {
      const index = this.tabKeys.indexOf(menuKey);
      if (index >= 0) {
        const nextActiveIndex = index === this.tabKeys.length - 1 ? index - 1 : index;
        this.tabKeys = this.tabKeys.filter(it => it !== menuKey);
        this.activeMenuKey = this.tabKeys[nextActiveIndex];
      }
    }
  };
}

// settingsStore应该在程序中实例化
export const settingsStore = new SettingsStore();
