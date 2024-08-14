import { CardInfo } from "./components/CardInfo"
import { JokerInstance, Jokers } from "./components/JokerInfo"
import { AnteChips, Blinds, BlindType, ConsumableInstance, Consumables, Edition, Enhancement, handLevels, HandType, Rank, Suit } from "./Constants"
import { GameState, Random } from "./GameState"

// https://www.desmos.com/calculator/fsvcr75cdx
export const ante_base = (ante: number) => {
    if(ante > 8) {
        const b = 1.6, c = ante - 8, d = 1 + 0.2 * c
        const f = Math.floor(AnteChips[8] * ((b + ((0.75 * c) ** d)) ** c))
        return f - (f % (10 ** (Math.floor(Math.log10(f))-1)))
    }
    return AnteChips[ante as keyof typeof AnteChips]
}

export const boss_roll = (ante: number) => {
    let arr = Blinds.filter((b, i) => i > 1 && (ante % 8 === 0 ? b.ante % 8 === 0 : (b.ante <= ante && b.ante % 8 !== 0)))
    return arr[Math.floor(Random.next() * arr.length)]
}

export type AnteBlinds = 'small' | 'big' | 'boss'
export const getNextBlind = (ante: AnteBlinds): AnteBlinds => {
    return (ante === 'small') ? 'big' : (ante === 'big') ? 'boss' : 'small'
}

export const bestHand = (cards: CardInfo[], jokers: JokerInstance[]): keyof typeof HandType => {
    const wilds = cards.filter(c => c.enhancement === Enhancement.Wild && !c.debuffed)
    if(wilds.length === 0) { return getPokerHand(cards, jokers) }

    const hands: (keyof typeof HandType)[] = [], suits: Suit[] = []
    Object.keys(Suit).filter(s => isNaN(Number(s))).forEach(s => {
        wilds.forEach((c, i) => {
            suits[i] = c.suit
            c.suit = Suit[s as keyof typeof Suit]
        })
        hands.push(getPokerHand(cards, jokers))
        wilds.forEach((c, i) => c.suit = suits[i])
    })
    hands.sort((a, b) => handLevels[b].chips * handLevels[b].mult - handLevels[a].chips * handLevels[a].mult)
    return hands[0]
}

const getPokerHand = (cards: CardInfo[], jokers: JokerInstance[]): keyof typeof HandType => {
    const fourFingers = jokers.find(j => j.joker.name === 'Four Fingers') !== undefined

    // xxSA KQJT 9876 5432
    const straights = [0x100F, 0x1F, 0x3E, 0x7C, 0xF8, 0x1F0, 0x3E0, 0x7C0, 0xF80, 0x1F00]
    if(fourFingers) {
        straights.push(...[0x1007, 0xF, 0x1E, 0x3C, 0x78, 0xF0, 0x1E0, 0x3C0, 0x780, 0xF00, 0x1E00])
    }
    const hand = cards.reduce((total, c) => total | (1 << c.rank), 0)
    let min_rank: keyof typeof HandType = 'NONE'

    // [2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, A]
    let ranks: number[] = new Array(13).fill(0), suits: number[] = new Array(4).fill(0)
    cards.forEach(c => {
        if(c.enhancement !== undefined && c.enhancement === Enhancement.Stone) {
            min_rank = 'HIGH_CARD'
        } else {
            ranks[c.rank]++
            suits[c.suit]++
        }
    })

    ranks = ranks.filter(r => r !== 0).sort((a, b) => b - a)
    suits = suits.filter(s => s !== 0).sort((a, b) => b - a)

    if(suits[0] >= (fourFingers ? 4 : 5)) {
        if(ranks[0] === 5) return 'FLUSH_FIVE'
        if(fourFingers) {
            for(let i = 0; i < cards.length; i++) {
                let fourHand = cards.filter((_, idx) => idx !== i).reduce((total, c) => total | (1 << c.rank), 0)
                if(straights.includes(fourHand)) return 'STRAIGHT_FLUSH'
            }
        }
        if(straights.includes(hand)) return 'STRAIGHT_FLUSH'
        if(ranks[0] === 3 && ranks[1] === 2) return 'FLUSH_HOUSE'
        return 'FLUSH'
    }

    if(fourFingers) {
        for(let i = 0; i < cards.length; i++) {
            let fourHand = cards.filter((_, idx) => idx !== i).reduce((total, c) => total | (1 << c.rank), 0)
            if(straights.includes(fourHand)) return 'STRAIGHT'
        }
    }

    switch(ranks[0]) {
        case 5: return 'FIVE'
        case 4: return 'FOUR'
        case 3: return ranks[1] === 2 ? 'FULL_HOUSE' : 'THREE'
        case 2: return ranks[1] === 2 ? 'TWO_PAIR' : 'PAIR'
        case 1: return straights.includes(hand) ? 'STRAIGHT' : 'HIGH_CARD'
    }

    return min_rank
}

export const shuffle = (cards: any[]) => {
    let arr = [...cards], i = cards.length
    while(i > 0) {
        let rand = Math.floor(Random.next() * i--);
        [arr[i], arr[rand]] = [arr[rand], arr[i]]
    }
    return arr
}

// https://www.desmos.com/calculator/1jlnwr1peo
export const cardSnap = ({cards, idPrefix, r = 6000, log = false}: {cards: any[], idPrefix: string, r?: number, log?: boolean}) => {
    if(cards.length !== 0) {
        const cardDiv = cards.map(c => document.querySelector(`[id='${idPrefix}_${c.id}']`) as HTMLElement)
        if(!cardDiv.every(c => c !== null)) {
            if(log) console.log(cardDiv, 'has null elements')
            return
        }
        const container = cardDiv[0]!.parentElement!, w = container.clientWidth, n = cards.length
        const lStep = w / n, extra = (lStep - cardDiv[0]!.clientWidth) / (Math.max(1, n - 1))
        const h = w / 2, k = -Math.sqrt(r*r-h*h)
        
        cardDiv.forEach((c, i) => {
            const left = i * (lStep + extra)
            const x = Math.abs(h - (left + 71))
            const y = Math.sqrt(r * r - (h - (i * lStep + 71)) ** 2) + k
            const rot = (i < cards.length / 2 ? 1 : -1) * (Math.acos(x / r) - Math.PI / 2)

            c!.style.left = `${left}px`
            if(r > 0) {
                c!.style.bottom = `${y}px`
                c!.style.rotate = `${rot}rad`
            } else {
                c!.style.bottom = '-7px'
            }
        })
    } else if(log) {
        console.log('no cards', cards)
    }
}

export const debuffCards = (blind: BlindType, cards: CardInfo[], past?: (keyof typeof HandType | CardInfo)[], sold?: boolean) => {
    switch(blind.name) {
        case 'The Goad':
            cards.forEach(c => c.debuffed = (c.suit === Suit.Spades || c.enhancement === Enhancement?.Wild))
            break
        case 'The Head':
            cards.forEach(c => c.debuffed = (c.suit === Suit.Hearts || c.enhancement === Enhancement?.Wild))
            break
        case 'The Club':
            cards.forEach(c => c.debuffed = (c.suit === Suit.Clubs || c.enhancement === Enhancement?.Wild))
            break
        case 'The Window':
            cards.forEach(c => c.debuffed = (c.suit === Suit.Diamonds || c.enhancement === Enhancement?.Wild))
            break
        case 'The Plant':
            cards.forEach(c => c.debuffed = ([Rank.King, Rank.Queen, Rank.Jack].includes(c.rank)))
            break
        case 'The Pillar':
            cards.forEach(c => c.debuffed = (past!.includes(c)))
            break
        case 'Verdant Leaf':
            cards.forEach(c => c.debuffed = !sold)
            break
        default:
    }
}

export const getImage = (url: string, images: Record<string, { default: string }>) => {
    const module = images[url]
    if(!module) { throw new Error(`no such image ${url}`) }
    return module.default
}

export const newOffers = (slots: number, weights: {
    Joker: number;
    Tarot: number;
    Planet: number;
    Card: number;
    Spectral: number;
}, game: GameState) => {
    const offers = []
    const total = Object.values(weights).reduce((n, w) => n += w)
    for(let i = 1; i <= slots; i++) {
        const roll = Random.next()
        if(roll < weights.Joker / total) {
            const rare_roll = Random.next()
            const rarity = rare_roll < .7 ? 'Common' : rare_roll < .95 ? 'Uncommon' : 'Rare'
            const validJokers = Jokers.filter(j => j.rarity === rarity && !game.jokers.find(joker => joker.joker.name === j.name))
            if(validJokers.length === 0) { validJokers.push(Jokers[0])}
            offers.push({
                id: -i,
                joker: validJokers[Math.floor(Random.next() * validJokers.length)],
                shopMode: true
            })
        } else if(roll < (weights.Joker + weights.Tarot) / total) {
            const validTarots = Consumables.slice(30, 52).filter(c => game.cards.consumables.every(con => con.consumable.name !== c.name))
            if(validTarots.length === 0) { validTarots.push(Consumables[40])}
            offers.push({
                id: -i,
                consumable: validTarots[Math.floor(Random.next() * validTarots.length)],
                shopMode: true
            })
        } else if(roll < (weights.Joker + weights.Tarot + weights.Planet) / total) {
            const validPlanets = Consumables.slice(0, 12).filter(c => game.cards.consumables.every(con => con.consumable.name !== c.name) && (!c.name.match('Planet X|Ceres|Eris') || handLevels[c.hand!].played > 0))
            if(validPlanets.length === 0) { validPlanets.push(Consumables[0]) }
            offers.push({
                id: -i,
                consumable: validPlanets[Math.floor(Random.next() * validPlanets.length)],
                shopMode: true
            })
        } else if(roll < (weights.Joker + weights.Tarot + weights.Planet + weights.Card) / total) {
            // TODO: Playing cards in shop
        } else {
            const validSpectrals = Consumables.slice(13, 30).filter(c => game.cards.consumables.every(con => con.consumable.name !== c.name))
            offers.push({
                id: -i,
                consumable: validSpectrals[Math.floor(Random.next() * validSpectrals.length)],
                shopMode: true
            })
        }
    }
    return offers
}

export const calcPrice = (card: JokerInstance | ConsumableInstance) => {
    let price
    if((card as ConsumableInstance).consumable !== undefined) {
        price = (card as ConsumableInstance).consumable.type === 'Spectral' ? 4 : 3
    } else {
        const joker = card as JokerInstance
        price = joker.joker.cost
        if(joker.edition !== undefined) {
            switch(joker.edition) {
                case Edition.Foil: price += 2; break
                case Edition.Holographic: price += 3; break
                case Edition.Negative:
                case Edition.Polychrome: price += 5; break
            }
        }
    }
    return {price: price, sell: Math.max(1, Math.floor(price / 2))}
}