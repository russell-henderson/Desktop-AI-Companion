import { useModelContext } from '../../contexts/ModelContext';

export function ModelCard() {
    const { currentModel, models, setCurrentModel } = useModelContext();
    const activeModel = models.find((m) => m.id === currentModel) ?? models[0];

    return (
        <div className="bg-white rounded-2xl shadow-sm px-4 py-3 flex flex-col min-w-[220px]">
            <span className="text-xs font-medium text-text-muted tracking-wide uppercase">Model</span>
            <div className="mt-1 flex items-center justify-between gap-2">
                <select
                    value={currentModel}
                    onChange={(e) => setCurrentModel(e.target.value)}
                    className="text-sm font-semibold text-text-primary bg-surface-soft rounded-xl border border-surface-soft px-3 py-2 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-opacity-40"
                >
                    {models.map((model) => (
                        <option key={model.id} value={model.id}>
                            {model.label}
                        </option>
                    ))}
                </select>
            </div>
            <p className="mt-1 text-xs text-text-muted">{activeModel.description}</p>
        </div>
    );
}

export default ModelCard;

