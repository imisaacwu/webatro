import { useContext, useState } from 'react'
import './Deck.css'
import DeckMenu from './DeckMenu'
import { redDeck } from '../assets/decks'
import { GameStateContext } from '../GameState'

export const Deck = () => {
    const { state: game } = useContext(GameStateContext)
    const [ menuActive, setMenuActive ] = useState(false)

    return (
        <div id='deck' className='card-container'>
            <DeckMenu
                menu={menuActive}
                setMenu={setMenuActive}
            />
            <div id='deck-area' className='card-area'>
                <div id='face-down' onClick={() => setMenuActive(true)}>
                    <img src={redDeck} />
                </div>
            </div>
            <div id='deck-label' className='counter'>{game.cards.deck.length}/{game.cards.deck.length + game.cards.hand.length + game.cards.submitted.length + game.cards.hidden.length}</div>
        </div>
    )
}