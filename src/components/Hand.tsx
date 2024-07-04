import { useContext } from 'react'
import './Hand.css'
import { HandSizeContext } from '../App'
import { useCardState } from './CardStateContext'

type HandProps = {
    sort: 'rank' | 'suit'
    setSort: React.Dispatch<React.SetStateAction<'rank' | 'suit'>>
}

export default function Hand(props: HandProps) {
    const handSize = useContext(HandSizeContext)
    const { state: cards, dispatch} = useCardState()

    return (
        <div id='hand' className='card-container'>
            <div id='hand-area' className='card-area'>
                {cards.hand}
            </div>
            <div id='hand-label' className='counter'>{cards.hand.length}/{handSize}</div>
            {cards.submitted.length === 0 &&
            <div id='hand-buttons'>
                <div id='ship' className={`button ${cards.selected.length > 0}`} onClick={() => {
                    if(cards.selected.length > 0) {
                        const draw = cards.selected.length
                        dispatch({type: 'submit', payload: {sort: props.sort}})
                        setTimeout(() => {
                            dispatch({type: 'reset'})
                            dispatch({type: 'draw', payload: {draw: draw}})
                        }, 3000)
                    }
                }}>Ship It</div>
                <div id='sort'>
                    Sort Hand
                    <div id='sort-buttons'>
                        <div id='rank' className='sort-button' onClick={() => props.setSort('rank')}>Rank</div>
                        <div id='suit' className='sort-button' onClick={() => props.setSort('suit')}>Suit</div>
                    </div>
                </div>
                <div id='discard' className={`button ${cards.selected.length > 0}`} onClick={() => {
                    if(cards.selected.length > 0) {
                        const select = cards.selected
                        dispatch({type: 'discard'})
                        dispatch({type: 'draw', payload: {draw: select.length}})
                    }
                }}>Discard</div>
            </div>}
        </div>
    )
}
