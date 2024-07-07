import { Dispatch, ReactElement, ReactNode, createContext, useContext, useReducer } from "react"
import { HandType, Rank, rankChips } from "../Constants"

type HandLevel = {
    [K in keyof typeof HandType]: { level: number, chips: number, mult: number }
}

const handLevels: HandLevel = {
    'FLUSH_FIVE': {level: 1, chips: 160, mult: 16},
    'FLUSH_HOUSE': {level: 1, chips: 140, mult: 14},
    'FIVE': {level: 1, chips: 120, mult: 12},
    'ROYAL_FLUSH': {level: 1, chips: 100, mult: 8},
    'STRAIGHT_FLUSH': {level: 1, chips: 100, mult: 8},
    'FOUR': {level: 1, chips: 60, mult: 7},
    'FULL_HOUSE': {level: 1, chips: 40, mult: 4},
    'FLUSH': {level: 1, chips: 35, mult: 4},
    'STRAIGHT': {level: 1, chips: 30, mult: 4},
    'THREE': {level: 1, chips: 30, mult: 3},
    'TWO_PAIR': {level: 1, chips: 20, mult: 2},
    'PAIR': {level: 1, chips: 10, mult: 2},
    'HIGH_CARD': {level: 1, chips: 5, mult: 1},
    'NONE': {level: 0, chips: 0, mult: 0}
}

const handUpgrade = {
    'FLUSH_FIVE': {chips: 50, mult: 3},
    'FLUSH_HOUSE': {chips: 40, mult: 4},
    'FIVE': {chips: 35, mult: 3},
    'ROYAL_FLUSH': {chips: 40, mult: 4},
    'STRAIGHT_FLUSH': {chips: 40, mult: 4},
    'FOUR': {chips: 30, mult: 3},
    'FULL_HOUSE': {chips: 25, mult: 2},
    'FLUSH': {chips: 15, mult: 2},
    'STRAIGHT': {chips: 30, mult: 3},
    'THREE': {chips: 20, mult: 2},
    'TWO_PAIR': {chips: 20, mult: 1},
    'PAIR': {chips: 15, mult: 1},
    'HIGH_CARD': {chips: 10, mult: 1},
    'NONE': {chips: 0, mult: 0}
} as const

type HandState = {
    hand: {
        name: keyof typeof HandType
        level: { level: number, chips: number, mult: number }
    }
    score: number
}

type HandAction = {
    type: 'score' | 'level-up'
    payload: {
        cards?: ReactElement[]
        hand?: keyof typeof HandType
    }
}

const initialHandState: HandState = { hand: { name: 'NONE', level: handLevels['NONE'] }, score: 0}

const handReducer = (state: HandState, action: HandAction): HandState => {
    switch(action.type) {
        case 'score':
            if(action.payload.cards == undefined) { throw new Error('no cards to score!')}
            const name = bestHand(action.payload.cards)
            return { hand: { name: name, level: handLevels[name]}, score: score(name, action.payload.cards)}
        case 'level-up':
            if(action.payload.hand == undefined) { throw new Error('no hand to upgrade!')}
            const upgrade = handUpgrade[action.payload.hand]
            handLevels[action.payload.hand].level++
            handLevels[action.payload.hand].chips += upgrade.chips
            handLevels[action.payload.hand].mult += upgrade.mult
            return state
        default:
            return state
    }
}

const bestHand = (cards: ReactElement[]): keyof typeof HandType => {
    // xxxAKQJT 98765432
    const straights = [0x100F, 0x1F, 0x3E, 0x7C, 0xF8, 0x1F0, 0x3E0, 0x7C0, 0xF80, 0x1F00]
    const hand = cards.reduce((total, c) => total | (1 << c.props.rank), 0)

    let ranks: number[] = new Array(13).fill(0), suits: number[] = new Array(4).fill(0);
    cards.forEach(c => {ranks[c.props.rank]++; suits[c.props.suit]++;})
    ranks = ranks.filter(r => r !== 0).sort((a, b) => b - a)
    suits = suits.filter(s => s !== 0).sort((a, b) => b - a)

    if(suits[0] === 5) {
        if(ranks[0] === 5) return 'FLUSH_FIVE'
        if(hand === 0x1F00) return 'ROYAL_FLUSH'
        if(straights.includes(hand)) return 'STRAIGHT_FLUSH'
        if(ranks[0] === 3 && ranks[1] === 2) return 'FLUSH_HOUSE'
        return 'FLUSH'
    }

    switch(ranks[0]) {
        case 5: return 'FIVE'
        case 4: return 'FOUR'
        case 3: return ranks[1] === 2 ? 'FULL_HOUSE' : 'THREE'
        case 2: return ranks[1] === 2 ? 'TWO_PAIR' : 'PAIR'
        case 1: return straights.includes(hand) ? 'STRAIGHT' : 'HIGH_CARD'
    }

    return 'NONE'
}

const score = (name: keyof typeof HandType, cards: ReactElement[]): number => {
    let chips = handLevels[name].chips, mult = handLevels[name].mult
    cards.forEach(card => chips += rankChips[Rank[card.props.rank] as keyof typeof rankChips])
    return chips * mult
}

const HandStateContext = createContext<{
    state: HandState,
    dispatch: Dispatch<HandAction>
}>({
    state: initialHandState,
    dispatch: () => undefined
})

export const HandStateProvider = ({ children }: { children: ReactNode }) => {
    const [ state, dispatch ] = useReducer(handReducer, initialHandState)    
    return (
        <HandStateContext.Provider value={{ state, dispatch }}>
            {children}
        </HandStateContext.Provider>
    )
}

export const useHandState = () => {
    const context = useContext(HandStateContext)
    if(context == undefined) { throw new Error('can\'t access hand context here') }
    return context
}