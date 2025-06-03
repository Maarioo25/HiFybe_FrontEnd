import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const originalConsoleError = console.error;

console.error = (...args) => {
  const msg = args[0];
  if (typeof msg === 'string' && msg.includes('cpapi.spotify.com') && msg.includes('item_before_load')) {
    return;
  }
  originalConsoleError(...args);
};


ReactDOM.createRoot(document.getElementById('root')).render(<App />)