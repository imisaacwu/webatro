import { ReactElement, useContext, useReducer } from 'react'
import './Calculator.css'
import { CardStateContext } from '../App'
import { HandType } from './Constants'

type HandLevelState = {
    level: {[K in keyof typeof HandType]: number}
}

type HandLevelAction = {
    type: 'add'
    hand: keyof typeof HandType
    amount?: number
}

const initializeHands = () => {
    const levels = {} as HandLevelState['level']
    Object.keys(HandType).forEach(k => levels[k as keyof typeof HandType] = 1)
    return levels;
}
const initialHandLevel: HandLevelState = {level: initializeHands()}

const handLevelReducer = (state: HandLevelState, action: HandLevelAction): HandLevelState => {
    switch(action.type) {
        case 'add':
            return {level: {...state.level, [action.hand]: state.level[action.hand] + 1}}
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
            if(hand === 14535931) return 'ROYAL_FLUSH'
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
                <div id='hand-level'>{hand !== 'NONE' ? `lvl.${levels.level[hand]}` : ''}</div>
            </div>
            <div id='calculator'>
                <div id='chips'>0</div>
                <div id='X'>X</div>
                <div id='mult'>0</div>
            </div>
        </div>
    )
}
