import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';

// Gestionnaire d'erreurs global amélioré
const handleError = (error, errorInfo) => {
  // Si l'erreur est un objet avec une propriété 'message'
  if (error && typeof error === 'object') {
    console.error('Erreur détaillée:', {
      message: error.message || 'Erreur inconnue',
      status: error.status || 'Inconnu',
      type: error.type || 'Erreur standard',
      stack: error.stack,
      ...error
    });
  } else {
    console.error('Erreur brute:', error);
  }

  // Log des informations supplémentaires si disponibles
  if (errorInfo) {
    console.error('Informations supplémentaires:', {
      componentStack: errorInfo.componentStack,
      ...errorInfo
    });
  }
};

// ErrorBoundary pour capturer les erreurs React
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    handleError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Oups ! Quelque chose s'est mal passé.
            </h2>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || "L'application a rencontré une erreur. Veuillez rafraîchir la page."}
            </p>
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors w-full"
              >
                Rafraîchir la page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors w-full"
              >
                Retourner à l'accueil
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="mt-4 text-left text-xs bg-gray-100 p-4 rounded overflow-auto max-h-48">
                {this.state.error.stack || JSON.stringify(this.state.error, null, 2)}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Gestionnaire d'erreurs non capturées amélioré
window.onerror = (message, source, lineno, colno, error) => {
  handleError(error, {
    type: 'Uncaught Error',
    message,
    source,
    lineno,
    colno
  });
  return false;
};

// Gestionnaire de rejets de promesses non gérés amélioré
window.onunhandledrejection = (event) => {
  handleError(event.reason, {
    type: 'Unhandled Promise Rejection',
    promise: event.promise
  });
};

// Configuration de React Router avec les flags futurs
const routerConfig = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

// Création et rendu de l'application
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter {...routerConfig}>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

// Désactiver les logs en production
if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.debug = () => {};
  // Garder console.error pour le suivi des erreurs en production
}