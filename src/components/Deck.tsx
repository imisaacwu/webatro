import { ReactElement } from 'react'
import './Deck.css'

type DeckProps = {
    deck: ReactElement[]
}

export const Deck = (props: DeckProps) => {
    return (
        <div id='deck' className='card-container'>
            <div id='deck-area' className='card-area'></div>
            <div id='deck-label' className='counter'>{props.deck.length}/52</div>
        </div>
    )
}