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
    const shortcut = jokers.find(j => j.joker.name === 'Shortcut') !== undefined

    // xxSA KQJT 9876 5432
    const straights = [0x100F, 0x1F, 0x3E, 0x7C, 0xF8, 0x1F0, 0x3E0, 0x7C0, 0xF80, 0x1F00]
    if(fourFingers) {
        straights.push(...[0x1007, 0xF, 0x1E, 0x3C, 0x78, 0xF0, 0x1E0, 0x3C0, 0x780, 0xF00, 0x1E00])
    }
    // Not extensively tested
    if(shortcut) {
        straights.push(...[0x2F, 0x5E, 0xBC, 0x178, 0x2F0, 0x5E0, 0xBC0, 0x1780, 0x37, 0x6E, 0xDC, 0x1B8, 0x370, 0x6E0, 0xDC0, 0x1B80, 0x3B, 0x76, 0xEC, 0x1D8, 0x3B0, 0x760, 0xEC0, 0x1D80, 0x3D, 0x7A, 0xF4, 0x1E8, 0x3D0, 0x7A0, 0xF40, 0x1E80, 0x57, 0xAE, 0x15C, 0x2B8, 0x570, 0xAE0, 0x15C0, 0x5B, 0xB6, 0x16C, 0x2D8, 0x5B0, 0xB60, 0x16C0, 0x5D, 0xBA, 0x174, 0x2E8, 0x5D0, 0xBA0, 0x1740, 0x6B, 0xD6, 0x1AC, 0x358, 0x6B0, 0xD60, 0x1AC0, 0x6D, 0xDA, 0x1B4, 0x368, 0x6D0, 0xDA0, 0x1B40, 0x75, 0xEA, 0x1D4, 0x3A8, 0x750, 0xEA0, 0x1D40, 0xAB, 0x156, 0x2AC, 0x558, 0xAB0, 0x1560, 0xAD, 0x15A, 0x2B4, 0x568, 0xAD0, 0x15A0, 0xB5, 0x16A, 0x2D4, 0x5A8, 0xB50, 0x16A0, 0xD5, 0x1AA, 0x354, 0x6A8, 0xD50, 0x1AA0, 0x155, 0x2AA, 0x554, 0xAA8, 0x1550])
    }
    if(fourFingers && shortcut) {
        straights.push(...[0x17, 0x2E, 0x5C, 0xB8, 0x170, 0x2E0, 0x5C0, 0xB80, 0x1700, 0x1B, 0x36, 0x6C, 0xD8, 0x1B0, 0x360, 0x6C0, 0xD80, 0x1B00, 0x1D, 0x3A, 0x74, 0xE8, 0x1D0, 0x3A0, 0x740, 0xE80, 0x1D00, 0x2B, 0x56, 0xAC, 0x158, 0x2B0, 0x560, 0xAC0, 0x1580, 0x2D, 0x5A, 0xB4, 0x168, 0x2D0, 0x5A0, 0xB40, 0x1680, 0x35, 0x6A, 0xD4, 0x1A8, 0x350, 0x6A0, 0xD40, 0x1A80, 0x55, 0xAA, 0x154, 0x2A8, 0x550, 0xAA0, 0x1540, 0x155, 0x2AA, 0x554, 0xAA8, 0x1550])
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
    cards.forEach(c => {
        switch(blind.name) {
            case 'The Goad':
                c.debuffed = (c.suit === Suit.Spades || c.enhancement === Enhancement?.Wild)
                break
            case 'The Head':
                c.debuffed = (c.suit === Suit.Hearts || c.enhancement === Enhancement?.Wild)
                break
            case 'The Club':
                c.debuffed = (c.suit === Suit.Clubs || c.enhancement === Enhancement?.Wild)
                break
            case 'The Window':
                c.debuffed = (c.suit === Suit.Diamonds || c.enhancement === Enhancement?.Wild)
                break
            case 'The Plant':
                c.debuffed = ([Rank.King, Rank.Queen, Rank.Jack].includes(c.rank))
                break
            case 'The Pillar':
                c.debuffed = (past!.includes(c))
                break
            case 'Verdant Leaf':
                c.debuffed = !sold
                break
            
        }
        if(c.enhancement === Enhancement?.Stone) { c.debuffed = false }
    })
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
    const offers: (JokerInstance | ConsumableInstance)[] = []
    const total = Object.values(weights).reduce((n, w) => n += w)
    for(let i = 1; i <= slots; i++) {
        const roll = Random.next()
        if(roll < weights.Joker / total) {
            const rare_roll = Random.next()
            const rarity = rare_roll < .7 ? 'Common' : rare_roll < .95 ? 'Uncommon' : 'Rare'
            const validJokers = Jokers.filter(j => j.rarity === rarity && !game.jokers.find(joker => joker.joker.name === j.name) && !offers.filter(o => (o as JokerInstance).joker).find(o => (o as JokerInstance).joker.name === j.name))

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