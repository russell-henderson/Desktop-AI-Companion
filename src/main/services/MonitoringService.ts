import { NotificationRepository, type CreateNotificationInput } from '../repositories/NotificationRepository';
import { ToolboxService } from './ToolboxService';
import { SystemTelemetryService } from './SystemTelemetryService';
import { AlertStore } from './AlertStore';

export class MonitoringService {
    private intervalId: NodeJS.Timeout | null = null;

    constructor(
        private notificationRepo: NotificationRepository,
        private toolboxService: ToolboxService,
        private systemTelemetryService: SystemTelemetryService,
        private alertStore: AlertStore,
    ) {}

    start(intervalMs = 30000) {
        if (this.intervalId) {
            this.stop();
        }

        this.intervalId = setInterval(() => {
            this.checkSystemHealth();
        }, intervalMs);

        this.checkSystemHealth();
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    private async checkSystemHealth() {
        const snapshot = this.systemTelemetryService.getSnapshot();
        if (!snapshot) {
            return;
        }

        // Create alerts in AlertStore based on telemetry status
        if (snapshot.status === 'WARNING' || snapshot.status === 'CRITICAL') {
            for (const alertMessage of snapshot.activeAlerts) {
                const severity = snapshot.status === 'CRITICAL' ? 'critical' : 'warning';
                this.alertStore.create(severity, 'Telemetry', alertMessage);
                
                // Also create notification for UI
                await this.createNotification({
                    type: snapshot.status === 'CRITICAL' ? 'critical' : 'warning',
                    severity: snapshot.status === 'CRITICAL' ? 'critical' : 'warning',
                    title: snapshot.status === 'CRITICAL' ? 'Critical system issue' : 'System warning',
                    message: alertMessage,
                });
            }
        }
    }

    private async createNotification(input: CreateNotificationInput) {
        const existing = await this.notificationRepo.listUnread();
        const recent = existing.find(
            (n) => n.type === input.type && Date.now() - new Date(n.created_at).getTime() < 300000,
        );

        if (!recent) {
            await this.notificationRepo.create(input);
        }
    }
}

