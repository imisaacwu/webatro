import { useEffect } from 'react'
import './Hand.css'
import { useCardState } from './contexts/CardStateContext'
import { useGameState } from './contexts/GameStateContext'
import { useHandState } from './contexts/HandStateContext'
import { handLevels } from './Constants'

type HandProps = {
    sort: 'rank' | 'suit'
    setSort: React.Dispatch<React.SetStateAction<'rank' | 'suit'>>
}

export default function Hand(props: HandProps) {
    const { state: game, dispatch: gameDispatch } = useGameState()
    const { state: hand } = useHandState()
    const { state, dispatch: cardDispatch } = useCardState()

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
    }, [state.hand])

    return (
        <div id='hand' className='card-container'>
            <div id='hand-area' className='card-area'>
                {state.hand}
            </div>
            <div id='hand-label' className='counter'>{state.hand.length}/{game.handSize}</div>
            {state.submitted.length === 0 &&
            <div id='hand-buttons'>
                <div id='ship' className={`button ${state.selected.length > 0}`} onClick={() => {
                    if(state.selected.length > 0) {
                        const draw = state.selected.length
                        gameDispatch({type: 'hand'})
                        gameDispatch({type: 'score', payload: {score: hand.score}})
                        cardDispatch({type: 'submit', payload: {sort: props.sort}})
                        handLevels[hand.hand.name].played++;
                        setTimeout(() => {
                            cardDispatch({type: 'scored'})
                            const req = (game.currBlind === 'small' ? game.reqBase : game.currBlind === 'big' ? 1.5 * game.reqBase : game.boss.mult * game.reqBase)
                            if(game.score + hand.score >= req) {
                                cardDispatch({type: 'reset'})
                                gameDispatch({type: 'defeat'})
                            } else {
                                cardDispatch({type: 'draw', payload: {draw: draw}})
                            }
                        }, 1500)
                    }
                }}>Ship It</div>
                <div id='sort'>
                    Sort Hand
                    <div id='sort-buttons'>
                        <div id='rank' className='sort-button' onClick={() => props.setSort('rank')}>Rank</div>
                        <div id='suit' className='sort-button' onClick={() => props.setSort('suit')}>Suit</div>
                    </div>
                </div>
                <div id='discard' className={`button ${state.selected.length > 0}`} onClick={() => {
                    if(state.selected.length > 0 && game.discards > 0) {
                        const select = state.selected
                        gameDispatch({type: 'discard'})
                        cardDispatch({type: 'discard'})
                        cardDispatch({type: 'draw', payload: {draw: select.length}})
                    }
                }}>Discard</div>
            </div>}
        </div>
    )
}
