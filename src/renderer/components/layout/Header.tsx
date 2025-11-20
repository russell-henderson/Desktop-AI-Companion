import { useState, useEffect } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import ModelCard from '../ui/ModelCard';
import UtilityCard from '../ui/UtilityCard';

function getTimeBasedGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
}

interface HeaderProps {
    onOpenNotebook?: () => void;
}

export function Header({ onOpenNotebook }: HeaderProps) {
    const { setSection } = useNavigation();
    const [systemStatus, setSystemStatus] = useState<'nominal' | 'warning' | 'critical'>('nominal');

    // Fetch telemetry status
    useEffect(() => {
        const updateStatus = async () => {
            const bridge = window.desktop;
            if (!bridge) return;

            try {
                const telemetry = await bridge.system?.getTelemetry();
                if (telemetry) {
                    setSystemStatus(telemetry.status === 'NOMINAL' ? 'nominal' : telemetry.status === 'WARNING' ? 'warning' : 'critical');
                }
            } catch (error) {
                console.error('Failed to fetch telemetry', error);
            }
        };

        updateStatus();
        const interval = setInterval(updateStatus, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const systemMessage = systemStatus === 'nominal' ? 'System nominal' : systemStatus === 'warning' ? 'System warning' : 'System critical';
    const handleStatusClick = () => {
        setSection('system');
    };

    return (
        <header className="flex items-center justify-between px-6 pt-4 pb-3 shrink-0">
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-text-primary">{getTimeBasedGreeting()}</h1>
                    <p className="text-sm text-text-subtle">System admin mode • Nova is monitoring your machine</p>
                </div>
                <button
                    onClick={handleStatusClick}
                    className={`inline-flex items-center gap-2 rounded-pill px-3 py-2 text-sm transition ${
                        systemStatus === 'nominal'
                            ? 'bg-surface text-text-primary hover:bg-surface-soft'
                            : systemStatus === 'warning'
                              ? 'bg-brand-orange/80 text-white hover:bg-brand-orange'
                              : 'bg-brand-orange text-white hover:bg-brand-orange/90'
                    }`}
                    role="status"
                    aria-live="polite"
                    title="Click to view system details"
                >
                    {systemStatus === 'nominal' && (
                        <div className="h-2 w-2 rounded-full bg-brand-emerald"></div>
                    )}
                    <span>{systemMessage}</span>
                </button>
            </div>

            <div className="flex items-center gap-4">
                <ModelCard />
                <UtilityCard onOpenNotebook={onOpenNotebook} />
            </div>
        </header>
    );
}

export default Header;

