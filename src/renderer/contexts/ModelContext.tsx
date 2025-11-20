import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface Model {
    id: string;
    label: string;
    description: string;
}

const DEFAULT_MODELS: Model[] = [
    { id: 'gpt-4o-mini', label: 'Nova · System Expert', description: 'Precision + tool access' },
    { id: 'gpt-4.1-mini', label: 'Nova · Research', description: 'Long context, grounded answers' },
    { id: 'gpt-3.5-turbo', label: 'Nova · Fast Drafts', description: 'Speed over depth' },
];

interface ModelContextType {
    currentModel: string;
    models: Model[];
    setCurrentModel: (modelId: string) => Promise<void>;
    getCurrentModel: () => string;
    listModels: () => Model[];
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: ReactNode }) {
    const [currentModel, setCurrentModelState] = useState<string>('gpt-3.5-turbo');
    const [models] = useState<Model[]>(DEFAULT_MODELS);

    useEffect(() => {
        const bridge = window.desktop ?? window.ai;
        if (!bridge || !(bridge as any).ai?.getCurrentModel) {
            return;
        }

        (bridge as any).ai
            .getCurrentModel()
            .then((modelId: string) => {
                if (modelId) {
                    setCurrentModelState(modelId);
                }
            })
            .catch((error: Error) => {
                console.error('Failed to load current model', error);
            });
    }, []);

    const setCurrentModel = async (modelId: string) => {
        const bridge = window.desktop ?? window.ai;
        if (!bridge || !(bridge as any).ai?.setCurrentModel) {
            console.error('Model bridge not available');
            return;
        }

        try {
            await (bridge as any).ai.setCurrentModel(modelId);
            setCurrentModelState(modelId);
        } catch (error) {
            console.error('Failed to set current model', error);
            throw error;
        }
    };

    const getCurrentModel = () => currentModel;

    const listModels = () => models;

    return (
        <ModelContext.Provider value={{ currentModel, models, setCurrentModel, getCurrentModel, listModels }}>
            {children}
        </ModelContext.Provider>
    );
}

export function useModelContext() {
    const context = useContext(ModelContext);
    if (context === undefined) {
        throw new Error('useModelContext must be used within a ModelProvider');
    }
    return context;
}

