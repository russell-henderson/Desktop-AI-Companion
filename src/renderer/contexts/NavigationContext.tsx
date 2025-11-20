import { createContext, useContext, useMemo, useState } from 'react';

export type NavigationSection = 'home' | 'chats' | 'projects' | 'notebook' | 'system' | 'notifications';

interface NavigationContextValue {
    section: NavigationSection;
    setSection: (section: NavigationSection) => void;
}

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
    const [section, setSection] = useState<NavigationSection>('home');

    const value = useMemo(() => ({ section, setSection }), [section]);

    return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation() {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
}

