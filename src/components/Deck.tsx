import { useState } from 'react'
import './Deck.css'
import DeckMenu from './DeckMenu'
import { redDeck } from '../assets/decks'
import { useCardState } from './contexts/CardStateContext'

export const Deck = () => {
    const { state } = useCardState()
    const [ menuActive, setMenuActive ] = useState(false)

    return (
        <div id='deck' className='card-container'>
            {menuActive &&
                <DeckMenu
                    setMenu={setMenuActive}
                />
            }
            <div id='deck-area' className='card-area'>
                <div id='face-down' onClick={() => setMenuActive(true)}>
                    <img src={redDeck} />
                </div>
            </div>
            <div id='deck-label' className='counter'>{state.deck.length}/{state.deck.length + state.hand.length + state.submitted.length + state.hidden.length}</div>
        </div>
    )
}