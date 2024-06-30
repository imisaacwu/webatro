import Deck from './Deck'
import './Hand.css'

export default function Hand({ deck }: { deck: Deck }) {
    // const drawn: Card[] = deck.draw(8)

    // const render = (c: Card) => {
    //     return <div>{c.toString()}</div>
    // }

    return (
        <div id='hand' className='card-container'>
            <div id='hand-area' className='card-area'>
                {deck.arr.slice(0, 8)}
            </div>
            <div id='hand-label' className='counter'>3/8</div>
        </div>
    )
}
