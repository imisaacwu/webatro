import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { CardStateProvider } from './components/CardStateContext.tsx'
import { HandStateProvider } from './components/HandStateContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <CardStateProvider>
            <HandStateProvider>
                <App />
            </HandStateProvider>
        </CardStateProvider>
    </React.StrictMode>,
)
