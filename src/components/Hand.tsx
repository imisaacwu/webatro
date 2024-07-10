import { useContext, useEffect, useRef } from 'react'
import './Hand.css'
import { GameStateContext } from '../GameState'

export default function Hand() {
    const { state: game, dispatch } = useContext(GameStateContext)
    const gameRef = useRef(game);
    gameRef.current = game;

    useEffect(() => {
        // https://www.desmos.com/calculator/vaaglwvmxl
        const hand = document.getElementById('hand-area')
        const cards = document.querySelectorAll('#hand-area .card') as NodeListOf<HTMLElement>

        const r = 6000
        const h = hand!.clientWidth / 2
        const k = -Math.sqrt(r*r-h*h)

        let lStep = hand!.clientWidth / (cards.length);
        const extra = (lStep - 142) / (cards.length - 1);

        cards.forEach((c, i) => {
            const left = i * (lStep + extra); 
            c.style.left = `${left}px`

            const x = Math.abs(h - (left + 71))
            const y = Math.sqrt(r * r - (h - (i * lStep + 71)) ** 2) + k
            c.style.bottom = `${y}px`

            let rot = Math.acos(x/r)
            rot -= Math.PI / 2
            rot *= (i < cards.length / 2 ? 1 : -1)

            c.style.rotate = `${rot}rad`
        })
    }, [game.cards.hand])

    return (
        <div id='hand' className='card-container'>
            <div id='hand-area' className='card-area'>
                {game.cards.hand}
            </div>
            <div id='hand-label' className='counter'>{game.cards.hand.length}/{game.stats.handSize}</div>
            {game.cards.submitted.length === 0 &&
            <div id='hand-buttons'>
                <div id='ship' className={`button ${game.cards.selected.length > 0}`} onClick={() => {
                    if(game.cards.selected.length > 0) {
                        dispatch({type: 'submit'})
                        setTimeout(() => {
                            console.log(gameRef.current.cards.submitted)
                            gameRef.current.cards.submitted.forEach(c => console.log(document.getElementById(`card ${c.props.id}`)));
                            dispatch({type: 'discard'})
                            if(game.stats.score >= (game.blind.base * (game.blind.curr === 'small' ? 1 : game.blind.curr === 'big' ? 1.5 : game.blind.boss.mult))) {
                                dispatch({type: 'state', payload: {state: 'post-scoring'}})
                            } else {
                                dispatch({type: 'draw', payload: {amount: (game.stats.handSize - game.cards.hand.length)}})
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
                    if(game.cards.selected.length > 0 && game.stats.discards > 0) {
                        let amount = game.cards.selected.length
                        dispatch({type: 'discard'})
                        setTimeout(() => {
                            dispatch({type: 'draw', payload: {amount: amount}})
                        }, 500)
                    }
                }}>Discard</div>
            </div>}
        </div>
    )
}
