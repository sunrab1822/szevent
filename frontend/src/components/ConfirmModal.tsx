import { Modal } from "antd";
import type { ReactNode } from "react";

interface ConfirmModalProps {
    open: boolean;
    title: string;
    message: ReactNode;
    onCancel: () => void;
    onConfirm: () => void | Promise<void>;
    confirmText?: string;
    cancelText?: string;
    confirmLoading?: boolean;
    confirmDisabled?: boolean;
    danger?: boolean;
    width?: number;
}

const ConfirmModal = ({
    open,
    title,
    message,
    onCancel,
    onConfirm,
    confirmText = "Megerősítés",
    cancelText = "Mégse",
    confirmLoading = false,
    confirmDisabled = false,
    danger = false,
    width = 520,
}: ConfirmModalProps) => {
    const confirmClassName = danger
        ? "flex h-fit cursor-pointer flex-row gap-1 rounded-md bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-500/80 disabled:cursor-not-allowed disabled:opacity-60"
        : "bg-primary-light hover:bg-primary-light/80 flex h-fit cursor-pointer flex-row gap-1 rounded-md px-4 py-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60";

    return (
        <Modal
            title={title}
            open={open}
            onCancel={confirmLoading ? undefined : onCancel}
            width={width}
            footer={
                <div className="mt-6 flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        disabled={confirmLoading}
                        className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {cancelText}
                    </button>
                    <button onClick={onConfirm} disabled={confirmDisabled || confirmLoading} className={confirmClassName}>
                        {confirmLoading ? "Mentés..." : confirmText}
                    </button>
                </div>
            }
        >
            <div className="py-2 text-sm text-[#3e484c]">{message}</div>
        </Modal>
    );
};

export default ConfirmModal;
