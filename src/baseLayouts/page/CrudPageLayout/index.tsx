import * as React from 'react';
import styles from './index.module.less';

interface Props {
  query?: React.ReactNode;
  action?: React.ReactNode;
  table?: React.ReactNode;
  style?: React.CSSProperties;
}

const CrudPageLayout: React.FC<Props> = ({ query, action, table, style }) => {
  return (
    <div className={styles['container']} style={style}>
      {query && <div className={styles['query']}>{query}</div>}
      {action && <div className={styles['action']}>{action}</div>}
      {table && <div className={styles['table']}>{table}</div>}
    </div>
  );
};

export default CrudPageLayout;
