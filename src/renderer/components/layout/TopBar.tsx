import ModelCard from '../ui/ModelCard';
import UtilityCard from '../ui/UtilityCard';

export function TopBar() {
    return (
        <header className="flex items-start justify-between gap-4 px-6 pt-4 pb-2 shrink-0">
            <div>
                <h1 className="text-lg font-semibold text-text-primary">Dashboard</h1>
                <p className="text-sm text-text-muted">System overview and chat</p>
            </div>

            <div className="flex items-stretch gap-4">
                <ModelCard />
                <UtilityCard />
            </div>
        </header>
    );
}

export default TopBar;

