import * as React from 'react';
import { Button, ButtonProps } from 'antd';
import { confirm } from '../../utils/ui';
import { propsByAction } from './common';

type DeleteButtonProps = {
  buttonProps?: ButtonProps;
  msg?: string;
  onSubmit: () => Promise<any>;
  htmlType?: 'button' | 'a';
};

export class DeleteButton extends React.Component<DeleteButtonProps> {
  constructor(props: DeleteButtonProps) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const { msg, onSubmit, buttonProps } = this.props;
    if (!buttonProps?.disabled) {
      confirm(msg || '删除后不可恢复。是否确定删除?').then(result => {
        if (result) {
          onSubmit();
        }
      });
    }
  }

  render() {
    const props = { ...propsByAction.delete, ...this.props.buttonProps };
    const { title, icon = null, ...restProps } = props;
    return this.props.htmlType === 'a' ? (
      <a onClick={this.handleClick} style={{ color: props.disabled ? '#ccc' : undefined }}>
        {icon}
        {title}
      </a>
    ) : (
      <Button onClick={this.handleClick} {...restProps}>
        {icon}
        {title}
      </Button>
    );
  }
}
