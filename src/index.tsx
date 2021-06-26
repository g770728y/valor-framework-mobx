import * as React from 'react';
import { ConfigProvider,Modal } from 'antd';
// 由于 antd 组件的默认文案是英文，所以需要修改为中文
import zhCN from 'antd/es/locale/zh_CN';
import moment from 'moment';

import 'moment/dist/locale/zh-cn';
import 'antd/dist/antd.css';
import './index.css';
import { configure } from 'mobx';
import { setup } from '@formily/antd-components';

moment.locale('zh-cn');

// formily组件自动注册
setup();

// mobx初始化
configure({ enforceActions: 'observed' });

///////////////////////////////////////
////////////////// typing

//////////////////////////////////////

export * from './baseModels';
export * from './baseComponents';
export * from './baseRoutes';
export * from './globalStores';
export * from './utils';
export * from './rbac';
export * from './baseLayouts';

// 应用程序的壳
export const AppShell: React.FC = ({ children }) => {
  return <ConfigProvider locale={zhCN}>{children}</ConfigProvider>;
};

// 导出常用常数
export * as constants from './constants';


