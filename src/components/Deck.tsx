import { ReactElement, useState } from 'react'
import './Deck.css'
import DeckMenu from './DeckMenu'
import { redDeck } from '../assets/decks'

type DeckProps = {
    deck: ReactElement[]
}

export const Deck = (props: DeckProps) => {
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
            <div id='deck-label' className='counter'>{props.deck.length}/52</div>
        </div>
    )
}