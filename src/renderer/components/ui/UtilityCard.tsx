interface UtilityCardProps {
    onOpenNotebook?: () => void;
}

export function UtilityCard({ onOpenNotebook }: UtilityCardProps) {
    return (
        <div className="bg-surface rounded-card shadow-card px-4 py-3 flex items-center gap-3">
            <button
                type="button"
                onClick={onOpenNotebook}
                className="rounded-pill bg-brand-cyan text-white text-sm font-medium px-4 py-2 transition hover:bg-brand-cyan/90"
            >
                Notebook
            </button>
            <button
                type="button"
                className="rounded-pill bg-surface-soft border border-surface-soft text-sm font-medium text-text-primary px-4 py-2 transition hover:bg-surface-soft/80"
            >
                Settings
            </button>
        </div>
    );
}

export default UtilityCard;

