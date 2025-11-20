import { useState } from 'react';

const MODELS = [
    { id: 'gpt-4o-mini', label: 'Nova · System Expert', description: 'Precision + tool access' },
    { id: 'gpt-4.1-mini', label: 'Nova · Research', description: 'Long context, grounded answers' },
    { id: 'gpt-3.5-turbo', label: 'Nova · Fast Drafts', description: 'Speed over depth' },
];

export function ModelSelector() {
    const [model, setModel] = useState(MODELS[0].id);

    const activeModel = MODELS.find((entry) => entry.id === model) ?? MODELS[0];

    return (
        <div className="rounded-card border border-surface-soft bg-surface p-4">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-text-muted">
                <span>Model</span>
                <span>{model}</span>
            </div>
            <select
                className="mt-3 w-full rounded-xl border border-surface-soft bg-surface-soft p-3 text-sm font-semibold text-text-primary focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-opacity-40"
                value={model}
                onChange={(event) => setModel(event.target.value)}
            >
                {MODELS.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                        {entry.label}
                    </option>
                ))}
            </select>
            <p className="mt-2 text-xs text-text-muted">{activeModel.description}</p>
        </div>
    );
}

export default ModelSelector;

