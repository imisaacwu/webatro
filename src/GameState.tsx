import { createContext, Dispatch, ReactElement, ReactNode, useReducer } from "react"
import { Card } from './components/Card'
import { Blinds, BlindType, DeckType, handLevels, HandType, Rank, rankChips, Suit } from "./Constants"
import { ante_base, AnteBlinds, bestHand, boss_roll, cardSnap, getNextBlind, shuffle } from "./Utilities"

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
        deck: ReactElement[]
        hand: ReactElement[]
        selected: ReactElement[]    // Still in hand, selected
        submitted: ReactElement[]   // To be scored
        hidden: ReactElement[]      // Off-screen
        sort: 'rank' | 'suit'
    }

    // In hand or submitted, handled automatically
    active: {
        name: keyof typeof HandType
        chips: number
        score: number
    }
}

type GameAction = {
    type: 'init' | 'state' | 'stat' | 'select' | 'submit' | 'discard' | 'draw' | 'setSort' | 'updateHand'
    payload?: {
        deck?: keyof typeof DeckType,

        state?: GameStates

        stat?: 'handSize' | 'hands' | 'discards' | 'money' | 'ante' | 'score'
        amount?: number

        card?: ReactElement
        hand?: ReactElement[]

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
        curr: 'small',
        boss: Blinds[0],
        base: 0
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
        chips: 0,
        score: 0
    }
}

const gameReducer = (state: GameState, action: GameAction): GameState => {
    const sort = (a: ReactElement, b: ReactElement) => (
        ((!!action.payload?.sort) ? action.payload.sort : state.cards.sort) === 'rank' ?
        (a.props.rank !== b.props.rank? b.props.rank - a.props.rank : a.props.suit - b.props.suit) :
        (a.props.suit !== b.props.suit ? a.props.suit - b.props.suit : b.props.rank - a.props.rank)
    )
    let next = state
    switch(action.type) {
        case 'init':
            let arr: ReactElement[] = []
            let suits = Object.keys(Suit).filter(k => isNaN(Number(k))).map(s => s as keyof typeof Suit)
            let ranks = Object.keys(Rank).filter(r => isNaN(Number(r))).map(r => r as keyof typeof Rank)
            switch(action.payload?.deck) {
                case 'Erratic':
                    for(let i = 0; i < 52; i++) {
                        arr.push(
                            <Card
                                key={i}
                                id={i}
                                suit={Suit[suits[Math.floor(Math.random()*suits.length)]]}
                                rank={Rank[ranks[Math.floor(Math.random()*ranks.length)]]}
                            />
                        )
                    }
                    break 
                default:
                    suits.forEach(s => { ranks.forEach(r => {
                        arr.push(
                            <Card
                                key={arr.length}
                                id={arr.length}
                                suit={Suit[s]}
                                rank={Rank[r]}
                            />
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
                    state.cards.selected.forEach(c => {
                        document.getElementById(`card ${c.props.id}`)?.classList.remove('selected')
                    })
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
            let card = action.payload?.card!, div = document.getElementById(`card ${card.props.id}`)!, updated
            if(!state.cards.selected.includes(card)) {
                updated = [...state.cards.selected, card]
                div.classList.add('selected')
            } else {
                updated = state.cards.selected.filter(c => c.props.id !== card.props.id)
                div.classList.remove('selected')
            }
            next = {...next, cards: {...state.cards,
                selected: updated
            }}
            let hand = bestHand(updated)
            next = {...next, active: {
                name: hand,
                chips: handLevels[hand].chips,
                score: (handLevels[hand].chips +
                        [...state.cards.selected, card].reduce((t, c) => t += rankChips[Rank[c.props.rank as keyof typeof Rank]], 0)
                    ) * handLevels[hand].mult
            }}
            break 
        case 'submit':
            let temp = [...state.cards.selected].reverse()
            handLevels[state.active.name === 'ROYAL_FLUSH' ? 'STRAIGHT_FLUSH' : state.active.name].played++;
            next = {...next,
                stats: {...state.stats,
                    hands: state.stats.hands - 1,
                    score: state.stats.score + state.active.score
                },
                cards: {...state.cards,
                    hand: state.cards.hand.filter(c => !temp.includes(c)),
                    selected: [],
                    submitted: temp
                },
                active: {...state.active,
                    chips: state.active.chips + state.cards.selected.reduce((t, c) => t += rankChips[Rank[c.props.rank as keyof typeof Rank]], 0)
                }
            }
            setTimeout(() => {
                temp.forEach(c => {
                    let div = document.getElementById(`card ${c.props.id}`)!
                    div.classList.remove('selected')
                    div.classList.add('submitted')
                    let popup = document.createElement('div')
                    popup.classList.add('popup')
                    popup.textContent = `+${rankChips[Rank[c.props.rank] as keyof typeof rankChips]}`
                    div.appendChild(popup)
                })
            })
            break 
        case 'discard':
            if(action.payload?.hand) {
                next = {...next, cards: {...state.cards,
                    hand: state.cards.hand.filter(c => action.payload?.hand!.includes(c)),
                    hidden: [...state.cards.hidden, ...action.payload.hand!]
                }}
            } else if(state.cards.submitted.length > 0) {
                state.cards.submitted.forEach(c => {
                    document.getElementById(`card ${c.props.id}`)?.classList.remove('submitted')
                })
                next = {...next, cards: {...state.cards,
                    submitted: [],
                    hidden: [...state.cards.hidden, ...state.cards.submitted]
                }}
            } else {
                state.cards.selected.forEach(c => {
                    document.getElementById(`card ${c.props.id}`)?.classList.remove('selected')
                })
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
            break;
        case 'setSort':
            next = {...next, cards: {...state.cards,
                hand: state.cards.hand.sort(sort),
                sort: action.payload?.sort!
            }}
            setTimeout(() => cardSnap(state.cards.hand))
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