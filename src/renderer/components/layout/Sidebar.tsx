import { useNavigation } from '../../contexts/NavigationContext';

const NAV_ITEMS = [
    { id: 'home', label: 'Home' },
    { id: 'notebook', label: 'Notebook' },
    { id: 'system', label: 'System' },
] as const;

interface SidebarProps {
    onOpenNotebook?: () => void;
}

export function Sidebar({ onOpenNotebook }: SidebarProps) {
    const { section, setSection } = useNavigation();

    const handleNavClick = (id: string) => {
        if (id === 'notebook' && onOpenNotebook) {
            onOpenNotebook();
        } else {
            setSection(id);
        }
    };

    return (
        <aside className="w-[272px] h-full bg-sidebar flex flex-col px-4 py-4">
            {/* SidebarHeader: Nova avatar and label */}
            <div className="shrink-0 flex flex-col items-center py-4">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-cyan text-white text-xl font-semibold shadow-card">
                    N
                </div>
                <p className="text-base font-semibold text-text-primary">Nova</p>
                <p className="text-xs text-text-subtle">System aware assistant</p>
            </div>

            {/* SidebarNav: scrollable nav items */}
            <nav className="flex-1 min-h-0 overflow-y-auto space-y-2">
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-pill transition ${
                            section === item.id
                                ? 'bg-brand-cyan text-white shadow-card'
                                : 'bg-transparent text-text-primary hover:bg-white/60'
                        }`}
                    >
                        {item.label}
                    </button>
                ))}
            </nav>

            {/* SidebarUtilities: bottom buttons */}
            <div className="shrink-0 pt-3 border-t border-sidebar/50 space-y-2">
                <button
                    type="button"
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-pill bg-transparent text-text-primary hover:bg-white/60 transition"
                >
                    ⚙️ Toolbox
                </button>
                <button
                    type="button"
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-pill bg-transparent text-text-primary hover:bg-white/60 transition"
                >
                    🛡️ Optimization Mode
                </button>
                <button
                    type="button"
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-pill bg-transparent text-text-primary hover:bg-white/60 transition"
                >
                    📋 Activity
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;

