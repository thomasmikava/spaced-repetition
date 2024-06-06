/* eslint-disable max-lines-per-function */
import Modal from 'antd/es/modal/Modal';
import { forwardRef, memo, useCallback, useImperativeHandle, useState } from 'react';
import Button from '../Button';

type ConfirmationModalRef = {
  onClose: () => void;
};

export type ConfirmModalProps = {
  approveTitle?: string;
  approveButtonClassName?: string;

  text: string | number | JSX.Element;

  getErrorText?: (error: unknown) => string | undefined;
  defaultErrorText?: string;
} & (
  | {
      onApprove: () => void | Promise<unknown>;
      rejectTitle: string;
      onReject?: () => void | Promise<unknown>;
      rejectButtonClassName?: string;
      displayRejectButtonAsPrimary?: boolean;
    }
  | {
      onApprove?: () => void | Promise<unknown>;
      rejectTitle?: undefined;
      onReject?: undefined;
      rejectButtonClassName?: undefined;
      displayRejectButtonAsPrimary?: undefined;
    }
);

export const ConfirmationModal = memo(
  forwardRef<ConfirmationModalRef, ConfirmModalProps & { onClose: () => void }>((props, ref) => {
    const [loading, setLoading] = useState<'approve' | 'reject'>();
    const [error, setError] = useState<string | null>(null);

    const { onApprove, onReject, onClose, getErrorText } = props;

    const approve = useCallback(() => {
      setLoading('approve');
      setError(null);
      if (!onApprove) {
        onClose();
        return;
      }
      new Promise((resolve) => {
        resolve(onApprove());
      })
        .then(() => {
          setLoading(undefined);
          onClose();
        })
        .catch((e) => {
          setLoading(undefined);
          const errorText = (getErrorText && getErrorText(e)) || props.defaultErrorText || '';
          setError(errorText);
        });
    }, [getErrorText, onApprove, onClose, props.defaultErrorText]);

    const reject = useCallback(() => {
      setLoading('reject');
      setError(null);
      if (!onReject) {
        onClose();
        return;
      }
      new Promise((resolve) => {
        resolve(onReject());
      })
        .then(() => {
          setLoading(undefined);
          onClose();
        })
        .catch((e) => {
          setLoading(undefined);
          const errorText = (getErrorText && getErrorText(e)) || props.defaultErrorText || '';
          setError(errorText);
        });
    }, [getErrorText, onClose, onReject, props.defaultErrorText]);

    useImperativeHandle(
      ref,
      () => ({
        onClose,
      }),
      [onClose],
    );

    const footer = (
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <Button
          label={props.rejectTitle ?? 'Cancel'}
          onClick={reject}
          loading={loading === 'reject'}
          variant={props.displayRejectButtonAsPrimary ? 'primary' : 'default'}
        />
        <Button
          label={props.approveTitle ?? 'Confirm'}
          onClick={approve}
          loading={loading === 'approve'}
          variant={props.displayRejectButtonAsPrimary ? 'default' : 'primary'}
        />
      </div>
    );

    return (
      <Modal open={true} onCancel={onClose} footer={footer}>
        <div>{props.text}</div>
        {error !== null && <div style={{ color: 'red' }}>{error}</div>}
      </Modal>
    );
  }),
);
