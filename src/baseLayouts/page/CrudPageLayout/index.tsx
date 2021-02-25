import * as React from 'react';
import styles from './index.module.less';

interface Props {
  query?: React.ReactNode;
  action?: React.ReactNode;
  table?: React.ReactNode;
  slave?: React.ReactNode;
  style?: React.CSSProperties;
}

const CrudPageLayout: React.FC<Props> = ({ query, action, table, slave, style }) => {
  const mainContent = (
    <>
      {query && <div className={styles['query']}>{query}</div>}
      {action && <div className={styles['action']}>{action}</div>}
      {table && <div className={styles['table']}>{table}</div>}
    </>
  );
  return (
    <div className={styles['container']} style={style}>
      {slave ? (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ flex: 'auto', height: 10, overflowY: 'auto' }}>{mainContent}</div>
          <div style={{ flex: 'none', height: 350, boxShadow: '0px 0px 5px #ddd' }}>{slave}</div>
        </div>
      ) : (
        mainContent
      )}
    </div>
  );
};

export default CrudPageLayout;
