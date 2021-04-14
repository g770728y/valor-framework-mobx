import { Button } from 'antd';
import * as React from 'react';
import { RefreshIcon } from '../../icons';

interface Props {
  refresh: () => Promise<any>;
}
export const RefreshButton: React.FC<Props> = props => {
  return (
    <Button type="link" onClick={props.refresh}>
      <RefreshIcon />
    </Button>
  );
};
