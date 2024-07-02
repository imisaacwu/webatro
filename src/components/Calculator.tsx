import { ReactElement, useContext, useReducer } from 'react'
import './Calculator.css'
import { CardStateContext } from '../App'
import { HandType } from './Constants'

type HandLevelState = {
    [K in keyof typeof HandType]: { level: number, chips: number, mult: number }
}

type HandLevelAction = {
    type: 'add'
    hand: keyof typeof HandType
    amount?: number
}

const initialHandLevel: HandLevelState = {
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

const handLevelReducer = (state: HandLevelState, action: HandLevelAction): HandLevelState => {
    switch(action.type) {
        case 'add':
            return {...state, [action.hand]: {...state[action.hand], level: state[action.hand].level + 1}}
        default:
            return state
    }
}

export const Calculator = () => {
    const { state } = useContext(CardStateContext)
    const [levels, _] = useReducer(handLevelReducer, initialHandLevel)

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

    const hand = bestHand(state.selected);

    return (
        <div id='hand-info'>
            <div id='hand-type'>
                <div id='hand-name'>{HandType[hand]}</div>
                <div id='hand-level'>{hand !== 'NONE' ? `lvl.${levels[hand].level}` : ''}</div>
            </div>
            <div id='calculator'>
                <div id='chips'>{levels[hand].chips}</div>
                <div id='X'>X</div>
                <div id='mult'>{levels[hand].mult}</div>
            </div>
        </div>
    )
}
