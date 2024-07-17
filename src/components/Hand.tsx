import { useContext, useEffect, useRef } from 'react'
import { cardSnap, shuffle } from '../Utilities'
import './Hand.css'
import { PlayingCard } from './PlayingCard'
import { GameStateContext } from '../GameState'

export default function Hand() {
    const { state: game, dispatch } = useContext(GameStateContext)
    const gameRef = useRef(game)
    gameRef.current = game

    useEffect(() => {
        cardSnap(gameRef.current.cards.hand, 6000)
    }, [gameRef.current.cards.hand])

    return (
        <div id='hand' className='card-container'>
            <div id='hand-area' className='card-area'>
                {game.cards.hand.map(c => <PlayingCard key={c.id} {...c} />)}
            </div>
            <div id='hand-label' className='counter'>{game.cards.hand.length}/{game.stats.handSize}</div>
            {game.cards.submitted.length === 0 &&
            <div id='hand-buttons'>
                <div id='ship' className={`button ${game.cards.selected.length > 0}`} onClick={() => {
                    if(gameRef.current.cards.selected.length > 0) {
                        let len = game.cards.selected.length
                        dispatch({type: 'submit'})
                        if(game.blind.curr === 'boss' && game.blind.boss.name === 'The Hook') {
                            let discard = shuffle(game.cards.hand.filter(c => !game.cards.selected.includes(c))).slice(2)
                            dispatch({type: 'discard', payload: {hand: discard}})
                            len += 2
                        }
                        setTimeout(() => {
                            dispatch({type: 'discard'})
                            let req = (game.blind.base * (game.blind.curr === 'small' ? 1 : game.blind.curr === 'big' ? 1.5 : game.blind.boss.mult))
                            if(gameRef.current.stats.score >= req) {
                                dispatch({type: 'state', payload: {state: 'post-scoring'}})
                            } else {
                                dispatch({type: 'draw', payload: {amount: len, previous: 'played'}})
                            }
                        }, 1500)
                    }
                }}>Play Hand</div>
                <div id='sort'>
                    Sort Hand
                    <div id='sort-buttons'>
                        <div id='rank' className='sort-button' onClick={() => dispatch({type: 'setSort', payload: {sort: 'rank'}})}>Rank</div>
                        <div id='suit' className='sort-button' onClick={() => dispatch({type: 'setSort', payload: {sort: 'suit'}})}>Suit</div>
                    </div>
                </div>
                <div id='discard' className={`button ${game.cards.selected.length > 0}`} onClick={() => {
                    if(game.cards.selected.length > 0 && gameRef.current.stats.discards > 0) {
                        let amount = game.cards.selected.length
                        dispatch({type: 'discard'})
                        setTimeout(() => {
                            dispatch({type: 'draw', payload: {amount: amount, previous: 'discarded'}})
                        }, 500)
                    }
                }}>Discard</div>
            </div>}
        </div>
    )
}
