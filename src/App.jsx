import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import AuthForm from './components/AuthForm';
import MainPage from './pages/MainPage';
import ProtectedRoute from './components/ProtectedRoute';
import Friends from "./pages/Friends";
import FriendDetail from "./pages/FriendDetail";
import Chats from "./pages/Chats";
import Playlists from "./pages/Playlists";
import PlaylistDetail from "./pages/PlaylistDetail";
import PublicPlaylistDetail from './pages/PublicPlaylistDetail';
import { PlayerProvider } from './context/PlayerContext';


function App() {
  return (
    <Router>
      <AuthProvider>
        <PlayerProvider>
          
          
        <div className="min-h-screen bg-gradient-to-br from-harmony-primary via-harmony-secondary to-harmony-accent">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#4CAF50',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#f44336',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Routes>
            <Route path="/auth" element={<AuthForm />} />
            
            {/* Rutas protegidas */}
            <Route
              element={
                <ProtectedRoute>
                  <></>
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<MainPage />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/friends/:id" element={<FriendDetail />} />
              <Route path="/friends/:id/playlists/:name" element={<PlaylistDetail />} />
              <Route path="/chats" element={<Chats />} />
              <Route path="/playlists" element={<Playlists />} />
              <Route path="/playlists/:id" element={<PlaylistDetail />} />
              <Route path="/friends/:id/playlists/:name" element={<PublicPlaylistDetail />} />

            </Route>

            


            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </div>
        </PlayerProvider>        
      </AuthProvider>
    </Router>
  );
}

export default App;
