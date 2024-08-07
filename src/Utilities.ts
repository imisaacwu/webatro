import { CardInfo } from "./components/CardInfo"
import { Jokers } from "./components/JokerInfo"
import { AnteChips, Blinds, Consumables, Enhancement, handLevels, HandType } from "./Constants"
import { GameState } from "./GameState"

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
    return arr[Math.floor(Math.random() * arr.length)]
}

export type AnteBlinds = 'small' | 'big' | 'boss'
export const getNextBlind = (ante: AnteBlinds): AnteBlinds => {
    return (ante === 'small') ? 'big' : (ante === 'big') ? 'boss' : 'small'
}

export const bestHand = (cards: CardInfo[]): keyof typeof HandType => {
    // xxxAKQJT 98765432
    const straights = [0x100F, 0x1F, 0x3E, 0x7C, 0xF8, 0x1F0, 0x3E0, 0x7C0, 0xF80, 0x1F00]
    const hand = cards.reduce((total, c) => total | (1 << c.rank), 0)

    // TODO: Stone
    // [2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, A, Stone]
    let ranks: number[] = new Array(14).fill(0), suits: number[] = new Array(4).fill(0)
    cards.forEach(c => {
        if(c.enhancement !== undefined && c.enhancement === Enhancement.Stone) {
            ranks[13]++;
        } else {
            ranks[c.rank]++
            suits[c.suit]++
        }
    })
    ranks = ranks.filter(r => r !== 0).sort((a, b) => b - a)
    suits = suits.filter(s => s !== 0).sort((a, b) => b - a)

    if(suits[0] === 5) {
        if(ranks[0] === 5) return 'FLUSH_FIVE'
        if(straights.includes(hand)) return 'STRAIGHT_FLUSH'
        if(ranks[0] === 3 && ranks[1] === 2) return 'FLUSH_HOUSE'
        return 'FLUSH'
    }

    switch(ranks[0]) {
        case 5: return 'FIVE'
        case 4: return 'FOUR'
        case 3: return ranks[1] === 2 ? 'FULL_HOUSE' : 'THREE'
        case 2: return ranks[1] === 2 ? 'TWO_PAIR' : 'PAIR'
        case 1: return straights.includes(hand) ? 'STRAIGHT' : 'HIGH_CARD'
    }

    return 'NONE'
}

export const shuffle = (cards: any[]) => {
    let arr = [...cards], i = cards.length
    while(i > 0) {
        let rand = Math.floor(Math.random() * i--);
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
        const roll = Math.random()
        if(roll < weights.Joker / total) {
            const rare_roll = Math.random()
            const rarity = rare_roll < .7 ? 'Common' : rare_roll < .95 ? 'Uncommon' : 'Rare'
            const validJokers = Jokers.filter(j => j.rarity === rarity && !game.jokers.find(joker => joker.joker.name === j.name))
            if(validJokers.length === 0) { validJokers.push(Jokers[0])}
            offers.push({
                id: -i,
                joker: validJokers[Math.floor(Math.random() * validJokers.length)],
                shopMode: true
            })
        } else if(roll < (weights.Joker + weights.Tarot) / total) {
            const validTarots = Consumables.slice(29, 51).filter(c => game.cards.consumables.every(con => con.consumable.name !== c.name))
            if(validTarots.length === 0) { validTarots.push(Consumables[40])}
            offers.push({
                id: -i,
                consumable: validTarots[Math.floor(Math.random() * validTarots.length)],
                shopMode: true
            })
        } else if(roll < (weights.Joker + weights.Tarot + weights.Planet) / total) {
            const validPlanets = Consumables.slice(0, 11).filter(c => game.cards.consumables.every(con => con.consumable.name !== c.name) && (!c.name.match('Planet X|Ceres|Eris') || handLevels[c.hand!].played > 0))
            if(validPlanets.length === 0) { validPlanets.push(Consumables[0]) }
            offers.push({
                id: -i,
                consumable: validPlanets[Math.floor(Math.random() * validPlanets.length)],
                shopMode: true
            })
        }
    }
    return offers
}