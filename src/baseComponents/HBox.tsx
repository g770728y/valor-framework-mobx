import * as React from 'react';

export type HBoxProps = {
  h?: 'l' | 'c' | 'r';
  v?: 't' | 'c' | 'b';
  style?: any;
  className?: string;
};

export const HBox: React.FC<HBoxProps> = props => {
  const hAlign = props.h || 'c';
  const vAlign = props.v || 'c';
  const justifyContent = {
    l: 'flex-start',
    c: 'center',
    r: 'flex-end',
  }[hAlign as 'l' | 'c' | 'r'];

  const alignItems = {
    t: 'flex-start',
    c: 'center',
    b: 'flex-end',
  }[vAlign as 't' | 'c' | 'b'];

  return (
    <div
      style={{ display: 'flex', flexDirection: 'row', justifyContent, alignItems, ...props.style }}
      className={props.className}
    >
      {props.children}
    </div>
  );
};

export const HDivider: React.FC<{ gap?: number; height?: number }> = props => {
  return (
    <div
      style={{
        margin: `0 ${props.gap ?? 8}px`,
        color: '#ccc',
        borderRight: '1px solid #ccc',
        height: props.height ?? 12,
      }}
    ></div>
  );
};
