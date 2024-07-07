import { Dispatch, ReactElement, ReactNode, createContext, useContext, useReducer } from "react"
import { Card } from "../Card"
import { Suit, Rank, CardActionType } from "../Constants"

type CardState = {
    deck: ReactElement[]        // Contains cards not drawn yet
    hand: ReactElement[]        // Cards shown in hand
    selected: ReactElement[]    // Cards in hand that are selected
    submitted: ReactElement[]   // Cards to be scored
    hidden: ReactElement[]      // Cards off-screen (e.g. discarded)
}

type CardAction = {
    type: CardActionType
    payload?: {
        element?: ReactElement
        handleCardClick?: (e: React.MouseEvent, id: number) => void
        draw?: number
        sort?: 'rank' | 'suit'
    }
}

const initialCardState: CardState = { deck: [], hand: [], selected: [], submitted: [], hidden: [] }

const cardReducer = (state: CardState, action: CardAction): CardState => {
    let arr: ReactElement[]
    switch(action.type) {
        case 'init':
            if(action.payload?.handleCardClick == undefined) { throw new Error('handleCardClick not defined!') }
            arr = [];
            // Object.keys(Suit)
            //     .filter(key => isNaN(Number(key)))
            //     .forEach(suit => {
            //         Object.keys(Rank)
            //             .filter(key => isNaN(Number(key)))
            //             .forEach(rank => {
            //                 arr.push(
            //                     <Card
            //                         key={arr.length}
            //                         id={arr.length}
            //                         suit={Suit[suit as keyof typeof Suit]}
            //                         rank={Rank[rank as keyof typeof Rank]}
            //                         handleClick={action.payload?.handleCardClick as () => void}
            //                     />
            //                 )
            //         })
            // })

            let suits = Object.keys(Suit).filter(s => isNaN(Number(s)))
            let ranks = Object.keys(Rank).filter(r => isNaN(Number(r)))
            for(let i = 0; i < 52; i++) {
                arr.push(
                    <Card
                        key={i}
                        id={i}
                        suit={Suit[suits[Math.floor(Math.random()*4)] as keyof typeof Suit]}
                        rank={Rank[ranks[Math.floor(Math.random()*13)] as keyof typeof Rank]}
                        handleClick={action.payload?.handleCardClick as () => void}
                    />
                )
            }
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
        case 'submit':
            return {
                ...state,
                hand: state.hand.filter(c => !state.selected.includes(c)),
                submitted: [...state.submitted, ...state.selected].sort((a, b) =>
                    (action.payload?.sort === 'rank') ?
                    (a.props.rank !== b.props.rank? b.props.rank - a.props.rank : a.props.suit - b.props.suit) :
                    (a.props.suit !== b.props.suit ? a.props.suit - b.props.suit : b.props.rank - a.props.rank)),
                selected: []};
        case 'discard':
            return {
                ...state,
                hand: state.hand.filter(c => !state.selected.includes(c)),
                hidden: [...state.hidden, ...state.selected],
                selected: []}
        case 'scored': // After score
            return {...state, hidden: [...state.hidden, ...state.submitted], submitted: []}
        case 'reset': // After defeat
            return {...state, deck: [...state.deck, ...state.hand, ...state.submitted, ...state.hidden], selected: []}
        case 'sort':
            if(action.payload?.sort == undefined) { throw new Error('sort type not specified!') }
            if(action.payload.sort === 'rank') {
                return {...state, hand: [...state.hand.sort((a, b) => 
                    a.props.rank !== b.props.rank ? b.props.rank - a.props.rank : a.props.suit - b.props.suit
                )]}
            } else {
                return {...state, hand: [...state.hand.sort((a, b) => 
                    a.props.suit !== b.props.suit ? a.props.suit - b.props.suit : b.props.rank - a.props.rank
                )]}
            }
        default:
            return state
    }
}

const CardStateContext = createContext<{
    state: CardState,
    dispatch: Dispatch<CardAction>
}>({
    state: initialCardState,
    dispatch: () => undefined
})

export const CardStateProvider = ({ children }: { children: ReactNode }) => {
    const [ state, dispatch ] = useReducer(cardReducer, initialCardState)
    return (
        <CardStateContext.Provider value={{ state, dispatch }}>
            {children}
        </CardStateContext.Provider>
    )
}

export const useCardState = () => {
    const context = useContext(CardStateContext)
    if(context == undefined) { throw new Error('can\'t access card context here') }
    return context
}