import { createContext, Dispatch } from "react"
import { BlindType, Consumables, ConsumableType, DeckType, Edition, Enhancement, handLevels, HandType, handUpgrade, Rank, rankChips, Seal, Suit } from "./Constants"
import { ante_base, AnteBlinds, bestHand, boss_roll, cardSnap, getNextBlind, shuffle } from "./Utilities"
import { CardInfo } from "./components/CardInfo"

export const levelHand = ({ hand, n = 1 }: {hand: keyof typeof handLevels, n?: number}) => {
    handLevels[hand].level += n
    handLevels[hand].chips += handUpgrade[hand].chips * n
    handLevels[hand].mult += handUpgrade[hand].mult * n
}

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
        deck: DeckType
    }

    blind: {
        curr: AnteBlinds
        boss: BlindType
        base: number
    }

    cards: {
        nextId: number
        deck: CardInfo[]
        hand: CardInfo[]
        selected: CardInfo[]    // Still in hand, selected
        submitted: CardInfo[]   // To be scored
        hidden: CardInfo[]      // Off-screen
        sort: 'rank' | 'suit'
        played: (keyof typeof HandType | CardInfo)[] // For boss blinds
        consumables: ConsumableType[]
        lastCon: string | undefined     // name of last used Consumable
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
        'setSort' | 'updateCards' | 'addCard' | 'removeCard' |
        'setLastUsedConsumable'
    payload?: {
        deck?: DeckType,

        state?: GameStates

        stat?: 'handSize' | 'hands' | 'discards' | 'money' | 'ante' | 'score'
        previous?: 'played' | 'discarded'   // To know during a draw which came previously
        amount?: number

        cardLocation?: keyof typeof initialGameState['cards']
        update?: (CardInfo | ConsumableType)[]
        card?: CardInfo | Omit<CardInfo, 'id'>
        consumable?: ConsumableType | Omit<ConsumableType, 'id'>

        sort?: 'rank' | 'suit'
    }
}

export const initialGameState: GameState = {
    state: 'shop' as GameStates,

    stats: {
        handSize: 8,
        hands: 4,
        discards: 4,
        money: 4,
        ante: 1,
        round: 0,
        score: 0,
        consumableSize: 2,
        deck: DeckType.Red
    },

    blind: {
        curr: 'boss',
        boss: boss_roll(1),
        base: ante_base(1)
    },

    cards: {
        nextId: 0,
        deck: [],
        hand: [],
        selected: [],
        submitted: [],
        hidden: [],
        sort: 'rank',
        played: [],
        consumables: [{id: -1, ...Consumables[29]}, {id: -2, ...Consumables[19]}],
        lastCon: undefined
    },

    active: {
        name: 'NONE',
        score: {
            chips: 0,
            mult: 0
        }
    }
}

export const gameReducer = (state: GameState, action: GameAction): GameState => {
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
            let editions = Object.keys(Edition).filter(e => (isNaN(Number(e)) && e !== 'Negative')).map(e => e as keyof typeof Edition)
            let enhancements = Object.keys(Enhancement).filter(e => isNaN(Number(e))).map(e => e as keyof typeof Enhancement)
            let seals = Object.keys(Seal).filter(s => isNaN(Number(s))).map(s => s as keyof typeof Seal)
            switch(action.payload?.deck!) {
                case DeckType.Erratic:
                    next.stats.deck = DeckType.Erratic
                    for(let i = 1; i <= 52; i++) {
                        arr.push(
                            {
                                id: i,
                                suit: Suit[suits[Math.floor(Math.random()*suits.length)]],
                                rank: Rank[ranks[Math.floor(Math.random()*ranks.length)]],
                                edition: Math.random() > .8 ? Edition[editions[Math.floor(Math.random()*editions.length)]] : undefined,
                                enhancement: Math.random() > .8 ? Enhancement[enhancements[Math.floor(Math.random()*enhancements.length)]]: undefined,
                                seal: Math.random() > .8 ? Seal[seals[Math.floor(Math.random()*seals.length)]]: undefined,
                                deck: DeckType.Erratic
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
                                deck: action.payload?.deck!
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
                    nextId: 53,
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
            if(action.payload?.consumable) {
                const consumables = state.cards.consumables
                const index = consumables.findIndex(c => c.id === (action.payload!.consumable! as ConsumableType).id)!
                let updated = state.cards.consumables
                updated.forEach((c, i) => c.selected = !c.selected && i === index)
                next = {...next, cards: {...state.cards,
                    consumables: updated
                }}
            } else {
                const card = action.payload?.card! as CardInfo
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
            }
            break
        case 'submit':
            let selected = state.cards.selected.sort((a, b) => (
                state.cards.hand.findIndex(c => c.id === b.id) - state.cards.hand.findIndex(c => c.id === a.id)
            ))
            // Update card state
            selected.forEach(c => {
                c.selected = false
                c.flipped = false
                c.submitted = true
            })
            // Does it score?
            if(state.blind.curr === 'boss' && ((name === 'The Psychic' && selected.length < 5) ||
                (name === 'The Eye' && state.cards.played.includes(state.active.name)) ||
                (name === 'The Mouth' && state.cards.played.length > 0 && !state.cards.played.includes(state.active.name)))) {
                next = {...next, active: initialGameState.active}
            } else {
                let hand = state.active.name
                // Keep track of hands for relevant bosses
                if(state.blind.curr === 'boss') {
                    if(name === 'The Arm') {
                        if(handLevels[hand].level > 1) {
                            levelHand({hand: hand, n: -1})
                        }
                    } else if(name.match('The\ [Eye|Mouth]')) {
                        next.cards.played.push(hand)
                    } else if(name === 'The Tooth') {
                        next.cards.played = [...next.cards.played, ...selected]
                    }
                } else if(name === 'The Pillar') {
                    next.cards.played = [...next.cards.played, ...selected]
                }
                handLevels[hand].played++
                // Determine which cards score
                let ranks: number[] = new Array(13).fill(0)
                selected.forEach(c => {
                    c.scored = true
                    ranks[c.rank]++
                })
                let main = hand === 'FOUR' ? 4 : hand === 'THREE' ? 3 : hand.match('(TWO_)?PAIR') ? 2 : -1
                if(main > 0) {
                    selected.forEach(c => {
                        if(ranks[c.rank] !== main) {
                            c.scored = false
                        }
                    })
                } else if(hand === 'HIGH_CARD') {
                    selected.sort((a, b) => b.rank - a.rank).forEach((c, i) => {
                        if(i > 0) { c.scored = false }
                    })
                }
                // Activation sequence
                let chips = handLevels[hand].chips, mult = handLevels[hand].mult
                let glassToBreak = []
                selected.forEach(c => {
                    if(!c.debuffed && c.scored) {
                        for(let i = 0; i < 1; i++) {
                            chips += rankChips[Rank[c.rank] as keyof typeof rankChips]
                            if(c.enhancement !== undefined) {
                                switch(c.enhancement) {
                                    case Enhancement.Bonus: chips += 30; break
                                    case Enhancement.Glass:
                                        mult *= 2;
                                        if(Math.random() < .25) { glassToBreak.push(c) }
                                        break
                                    case Enhancement.Lucky:
                                        if(Math.random() < .2) { mult += 20 }
                                        if(Math.random() < .07) { next.stats.money += 20 }
                                        break
                                    case Enhancement.Mult: mult += 4; break
                                    case Enhancement.Stone: chips += 50; break
                                }
                            }
                            if(c.seal !== undefined && c.seal === Seal.Gold) {
                                next.stats.money += 3
                            }
                            if(c.edition !== undefined) {
                                switch(c.edition) {
                                    case Edition.Foil: chips += 50; break
                                    case Edition.Holographic: mult += 10; break
                                    case Edition.Polychrome: mult *= 1.5; break
                                }
                            }
                            if(c.enhancement !== undefined && c.enhancement === Enhancement.Bonus) { chips += 30 }

                            // if(c.seal !== undefined && c.seal === Seal.Red) { i-- }
                        }
                    }
                })
                chips = Math.ceil(chips), mult = Math.ceil(mult)
                
                if(state.blind.curr === 'boss' && name === 'The Flint') {
                    chips = Math.ceil(chips / 2.0)
                    mult = Math.ceil(mult / 2.0)
                }
                next.stats.score += (chips * mult)
                next.active.score = {chips: chips, mult: mult}
            }
            next = {...next,
                stats: {...next.stats,
                    hands: state.stats.hands - 1
                },
                cards: {...next.cards,
                    hand: state.cards.hand.filter(c => !selected.includes(c)),
                    selected: [],
                    submitted: selected
                }
            }
            break 
        case 'discard':
            if(state.cards.consumables.some(c => c.selected)) {
                next = {...next, cards: {...state.cards,
                    consumables: state.cards.consumables.filter(c => !c.selected)
                }}
            } else {
                state.cards.selected.forEach(c => {
                    c.selected = false
                    c.flipped = false
                })
                if(action.payload?.update) {
                    next = {...next, cards: {...state.cards,
                        hand: state.cards.hand.filter(c => action.payload?.update!.includes(c)),
                        hidden: [...state.cards.hidden, ...action.payload.update! as CardInfo[]]
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
            }
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
                    consumables: [...state.cards.consumables, action.payload?.consumable! as ConsumableType]
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
            setTimeout(() => cardSnap({cards: state.cards.hand, idPrefix: 'card'}))
            break
        case 'updateCards':
            next = {...next, cards: {...state.cards,
                [action.payload?.cardLocation!]: action.payload?.update!
            }}
            let cards = state.cards[`${action.payload?.cardLocation!}`] as any[]
            let prefix = action.payload?.cardLocation === 'hand' ? 'card' : 'consumable'
            setTimeout(() => cardSnap({cards: cards, idPrefix: prefix}))
            break
        case 'addCard':
            if(action.payload?.consumable) {
                next = {...next, cards: {...state.cards,
                    nextId: state.cards.nextId + 1,
                    consumables: [...state.cards.consumables, {
                        id: state.cards.nextId,
                        ...action.payload.consumable
                    }]
                }}
            } else {
                next = {...next, cards: {...state.cards,
                    nextId: state.cards.nextId + 1,
                    [action.payload?.cardLocation!]: [...state.cards[action.payload?.cardLocation!] as any[], {
                        id: state.cards.nextId,
                        ...action.payload?.card
                    }]
                }}
            }
            break
        case 'removeCard':
            next = {...next, cards: {...state.cards,
                [action.payload?.cardLocation!]: (state.cards[action.payload?.cardLocation!] as any[]).filter(c => c.id !== (action.payload?.card as CardInfo).id)
            }}
            break
        case 'setLastUsedConsumable':
            next.cards.lastCon = action.payload?.consumable!.name
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