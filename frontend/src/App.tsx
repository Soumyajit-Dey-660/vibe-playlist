import { usePlaylist } from './hooks/usePlaylist';
import { DrawingCanvas } from './components/Canvas/DrawingCanvas';
import { PlaylistPanel } from './components/Playlist/PlaylistPanel';
import './App.css';

function App() {
  const { result, isLoading, error, generate, reset } = usePlaylist();

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-brand">
          <span className="header-icon">🎨</span>
          <h1 className="header-title">Vibe Playlist</h1>
        </div>
        <p className="header-tagline">Draw your mood. Get your soundtrack.</p>
      </header>

      <main className="app-main">
        <section className="panel left-panel">
          <DrawingCanvas onSubmit={generate} isLoading={isLoading} />
        </section>
        <section className="panel right-panel">
          <PlaylistPanel
            result={result}
            isLoading={isLoading}
            error={error}
            onDismissError={reset}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
