import { ReactElement, useContext } from 'react'
import './Hand.css'
import { CardStateContext, HandSizeContext } from '../App'

type HandProps = {
    hand: ReactElement[]
    selected: boolean
    submitted: boolean
}

export default function Hand(props: HandProps) {
    const handSize = useContext(HandSizeContext)
    const cardState = useContext(CardStateContext)

    return (
        <div id='hand' className='card-container'>
            <div id='hand-area' className='card-area'>
                {props.hand}
            </div>
            <div id='hand-label' className='counter'>{props.hand.length}/{handSize}</div>
            <div id='hand-buttons'>
                <div id='ship' className={`button ${props.selected}`}>Ship It</div>
                <div id='sort'>
                    Sort Hand
                    <div id='sort-buttons'>
                        <div id='rank' className='sort-button' onClick={() => cardState.dispatch({type: 'sortHand-rank'})}>Rank</div>
                        <div id='suit' className='sort-button' onClick={() => cardState.dispatch({type: 'sortHand-suit'})}>Suit</div>
                    </div>
                </div>
                <div id='discard' className={`button ${props.selected}`}>Discard</div>
            </div>
        </div>
    )
}
