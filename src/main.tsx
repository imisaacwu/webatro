import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Card } from './components/Card.tsx'
import { DeckType, Edition, Enhancement, Rank, Seal, Suit } from './Constants.ts'

ReactDOM.createRoot(document.getElementById('root')!).render(
    // <React.StrictMode>
    //     <App />
    // </React.StrictMode>
    <Card id={0} suit={Suit.Spades} rank={Rank.Two} deck={DeckType.Red}
        edition={Edition.Holographic}
        enhancement={Enhancement.Glass}
        seal={Seal.Blue}
        debuffed={true}
    />
)
