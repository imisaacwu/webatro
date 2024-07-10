// import { Dispatch, ReactElement, ReactNode, createContext, useContext, useReducer } from "react"
// import { handLevels, HandType, Rank, rankChips } from "../../Constants"

// type HandState = {
//     hand: {
//         name: keyof typeof HandType
//         level: { level: number, chips: number, mult: number }
//     }
//     score: number
// }

// type HandAction = {
//     type: 'score' | 'level-up'
//     payload: {
//         cards?: ReactElement[]
//         hand?: keyof typeof HandType
//     }
// }

// const initialHandState: HandState = { hand: { name: 'NONE', level: handLevels['NONE'] }, score: 0}

// const handReducer = (state: HandState, action: HandAction): HandState => {
//     switch(action.type) {
//         case 'score':
//             if(action.payload.cards == undefined) { throw new Error('no cards to score!')}
//             const name = bestHand(action.payload.cards)
//             return { hand: { name: name, level: handLevels[name]}, score: score(name, action.payload.cards)}
//         case 'level-up':
//             if(action.payload.hand == undefined) { throw new Error('no hand to upgrade!')}
//             const upgrade = handUpgrade[action.payload.hand]
//             handLevels[action.payload.hand].level++
//             handLevels[action.payload.hand].chips += upgrade.chips
//             handLevels[action.payload.hand].mult += upgrade.mult
//             return state
//         default:
//             return state
//     }
// }

// const score = (name: keyof typeof HandType, cards: ReactElement[]): number => {
//     let chips = handLevels[name].chips, mult = handLevels[name].mult
//     cards.forEach(card => chips += rankChips[Rank[card.props.rank] as keyof typeof rankChips])
//     return chips * mult
// }

// const HandStateContext = createContext<{
//     state: HandState,
//     dispatch: Dispatch<HandAction>
// }>({
//     state: initialHandState,
//     dispatch: () => undefined
// })

// export const HandStateProvider = ({ children }: { children: ReactNode }) => {
//     const [ state, dispatch ] = useReducer(handReducer, initialHandState)    
//     return (
//         <HandStateContext.Provider value={{ state, dispatch }}>
//             {children}
//         </HandStateContext.Provider>
//     )
// }

// export const useHandState = () => {
//     const context = useContext(HandStateContext)
//     if(context == undefined) { throw new Error('can\'t access hand context here') }
//     return context
// }