import './Deck.css'

type DeckProps = {
    num: number
}

export const Deck = (props: DeckProps) => {
    return (
        <div id='deck' className='card-container'>
            <div id='deck-area' className='card-area'></div>
            <div id='deck-label' className='counter'>{props.num}/52</div>
        </div>
    )
}