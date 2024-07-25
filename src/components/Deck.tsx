import { useContext, useState } from 'react'
import './Deck.css'
import DeckMenu from './DeckMenu'
import { GameStateContext } from '../GameState'
import { DeckType } from '../Constants'
const decks: Record<string, { default: string }> = import.meta.glob('../assets/decks/*.png', { eager: true })

const getDeck = (deck: string) => {
    const module = decks[`../assets/decks/${deck}.png`]
    if(!module) { throw new Error(`no such image ${deck}.png`) }
    return module.default
}

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
                    <img src={getDeck(DeckType[game.stats.deck])} />
                </div>
            </div>
            <div id='deck-label' className='counter'>{game.cards.deck.length}/{game.cards.deck.length + game.cards.hand.length + game.cards.submitted.length + game.cards.hidden.length}</div>
        </div>
    )
}