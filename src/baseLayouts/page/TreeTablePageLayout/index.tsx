import * as React from 'react';
import styles from './index.module.less';

interface Props {
  tree?: React.ReactNode;
  query?: React.ReactNode;
  action?: React.ReactNode;
  table?: React.ReactNode;
}

const TreeTablePageLayout: React.FC<Props> = ({ tree, query, action, table }) => {
  return (
    <div className={styles['container']}>
      {tree && <div className={styles['tree-wrapper']}>{tree}</div>}
      <div className={styles['content-wrapper']}>
        {query && <div className={styles['query']}>{query}</div>}
        {action && <div className={styles['action']}>{action}</div>}
        {table && <div className={styles['table']}>{table}</div>}
      </div>
    </div>
  );
};

export default TreeTablePageLayout;
