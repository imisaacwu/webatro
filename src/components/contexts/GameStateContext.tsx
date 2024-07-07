import { createContext, Dispatch, ReactNode, useContext, useReducer } from "react"
import { AnteChips, Blinds, BlindType } from "../Constants"

type GameStates = 'blind-select' | 'scoring' | 'post-scoring' | 'shop'

type GameState = {
    mode: GameStates
    handSize: number
    hands: number
    discards: number
    money: number
    ante: number
    round: number
    score: number
    currBlind: 'small' | 'big' | 'boss'
    boss: BlindType
    reqBase: number
}

type GameAction = {
    type: 'init-blinds' | 'hand' | 'score' | 'discard' | 'select' | 'defeat' | 'exit' | 'next'
    payload?: {
        score?: number
    }
}

const nextBlind = (currBlind: 'small' | 'big' | 'boss'): 'small' | 'big' | 'boss' => (
    currBlind === 'small' ? 'big' : currBlind === 'big' ? 'boss' : 'small'
)

const rollBoss = (ante: number) => {
    let arr = Blinds.filter((b, i) => i > 1 && b.ante <= ante)
    return arr[Math.floor(Math.random() * arr.length)]
}

// https://www.desmos.com/calculator/fsvcr75cdx
const ante_base = (ante: number) => {
    if(ante > 8) {
        const b = 1.6, c = ante - 8, d = 1 + 0.2 * c
        const f = Math.floor(AnteChips[8] * ((b + ((0.75 * c) ** d)) ** c));
        return f - (f % (10 ** (Math.floor(Math.log10(f))-1)))
    }
    return AnteChips[ante as keyof typeof AnteChips];
}

const initialGameState = {
    mode: 'blind-select' as GameStates,
    handSize: 8,
    hands: 4,
    discards: 4,
    money: 4,
    ante: 1,
    round: 0,
    score: 0,
    currBlind: 'small' as 'small' | 'big' | 'boss',
    boss: rollBoss(1),
    reqBase: ante_base(1)
}

const gameReducer = (state: GameState, action: GameAction) => {
    switch(action.type) {
        case 'hand':
            return {...state, hands: state.hands - 1}
        case 'score':
            if(action.payload?.score == undefined) { throw new Error('no score to add!') }
            return {...state, score: state.score + action.payload?.score}
        case 'discard':
            return {...state, discards: state.discards - 1}
        case 'select': // After blind-select, Into scoring
            return {...state, mode: 'scoring' as GameStates, round: state.round + 1}
        case 'defeat': // After scoring, Into post-scoring
            return {...state, mode: 'post-scoring' as GameStates}
        case 'exit': // After post-scoring, Into shop
            let next = {...state, mode: 'shop' as GameStates, hands: initialGameState['hands'], discards: initialGameState['discards'], score: 0, currBlind: nextBlind(state.currBlind)}
            if(nextBlind(state.currBlind) === 'small') {
                next = {...next, ante: state.ante + 1, boss: rollBoss(state.ante + 1), reqBase: ante_base(state.ante + 1)}
            }
            return next
        case 'next': // After shop, Into blind select
            return {...state, mode: 'blind-select' as GameStates}
        default:
            return state
    }
}

const GameStateContext = createContext<{
    state: GameState,
    dispatch: Dispatch<GameAction>
}>({
    state: initialGameState,
    dispatch: () => undefined
})

export const GameStateProvider = ({ children }: { children: ReactNode }) => {
    const [ state, dispatch ] = useReducer(gameReducer, initialGameState)
    return (
        <GameStateContext.Provider value={{ state, dispatch }}>
            {children}
        </GameStateContext.Provider>
    )
}

export const useGameState = () => {
    const context = useContext(GameStateContext)
    if(context == undefined) { throw new Error('can\'t access card context here') }
    return context
}