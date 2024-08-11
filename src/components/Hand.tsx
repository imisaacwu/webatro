import { useContext, useEffect, useRef } from 'react'
import { cardSnap, shuffle } from '../Utilities'
import './Hand.css'
import { GameStateContext } from '../GameState'
import { Card } from './Card'
import { Consumables, Enhancement, Seal } from '../Constants'

export default function Hand() {
    const { state: game, dispatch } = useContext(GameStateContext)
    const gameRef = useRef(game)
    gameRef.current = game

    useEffect(() => {
        cardSnap({cards: gameRef.current.cards.hand, idPrefix: 'card'})
    })

    return (
        <div id='hand' className='card-container'>
            <div id='hand-area' className='card-area'>
                {game.cards.hand.map(c => <Card key={c.id} {...c} />)}
            </div>
            <div id='hand-label' className='counter'>{game.cards.hand.length}/{game.stats.handSize}</div>
            {game.cards.submitted.length === 0 &&
            <div id='hand-buttons'>
                <div id='ship' className={`button ${game.cards.selected.length > 0}`} onClick={() => {
                    if(gameRef.current.cards.selected.length > 0) {
                        let len = Math.max(gameRef.current.stats.handSize - (gameRef.current.cards.hand.length - gameRef.current.cards.selected.length), 0)
                        dispatch({type: 'submit'})
                        if(game.blind.curr === 'boss' && game.blind.boss.name === 'The Hook') {
                            let discard = shuffle(game.cards.hand.filter(c => !game.cards.selected.includes(c))).slice(-2)
                            dispatch({type: 'updateCards', payload: {cardLocation: 'hand', update: game.cards.hand.filter(c => !discard.includes(c) && !c.selected)}})
                            // weird timing issue
                            dispatch({type: 'updateCards', payload: {cardLocation: 'hidden', update: [...game.cards.hidden, ...discard]}})
                            len += discard.length
                        }
                        setTimeout(() => {
                            const lastHand = game.active.name
                            dispatch({type: 'discard'})
                            let req = game.blind.base
                            switch(game.blind.curr) {
                                case 'big': req *= 1.5; break
                                case 'boss': req *= game.blind.boss.mult; break
                            }
                            if(gameRef.current.stats.score >= req) {
                                dispatch({type: 'state', payload: {state: 'post-scoring'}})
                                let money = 0, planets = 0
                                game.cards.hand.forEach(c => {
                                    if(c.enhancement === Enhancement?.Gold) { money += 3 }
                                    if(c.seal === Seal?.Blue) { planets++ }
                                })
                                dispatch({type: 'stat', payload: {stat: 'money', amount: money}})
                                for(let i = 0; i < Math.min(game.stats.consumableSize - game.cards.consumables.length, planets); i++) {
                                    dispatch({type: 'addCard', payload: {card: Consumables.find(c => c.hand === lastHand)}});
                                }
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
                        let amount = Math.max(gameRef.current.stats.handSize - (gameRef.current.cards.hand.length - gameRef.current.cards.selected.length), 0), purple = 0
                        dispatch({type: 'discard'})

                        game.cards.hand.forEach(c => {
                            if(c.seal === Seal?.Purple) { purple++ }
                        })
                        let validTarots = Consumables.slice(30, 52)
                        validTarots = validTarots.filter(c => game.cards.consumables.every(con => con.consumable.name !== c.name))
                        if(validTarots.length === 0) { validTarots.push(Consumables[40])}
                        for(let i = 0; i < Math.min(game.stats.consumableSize - game.cards.consumables.length, purple); i++) {
                            dispatch({type: 'addCard', payload: {card: validTarots[Math.floor(Math.random() * validTarots.length)]}});
                        }

                        setTimeout(() => {
                            dispatch({type: 'draw', payload: {amount: amount, previous: 'discarded'}})
                        }, 500)
                    }
                }}>Discard</div>
            </div>}
        </div>
    )
}
