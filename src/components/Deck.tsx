import { ReactElement } from 'react'
import './Deck.css'

type DeckProps = {
    deck: ReactElement[]
}

export const Deck = (props: DeckProps) => {
    const viewDeck = () => {
        // console.log(document.getElementById('container'))
        // document.getElementById('root')?.appendChild()
    }

    return (
        <div id='deck' className='card-container'>
            <div id='deck-area' className='card-area'>
                <div id='face-down' onClick={viewDeck}></div>
            </div>
            <div id='deck-label' className='counter'>{props.deck.length}/52</div>
        </div>
    )
}