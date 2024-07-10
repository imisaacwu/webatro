import { useContext, useEffect, useRef } from 'react'
import './App.css'
import { Blind } from './components/Blind'
import { Calculator } from './components/Calculator'
import { Blinds } from './Constants'
import { Deck } from './components/Deck'
import Hand from './components/Hand'
import { InfoPanel } from './components/InfoPanel'
import { Round } from './components/Round'
import { GameStateContext } from './GameState'

export default function App() {
    const { state: game, dispatch } = useContext(GameStateContext)
    const gameRef = useRef(game)
    gameRef.current = game
    
    useEffect(() => dispatch({type: 'init'}), [])

    useEffect(() => {
        document.addEventListener('keydown', handleKeys)

        return () => document.removeEventListener('keydown', handleKeys)
    }, [])

    const handleKeys = (e: KeyboardEvent) => {
        if(e.key === 'Escape') {
            gameRef.current.cards.selected.forEach(c => {
                dispatch({type: 'select', payload: {card: c}})
            })
        }
    }

    const currBlindType = game.blind.curr === 'small' ? Blinds[0] : game.blind.curr === 'big' ? Blinds[1] : game.blind.boss

    const reward = currBlindType.reward + game.stats.hands + Math.min(Math.floor(game.stats.money / 5), 5)

    return (
        <div className='container'>
            <div id='sidebar'>
                <div id='top-sidebar'>
                    {game.state === 'blind-select' && <div>Choose your<br />next Blind</div>}
                    {game.state === 'scoring' &&
                        <Blind type='sidebar' blind={currBlindType} />
                    }
                </div>
                <Round />
                <Calculator />
                <InfoPanel />
            </div>
            <div id='main'>
                <div id='top'>
                    <div id='jokers' className='card-container'>
                        <div id='joker-area' className='card-area'></div>
                        <div id='joker-label' className='counter'>0/5</div>
                    </div>
                    <div id='consumables' className='card-container'>
                        <div id='consumables-area' className='card-area'></div>
                        <div id='consumables-label' className='counter'>0/2</div>
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
                                {gameRef.current.cards.submitted}
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
                                        {game.stats.hands > 0 &&
                                            <div id='remaining-hands' className='extra-reward'>
                                                <div className='num-extra'>{game.stats.hands}</div>
                                                <div className='extra-reward-text'>{'Remaining Hands \[$1 each\]'}</div>
                                                <div className='reward'>{'$'.repeat(game.stats.hands)}</div>
                                            </div>
                                        }
                                        {game.stats.money > 4 &&
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
                    </div>
                    <Deck />
                </div>
            </div>
        </div>
    )
}
