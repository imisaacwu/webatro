import { ReactElement } from 'react'
import './Hand.css'

type HandProps = {
    hand: ReactElement[]
    handSize: number
    selected: boolean
    submitted: boolean
}

export default function Hand(props: HandProps) {
    return (
        <div id='hand' className='card-container'>
            <div id='hand-area' className='card-area'>
                {props.hand}
            </div>
            <div id='hand-label' className='counter'>{props.hand.length}/{props.handSize}</div>
            <div id='hand-buttons'>
                <div id='ship' className={`button ${props.selected}`}>Ship It</div>
                <div id='sort'>
                    Sort Hand
                    <div id='sort-buttons'>
                        <div id='rank' className='sort-button'>Rank</div>
                        <div id='suit' className='sort-button'>Suit</div>
                    </div>
                </div>
                <div id='discard' className={`button ${props.selected}`}>Discard</div>
            </div>
        </div>
    )
}
