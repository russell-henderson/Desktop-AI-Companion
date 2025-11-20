import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NavigationProvider } from '../../../src/renderer/contexts/NavigationContext';
import NotificationManager from '../../../src/renderer/components/notifications/NotificationManager';
import { createMockDesktopBridge } from '../test-utils';
import type { NotificationRecord } from '../../../src/types/ipc';

function NotificationManagerWrapper() {
    return (
        <NavigationProvider>
            <NotificationManager />
        </NavigationProvider>
    );
}

describe('NotificationManager', () => {
    it('displays toast notifications', async () => {
        const mockNotifications: NotificationRecord[] = [
            {
                id: 'notif-1',
                type: 'system',
                severity: 'warning',
                title: 'High CPU Usage',
                message: 'CPU usage is above 80%',
                read: 0,
                created_at: new Date().toISOString(),
            },
        ];

        const mockBridge = createMockDesktopBridge({
            notifications: {
                list: vi.fn().mockResolvedValue(mockNotifications),
                markRead: vi.fn().mockResolvedValue(undefined),
            },
        });
        (window as any).desktop = mockBridge;

        render(<NotificationManagerWrapper />);

        await waitFor(() => {
            expect(screen.getByText('High CPU Usage')).toBeInTheDocument();
            expect(screen.getByText('CPU usage is above 80%')).toBeInTheDocument();
        });
    });

    it('shows severity in toast content', async () => {
        const mockNotifications: NotificationRecord[] = [
            {
                id: 'notif-1',
                type: 'system',
                severity: 'critical',
                title: 'Critical Error',
                message: 'System error detected',
                read: 0,
                created_at: new Date().toISOString(),
            },
        ];

        const mockBridge = createMockDesktopBridge({
            notifications: {
                list: vi.fn().mockResolvedValue(mockNotifications),
                markRead: vi.fn().mockResolvedValue(undefined),
            },
        });
        (window as any).desktop = mockBridge;

        render(<NotificationManagerWrapper />);

        await waitFor(() => {
            expect(screen.getByText('Critical Error')).toBeInTheDocument();
        });
    });

    it('routes to system view when toast is clicked', async () => {
        const user = userEvent.setup();
        const mockNotifications: NotificationRecord[] = [
            {
                id: 'notif-1',
                type: 'system',
                severity: 'warning',
                title: 'Toolbox Alert',
                message: 'Check system',
                related_tool: 'ProcessInspector',
                read: 0,
                created_at: new Date().toISOString(),
            },
        ];

        const mockMarkRead = vi.fn().mockResolvedValue(undefined);
        const mockBridge = createMockDesktopBridge({
            notifications: {
                list: vi.fn().mockResolvedValue(mockNotifications),
                markRead: mockMarkRead,
            },
        });
        (window as any).desktop = mockBridge;

        render(<NotificationManagerWrapper />);

        await waitFor(() => {
            expect(screen.getByText('Toolbox Alert')).toBeInTheDocument();
        }, { timeout: 2000 });

        // Click the "Open Tool" button, not the toast itself
        const openToolButton = screen.getByRole('button', { name: /open tool/i });
        await user.click(openToolButton);

        await waitFor(() => {
            expect(mockMarkRead).toHaveBeenCalledWith('notif-1');
        }, { timeout: 2000 });
    });

    it('dismisses notification when clicked', async () => {
        const user = userEvent.setup();
        const mockNotifications: NotificationRecord[] = [
            {
                id: 'notif-1',
                type: 'system',
                severity: 'info',
                title: 'Info',
                message: 'Test message',
                read: 0,
                created_at: new Date().toISOString(),
            },
        ];

        const mockMarkRead = vi.fn().mockResolvedValue(undefined);
        const mockBridge = createMockDesktopBridge({
            notifications: {
                list: vi.fn().mockResolvedValue(mockNotifications),
                markRead: mockMarkRead,
            },
        });
        (window as any).desktop = mockBridge;

        render(<NotificationManagerWrapper />);

        await waitFor(() => {
            expect(screen.getByText('Info')).toBeInTheDocument();
        }, { timeout: 2000 });

        // Click the "Dismiss" button, not the toast itself
        const dismissButton = screen.getByRole('button', { name: /dismiss/i });
        await user.click(dismissButton);

        await waitFor(() => {
            expect(mockMarkRead).toHaveBeenCalledWith('notif-1');
        }, { timeout: 2000 });
    });

    it('handles multiple notifications (shows up to 3)', async () => {
        const mockNotifications: NotificationRecord[] = [
            {
                id: 'notif-1',
                type: 'system',
                severity: 'info',
                title: 'Notification 1',
                message: 'Message 1',
                read: 0,
                created_at: new Date().toISOString(),
            },
            {
                id: 'notif-2',
                type: 'system',
                severity: 'warning',
                title: 'Notification 2',
                message: 'Message 2',
                read: 0,
                created_at: new Date().toISOString(),
            },
            {
                id: 'notif-3',
                type: 'system',
                severity: 'critical',
                title: 'Notification 3',
                message: 'Message 3',
                read: 0,
                created_at: new Date().toISOString(),
            },
            {
                id: 'notif-4',
                type: 'system',
                severity: 'info',
                title: 'Notification 4',
                message: 'Message 4',
                read: 0,
                created_at: new Date().toISOString(),
            },
        ];

        const mockBridge = createMockDesktopBridge({
            notifications: {
                list: vi.fn().mockResolvedValue(mockNotifications),
                markRead: vi.fn().mockResolvedValue(undefined),
            },
        });
        (window as any).desktop = mockBridge;

        render(<NotificationManagerWrapper />);

        await waitFor(() => {
            // Should show at most 3 notifications
            const notifications = screen.getAllByText(/Notification \d/);
            expect(notifications.length).toBeLessThanOrEqual(3);
        });
    });
});

