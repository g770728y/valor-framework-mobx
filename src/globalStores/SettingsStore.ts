import { action, autorun, observable } from 'mobx';
interface AppSettings {
  appTitle: string;
  appIcon: any;
  pageSize: number;
  menus: { key: string; title: string }[];
}
export class SettingsStore {
  @observable
  data: AppSettings = {} as any;

  // @observable
  // activeMenuKey: string = "";

  // 仅表示显示哪些tab
  @observable
  tabKeys: string[] = [];

  @action
  init(props: AppSettings) {
    this.data = props;
  }

  constructor() {}

  // @action
  // setActiveMenu = (menuKey: string) => {
  //   // 确保显示tab
  //   if (this.tabKeys.indexOf(menuKey) < 0) {
  //     this.tabKeys.push(menuKey);
  //   }
  //   // this.activeMenuKey = menuKey + "";
  // };
}

// settingsStore应该在程序中实例化
export const settingsStore = new SettingsStore();

// menus = [
//   { key: "/main/home", title: "首页" },
//   { key: "/main/project/info", title: "项目信息" },
//   { key: "/main/project/boq", title: "工程量清单" },
//   { key: "/main/project/wbs", title: "工程部位分解" },
//   { key: "/main/admin/user", title: "用户" },
//   { key: "/main/admin/role", title: "角色" },
// ];
