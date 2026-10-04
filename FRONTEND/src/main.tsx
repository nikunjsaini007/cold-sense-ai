import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles.css';
import './api.css';
import './product.css';
import './modern.css';

class FrontendGuard extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ColdSense frontend render error', error, info);
  }

  render() {
    if (this.state.error) {
      return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#f5f8fc', color: '#183354', fontFamily: 'Inter, sans-serif' }}><section style={{ maxWidth: 520, padding: 28, border: '1px solid #dce8f2', borderRadius: 18, background: '#fff', boxShadow: '0 20px 60px #315d8c20' }}><h1 style={{ margin: '0 0 8px' }}>Live dashboard paused</h1><p style={{ color: '#71869d', lineHeight: 1.6 }}>The API returned a value the screen could not display. Reload after checking the backend connection.</p><code style={{ display: 'block', margin: '15px 0', padding: 10, overflow: 'auto', borderRadius: 8, color: '#b65249', background: '#fff3f1', fontSize: 11 }}>{this.state.error.message}</code><button onClick={() => window.location.reload()} style={{ padding: '10px 14px', border: 0, borderRadius: 9, color: '#fff', background: '#398cf0', fontWeight: 700 }}>Reload dashboard</button></section></main>;
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode><FrontendGuard><App /></FrontendGuard></React.StrictMode>,
);
