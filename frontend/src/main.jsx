import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux';
import { store } from './store/store'; // Ensure you import your store
import OnchainProviders from './OnChainProviders.tsx';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <OnchainProviders>
      <Provider store={store}> {/* Wrap App with Provider */}
        <App />
      </Provider>
    </OnchainProviders>
  </StrictMode>,
)
