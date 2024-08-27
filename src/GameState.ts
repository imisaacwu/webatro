import { createContext, Dispatch } from "react"
import { BlindType, ConsumableInstance, Consumables, ConsumableType, DeckType, Edition, Enhancement, handLevels, HandType, handUpgrade, Rank, rankChips, Seal, Suit } from "./Constants"
import { ante_base, AnteBlinds, bestHand, boss_roll, cardSnap, debuffCards, getNextBlind, newOffers, shuffle } from "./Utilities"
import { CardInfo } from "./components/CardInfo"
import { Activation, JokerInstance, JokerType } from "./components/JokerInfo"
import Rand from "rand-seed"

export let Random: Rand = new Rand()

export const levelHand = ({ hand, n = 1 }: {hand: keyof typeof handLevels, n?: number}) => {
    handLevels[hand].level += n
    handLevels[hand].chips += handUpgrade[hand].chips * n
    handLevels[hand].mult += handUpgrade[hand].mult * n
}

type GameStates = 'main-menu' | 'blind-select' | 'scoring' | 'post-scoring' | 'shop'

export type GameState = {
    state: GameStates
    seed: string
    seeded: boolean
    
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
        rerollCost: number
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
        firstPlay: boolean
    }

    // In hand or submitted, handled automatically
    active: {
        name: keyof typeof HandType
        score: {
            chips: number
            mult: number
        }
    }

    scoreLog: {
        name: string
        chips?: number
        mult?: number
        mult_type?: '+' | 'x'
        notes?: string
    }[]
    moneyTotalLog: number
}

export type GameAction = {
    type:
        'init' |
        'state' |
        'stat' |
        'select' | 'submit' | 'discard' | 'draw' |
        'setSort' | 'updateCards' | 'addCard' | 'removeCard' |
        'setLastUsedConsumable' | 'updateJokers' | 'addJoker' | 'removeJoker' |
        'shop-select' | 'shop-remove' | 'reroll'
    payload?: {
        deck?: DeckType
        seed?: string

        state?: GameStates

        stat?: keyof typeof initialGameState['stats']
        previous?: 'played' | 'discarded'   // To know during a draw which came previously
        amount?: number

        cardLocation?: keyof typeof initialGameState['cards']
        update?: (CardInfo | ConsumableInstance | JokerInstance)[]
        card?: CardInfo | Omit<CardInfo, 'id'> | ConsumableType | JokerType | JokerInstance | ConsumableInstance

        sort?: 'rank' | 'suit'
    }
}

export const initialGameState: GameState = {
    state: 'main-menu' as GameStates,
    seed: '',
    seeded: false,

    stats: {
        handSize: 8,
        hands: 4,
        discards: 4,
        money: 10000000000,
        ante: 1,
        round: 0,
        score: 0,
        consumableSize: 2,
        jokerSize: 5,
        deck: DeckType.Red
    },

    shop: {
        slots: 2,
        rerollCost: 5,
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
        curr: 'small',
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
        consumables: [],
        lastCon: undefined,
        firstPlay: true
    },

    active: {
        name: 'NONE',
        score: {
            chips: 0,
            mult: 0
        }
    },

    scoreLog: [],
    moneyTotalLog: 0
}

let cerulean_bell_card: CardInfo
export const gameReducer = (state: GameState, action: GameAction): GameState => {
    const sort = (a: CardInfo, b: CardInfo) => (
        ((!!action.payload?.sort) ? action.payload.sort : state.cards.sort) === 'rank' ?
        (a.rank !== b.rank? b.rank - a.rank : a.suit - b.suit) :
        (a.suit !== b.suit ? a.suit - b.suit : b.rank - a.rank)
    )
    let suits = Object.keys(Suit).filter(k => isNaN(Number(k))).map(s => s as keyof typeof Suit)
        let ranks = Object.keys(Rank).filter(r => isNaN(Number(r))).map(r => r as keyof typeof Rank)
    let next = state, name = state.blind.boss.name
    switch(action.type) {
        case 'init':
            let arr: CardInfo[] = []
            switch(action.payload?.deck!) {
                case DeckType.Erratic:
                    next.stats.deck = DeckType.Erratic
                    for(let i = 1; i <= 52; i++) {
                        let rank = Rank[ranks[Math.floor(Random.next()*ranks.length)]]
                        arr.push(
                            {
                                id: i,
                                suit: Suit[suits[Math.floor(Random.next()*suits.length)]],
                                rank: rank,
                                chips: rankChips[rank],
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
                                chips: rankChips[r],
                                deck: action.payload?.deck!
                            }
                        )
                    })})
            }
            next = initialGameState
            next = {...next,
                seed: action.payload?.seed ?? (Math.random() + 1).toString(36).toUpperCase().slice(2),
                seeded: action.payload?.seed !== undefined,
                blind: {...state.blind,
                    boss: boss_roll(state.stats.ante),
                    base: ante_base(state.stats.ante)
                },
                cards: {...state.cards,
                    nextId: 53,
                    deck: arr
                }
            }
            Random = new Rand(next.seed)
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
                        } else if(name === 'Crimson Heart') {
                            next.jokers[Math.floor(Random.next() * next.jokers.length)].debuffed = true
                        } else if(name === 'Amber Acorn') {
                            next.jokers.forEach(j => j.flipped = true)
                            next = {...next,
                                jokers: shuffle(next.jokers)
                            }
                        }
                    }
                    state.jokers.filter(j => j.joker.activation.includes(Activation.OnBlind)).forEach(j => {
                        switch(j.joker.name) {
                            case 'Marble Joker':
                                next = {...next,
                                    cards: {...next.cards,
                                        nextId: next.cards.nextId + 1,
                                        deck: [...next.cards.deck, {
                                            id: next.cards.nextId,
                                            suit: Suit[suits[Math.floor(Random.next()*suits.length)]],
                                            rank: Rank[ranks[Math.floor(Random.next()*ranks.length)]],
                                            chips: 50,
                                            enhancement: Enhancement.Stone,
                                            deck: DeckType.Red
                                        }]
                                    }
                                }
                                break
                            case 'Burglar':
                                next.stats.hands += 3
                                next.stats.discards = 0
                                break
                            case 'Madness':
                                if(state.blind.curr !== 'boss') {
                                    j.joker.counter! += 0.5
                                    let validJokers = state.jokers.filter(joker => joker !== j)
                                    if(validJokers.length > 0) {
                                        let target = validJokers[Math.floor(Random.next() * validJokers.length)].id
                                        next = {...next,
                                            jokers: next.jokers.filter(j => j.id !== target)
                                        }
                                    }
                                }
                                break
                        }
                    })
                    break
                case 'post-scoring':
                    let deck = [...state.cards.deck, ...state.cards.hand, ...state.cards.hidden, ...state.cards.submitted]
                    deck.forEach(c => {
                            c.selected = false
                            c.debuffed = false
                        }
                    )
                    state.jokers.filter(j => j.joker.activation.includes(Activation.EndOfRound)).forEach(j => {
                        switch(j.joker.name) {
                            case 'Egg':
                                j.joker.counter! += 3
                                break
                        }
                    })
                    next.jokers.forEach(j => {j.debuffed = false; j.flipped = false})
                    next = {...next,
                        stats: {...next.stats,
                            ante: next.stats.ante + (state.blind.curr === 'boss' ? 1 : 0)
                        },
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
                            offers: newOffers(state.shop.slots, state.shop.weights, state),
                            rerollCost: initialGameState.shop.rerollCost
                        },
                        blind: {...state.blind,
                            curr: nextBlind,
                            ...(nextBlind === 'small' && {
                                boss: boss_roll(state.stats.ante + 1),
                                base: ante_base(state.stats.ante + 1)
                            })
                        },
                        cards: {...state.cards,
                            firstPlay: true
                        }
                    }
                    break 
                default:
            }
            break
        case 'stat':
            next = {...next, stats: {...state.stats,
                [action.payload?.stat!]: state.stats[action.payload?.stat!] + (action.payload?.amount ?? -1)
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
                if(state.blind.curr !== 'boss' || state.blind.boss.name !== 'Cerulean Bell' || card.id !== cerulean_bell_card.id) {
                    card.selected = !card.selected
                    const hand = bestHand(state.cards.hand.filter(c => c.selected), state.jokers)
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
            let toRemove: (CardInfo | JokerInstance)[] = []
            // Does it score?
            if(state.blind.curr === 'boss' && ((name === 'The Psychic' && selected.length < 5) ||
                (name === 'The Eye' && state.cards.played.includes(state.active.name)) ||
                (name === 'The Mouth' && state.cards.played.length > 0 && !state.cards.played.includes(state.active.name)))) {
                next = {...next, active: initialGameState.active}
            } else {
                next.scoreLog = []

                let hand = state.active.name
                handLevels[hand].played++
                let chips = handLevels[hand].chips, mult = handLevels[hand].mult

                next.scoreLog.push({name: HandType[hand], chips: chips, mult: mult})

                // Relevant boss mechanics
                if(state.blind.curr === 'boss') {
                    if(name === 'The Arm') {
                        if(handLevels[hand].level > 1) {
                            levelHand({hand: hand, n: -1})
                        }
                    } else if(name === 'The Flint') {
                        chips = Math.ceil(chips / 2.0)
                        mult = Math.ceil(mult / 2.0)
                        next.scoreLog.push({name: 'The Flint', chips: -chips, mult: -mult, mult_type: '+'})
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
                selected.forEach(c => {
                    if(c.enhancement === Enhancement?.Stone) { c.scored = true }
                })
                if(state.jokers.find(j => j.joker.name === 'Splash')) {
                    selected.forEach(c => c.scored = true)
                }
                // Activation sequence
                const baseballCard = state.jokers.find(j => j.joker.name === 'Baseball Card')
                const baseball = baseballCard !== undefined && !baseballCard.debuffed && false

                state.jokers.filter(j => j.joker.activation.includes(Activation.OnPlayed) && !j.debuffed).forEach(j => {
                    switch(j.joker.name) {
                        case 'Loyalty Card':
                            j.joker.counter!--
                            break
                        case 'Ride the Bus':
                            if(selected.filter(c => [Rank.King, Rank.Queen, Rank.Jack].includes(c.rank)).some(c => c.scored)) {
                                j.joker.counter = 0
                            } else {
                                j.joker.counter!++
                            }
                            break
                        case 'Space Joker':
                            if(Random.next() < .25) {
                                levelHand({hand})
                            }
                            break
                        case 'Runner':
                            if(hand.match(/.*STRAIGHT.*/)) {
                                j.joker.counter! += 15
                            }
                            break
                        case 'Ice Cream':
                            j.joker.counter! = Math.max(0, j.joker.counter! - 5)
                            break             
                        case 'Sixth Sense':
                            if(state.cards.firstPlay && selected.length === 1 && selected[0].rank === Rank.Six && state.cards.consumables.length < state.stats.consumableSize) {
                                toRemove.push(selected[0])
                                let validSpectrals = Consumables.slice(12, 28)
                                validSpectrals.filter(c => state.cards.consumables.every(con => con.consumable.name !== c.name))
                                if(validSpectrals.length === 0) { validSpectrals.push(Consumables[29]) }
                                next = {...next, cards: {...next.cards,
                                    consumables: [...next.cards.consumables, {
                                        id: next.cards.nextId,
                                        consumable: validSpectrals[Math.floor(Random.next() * validSpectrals.length)]
                                    }],
                                    nextId: next.cards.nextId + 1
                                }}
                            }
                            break
                        case 'Green Joker':
                            j.joker.counter!++
                            break
                        case 'Superposition':
                            if(hand.match(/.*STRAIGHT.*/) && selected.some(c => c.rank === Rank.Ace) && state.cards.consumables.length < state.stats.consumableSize) {
                                let validTarots = Consumables.slice(30, 52)
                                validTarots.filter(c => state.cards.consumables.every(con => con.consumable.name !== c.name))
                                if(validTarots.length === 0) { validTarots.push(Consumables[41]) }
                                next = {...next, cards: {...next.cards,
                                    consumables: [...next.cards.consumables, {
                                        id: next.cards.nextId,
                                        consumable: validTarots[Math.floor(Random.next() * validTarots.length)]
                                    }],
                                    nextId: next.cards.nextId + 1
                                }}
                            }
                            break
                        case 'Square Joker':
                            if(selected.length === 4) {
                                j.joker.counter! += 4
                            }
                    }
                    if(baseball && j.joker.rarity === 'Uncommon') {
                        mult *= 1.5
                        next.scoreLog.push({name: `${j.joker.name}->Baseball Card`, mult: 1.5, mult_type: 'x'})
                    }
                })

                selected.forEach(c => {
                    if(!c.debuffed && c.scored) {
                        const cardName = `${c.edition !== undefined ? Edition[c.edition] + ' ' : ''}${c.enhancement !== undefined ? Enhancement[c.enhancement] + ' ' : ''}${c.seal !== undefined ? Seal[c.seal] + ' Seal ': ''}${c.enhancement === Enhancement?.Stone ? 'Card' : `${Rank[c.rank]} of ${Suit[c.suit]}`}`
                        next.scoreLog.push({name: cardName})

                        const onCardScore = () => {
                            if(c.enhancement !== Enhancement?.Stone) {
                                chips += c.chips
                                next.scoreLog.push({name: Rank[c.rank], chips: c.chips})
                            }
                            if(c.enhancement !== undefined && c.enhancement === Enhancement.Bonus) {
                                chips += 30
                                next.scoreLog.push({name: 'Bonus Card', chips: 30})
                            }

                            if(c.enhancement !== undefined) {
                                switch(c.enhancement) {
                                    case Enhancement.Glass:
                                        mult *= 2;
                                        const glassLog: GameState['scoreLog'][0] = {name: 'Glass Card', mult: 2, mult_type: 'x'}
                                        next.scoreLog.push()
                                        if(Random.next() < .25) {
                                            toRemove.push(c)
                                            glassLog.notes = 'Broke'
                                        }
                                        next.scoreLog.push(glassLog)
                                        break
                                    case Enhancement.Lucky:
                                        if(Random.next() < .2) {
                                            mult += 20
                                            next.scoreLog.push({name: 'Lucky Card', mult: 20, mult_type: '+'})
                                        }
                                        if(Random.next() < .07) {
                                            next.stats.money += 20
                                            next.scoreLog.push({name: 'Lucky Card', notes: '+$20'})
                                            next.moneyTotalLog += 20
                                        }
                                        break
                                    case Enhancement.Mult:
                                        mult += 4;
                                        next.scoreLog.push({name: 'Mult Card', mult: 4, mult_type: '+'})
                                        break
                                    case Enhancement.Stone:
                                        chips += 50;
                                        next.scoreLog.push({name: 'Stone Card', chips: 50})
                                        break
                                }
                            }

                            if(c.seal !== undefined && c.seal === Seal.Gold) {
                                next.stats.money += 3
                                next.scoreLog.push({name: 'Gold Seal', notes: '+$3'})
                                next.moneyTotalLog += 3
                            }

                            if(c.edition !== undefined) {
                                switch(c.edition) {
                                    case Edition.Foil:
                                        chips += 50;
                                        next.scoreLog.push({name: 'Foil', chips: 50})
                                        break
                                    case Edition.Holographic:
                                        mult += 10;
                                        next.scoreLog.push({name: 'Holographic', mult: 10, mult_type: '+'})
                                        break
                                    case Edition.Polychrome:
                                        mult *= 1.5;
                                        next.scoreLog.push({name: 'Polychrome', mult: 1.5, mult_type: 'x'})
                                        break
                                }
                            }

                            state.jokers.filter(j => j.joker.activation.includes(Activation.OnScored) && !j.debuffed).forEach(j => {
                                switch(j.joker.name) {
                                    case 'Greedy Joker':
                                        if(c.suit === Suit.Diamonds) {
                                            mult += 3
                                            next.scoreLog.push({name: 'Greedy Joker', mult: 3, mult_type: '+'})
                                        }
                                        break
                                    case 'Lusty Joker':
                                        if(c.suit === Suit.Hearts) {
                                            mult += 3
                                            next.scoreLog.push({name: 'Lusty Joker', mult: 3, mult_type: '+'})
                                        }
                                        break
                                    case 'Wrathful Joker':
                                        if(c.suit === Suit.Spades) {
                                            mult += 3
                                            next.scoreLog.push({name: 'Wrathful Joker', mult: 3, mult_type: '+'})
                                        }
                                        break
                                    case 'Gluttonous Joker':
                                        if(c.suit === Suit.Clubs) {
                                            mult += 3
                                            next.scoreLog.push({name: 'Gluttonous Joker', mult: 3, mult_type: '+'})
                                        }
                                        break
                                    case '8 Ball':
                                        if(c.rank === Rank.Eight && Random.next() < .25 && next.cards.consumables.length < next.stats.consumableSize) {
                                            let validTarots = Consumables.slice(30, 52)
                                            validTarots = validTarots.filter(c => next.cards.consumables.every(con => con.consumable.name !== c.name))
                                            if(validTarots.length === 0) { validTarots.push(Consumables[41]) }
                                            next = {...next,
                                                cards: {...next.cards,
                                                    nextId: next.cards.nextId + 1,
                                                    consumables: [...next.cards.consumables, {
                                                        id: next.cards.nextId,
                                                        consumable: validTarots[Math.floor(Random.next() * validTarots.length)]
                                                    }]
                                                }
                                            }
                                            next.scoreLog.push({name: '8 Ball', notes: 'Generated Tarot'})
                                        }
                                        break
                                    case 'Fibonacci':
                                        if([Rank.Ace, Rank.Two, Rank.Three, Rank.Five, Rank.Eight].includes(c.rank)) {
                                            mult += 8
                                            next.scoreLog.push({name: 'Fibonacci', mult: 8, mult_type: '+'})
                                        }
                                        break
                                    case 'Scary Face':
                                        if([Rank.King, Rank.Queen, Rank.Jack].includes(c.rank)) {
                                            chips += 30
                                            next.scoreLog.push({name: 'Scary Face', chips: 30})
                                        }
                                        break
                                    case 'Even Steven':
                                        if([Rank.Two, Rank.Four, Rank.Six, Rank.Eight, Rank.Ten].includes(c.rank)) {
                                            mult += 4
                                            next.scoreLog.push({name: 'Even Steven', mult: 4, mult_type: '+'})
                                        }
                                        break
                                    case 'Odd Todd':
                                        if([Rank.Ace, Rank.Three, Rank.Five, Rank.Seven, Rank.Nine].includes(c.rank)) {
                                            chips += 31
                                            next.scoreLog.push({name: 'Odd Todd', chips: 31})
                                        }
                                        break
                                    case 'Scholar':
                                        if(c.rank === Rank.Ace) {
                                            chips += 20
                                            mult += 4
                                            next.scoreLog.push({name: 'Scholar', chips: 20, mult: 4, mult_type: '+'})
                                        }
                                        break
                                    case 'Business Card':
                                        if([Rank.King, Rank.Queen, Rank.Jack].includes(c.rank) && Random.next() < .5) {
                                            next.stats.money += 2
                                            next.scoreLog.push({name: 'Business Card', notes: '+$2'})
                                            next.moneyTotalLog += 2
                                        }
                                        break
                                    case 'Hiker':
                                        c.chips += 5
                                        break
                                    case 'Triboulet':
                                        if([Rank.King, Rank.Queen].includes(c.rank)) {
                                            mult *= 2
                                            next.scoreLog.push({name: 'Triboulet', mult: 2, mult_type: 'x'})
                                        }
                                        break
                                }
                                if(baseball && j.joker.rarity === 'Uncommon') {
                                    mult *= 1.5
                                    next.scoreLog.push({name: `${j.joker.name}->Baseball Card`, mult: 1.5, mult_type: 'x'})
                                }
                            })
                        }

                        onCardScore()
                        if(c.seal === Seal?.Red) {
                            next.scoreLog.push({name: 'Red Seal', notes: 'Retrigger'})
                            onCardScore()
                        }
                        if(state.jokers.find(j => j.joker.name === 'Dusk') !== undefined && state.stats.hands === 1) {
                            next.scoreLog.push({name: 'Dusk', notes: 'Retrigger'})
                            onCardScore()
                        }
                        if(c.rank < 5) {
                            state.jokers.filter(j => j.joker.name === 'Hack').forEach(() => {
                                next.scoreLog.push({name: 'Hack', notes: 'Retrigger'})
                                onCardScore()
                            })
                        }
                        // Retrigger jokers
                    }
                })

                state.cards.hand.filter(c => !c.selected && !c.submitted).forEach(c => {
                    if(!c.debuffed) {
                        let will_trigger = c.enhancement === Enhancement?.Steel || c.enhancement === Enhancement?.Gold
                        state.jokers.filter(j => j.joker.activation.includes(Activation.OnHeld) && !j.debuffed).forEach(j => {
                            switch(j.joker.name) {
                                
                            }
                        })

                        if(will_trigger) {
                            const cardName = `(Held in hand) ${c.edition ? Edition[c.edition] + ' ' : ''}${c.enhancement ? Enhancement[c.enhancement] + ' ' : ''}${c.seal ? Seal[c.seal] + ' Seal ': ''}${c.enhancement === Enhancement?.Stone ? 'Card' : Rank[c.rank]} of ${Suit[c.suit]}`
                            next.scoreLog.push({name: cardName})

                            const mime = state.jokers.find(j => j.joker.name === 'Mime') !== undefined

                            const heldInHand = () => {
                                if(c.enhancement === Enhancement?.Steel) {
                                    mult *= 1.5
                                    next.scoreLog.push({name: 'Steel Card', mult: 1.5, mult_type: 'x'})
                                } else if(c.enhancement === Enhancement?.Gold) {
                                    next.stats.money += 3
                                    next.scoreLog.push({name: 'Gold Card', notes: '+$3'})
                                    next.moneyTotalLog += 3
                                }
                            }

                            heldInHand()
                            if(c.seal === Seal?.Red) {
                                next.scoreLog.push({name: 'Red Seal', notes: 'Retrigger'})
                                heldInHand()
                            }
                            if(mime) {
                                state.jokers.filter(j => j.joker.name === 'Mime').forEach(() => {
                                    next.scoreLog.push({name: 'Mime', notes: 'Retrigger'})
                                    heldInHand()
                                })
                            }
                        }
                    }
                })

                state.jokers.filter(j => j.joker.activation.includes(Activation.OnHeld) && !j.debuffed).forEach(j => {
                    switch(j.joker.name) {
                        case 'Raised Fist':
                            let raisedFistMult = 2 * rankChips[Rank[state.cards.hand.filter(c => !c.selected && !c.submitted).reduce((low, c) => low = Math.min(low, c.rank), 12)] as keyof typeof rankChips]
                            mult += raisedFistMult
                            next.scoreLog.push({name: 'Raised Fist', mult: raisedFistMult, mult_type: '+'})
                            break
                    }
                    if(baseball && j.joker.rarity === 'Uncommon') {
                        mult *= 1.5
                        next.scoreLog.push({name: `${j.joker.name}->Baseball Card`, mult: 1.5, mult_type: 'x'})
                    }
                })

                state.jokers.filter(j => !j.debuffed).forEach(j => {
                    if(j.edition === Edition?.Foil) {
                        chips += 50
                        next.scoreLog.push({name: `${j.joker.name + (j.joker.name.match(/.*s$/) ? '\'' : '\'s') + ' Foil'}`, chips: 50})
                    }
                    if(j.edition === Edition?.Holographic) {
                        mult += 10
                        next.scoreLog.push({name: `${j.joker.name + (j.joker.name.match(/.*s$/) ? '\'' : '\'s') + ' Holographic'}`, mult: 10, mult_type: '+'})
                    }
                })

                ranks = ranks.sort((a, b) => b - a)
                state.jokers.filter(j => j.joker.activation.includes(Activation.Independent) && !j.debuffed).forEach(j => {
                    switch(j.joker.name) {
                        case 'Joker':
                            mult += 4
                            next.scoreLog.push({name: 'Joker', mult: 4, mult_type: '+'})
                            break
                        case 'Jolly Joker':
                            if(ranks[0] >= 2) {
                                mult += 8
                                next.scoreLog.push({name: 'Jolly Joker', mult: 8, mult_type: '+'})
                            }
                            break
                        case 'Zany Joker':
                            if(ranks[0] >= 3) {
                                mult += 12
                                next.scoreLog.push({name: 'Zany Joker', mult: 12, mult_type: '+'})
                            }
                            break
                        case 'Mad Joker':
                            if(ranks[0] >= 2 && ranks[1] >= 2) {
                                mult += 10
                                next.scoreLog.push({name: 'Mad Joker', mult: 10, mult_type: '+'})
                            }
                            break
                        case 'Crazy Joker':
                            if(hand.match(/.*STRAIGHT.*/)) {
                                mult += 12
                                next.scoreLog.push({name: 'Crazy Joker', mult: 12, mult_type: '+'})
                            }
                            break
                        case 'Droll Joker':
                            if(hand.match(/.*FLUSH.*/)) {
                                mult += 10
                                next.scoreLog.push({name: 'Droll Joker', mult: 10, mult_type: '+'})
                            }
                            break
                        case 'Sly Joker':
                            if(ranks[0] >= 2) {
                                chips += 50
                                next.scoreLog.push({name: 'Sly Joker', chips: 50})
                            }
                            break
                        case 'Wily Joker':
                            if(ranks[0] >= 3) {
                                chips += 100
                                next.scoreLog.push({name: 'Wily Joker', chips: 100})
                            }
                            break
                        case 'Clever Joker':
                            if(ranks[0] >= 2 && ranks[1] >= 2) {
                                chips += 80
                                next.scoreLog.push({name: 'Clever Joker', chips: 80})
                            }
                            break
                        case 'Devious Joker':
                            if(hand.match(/.*STRAIGHT.*/)) {
                                chips += 100
                                next.scoreLog.push({name: 'Devious Joker', chips: 100})
                            }
                            break
                        case 'Crafty Joker':
                            if(hand.match(/.*FLUSH.*/)) {
                                chips += 80
                                next.scoreLog.push({name: 'Crafty Joker', chips: 80})
                            }
                            break
                        case 'Half Joker':
                            if(state.cards.selected.length <= 3) {
                                mult += 20
                                next.scoreLog.push({name: 'Half Joker', mult: 20, mult_type: '+'})
                            }
                            break
                        case 'Joker Stencil':
                            let jokerStencilMult = Math.max(1, state.stats.jokerSize - state.jokers.length + (state.jokers.filter(j => j.joker.name === 'Joker Stencil').length))
                            mult *= jokerStencilMult
                            next.scoreLog.push({name: 'Joker Stencil', mult: jokerStencilMult, mult_type: 'x'})
                            break
                        case 'Banner':
                            let bannerChips = 30 * state.stats.discards
                            chips += bannerChips
                            next.scoreLog.push({name: 'Banner', chips: bannerChips})
                            break
                        case 'Mystic Summit':
                            if(state.stats.discards === 0) {
                                mult += 15
                                next.scoreLog.push({name: 'Mystic Summit', mult: 15, mult_type: '+'})
                            }
                            break
                        case 'Loyalty Card':
                            if(j.joker.counter! <= 0) {
                                mult *= 4
                                next.scoreLog.push({name: 'Loyalty Card', mult: 4, mult_type: 'x'})
                                j.joker.counter = 6
                            }
                            break
                        case 'Misprint':
                            let misprintMult = Math.floor(Random.next() * 24)
                            mult += misprintMult
                            next.scoreLog.push({name: 'Misprint', mult: misprintMult, mult_type: '+'})
                            break
                        case 'Abstract Joker':
                            let abstractMult = 3 * state.jokers.length
                            mult += abstractMult
                            next.scoreLog.push({name: 'Abstract Joker', mult: abstractMult, mult_type: '+'})
                            break
                        case 'Supernova':
                            let supernovaMult = handLevels[hand].played
                            mult += supernovaMult
                            next.scoreLog.push({name: 'Supernova', mult: supernovaMult, mult_type: '+'})
                            break
                        case 'Ride the Bus':
                            mult += j.joker.counter!
                            next.scoreLog.push({name: 'Ride the Bus', mult: j.joker.counter!, mult_type: '+'})
                            break
                        case 'Blackboard':
                            if(state.cards.hand.filter(c => !c.selected && !c.submitted).every(c => c.suit === Suit.Spades || c.suit === Suit.Clubs)) {
                                mult *= 3
                                next.scoreLog.push({name: 'Blackboard', mult: 3, mult_type: 'x'})
                            }
                            break
                        case 'Runner':
                            if(j.joker.counter! > 0) {
                                chips += j.joker.counter!
                                next.scoreLog.push({name: 'Runner', chips: j.joker.counter!})
                            }
                            break
                        case 'Ice Cream':
                            if(j.joker.counter! > 0) {
                                chips += j.joker.counter!
                                next.scoreLog.push({name: 'Ice Cream', chips: j.joker.counter!})
                            }
                            break
                        case 'Blue Joker':
                            let blueJokerChips = 2 * state.cards.deck.length
                            chips += blueJokerChips
                            next.scoreLog.push({name: 'Blue Joker', chips: blueJokerChips})
                            break
                        case 'Constellation':
                            mult *= j.joker.counter!
                            next.scoreLog.push({name: 'Constellation', mult: j.joker.counter!, mult_type: 'x'})
                            break
                        case 'Green Joker':
                            if(j.joker.counter! > 0) {
                                mult += j.joker.counter!
                                next.scoreLog.push({name: 'Green Joker', mult: j.joker.counter!, mult_type: '+'})
                            }
                            break
                        case 'Cavendish':
                            mult *= 3
                            let cavendishLog: GameState['scoreLog'][0] = {name: 'Cavendish', mult: 3, mult_type: 'x'}
                            if(Random.next() < .001) {
                                toRemove.push(j)
                                cavendishLog.notes = 'Destroyed'
                            }
                            next.scoreLog.push(cavendishLog)
                            break
                        case 'Madness':
                            mult *= j.joker.counter!
                            next.scoreLog.push({name: 'Madness', mult: j.joker.counter!, mult_type: 'x'})
                            break
                        case 'Square Joker':
                            chips += j.joker.counter!
                            next.scoreLog.push({name: 'Square Joker', chips: j.joker.counter!})
                            break
                    }
                    if(baseball && j.joker.rarity === 'Uncommon') {
                        mult *= 1.5
                        next.scoreLog.push({name: `${j.joker.name}->Baseball Card`, mult: 1.5, mult_type: 'x'})
                    }
                })

                state.jokers.filter(j => !j.debuffed).forEach(j => {
                    if(j.edition === Edition?.Polychrome) {
                        mult *= 1.5
                        next.scoreLog.push({name: `${j.joker.name + (j.joker.name.match(/.*s$/) ? '\'' : '\'s') + ' Polychrome'}`, mult: 1.5, mult_type: 'x'})
                    }
                })

                chips = Math.ceil(chips), mult = Math.ceil(mult)
                next.scoreLog.push({name: 'Final Score', chips: chips, mult: mult, notes: `+$${state.moneyTotalLog}`})
                next.stats.score += (chips * mult)
                next.active.score = {chips: chips, mult: mult}
            }
            next = {...next,
                stats: {...next.stats,
                    hands: state.stats.hands - 1
                },
                jokers: next.jokers.filter(c => !toRemove.includes(c)),
                cards: {...next.cards,
                    hand: state.cards.hand.filter(c => !c.submitted),
                    selected: [],
                    submitted: selected.filter(c => !toRemove.includes(c)),
                    firstPlay: false
                }
            }
            break 
        case 'discard':
            if(state.cards.consumables.some(c => c.selected)) {
                next = {...next, cards: {...next.cards,
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
                    next = {...next, cards: {...next.cards,
                        submitted: [],
                        hidden: [...next.cards.hidden, ...next.cards.submitted]
                    }}
                } else {
                    state.cards.selected.forEach(c => c.selected = false)
                    state.jokers.filter(j => j.joker.activation.includes(Activation.OnDiscard) && !j.debuffed).forEach(j => {
                        switch(j.joker.name) {
                            case 'Faceless Joker':
                                if(state.cards.selected.reduce((face, c) => face += ([Rank.King, Rank.Queen, Rank.Jack].includes(c.rank) ? 1 : 0), 0)) {
                                    next.stats.money += 5
                                }
                                break
                            case 'Green Joker':
                                j.joker.counter = Math.max(0, j.joker.counter! - 1);
                                break
                        }
                    })
                    next = {...next,
                        stats: {...next.stats,
                            discards: state.stats.discards - 1
                        },
                        cards: {...next.cards,
                            hand: state.cards.hand.filter(c => !state.cards.selected.includes(c)),
                            selected: [],
                            hidden: [...next.cards.hidden, ...next.cards.selected]
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
                        nextHand.forEach(c => c.flipped = Random.next() <= (1 / 7))
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
                    case 'Crimson Heart':
                        if(action.payload?.previous === 'played') {
                            next.jokers.forEach(j => j.debuffed = false)
                            next.jokers[Math.floor(Random.next() * next.jokers.length)].debuffed = true
                        }
                        break
                }
            }
            next = {...next, cards: {...state.cards,
                hand: [...state.cards.hand, ...nextHand].sort(sort),
                deck: state.cards.deck.slice(draw)
            }}
            if(state.blind.curr === 'boss' && name === 'Cerulean Bell') {
                let card = next.cards.hand[Math.floor(Random.next() * next.cards.hand.length)]
                next.cards.selected.push(card)
                card.selected = true
                cerulean_bell_card = card
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
                        ...action.payload?.card,
                        id: state.cards.nextId
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
            next.cards.lastCon = (action.payload?.card! as ConsumableType).name
            break
        case 'updateJokers':
            next = {...next, jokers: action.payload?.update as JokerInstance[]}
            break
        case 'addJoker':
            let newJoker: JokerInstance
            if((action.payload?.card as JokerInstance).id !== undefined) {
                newJoker = {
                    ...action.payload?.card as JokerInstance,
                    id: state.cards.nextId,
                    selected: false,
                    shopMode: false,
                }
            } else {
                newJoker = {
                    id: state.cards.nextId,
                    joker: action.payload?.card as JokerType
                }
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
                offers: newOffers(state.shop.slots, state.shop.weights, state),
                rerollCost: state.shop.rerollCost + 1
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