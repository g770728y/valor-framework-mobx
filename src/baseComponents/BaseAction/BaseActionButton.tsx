import * as React from 'react';
import { ModalContext, ModalProvider } from 'react-promisify-modal';
import { Button, ButtonProps } from 'antd';
import { propsByAction } from './common';

export type BaseActionButtonProps = {
  actionType?: 'create' | 'update'; // 仅用于确定预置样式
  buttonProps?: ButtonProps;
  DialogComponent: any;
  htmlType?: 'button' | 'a';
};
class BaseActionButton_ extends React.Component<BaseActionButtonProps, any> {
  static contextType = ModalContext;
  context!: React.ContextType<typeof ModalContext>;

  constructor(props: BaseActionButtonProps) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const { buttonProps, DialogComponent } = this.props;
    const { openModal } = this.context!;
    if (!buttonProps?.disabled) {
      openModal!(args => <DialogComponent {...args} />);
    }
  }

  render() {
    const { actionType, htmlType } = this.props;
    const props =
      actionType && (propsByAction as any)[actionType]
        ? { ...(propsByAction as any)[actionType], ...this.props.buttonProps }
        : this.props.buttonProps;
    const { title, Icon, ...restProps } = props;

    return htmlType === 'a' ? (
      <a onClick={this.handleClick} style={{ color: props.disabled ? '#ccc' : undefined }}>
        {Icon && <Icon />}
        {title}
      </a>
    ) : (
      <Button onClick={this.handleClick} {...restProps}>
        {Icon && <Icon />}
        {title}
      </Button>
    );
  }
}

// 必须包裹ModalProvider
// 原因: curdModal里用到 PageContext, 会被 ModalProvider打断
export const BaseActionButton = (props: BaseActionButtonProps) => {
  return (
    <ModalProvider>
      <BaseActionButton_ {...props} />
    </ModalProvider>
  );
};
