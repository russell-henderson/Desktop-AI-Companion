import { useState } from 'react';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import { ModelProvider } from './contexts/ModelContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import HeadsUpDeck from './components/dashboard/HeadsUpDeck';
import ChatPanel from './components/chat/ChatPanel';
import ProjectsView from './views/ProjectsView';
import NotebookView from './views/NotebookView';
import SystemView from './views/SystemView';
import NotificationManager from './components/notifications/NotificationManager';
import InsightsView from './views/InsightsView';
import { ErrorBoundary } from './components/ErrorBoundary';
import NotebookSlideOver from './components/notebook/NotebookSlideOver';

function AppContent() {
    const { section } = useNavigation();
    const [notebookOpen, setNotebookOpen] = useState(false);

    const handleOpenNotebook = () => {
        setNotebookOpen(true);
    };

    const handleCloseNotebook = () => {
        setNotebookOpen(false);
    };

    const renderMainContent = () => {
        switch (section) {
            case 'home':
                return (
                    <>
                        <HeadsUpDeck />
                        <section className="flex-1 min-h-0 px-6 pb-6 flex flex-col gap-3">
                            <ChatPanel
                                onInsertNotebookEntry={(entry) => {
                                    // This will be handled by ChatInput's internal state
                                    // The callback is mainly for future extensibility
                                }}
                            />
                        </section>
                    </>
                );
            case 'projects':
                return <ProjectsView />;
            case 'notebook':
                // Notebook now opens as slide-over, but keep view for direct navigation
                return <NotebookView />;
            case 'system':
                return <SystemView />;
            case 'notifications':
                return <InsightsView />;
            default:
                return (
                    <>
                        <HeadsUpDeck />
                        <section className="flex-1 min-h-0 px-6 pb-6 flex flex-col gap-3">
                            <ChatPanel
                                onInsertNotebookEntry={(entry) => {
                                    // This will be handled by ChatInput's internal state
                                    // The callback is mainly for future extensibility
                                }}
                            />
                        </section>
                    </>
                );
        }
    };

    return (
        <>
            <div className="h-screen flex overflow-hidden bg-canvas">
                <Sidebar onOpenNotebook={handleOpenNotebook} />
                <main className="flex-1 flex flex-col overflow-hidden">
                    <Header onOpenNotebook={handleOpenNotebook} />
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {renderMainContent()}
                    </div>
                </main>
            </div>
            {notebookOpen && (
                <NotebookSlideOver
                    onClose={handleCloseNotebook}
                    onInsert={(entry) => {
                        // Insert into active chat input by dispatching a custom event
                        // ChatInput will listen for this event and insert the content
                        window.dispatchEvent(
                            new CustomEvent('notebook-insert', {
                                detail: { content: entry.content },
                            })
                        );
                        handleCloseNotebook();
                    }}
                />
            )}
            <NotificationManager />
        </>
    );
}

function App() {
    return (
        <ErrorBoundary>
            <ModelProvider>
                <NavigationProvider>
                    <AppContent />
                </NavigationProvider>
            </ModelProvider>
        </ErrorBoundary>
    );
}

export default App;