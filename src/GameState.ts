import { createContext, Dispatch } from "react"
import { BlindType, ConsumableInstance, Consumables, ConsumableType, DeckType, Edition, Enhancement, handLevels, HandType, handUpgrade, Rank, rankChips, Seal, Suit } from "./Constants"
import { ante_base, AnteBlinds, bestHand, boss_roll, cardSnap, getNextBlind, newOffers, shuffle } from "./Utilities"
import { CardInfo } from "./components/CardInfo"
import { debuffCards } from "./App"
import { Activation, JokerInstance } from "./components/JokerInfo"

export const levelHand = ({ hand, n = 1 }: {hand: keyof typeof handLevels, n?: number}) => {
    handLevels[hand].level += n
    handLevels[hand].chips += handUpgrade[hand].chips * n
    handLevels[hand].mult += handUpgrade[hand].mult * n
}

type GameStates = 'blind-select' | 'scoring' | 'post-scoring' | 'shop'

export type GameState = {
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
        jokerSize: number
        deck: DeckType
    }

    shop: {
        slots: number
        offers: (JokerInstance | ConsumableInstance)[]
        weights: {
            Joker: number;
            Tarot: number;
            Planet: number;
            Card: number;
            Spectral: number;
        }
    }

    blind: {
        curr: AnteBlinds
        boss: BlindType
        base: number
    }

    jokers: JokerInstance[]

    cards: {
        nextId: number
        deck: CardInfo[]
        hand: CardInfo[]
        selected: CardInfo[]    // Still in hand, selected
        submitted: CardInfo[]   // To be scored
        hidden: CardInfo[]      // Off-screen
        sort: 'rank' | 'suit'
        played: (keyof typeof HandType | CardInfo)[] // For boss blinds
        consumables: ConsumableInstance[]
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
        'setSort' | 'updateCards' | 'addCard' | 'removeCard' |
        'setLastUsedConsumable' | 'addJoker' | 'removeJoker' |
        'shop-select' | 'shop-remove' | 'reroll'
    payload?: {
        deck?: DeckType,

        state?: GameStates

        stat?: keyof typeof initialGameState['stats']
        previous?: 'played' | 'discarded'   // To know during a draw which came previously
        amount?: number

        cardLocation?: keyof typeof initialGameState['cards']
        update?: (CardInfo | ConsumableType)[]
        card?: CardInfo | Omit<CardInfo, 'id'> | ConsumableType | JokerInstance | ConsumableInstance

        sort?: 'rank' | 'suit'
    }
}

export const initialGameState: GameState = {
    state: 'shop' as GameStates,

    stats: {
        handSize: 8,
        hands: 4,
        discards: 4,
        money: 400,
        ante: 1,
        round: 0,
        score: 0,
        consumableSize: 2,
        jokerSize: 5,
        deck: DeckType.Red
    },

    shop: {
        slots: 2,
        offers: [],
        weights: {
            Joker: 20,
            Tarot: 4,
            Planet: 4,
            Card: 0,
            Spectral: 0
        }
    },

    blind: {
        curr: 'boss',
        boss: boss_roll(1),
        base: ante_base(1)
    },

    jokers: [],

    cards: {
        nextId: 0,
        deck: [],
        hand: [],
        selected: [],
        submitted: [],
        hidden: [],
        sort: 'rank',
        played: [],
        consumables: [{
            id: 53,
            consumable: Consumables[19]
        }, {
            id: 54,
            consumable: Consumables[21]
        }],
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
                                suit: Suit[suits[Math.floor(Math.random()*suits.length)*0]],
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
                        debuffCards(state.blind.boss, next.cards.deck, state.cards.played)
                        if(name === 'The Needle') {
                            next.stats.hands = 1
                        } else if(name === 'The Water') {
                            next.stats.discards = 0
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
                        shop: {...state.shop,
                            offers: newOffers(state.shop.slots, state.shop.weights, state)
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
            if((action.payload?.card as ConsumableInstance).consumable !== undefined) {
                const consumables = state.cards.consumables
                const index = consumables.findIndex(c => c.id === (action.payload!.card! as ConsumableInstance).id)!
                let updated = state.cards.consumables
                updated.forEach((c, i) => c.selected = !c.selected && i === index)
                next = {...next, cards: {...state.cards,
                    consumables: updated
                }}
            } else if((action.payload?.card as JokerInstance).joker !== undefined) {
                let updated = state.jokers
                updated.forEach(j => {
                    j.selected = (!j.selected && j.id === (action.payload?.card as JokerInstance).id!)
                })
                next = {...next, jokers: updated}
            } else if((action.payload?.card as CardInfo).suit !== undefined) {
                const card = state.cards.hand.find(c => c.id === (action.payload?.card! as CardInfo).id)!
                if(state.blind.curr !== 'boss' || state.blind.boss.name !== 'Cerulean Bell' || state.cards.selected.indexOf(card) !== 0) {
                    card.selected = !card.selected
                    const hand = bestHand(state.cards.hand.filter(c => c.selected))
                    next = {...next,
                        cards: {...state.cards,
                            selected: state.cards.hand.filter(c => c.selected)
                        },
                        active: {
                            name: hand,
                            score: {
                                chips: handLevels[hand].chips,
                                mult: handLevels[hand].mult
                            }
                        }
                    }
                }
            }
            break
        case 'submit':
            let selected = state.cards.selected
            // Update card state
            selected.forEach(c => {
                c.selected = false
                c.flipped = false
                c.submitted = true
            })
            let glassToBreak: CardInfo[] = []
            // Does it score?
            if(state.blind.curr === 'boss' && ((name === 'The Psychic' && selected.length < 5) ||
                (name === 'The Eye' && state.cards.played.includes(state.active.name)) ||
                (name === 'The Mouth' && state.cards.played.length > 0 && !state.cards.played.includes(state.active.name)))) {
                next = {...next, active: initialGameState.active}
            } else {
                let hand = state.active.name
                handLevels[hand].played++
                let chips = handLevels[hand].chips, mult = handLevels[hand].mult

                // Relevant boss mechanics
                if(state.blind.curr === 'boss') {
                    if(name === 'The Arm') {
                        if(handLevels[hand].level > 1) {
                            levelHand({hand: hand, n: -1})
                        }
                    } else if(name === 'The Flint') {
                        chips = Math.ceil(chips / 2.0)
                        mult = Math.ceil(mult / 2.0)
                    } else if(name.match('The\ [Eye|Mouth]')) {
                        next.cards.played.push(hand)
                    } else if(name === 'The Tooth') {
                        next.cards.played = [...next.cards.played, ...selected]
                    }
                } else if(name === 'The Pillar') {
                    next.cards.played = [...next.cards.played, ...selected]
                }
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
                    [...selected].sort((a, b) => b.rank - a.rank).forEach((c, i) => {
                        if(i > 0) { c.scored = false }
                    })
                }
                // Activation sequence
                const baseball = state.jokers.find(j => j.joker.name === 'Baseball Card') !== undefined

                state.jokers.filter(j => j.joker.activation.includes(Activation.OnPlayed)).forEach(j => {
                    switch(j.joker.name) {

                    }
                    if(baseball && j.joker.rarity === 'Uncommon') { mult *= 1.5 }
                })

                selected.forEach(c => {
                    if(!c.debuffed && c.scored) {
                        let triggers = 1 + (c.seal === Seal?.Red ? 1 : 0)
                        for(let i = 0; i < triggers; i++) {
                            chips += rankChips[Rank[c.rank] as keyof typeof rankChips]
                            if(c.enhancement !== undefined && c.enhancement === Enhancement.Bonus) { chips += 30 }

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

                            state.jokers.filter(j => j.joker.activation.includes(Activation.OnScored)).forEach(j => {
                                switch(j.joker.name) {
            
                                }
                                if(baseball && j.joker.rarity === 'Uncommon') { mult *= 1.5 }
                            })

                            // Retrigger jokers
                        }
                    }
                })

                state.cards.hand.filter(c => !c.selected).forEach(c => {
                    if(!c.debuffed) {
                        let triggers = 1 + (c.seal === Seal?.Red ? 1 : 0)
                        for(let i = 0; i < triggers; i++) {
                            if(c.enhancement === Enhancement?.Steel) { mult *= 1.5 }

                            state.jokers.filter(j => j.joker.activation.includes(Activation.OnHeld)).forEach(j => {
                                switch(j.joker.name) {
            
                                }
                                if(baseball && j.joker.rarity === 'Uncommon') { mult *= 1.5 }
                            })

                            // Retrigger jokers
                        }
                    }
                })

                state.jokers.forEach(j => {
                    if(j.edition === Edition?.Foil) { chips += 50 }
                    if(j.edition === Edition?.Holographic) { mult += 10 }
                })

                state.jokers.filter(j => j.joker.activation.includes(Activation.Independent)).forEach(j => {
                    switch(j.joker.name) {
                        case 'Joker': mult += 4; break
                    }
                    if(baseball && j.joker.rarity === 'Uncommon') { mult *= 1.5 }
                })

                state.jokers.forEach(j => {
                    if(j.edition === Edition?.Polychrome) { mult *= 1.5 }
                })

                chips = Math.ceil(chips), mult = Math.ceil(mult)
                next.stats.score += (chips * mult)
                next.active.score = {chips: chips, mult: mult}
            }
            next = {...next,
                stats: {...next.stats,
                    hands: state.stats.hands - 1
                },
                cards: {...next.cards,
                    hand: state.cards.hand.filter(c => !c.submitted),
                    selected: [],
                    submitted: selected.filter(c => !glassToBreak.includes(c))
                }
            }
            break 
        case 'discard':
            if(state.cards.consumables.some(c => c.selected)) {
                next = {...next, cards: {...state.cards,
                    consumables: state.cards.consumables.filter(c => !c.selected)
                }}
                cardSnap({cards: next.cards.consumables, idPrefix: 'consumable', r: -1})
            } else {
                state.cards.selected.forEach(c => {
                    c.selected = false
                    c.flipped = false
                })
                if(state.cards.submitted.length > 0) {
                    state.cards.submitted.forEach(c => c.submitted = false)
                    next = {...next, cards: {...state.cards,
                        submitted: [],
                        hidden: [...state.cards.hidden, ...state.cards.submitted]
                    }}
                } else {
                    const purple = state.cards.selected.reduce((p, c) => p += c.seal !== undefined && c.seal === Seal.Purple ? 1 : 0, 0)
                    if(purple > 0) {
                        let validTarots = Consumables.slice(29, 51)
                        validTarots = validTarots.filter(c => state.cards.consumables.every(con => con.consumable.name !== c.name))
                        if(validTarots.length === 0) { validTarots.push(Consumables[40])}

                        let tarot: Omit<ConsumableType, 'id'>
                        const n = Math.min(purple, state.stats.consumableSize - state.cards.consumables.length)
                        for(let i = 0; i < n; i++) {
                            tarot = validTarots[Math.floor(Math.random() * validTarots.length)]
                            next.cards.consumables.push({
                                id: state.cards.nextId + i,
                                consumable: tarot
                            })
                            validTarots = validTarots.filter(c => c.name !== tarot.name)
                            if(validTarots.length === 0) { validTarots.push(Consumables[40]) }
                        }
                        next.cards.nextId += n
                    }
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
            break
        case 'addCard':
            if((action.payload?.card as ConsumableType).name !== undefined) {
                next = {...next, cards: {...state.cards,
                    nextId: state.cards.nextId + 1,
                    consumables: [...state.cards.consumables, {
                        id: state.cards.nextId,
                        consumable: action.payload?.card as ConsumableType
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
            next.cards.lastCon = (action.payload?.card! as ConsumableInstance).consumable.name
            break
        case 'addJoker':
            let newJoker: JokerInstance = {
                ...action.payload?.card as JokerInstance,
                id: state.cards.nextId,
                selected: false,
                shopMode: false,
            }
            next = {...next,
                ...(newJoker.edition === Edition?.Negative && {
                    stats: {...state.stats,
                        jokerSize: state.stats.jokerSize + 1
                    }
                }),
                jokers: [...state.jokers, newJoker],
                cards: {...state.cards,
                    nextId: state.cards.nextId + 1
                }
            }
            break
        case 'removeJoker':
            let joker = action.payload?.card as JokerInstance
            next = {...next,
                ...(joker.edition === Edition?.Negative && {
                    stats: {...state.stats,
                        jokerSize: state.stats.jokerSize - 1
                    }
                }),
                jokers: state.jokers.filter(j => j.id !== joker.id)
            }
            break
        case 'shop-select':
            let updated = state.shop.offers
            updated.forEach((o) => {
                o.selected = (!o.selected && o.id === (action.payload?.card! as (JokerInstance | ConsumableInstance)).id!)
            })
            next = {...next, shop: {...state.shop,
                offers: updated
            }}
            break
        case 'shop-remove':
            next = {...next, shop: {...state.shop,
                offers: state.shop.offers.filter(c => c.id !== (action.payload?.card! as (JokerInstance | ConsumableInstance)).id)
            }}
            break
        case 'reroll':
            next = {...next, shop: {...state.shop,
                offers: newOffers(state.shop.slots, state.shop.weights, state)
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