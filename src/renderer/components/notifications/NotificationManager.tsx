import { useEffect, useState } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import NotificationToast from './NotificationToast';
import type { NotificationRecord } from '../../../types/ipc';

export default function NotificationManager() {
    const { setSection } = useNavigation();
    const [notifications, setNotifications] = useState<NotificationRecord[]>([]);

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 5000);
        return () => clearInterval(interval);
    }, []);

    const loadNotifications = async () => {
        try {
            const data = await window.desktop?.notifications.list(true);
            setNotifications(data || []);
        } catch (error) {
            console.error('Failed to load notifications', error);
        }
    };

    const handleDismiss = async (id: string) => {
        try {
            await window.desktop?.notifications.markRead(id);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    const handleAction = (notification: NotificationRecord) => {
        if (notification.related_tool) {
            setSection('system');
        }
        handleDismiss(notification.id);
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {notifications.slice(0, 3).map((notification) => (
                <NotificationToast
                    key={notification.id}
                    notification={notification}
                    onDismiss={handleDismiss}
                    onAction={handleAction}
                />
            ))}
        </div>
    );
}

