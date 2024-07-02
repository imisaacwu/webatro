import React, { ReactElement, useContext, useEffect, useReducer, useRef } from 'react'
import './App.css'
import { Blind } from './components/Blind'
import { Calculator } from './components/Calculator'
import { InfoPanel } from './components/InfoPanel'
import { Round } from './components/Round'
import { Card } from './components/Card'
import { Suit, Rank } from './components/Constants'
import Hand from './components/Hand'
import { Deck } from './components/Deck'

type CardState = {
    deck: ReactElement[]        // Contains cards not drawn yet
    hand: ReactElement[]        // Cards shown in hand
    selected: ReactElement[]    // Cards in hand that are selected, also cards that are scored
    hidden: ReactElement[]      // Cards off-screen (e.g. discarded)
}

type CardAction = {
    type: 'init' | 'select' | 'shuffle' | 'draw' | 'discard' | 'sortHand-rank' | 'sortHand-suit'
    payload?: {
        element?: ReactElement
        handleCardClick?: (e: React.MouseEvent, id: number) => void
        draw?: number
    }
}

const initialCardState: CardState = { deck: [], hand: [], selected: [], hidden: [] }

const cardReducer = (state: CardState, action: CardAction): CardState => {
    let arr: ReactElement[]
    switch(action.type) {
        case 'init':
            if(action.payload?.handleCardClick == undefined) { throw new Error('handleCardClick not defined!') }
            arr = [];
            Object.keys(Suit)
                .filter(key => isNaN(Number(key)))
                .forEach(suit => {
                    Object.keys(Rank)
                        .filter(key => isNaN(Number(key)))
                        .forEach(rank => {
                            arr.push(
                                <Card
                                    key={arr.length}
                                    id={arr.length}
                                    suit={Suit[suit as keyof typeof Suit]}
                                    rank={Rank[rank as keyof typeof Rank]}
                                    handleClick={action.payload?.handleCardClick as () => void}
                                />
                            )
                    })
            })
            return {...initialCardState, deck: arr}
        case 'select':
            if(action.payload?.element == undefined) { throw new Error('nothing specified to select!') }
            return {...state, selected: (
                state.selected.includes(action.payload.element) ?
                state.selected.filter(c => c.props.id !== action.payload!.element!.props.id) :
                [...state.selected, action.payload.element]
            )}
        case 'shuffle':
            arr = [...state.deck]
            let i = state.deck.length
            while(i > 0) {
                let rand = Math.floor(Math.random() * i--);
                [arr[i], arr[rand]] = [arr[rand], arr[i]]
            }
            return {...state, deck: arr}
        case 'draw':
            let n = action.payload?.draw
            if(n == undefined) { throw new Error('draw amount not specified!') }
            return {...state, hand: [...state.hand, ...state.deck.slice(-n)], deck: state.deck.slice(0, -n)}
        case 'discard':
            return {...state, hand: state.hand.filter(c => !state.selected.includes(c)), hidden: state.selected, selected: []}
        case 'sortHand-rank':
            return {...state, hand: [...state.hand.sort((a, b) => 
                a.props.rank !== b.props.rank ? b.props.rank - a.props.rank : a.props.suit - b.props.suit
            )]}
        case 'sortHand-suit':
            return {...state, hand: [...state.hand.sort((a, b) => 
                a.props.suit !== b.props.suit ? a.props.suit - b.props.suit : b.props.rank - a.props.rank
            )]}
        default:
            return state
    }
}

export const HandSizeContext = React.createContext(8)
export const CardStateContext = React.createContext<{
    state: CardState,
    dispatch: React.Dispatch<CardAction>
}>({
    state: initialCardState,
    dispatch: () => undefined
})

export default function App() {
    const [cards, dispatch] = useReducer(cardReducer, initialCardState)
    const handSize = useContext(HandSizeContext)
    const cardsRef = useRef(cards)
    cardsRef.current = cards

    useEffect(() => {
        dispatch({type: 'init', payload: {handleCardClick: handleCardClick}})
        dispatch({type: 'shuffle'})
        dispatch({type: 'draw', payload: {draw: handSize}})
        dispatch({type: 'sortHand-rank'})
    }, [])

    const handleCardClick = (e: React.MouseEvent, id: number) => {
        const card = cardsRef.current.hand.find(card => card.props.id === id)
        const className = e.currentTarget.getAttribute('class') as string // className is never null
        if(card) {
            if(!className.includes('selected')) {
                if(cardsRef.current.selected.length < 5) {
                    e.currentTarget.classList.add('selected')
                    dispatch({type: 'select', payload: {element: card}})
                }
            } else {
                e.currentTarget.classList.remove('selected')
                dispatch({type: 'select', payload: {element: card}})
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
                console.log(c)
                c!.setAttribute('class', c!.getAttribute('class')!.replace(' selected', ''))
                dispatch({type: 'select', payload: {element: card}})
            })
        }
    }

    return (
        <CardStateContext.Provider value={{state: cards, dispatch: dispatch}}>
            <div className='container'>
                <div id='sidebar'>
                    <Blind />
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
                    <div id='mid'></div>
                    <div id='bot'>
                        <HandSizeContext.Provider value={8}>
                            <Hand
                                hand={cards.hand}
                                selected={cards.selected.length > 0}
                                submitted={false}
                            />
                            <Deck deck={cards.deck} />
                        </HandSizeContext.Provider>
                    </div>
                </div>
            </div>
        </CardStateContext.Provider>
    )
}
