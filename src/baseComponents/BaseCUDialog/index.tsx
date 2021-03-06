import * as React from 'react';
import { Modal, Alert, ModalProps } from 'antd';
import { nop } from 'valor-app-utils';
import { SchemaForm, createFormActions, FormSlot, ISchemaFormActions } from '@formily/antd';
import * as R from 'rambdax';
import { IAntdSchemaFormProps } from '@formily/antd-components/esm/types';

interface Props {
  className?: string;
  title?: string;
  values?: any;
  show: boolean;
  onOk: (r: any) => void;
  // 注意这个方法, 必须在dialog内部拿到并运行
  onSubmit?: (result?: any) => Promise<any>;
  onCancel?: () => void;
  // 在submit前进行normalize
  normalize?: (values: any) => any;
  // 从外部获取effects
  effectsGetter?: (action: any) => any;
  actions?: ISchemaFormActions;
  dialogProps?: Partial<ModalProps>;
  formProps?: Partial<IAntdSchemaFormProps>;
}

// create 与 update 没有本质区别, 不过通常 create传来的props.values={} ( 并非总是如此 )
const BaseCUDialog: React.FC<Props> = ({
  className = '',
  title,
  values,
  show,
  onSubmit,
  onOk,
  onCancel = nop,
  children,
  effectsGetter,
  normalize = R.identity,
  actions: actions_,
  dialogProps,
  formProps,
}) => {
  const actionsRef = React.useRef<ISchemaFormActions>(actions_ || createFormActions());
  const actions = actionsRef.current;

  // 防止重复提交
  const submitting = React.useRef<boolean>(false);
  const [state, setState] = React.useState({ errorMsg: null });
  // const isFresh = !(values && values.id);

  return (
    <Modal
      title={title}
      visible={show}
      onOk={() => actions.submit()}
      onCancel={onCancel}
      okText="保存"
      cancelText="取消"
      className={className}
      {...dialogProps}
    >
      <SchemaForm
        defaultValue={values || {}}
        labelCol={5}
        wrapperCol={17}
        effects={effectsGetter && effectsGetter(actions)}
        onValuesChange={() => {
          setState(s => ({ ...s, errorMsg: null }));
        }}
        onSubmit={(v: any) => {
          if (submitting.current) return Promise.resolve();

          submitting.current = true;
          const vv = normalize({ ...values, ...v });
          if (onSubmit) {
            try {
              return onSubmit(vv)
                .then((result: any) => onOk(result))
                .catch(e => {
                  setState({ errorMsg: e.errorMsg || e.message || e });
                  throw e;
                })
                .finally(() => {
                  submitting.current = false;
                });
            } catch (e) {
              // 可能在onSubmit中直接throw, 比如validation
              setState({ errorMsg: e.errorMsg || e.message || e });
              throw e;
            }
          }
        }}
        actions={actions}
        {...formProps}
      >
        {state.errorMsg && (
          <FormSlot name="alert">
            <Alert message={state.errorMsg} type="error" />
          </FormSlot>
        )}
        {...children as any}
      </SchemaForm>
    </Modal>
  );
};

export default BaseCUDialog;
