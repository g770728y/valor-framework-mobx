import * as React from 'react';
import { ConfigProvider } from 'antd';
// 由于 antd 组件的默认文案是英文，所以需要修改为中文
import zhCN from 'antd/lib/locale/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';
import 'antd/dist/antd.css';
import './index.css';

moment.locale('zh-cn');

///////////////////////////////////////
////////////////// typing

//////////////////////////////////////

export * from './baseModels';
export * from './baseComponents';
export * from './baseRoutes';
export * from './globalStores';
export * from './utils';
export * from './rbac';

// 应用程序的壳
export const AppShell: React.FC = ({ children }) => {
  return <ConfigProvider locale={zhCN}>{children}</ConfigProvider>;
};
