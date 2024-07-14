import { createContext, Dispatch, ReactNode, useReducer } from "react"
import { BlindType, CardInfo, DeckType, handLevels, HandType, Rank, Suit } from "./Constants"
import { ante_base, AnteBlinds, bestHand, boss_roll, cardSnap, getNextBlind, scoreHand, shuffle } from "./Utilities"

type GameStates = 'blind-select' | 'scoring' | 'post-scoring' | 'shop'

type GameState = {
    state: GameStates
    
    stats: {
        handSize: number
        hands: number
        discards: number
        money: number
        ante: number
        round: number
        score: number
    }

    blind: {
        curr: AnteBlinds
        boss: BlindType
        base: number
    }

    cards: {
        deck: CardInfo[]
        hand: CardInfo[]
        selected: CardInfo[]    // Still in hand, selected
        submitted: CardInfo[]   // To be scored
        hidden: CardInfo[]      // Off-screen
        sort: 'rank' | 'suit'
    }

    // In hand or submitted, handled automatically
    active: {
        name: keyof typeof HandType
        score: {
            chips: number
            mult: number
        }
    }
}

type GameAction = {
    type: 'init' | 'state' | 'stat' | 'select' | 'submit' | 'discard' | 'draw' | 'setSort' | 'updateHand'
    payload?: {
        deck?: keyof typeof DeckType,

        state?: GameStates

        stat?: 'handSize' | 'hands' | 'discards' | 'money' | 'ante' | 'score'
        amount?: number

        card?: CardInfo
        hand?: CardInfo[]

        sort?: 'rank' | 'suit'
    }
}

const initialGameState: GameState = {
    state: 'blind-select' as GameStates,

    stats: {
        handSize: 8,
        hands: 4,
        discards: 4,
        money: 4,
        ante: 1,
        round: 0,
        score: 0
    },

    blind: {
        curr: 'boss',
        boss: boss_roll(1),
        base: ante_base(1)
    },

    cards: {
        deck: [],
        hand: [],
        selected: [],
        submitted: [],
        hidden: [],
        sort: 'rank'
    },

    active: {
        name: 'NONE',
        score: {
            chips: 0,
            mult: 0
        }
    }
}

const gameReducer = (state: GameState, action: GameAction): GameState => {
    const sort = (a: CardInfo, b: CardInfo) => (
        ((!!action.payload?.sort) ? action.payload.sort : state.cards.sort) === 'rank' ?
        (a.rank !== b.rank? b.rank - a.rank : a.suit - b.suit) :
        (a.suit !== b.suit ? a.suit - b.suit : b.rank - a.rank)
    )
    let next = state
    switch(action.type) {
        case 'init':
            let arr: CardInfo[] = []
            let suits = Object.keys(Suit).filter(k => isNaN(Number(k))).map(s => s as keyof typeof Suit)
            let ranks = Object.keys(Rank).filter(r => isNaN(Number(r))).map(r => r as keyof typeof Rank)
            switch(action.payload?.deck) {
                case 'Erratic':
                    for(let i = 0; i < 52; i++) {
                        arr.push(
                            {
                                id: i,
                                suit: Suit[suits[Math.floor(Math.random()*suits.length)]],
                                rank: Rank[ranks[Math.floor(Math.random()*ranks.length)]]
                            }
                        )
                    }
                    break 
                default:
                    suits.forEach(s => { ranks.forEach(r => {
                        arr.push(
                            {
                                id: arr.length + 1,
                                suit: Suit[s],
                                rank: Rank[r],
                            }
                        )
                    })})
            }
            next = {...next,
                blind: {...state.blind,
                    boss: boss_roll(state.stats.ante),
                    base: ante_base(state.stats.ante)
                },
                cards: {...state.cards,
                    deck: arr
                }
            }
            break 
        case 'state':
            next = {...next,
                state: action.payload?.state!
            }
            switch(action.payload?.state) {
                case 'scoring':
                    next = {...next,
                        stats: {...state.stats,
                            round: state.stats.round + 1
                        },
                        cards: {...state.cards,
                            deck: shuffle(state.cards.deck)
                        }
                    }
                    break
                case 'post-scoring':
                    state.cards.selected.forEach(c => c.selected = false)
                    next = {...next,
                        ...(getNextBlind(state.blind.curr) === 'small' && {...state.stats,
                            ante: state.stats.ante + 1
                        }),
                        cards: {...state.cards,
                            deck: [...state.cards.deck, ...state.cards.hand, ...state.cards.hidden, ...state.cards.submitted],
                            hand: [],
                            hidden: [],
                            submitted: []
                        }
                    }
                    break
                case 'shop':
                    let nextBlind = getNextBlind(state.blind.curr)
                    next = {...next,
                        stats: {...state.stats,
                            hands: initialGameState.stats.hands,
                            discards: initialGameState.stats.discards,
                            money: state.stats.money + action.payload.amount!,
                            score: 0
                        },
                        blind: {...state.blind,
                            curr: nextBlind,
                            ...(nextBlind === 'small' && {
                                boss: boss_roll(state.stats.ante + 1),
                                base: ante_base(state.stats.ante + 1)
                            })
                        }
                    }
                    break 
                default:
            }
            break 
        case 'stat':
            next = {...next, stats: {...state.stats,
                [action.payload?.stat!]: state.stats[action.payload?.stat!] + (action.payload?.amount == undefined ? -1 : action.payload.amount)
            }}
            break 
        case 'select':
            const card = action.payload?.card!
            let updated = state.cards.selected
            if(state.cards.selected.includes(card)) {
                updated = updated.filter(c => c.id !== card.id)
            } else {
                updated.push(card)
            }
            const hand = bestHand(updated)
            next = {...next,
                cards: {...state.cards,
                    selected: updated
                },
                active: {
                    name: hand,
                    score: {
                        chips: handLevels[hand].chips,
                        mult: handLevels[hand].mult
                    }
                }
            }
            card.selected = !card.selected
            break
        case 'submit':
            state.cards.selected.forEach(c => {
                c.selected = false
                c.flipped = false
                c.submitted = true
            })
            handLevels[state.active.name].played++;
            if(['FLUSH_FIVE', 'FLUSH_HOUSE', 'FIVE', 'STRAIGHT_FLUSH', 'FULL_HOUSE', 'FLUSH', 'STRAIGHT'].includes(state.active.name)) {
                state.cards.selected.forEach(c => {
                    c.scored = true
                })
            }
            let score = scoreHand(state.cards.selected)
            next = {...next,
                stats: {...state.stats,
                    hands: state.stats.hands - 1,
                    score: state.stats.score + (score.chips * score.mult)
                },
                cards: {...state.cards,
                    hand: state.cards.hand.filter(c => !state.cards.selected.includes(c)),
                    selected: [],
                    submitted: state.cards.selected.reverse()
                },
                active: {...state.active,
                    score: score
                }
            }
            break 
        case 'discard':
            if(action.payload?.hand) {
                next = {...next, cards: {...state.cards,
                    hand: state.cards.hand.filter(c => action.payload?.hand!.includes(c)),
                    hidden: [...state.cards.hidden, ...action.payload.hand!]
                }}
            } else if(state.cards.submitted.length > 0) {
                state.cards.submitted.forEach(c => c.submitted = false)
                next = {...next, cards: {...state.cards,
                    submitted: [],
                    hidden: [...state.cards.hidden, ...state.cards.submitted]
                }}
            } else {
                state.cards.selected.forEach(c => c.selected = false)
                next = {...next,
                    stats: {...state.stats,
                        discards: state.stats.discards - 1
                    },
                    cards: {...state.cards,
                        hand: state.cards.hand.filter(c => !state.cards.selected.includes(c)),
                        selected: [],
                        hidden: [...state.cards.hidden, ...state.cards.selected]
                    }
                }
            }
            next = {...next, active: initialGameState['active']}
            break
        case 'draw':
            next = {...next, cards: {...state.cards,
                hand: [...state.cards.hand, ...state.cards.deck.slice(0, action.payload?.amount)].sort(sort),
                deck: state.cards.deck.slice(action.payload?.amount)
            }}
            if(state.cards.hand.length === 0) {
                if(state.blind.curr === 'boss' && state.blind.boss.name === 'The House') {
                    next.cards.hand.forEach(c => {
                        c.flipped = true
                    })
                }
            }
            break;
        case 'setSort':
            next = {...next, cards: {...state.cards,
                hand: state.cards.hand.sort(sort),
                sort: action.payload?.sort!
            }}
            setTimeout(() => cardSnap(state.cards.hand, 6000))
            break;
        case 'updateHand':
            next = {...next, cards: {...state.cards,
                hand: action.payload?.hand!
            }}
            break;
        default:
    }
    return next 
}

export const GameStateContext = createContext<{
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