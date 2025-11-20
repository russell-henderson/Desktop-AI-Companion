export type AlertSeverity = 'warning' | 'critical';

export interface Alert {
    id: string;
    severity: AlertSeverity;
    source: string; // 'ProcessInspector', 'Monitoring', 'Telemetry', etc.
    message: string;
    createdAt: string;
    resolvedAt?: string;
}

export class AlertStore {
    private alerts: Map<string, Alert> = new Map();

    /**
     * Create a new alert or update an existing one with the same source
     */
    create(severity: AlertSeverity, source: string, message: string): string {
        // Check if there's an existing unresolved alert from this source
        const existing = Array.from(this.alerts.values()).find(
            (a) => a.source === source && !a.resolvedAt
        );

        if (existing) {
            // Update existing alert
            existing.severity = severity;
            existing.message = message;
            return existing.id;
        }

        // Create new alert
        const id = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const alert: Alert = {
            id,
            severity,
            source,
            message,
            createdAt: new Date().toISOString(),
        };
        this.alerts.set(id, alert);
        return id;
    }

    /**
     * Get the most recent active (unresolved) alert
     */
    getActiveAlert(): Alert | null {
        const active = Array.from(this.alerts.values())
            .filter((a) => !a.resolvedAt)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return active.length > 0 ? active[0] : null;
    }

    /**
     * Get all active alerts
     */
    getActiveAlerts(): Alert[] {
        return Array.from(this.alerts.values())
            .filter((a) => !a.resolvedAt)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    /**
     * Mark an alert as resolved
     */
    resolve(id: string): boolean {
        const alert = this.alerts.get(id);
        if (alert && !alert.resolvedAt) {
            alert.resolvedAt = new Date().toISOString();
            return true;
        }
        return false;
    }

    /**
     * Get all alerts (including resolved)
     */
    getAll(): Alert[] {
        return Array.from(this.alerts.values());
    }

    /**
     * Clear all resolved alerts
     */
    clearResolved(): void {
        for (const [id, alert] of this.alerts.entries()) {
            if (alert.resolvedAt) {
                this.alerts.delete(id);
            }
        }
    }
}

