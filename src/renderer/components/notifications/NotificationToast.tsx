import { useEffect, useState } from 'react';
import type { NotificationRecord } from '../../../types/ipc';

interface NotificationToastProps {
    notification: NotificationRecord;
    onDismiss: (id: string) => void;
    onAction: (notification: NotificationRecord) => void;
}

export default function NotificationToast({ notification, onDismiss, onAction }: NotificationToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => onDismiss(notification.id), 300);
        }, 5000);

        return () => clearTimeout(timer);
    }, [notification.id, onDismiss]);

    const getSeverityStyles = () => {
        switch (notification.severity) {
            case 'critical':
                return 'bg-brand-orange/10 border-brand-orange text-brand-orange';
            case 'warning':
                return 'bg-brand-orange/5 border-brand-orange/50 text-brand-orange';
            case 'info':
            default:
                return 'bg-brand-cyan/10 border-brand-cyan text-brand-cyan';
        }
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div
            className={`fixed bottom-4 right-4 z-50 w-80 animate-slide-up rounded-lg border p-4 shadow-lg ${getSeverityStyles()}`}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h4 className="font-semibold">{notification.title}</h4>
                    <p className="mt-1 text-sm opacity-90">{notification.message}</p>
                    <div className="mt-3 flex gap-2">
                        {notification.related_tool && (
                            <button
                                onClick={() => onAction(notification)}
                                className="rounded bg-white/20 px-3 py-1 text-xs font-medium hover:bg-white/30"
                            >
                                Open Tool
                            </button>
                        )}
                        <button
                            onClick={() => onDismiss(notification.id)}
                            className="rounded bg-white/20 px-3 py-1 text-xs font-medium hover:bg-white/30"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

