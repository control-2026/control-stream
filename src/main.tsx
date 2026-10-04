// Ensure window.fetch has both getter and setter in iframe environments
try {
  if (typeof window !== 'undefined' && window.fetch) {
    let _fetchRef = window.fetch;
    const desc = Object.getOwnPropertyDescriptor(window, 'fetch') || 
                 Object.getOwnPropertyDescriptor(Object.getPrototypeOf(window), 'fetch');
    if (!desc || !desc.set) {
      Object.defineProperty(window, 'fetch', {
        get() {
          return _fetchRef;
        },
        set(v) {
          _fetchRef = v;
        },
        configurable: true,
        enumerable: true
      });
    }
  }
} catch (e) {
  // ignore
}

import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
