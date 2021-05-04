import * as React from 'react';
import styles from './index.module.less';
import { SmallDashOutlined } from '@ant-design/icons';
import { useMouseDownMoveUp } from 'valor-hooks';

interface Props {
  query?: React.ReactNode;
  action?: React.ReactNode;
  table?: React.ReactNode;
  slave?: React.ReactNode;
  style?: React.CSSProperties;
}

const rawHeight = 350;
const CrudPageLayout: React.FC<Props> = ({ query, action, table, slave, style }) => {
  const [state, setState] = React.useState<{
    slaveHeight: number;
    isMoving: boolean;
    slaveHeight0: number;
  }>({ slaveHeight: rawHeight, isMoving: false, slaveHeight0: rawHeight });
  // 未使用
  const startPointRef = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const handleMouseMove = React.useCallback(
    ({ dx, dy, x, y }: { dx: number; dy: number; x: number; y: number }) => {
      setState(s => {
        const nextSlaveHeight = Math.max(s.slaveHeight0 - dy, 200);
        if (!s.isMoving) {
          return {
            ...s,
            slaveHeight: nextSlaveHeight,
            isMoving: true,
            slaveHeight0: s.slaveHeight,
          };
        }
        return { ...s, slaveHeight: nextSlaveHeight };
      });
    },
    [],
  );
  const handleMouseUp = React.useCallback(
    ({ dx, dy, x, y }: { dx: number; dy: number; x: number; y: number }) => {
      setState(s => {
        const nextSlaveHeight = Math.max(s.slaveHeight0 - dy, 200);
        return {
          ...s,
          slaveHeight: nextSlaveHeight,
          isMoving: false,
          slaveHeight0: nextSlaveHeight,
        };
      });
    },
    [],
  );

  const { handleMouseDown } = useMouseDownMoveUp({
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    cursor: 'ns-resize',
    startPointRef,
  });
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
        <div className={styles['master-slave-container']}>
          <div style={{ flex: 'auto', height: 10, overflowY: 'auto' }}>{mainContent}</div>
          <div className={styles['slave-container']} style={{ height: state.slaveHeight }}>
            <div className={styles['handler']} onMouseDown={handleMouseDown}>
              <SmallDashOutlined />
            </div>
            {slave}
          </div>
        </div>
      ) : (
        mainContent
      )}
    </div>
  );
};

export default CrudPageLayout;
