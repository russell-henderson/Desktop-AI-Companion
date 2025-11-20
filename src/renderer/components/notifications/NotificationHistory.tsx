import { useEffect, useState } from 'react';
import type { NotificationRecord } from '../../../types/ipc';

export default function NotificationHistory() {
    const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterSeverity, setFilterSeverity] = useState<string>('');

    useEffect(() => {
        loadNotifications();
    }, [filterSeverity]);

    const loadNotifications = async () => {
        try {
            const data = await window.desktop?.notifications.list(false);
            let filtered = data || [];

            if (filterSeverity) {
                filtered = filtered.filter((n) => n.severity === filterSeverity);
            }

            setNotifications(filtered);
        } catch (error) {
            console.error('Failed to load notifications', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (id: string) => {
        try {
            await window.desktop?.notifications.markRead(id);
            await loadNotifications();
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'bg-brand-orange/10 border-brand-orange text-brand-orange';
            case 'warning':
                return 'bg-brand-orange/5 border-brand-orange/50 text-brand-orange';
            case 'info':
            default:
                return 'bg-brand-cyan/10 border-brand-cyan text-brand-cyan';
        }
    };

    if (loading) {
        return <div className="p-6 text-text-muted">Loading notifications...</div>;
    }

    return (
        <div className="flex h-full flex-col p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Notification History</h1>
                <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="rounded-lg border border-surface-soft px-3 py-2 text-sm text-text-primary focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-opacity-40"
                >
                    <option value="">All Severities</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                </select>
            </div>

            {notifications.length === 0 ? (
                <div className="flex flex-1 items-center justify-center text-text-muted">
                    <p>No notifications yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`rounded-lg border p-4 ${getSeverityStyles(notification.severity)} ${
                                notification.read ? 'opacity-60' : ''
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold">{notification.title}</h4>
                                        {!notification.read && (
                                            <span className="rounded-pill bg-brand-cyan px-2 py-0.5 text-xs font-medium text-white">
                                                New
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1 text-sm opacity-90">{notification.message}</p>
                                    {notification.related_tool && (
                                        <p className="mt-2 text-xs opacity-75">Related tool: {notification.related_tool}</p>
                                    )}
                                    <p className="mt-2 text-xs opacity-75">
                                        {new Date(notification.created_at).toLocaleString()}
                                    </p>
                                </div>
                                {!notification.read && (
                                    <button
                                        onClick={() => handleMarkRead(notification.id)}
                                        className="ml-4 rounded bg-white/20 px-3 py-1 text-xs font-medium hover:bg-white/30"
                                    >
                                        Mark Read
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

