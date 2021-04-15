import * as React from 'react';

export type VBoxProps = {
  h?: 'l' | 'c' | 'r';
  v?: 't' | 'c' | 'b';
  style?: any;
};

export const VBox: React.FC<VBoxProps> = props => {
  const hAlign = props.h || 'c';
  const vAlign = props.v || 'c';
  const alignItems = {
    l: 'flex-start',
    c: 'center',
    r: 'flex-end',
  }[hAlign as 'l' | 'c' | 'r'];

  const justifyContent = {
    t: 'flex-start',
    c: 'center',
    b: 'flex-end',
  }[vAlign as 't' | 'c' | 'b'];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent,
        alignItems,
        ...props.style,
      }}
    >
      {props.children}
    </div>
  );
};
