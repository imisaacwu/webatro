import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { CardStateProvider } from './components/contexts/CardStateContext.tsx'
import { HandStateProvider } from './components/contexts/HandStateContext.tsx'
import { GameStateProvider } from './components/contexts/GameStateContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <CardStateProvider><HandStateProvider><GameStateProvider>
                <App />
        </GameStateProvider></HandStateProvider></CardStateProvider>
    </React.StrictMode>,
)
