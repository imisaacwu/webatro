import { createContext, useContext, useEffect, useRef, useState } from 'react'
import './App.css'
import { Blind } from './components/Blind'
import { Calculator } from './components/Calculator'
import { InfoPanel } from './components/InfoPanel'
import { Round } from './components/Round'
import Hand from './components/Hand'
import { Deck } from './components/Deck'
import { useCardState } from './components/CardStateContext'
import { useHandState } from './components/HandStateContext'

export const HandSizeContext = createContext(8)

export default function App() {
    const { state: cards, dispatch: cardDispatch } = useCardState()
    const { dispatch: handDispatch } = useHandState()
    const cardsRef = useRef(cards)
    cardsRef.current = cards
    
    const handSize = useContext(HandSizeContext)
    const [ sort, setSort ] = useState<'rank' | 'suit'>('rank')

    useEffect(() => {
        cardDispatch({type: 'init', payload: {handleCardClick: handleCardClick}})
        cardDispatch({type: 'shuffle'})
        cardDispatch({type: 'draw', payload: {draw: handSize}})
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
            card!.classList.add('submitted')
            setTimeout(() => {
                card!.classList.remove('submitted')
            }, 3000)
        })
    }, [cardsRef.current.submitted])

    return (
        <div className='container'>
            <div id='sidebar'>
                <Blind
                    name='SMALL_BLIND'
                    score={300}
                    reward={3}
                />
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
                        <div id='mid'>
                            {cards.submitted}
                        </div>
                        <div id='bot'>
                            <HandSizeContext.Provider value={8}>
                                <Hand
                                    sort={sort}
                                    setSort={setSort}
                                />
                            </HandSizeContext.Provider>
                        </div>
                    </div>
                    <Deck deck={cards.deck} />
                </div>
            </div>
        </div>
    )
}
