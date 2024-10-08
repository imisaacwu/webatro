import { useEffect, useReducer, useRef } from 'react'
import './App.css'
import shopIcon from './assets/shop.gif'
import { Blind } from './components/Blind'
import { Calculator } from './components/Calculator'
import { Card } from './components/Card'
import { Consumable } from './components/Consumable'
import { Deck } from './components/Deck'
import Hand from './components/Hand'
import { InfoPanel } from './components/InfoPanel'
import { Joker } from './components/Joker'
import { Round } from './components/Round'
import { Shop } from './components/Shop'
import { Blinds, DeckType } from './Constants'
import { gameReducer, GameStateContext, initialGameState } from './GameState'
import { cardSnap } from './Utilities'
import { MainMenu } from './components/MainMenu'

export default function App() {
    const [ game, dispatch ] = useReducer(gameReducer, initialGameState)
    const gameRef = useRef(game)
    gameRef.current = game
    
    useEffect(() => {
        document.addEventListener('keydown', handleKeys)

        return () => document.removeEventListener('keydown', handleKeys)
    }, [])

    useEffect(() => {
        cardSnap({cards: game.cards.consumables, idPrefix: 'consumable', r: -1})
    }, [game.cards.consumables])

    useEffect(() => {
        cardSnap({cards: game.jokers, idPrefix: 'joker', r: -1})
    }, [game.jokers])

    const handleKeys = (e: KeyboardEvent) => {
        if(e.key === 'Escape') {
            gameRef.current.cards.selected.forEach(c => {
                dispatch({type: 'select', payload: {card: c}})
            })
        }
    }

    const currBlindType = game.blind.curr === 'small' ? Blinds[0] : game.blind.curr === 'big' ? Blinds[1] : game.blind.boss

    let reward = currBlindType.reward
    if(game.stats.deck === DeckType.Green) {
        reward += 2 * game.stats.hands + game.stats.discards
    } else {
        reward += game.stats.hands + Math.min(Math.floor(game.stats.money / 5), 5)
    }
    

    return (
        <GameStateContext.Provider value={{ state: game, dispatch }}>
            {game.state === 'main-menu' ? <MainMenu /> :
                <div className='container'>
                    <div id='sidebar'>
                        <div id='top-sidebar'>
                            {game.state === 'blind-select' && <div>Choose your<br />next Blind</div>}
                            {game.state === 'scoring' && <Blind type='sidebar' blind={currBlindType} />}
                            {game.state === 'shop' && <img id='shop-logo' src={shopIcon} />}
                        </div>
                        <Round />
                        <Calculator />
                        <InfoPanel />
                    </div>
                    <div id='main'>
                        <div id='top'>
                            <div id='jokers' className='card-container'>
                                <div id='joker-area' className='card-area'>
                                    <label id='joker-bkg'>JOKERS</label>
                                    {game.jokers.map(j => 
                                        <Joker key={j.id} {...j}/>
                                    )}
                                </div>
                                <div id='joker-label' className='counter'>{`${game.jokers.length}/${game.stats.jokerSize}`}</div>
                            </div>
                            <div id='consumables' className='card-container'>
                                <div id='consumables-area' className='card-area'>
                                    <label id='consumable-bkg'>CONSUMABLES</label>
                                    {game.cards.consumables.map(c => (
                                        <Consumable key={c.id} {...c} />
                                    ))}
                                </div>
                                <div id='consumables-label' className='counter'>{`${game.cards.consumables.length}/${game.stats.consumableSize}`}</div>
                            </div>
                        </div>
                        <div id='lower'>
                            <div id='content'>
                                {game.state === 'blind-select' && <>
                                    <div id='blinds-container'>
                                        <Blind type='select' blind={Blinds[0]} />
                                        <Blind type='select' blind={Blinds[1]} />
                                        <Blind type='select' blind={game.blind.boss} />
                                    </div>
                                </>}
                                {game.state === 'scoring' && <>
                                    <div id='mid'>
                                        {game.cards.submitted.map(c => <Card key={c.id} {...c} />)}
                                    </div>
                                    <div id='bot'>
                                        <Hand />
                                    </div>
                                </>}
                                {game.state === 'post-scoring' && <>
                                    <div id='post-outer'>
                                        <div id='post-container'>
                                            <div id='post-inner'>
                                                <div id='cash-out' onClick={() => {
                                                    dispatch({type: 'state', payload: {
                                                        state: 'shop',
                                                        amount: reward,
                                                    }})
                                                }}>{`Cash Out: $${reward}`}</div>
                                                <Blind type='post' blind={currBlindType} />
                                                <div id='post-dots'>{'. '.repeat(49)}</div>
                                                {game.stats.deck !== DeckType.Green && game.stats.hands > 0 &&
                                                    <div id='remaining-hands' className='extra-reward'>
                                                        <div className='num-extra'>{game.stats.hands}</div>
                                                        <div className='extra-reward-text'>{'Remaining Hands \[$1 each\]'}</div>
                                                        <div className='reward'>{'$'.repeat(game.stats.hands)}</div>
                                                    </div>
                                                }
                                                {game.stats.deck === DeckType.Green && game.stats.hands > 0 &&
                                                    <div id='remaining-hands' className='extra-reward'>
                                                        <div className='num-extra'>{game.stats.hands}</div>
                                                        <div className='extra-reward-text'>{'Remaining Hands \[$2 each\]'}</div>
                                                        <div className='reward'>{'$'.repeat(2 * game.stats.hands)}</div>
                                                    </div>
                                                }
                                                {game.stats.deck === DeckType.Green && game.stats.discards > 0 &&
                                                    <div id='remaining-hands' className='extra-reward'>
                                                        <div className='num-extra'>{game.stats.discards}</div>
                                                        <div className='extra-reward-text'>{'Remaining Discards \[$1 each\]'}</div>
                                                        <div className='reward'>{'$'.repeat(game.stats.discards)}</div>
                                                    </div>
                                                }
                                                {game.stats.deck !== DeckType.Green && game.stats.money > 4 &&
                                                    <div id='interest' className='extra-reward'>
                                                        <div className='num-extra'>{Math.min(Math.floor(game.stats.money / 5), 5)}</div>
                                                        <div className='extra-reward-text'>{'1 interest per $5 \[5 max\]'}</div>
                                                        <div className='reward'>{'$'.repeat(Math.min(Math.floor(game.stats.money / 5), 5))}</div>
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </>}
                                {game.state === 'shop' && <Shop />}
                            </div>
                            <Deck />
                        </div>
                    </div>
                </div>
            }
        </GameStateContext.Provider>
    )
}
