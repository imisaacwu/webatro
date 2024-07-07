import { useEffect, useRef, useState } from 'react'
import './App.css'
import { Blind } from './components/Blind'
import { Calculator } from './components/Calculator'
import { InfoPanel } from './components/InfoPanel'
import { Round } from './components/Round'
import Hand from './components/Hand'
import { Deck } from './components/Deck'
import { useCardState } from './components/contexts/CardStateContext'
import { useHandState } from './components/contexts/HandStateContext'
import { useGameState } from './components/contexts/GameStateContext'
import { Blinds } from './components/Constants'

export default function App() {
    const { state: cards, dispatch: cardDispatch } = useCardState()
    const { dispatch: handDispatch } = useHandState()
    const { state: game, dispatch: gameDispatch } = useGameState()
    const cardsRef = useRef(cards)
    cardsRef.current = cards
    
    const [ sort, setSort ] = useState<'rank' | 'suit'>('rank')

    useEffect(() => {
        cardDispatch({type: 'init', payload: {handleCardClick: handleCardClick}})
        cardDispatch({type: 'shuffle'})
        cardDispatch({type: 'draw', payload: {draw: game.handSize}})
    }, [])

    const handleCardClick = (e: React.MouseEvent, id: number) => {
        const card = cardsRef.current.hand.find(card => card.props.id === id)
        const className = e.currentTarget.getAttribute('class') as string // className is never null
        if(card) {
            if(!className.includes('selected') && !className.includes('submitted')) {
                if(cardsRef.current.selected.length < 5) {
                    e.currentTarget.classList.add('selected')
                    cardDispatch({type: 'select', payload: {element: card}})
                }
            } else {
                e.currentTarget.classList.remove('selected')
                cardDispatch({type: 'select', payload: {element: card}})
            }
        } else { throw Error('couldn\'t find card clicked on')}
    }

    useEffect(() => {
        document.addEventListener('keydown', handleKeys)

        return () => document.removeEventListener('keydown', handleKeys)
    }, [])

    const handleKeys = (e: KeyboardEvent) => {
        if(e.key === 'Escape') {
            cardsRef.current.selected.forEach(card => {
                let c = document.getElementById(`card ${card.props.id}`)
                c!.setAttribute('class', c!.getAttribute('class')!.replace(' selected', ''))
                cardDispatch({type: 'select', payload: {element: card}})
            })
        }
    }

    useEffect(() => {
        cardDispatch({type: 'sort', payload: {sort: sort}})
    }, [sort, cardsRef.current.deck])

    useEffect(() => {
        if(cardsRef.current.submitted.length === 0) {
            handDispatch({type: 'score', payload: {cards: cardsRef.current.selected}})
        }
    }, [cardsRef.current.selected, cardsRef.current.submitted])

    useEffect(() => {
        cardsRef.current.submitted.forEach(c => {
            let card = document.getElementById(`card ${c.props.id}`)
            if(card == undefined) { throw new Error(`card ${c.props.id} not found!`)}
            card?.classList.add('submitted')
            setTimeout(() => {
                card!.classList.remove('submitted')
            }, 3000)
        })
    }, [cardsRef.current.submitted])

    const currBlindType = game.currBlind === 'small' ? Blinds[0] : game.currBlind === 'big' ? Blinds[1] : game.boss;

    return (
        <div className='container'>
            <div id='sidebar'>
                <div id='top-sidebar'>
                    {game.mode === 'blind-select' && <div>Choose your<br />next Blind</div>}
                    {game.mode === 'scoring' &&
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
                        {game.mode === 'blind-select' && <>
                            <div id='blinds-container'>
                                <Blind type='select' blind={Blinds[0]} />
                                <Blind type='select' blind={Blinds[1]} />
                                <Blind type='select' blind={game.boss} />
                            </div>
                        </>}
                        {game.mode === 'scoring' && <>
                            <div id='mid'>
                                {cards.submitted}
                            </div>
                            <div id='bot'>
                                <Hand
                                    sort={sort}
                                    setSort={setSort}
                                />
                            </div>
                        </>}
                        {game.mode === 'post-scoring' && <>
                            <div id='post-outer'>
                                <div id='post-container'>
                                    <div id='post-inner'>
                                        <div id='cash-out' onClick={() => {
                                            gameDispatch({type: 'exit', payload: {reward:
                                                currBlindType.reward +
                                                game.hands +
                                                Math.min(Math.floor(game.money / 5), 5)
                                            }})
                                            gameDispatch({type: 'next'})
                                            cardDispatch({type: 'shuffle'})
                                            cardDispatch({type: 'draw', payload: {draw: game.handSize}})
                                        }}>{`Cash Out: $${
                                            currBlindType.reward +
                                            game.hands +
                                            Math.min(Math.floor(game.money / 5), 5)
                                        }`}</div>
                                        <Blind type='post' blind={currBlindType} />
                                        <div id='post-dots'>{'. '.repeat(49)}</div>
                                        {game.hands > 0 &&
                                            <div id='remaining-hands' className='extra-reward'>
                                                <div className='num-extra'>{game.hands}</div>
                                                <div className='extra-reward-text'>{'Remaining Hands \[$1 each\]'}</div>
                                                <div className='reward'>{'$'.repeat(game.hands)}</div>
                                            </div>
                                        }
                                        {game.money > 4 &&
                                            <div id='interest' className='extra-reward'>
                                                <div className='num-extra'>{Math.min(Math.floor(game.money / 5), 5)}</div>
                                                <div className='extra-reward-text'>{'1 interest per $5 \[5 max\]'}</div>
                                                <div className='reward'>{'$'.repeat(Math.min(Math.floor(game.money / 5), 5))}</div>
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
