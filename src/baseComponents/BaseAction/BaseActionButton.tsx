import * as React from 'react';
import { ModalContext, ModalProvider } from 'react-promisify-modal';
import { Button, ButtonProps, Dropdown } from 'antd';
import { propsByAction } from './common';
import { dissoc } from 'valor-app-utils';

export type BaseActionButtonProps = {
  actionType?: 'create' | 'update'; // 仅用于确定预置样式
  buttonProps?: ButtonProps;
  DialogComponent: any;
  htmlType?: 'button' | 'a';
  // 对话框将收到的props
  dialogProps?: object;
  // 对话框将收到的异步props, 需要先resolve, 再打开对话框, 并将参数传入
  dialogAsyncProps?: () => Promise<object>;
  // 下拉菜单, 参见antd.Button的文档
  overlay?: React.ReactNode;
  // 对话框完成后的动作, 常用于多级对话框
  onComplete?: (dialogResult: any) => void;
};
class BaseActionButton_ extends React.Component<BaseActionButtonProps, any> {
  static contextType = ModalContext;
  //@ts-ignore
  context!: React.ContextType<typeof ModalContext>;

  constructor(props: BaseActionButtonProps) {
    super(props);
    if (props.overlay && props.htmlType === 'a') {
      throw new Error('BaseActionButton 暂不支持 在超链下提供dropdown');
    }
    this.handleClick = this.handleClick.bind(this);
  }

  async handleClick() {
    const { buttonProps, DialogComponent, dialogProps, onComplete } = this.props;
    const { openModal } = this.context!;
    if (!buttonProps?.disabled) {
      const asyncProps = this.props.dialogAsyncProps ? await this.props.dialogAsyncProps() : {};
      openModal!(args => (
        <DialogComponent {...args} {...dialogProps} {...asyncProps} />
      )).then((result: any) => onComplete?.(result));
    }
  }

  render() {
    const { actionType, htmlType, overlay } = this.props;
    const props =
      actionType && (propsByAction as any)[actionType]
        ? { ...(propsByAction as any)[actionType], ...this.props.buttonProps }
        : this.props.buttonProps;
    const { title, icon = null, ...restProps } = props;

    return htmlType === 'a' ? (
      <a onClick={this.handleClick} style={{ color: props.disabled ? '#ccc' : undefined }}>
        {icon}
        {title}
      </a>
    ) : overlay ? (
      <Dropdown.Button
        onClick={this.handleClick}
        {...dissoc(restProps, ['block'])}
        overlay={overlay}
      >
        {icon}
        {title}
      </Dropdown.Button>
    ) : (
      <Button onClick={this.handleClick} {...restProps}>
        {icon}
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
