import { createContext, Dispatch, ReactNode, useReducer } from "react"
import { BlindType, CardInfo, Consumables, ConsumableType, DeckType, handLevels, HandType, handUpgrade, Rank, Suit } from "./Constants"
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
        consumableSize: number
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
        played: (keyof typeof HandType | CardInfo)[] // For boss blinds
        consumables: ConsumableType[]
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
    type:
        'init' |
        'state' |
        'stat' |
        'select' | 'submit' | 'discard' | 'draw' |
        'buy' | 'use' | 'sell' |
        'setSort' | 'updateHand'
    payload?: {
        deck?: keyof typeof DeckType,

        state?: GameStates

        stat?: 'handSize' | 'hands' | 'discards' | 'money' | 'ante' | 'score'
        previous?: 'played' | 'discarded'   // To know during a draw which came previously
        amount?: number

        card?: CardInfo
        hand?: CardInfo[]
        consumable?: ConsumableType

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
        score: 0,
        consumableSize: 2
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
        sort: 'rank',
        played: [],
        consumables: [{id: 0, ...Consumables[0]}, {id: 1, ...Consumables[8]}]
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
    let next = state, name = state.blind.boss.name
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
                    if(state.blind.curr === 'boss') {
                        if(name === 'The Club') {
                            next.cards.deck.forEach(c => {
                                if(c.suit === Suit.Clubs) {
                                    c.debuffed = true
                                }
                            })
                        } else if(name === 'The Goad') {
                            next.cards.deck.forEach(c => {
                                if(c.suit === Suit.Spades) {
                                    c.debuffed = true
                                }
                            })
                        } else if(name === 'The Head') {
                            next.cards.deck.forEach(c => {
                                if(c.suit === Suit.Hearts) {
                                    c.debuffed = true
                                }
                            })
                        } else if(name === 'The Pillar') {
                            next.cards.deck.forEach(c => {
                                if(state.cards.played.includes(c)) {
                                    c.debuffed = true
                                }
                            })
                        } else if(name === 'The Plant') {
                            next.cards.deck.forEach(c => {
                                if([Rank.King, Rank.Queen, Rank.Jack].includes(c.rank)) {
                                    c.debuffed = true
                                }
                            })
                        } else if(name === 'The Needle') {
                            next.stats.hands = 1
                        } else if(name === 'The Water') {
                            next.stats.discards = 0
                        } else if(name === 'The Window') {
                            next.cards.deck.forEach(c => {
                                if(c.suit === Suit.Diamonds) {
                                    c.debuffed = true
                                }
                            })
                        }
                    }
                    break
                case 'post-scoring':
                    let deck = [...state.cards.deck, ...state.cards.hand, ...state.cards.hidden, ...state.cards.submitted]
                    deck.forEach(c => {
                            c.selected = false
                            c.debuffed = false
                        }
                    )
                    next = {...next,
                        ...(getNextBlind(state.blind.curr) === 'small' && {...state.stats,
                            ante: state.stats.ante + 1
                        }),
                        cards: {...state.cards,
                            deck: deck,
                            hand: [],
                            hidden: [],
                            submitted: [],
                        }
                    }
                    if(state.blind.curr === 'boss' || name !== 'The Pillar') {
                        next = {...next, cards: {...next.cards,
                            played: []
                        }}
                    }
                    if(state.blind.curr === 'boss' && name === 'The Tooth') {
                        next.stats.money -= state.cards.played.length
                    }
                    break
                case 'shop':
                    let nextBlind = getNextBlind(state.blind.curr)
                    next = {...next,
                        stats: {...state.stats,
                            handSize: initialGameState.stats.handSize,
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
                [action.payload?.stat!]: state.stats[action.payload?.stat!] + (action.payload?.amount === undefined ? -1 : action.payload.amount)
            }}
            break 
        case 'select':
            const card = action.payload?.card!
            if(state.blind.curr !== 'boss' || state.blind.boss.name !== 'Cerulean Bell' || state.cards.selected.indexOf(card) !== 0) {
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
            }
            break
        case 'submit':
            state.cards.selected.forEach(c => {
                c.selected = false
                c.flipped = false
                c.submitted = true
            })
            if(state.blind.curr === 'boss' && ((name === 'The Psychic' && state.cards.selected.length < 5) ||
                (name === 'The Eye' && state.cards.played.includes(state.active.name)) ||
                (name === 'The Mouth' && state.cards.played.length > 0 && !state.cards.played.includes(state.active.name)))) {
                next = {...next, active: initialGameState.active}
            } else {
                let hand = state.active.name
                if(state.blind.curr === 'boss') {
                    if(name === 'The Arm') {
                        if(handLevels[hand].level > 1) {
                            handLevels[hand].level--
                            handLevels[hand].chips -= handUpgrade[hand].chips
                            handLevels[hand].mult -= handUpgrade[hand].mult
                        }
                    } else if(name.match('The\ [Eye|Mouth]')) {
                        next.cards.played.push(hand)
                    } else if(name === 'The Tooth') {
                        next.cards.played = [...next.cards.played, ...state.cards.selected]
                    }
                } else if(name === 'The Pillar') {
                    next.cards.played = [...next.cards.played, ...state.cards.selected]
                }
                handLevels[hand].played++
                let ranks: number[] = new Array(13).fill(0)
                state.cards.selected.forEach(c => {
                    c.scored = true
                    ranks[c.rank]++
                })
                let main = hand === 'FOUR' ? 4 : hand === 'THREE' ? 3 : hand.match('(TWO_)?PAIR') ? 2 : -1
                if(main > 0) {
                    state.cards.selected.forEach(c => {
                        if(ranks[c.rank] !== main) {
                            c.scored = false
                        }
                    })
                } else if(hand === 'HIGH_CARD') {
                    state.cards.selected.sort((a, b) => b.rank - a.rank).forEach((c, i) => {
                        if(i > 0) { c.scored = false }
                    })
                }
                let score = scoreHand(state.cards.selected)
                if(state.blind.curr === 'boss' && name === 'The Flint') {
                    score.chips = Math.ceil(score.chips / 2.0)
                    score.mult = Math.ceil(score.mult / 2.0)
                }
                next.stats.score += (score.chips * score.mult)
                next.active.score = score
            }
            next = {...next,
                stats: {...next.stats,
                    hands: state.stats.hands - 1
                },
                cards: {...next.cards,
                    hand: state.cards.hand.filter(c => !state.cards.selected.includes(c)),
                    selected: [],
                    submitted: state.cards.selected
                }
            }
            break 
        case 'discard':
            state.cards.selected.forEach(c => {
                c.selected = false
                c.flipped = false
            })
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
            let draw = action.payload?.amount
            if(state.blind.curr === 'boss' && name === 'The Serpent' && action.payload?.previous !== undefined) { draw = 3 }
            let nextHand = state.cards.deck.slice(0, draw)
            if(state.blind.curr === 'boss') {
                switch(name) {
                    case 'The House':
                        if(action.payload?.previous === undefined) {
                            nextHand.forEach(c => c.flipped = true)
                        }
                        break
                    case 'The Wheel':
                        nextHand.forEach(c => c.flipped = Math.random() <= (1 / 7))
                        break
                    case 'The Fish':
                        if(action.payload?.previous === 'played') {
                            nextHand.forEach(c => c.flipped = true)
                        }
                        break
                    case 'The Mark':
                        nextHand.forEach(c => {
                            if([Rank.King, Rank.Queen, Rank.Jack].includes(c.rank)) {
                                c.flipped = true
                            }
                        })
                        break
                }
            }
            next = {...next, cards: {...state.cards,
                hand: [...state.cards.hand, ...nextHand].sort(sort),
                deck: state.cards.deck.slice(draw)
            }}
            if(state.blind.curr === 'boss' && name === 'Cerulean Bell') {
                let card = next.cards.hand[Math.floor(Math.random() * next.cards.hand.length)]
                next.cards.selected.push(card)
                card.selected = true
            }
            break
        case 'buy':
            next = {...next,
                stats: {...state.stats,
                    money: state.stats.money - action.payload?.amount!
                },
                cards: {...state.cards,
                    consumables: [...state.cards.consumables, action.payload?.consumable!]
                }
            }
            break
        case 'use':
        case 'sell':
            break
        case 'setSort':
            next = {...next, cards: {...state.cards,
                hand: state.cards.hand.sort(sort),
                sort: action.payload?.sort!
            }}
            setTimeout(() => cardSnap(state.cards.hand, 6000))
            break
        case 'updateHand':
            next = {...next, cards: {...state.cards,
                hand: action.payload?.hand!
            }}
            break
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