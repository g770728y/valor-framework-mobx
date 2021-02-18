import { Modal } from 'antd';

export function confirm(
  content: React.ReactChild,
  title = '请确认',
  okText = '确定',
  cancelText = '取消',
) {
  return new Promise((resolve, reject) => {
    Modal.confirm({
      title,
      content,
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
      okText,
      cancelText,
    });
  });
}
