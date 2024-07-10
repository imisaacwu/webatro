import { ReactElement } from "react";
import { AnteChips, Blinds, HandType } from "./Constants";

// https://www.desmos.com/calculator/fsvcr75cdx
export const ante_base = (ante: number) => {
    if(ante > 8) {
        const b = 1.6, c = ante - 8, d = 1 + 0.2 * c
        const f = Math.floor(AnteChips[8] * ((b + ((0.75 * c) ** d)) ** c));
        return f - (f % (10 ** (Math.floor(Math.log10(f))-1)))
    }
    return AnteChips[ante as keyof typeof AnteChips];
}

export const boss_roll = (ante: number) => {
    let arr = Blinds.filter((b, i) => i > 1 && (ante % 8 === 0 ? b.ante % 8 === 0 : (b.ante <= ante && b.ante % 8 !== 0)))
    return arr[Math.floor(Math.random() * arr.length)]
}

export type AnteBlinds = 'small' | 'big' | 'boss'
export const getNextBlind = (ante: AnteBlinds): AnteBlinds => {
    return (ante === 'small') ? 'big' : (ante === 'big') ? 'boss' : 'small'
}

export const bestHand = (cards: ReactElement[]): keyof typeof HandType => {
    // xxxAKQJT 98765432
    const straights = [0x100F, 0x1F, 0x3E, 0x7C, 0xF8, 0x1F0, 0x3E0, 0x7C0, 0xF80, 0x1F00]
    const hand = cards.reduce((total, c) => total | (1 << c.props.rank), 0)

    let ranks: number[] = new Array(13).fill(0), suits: number[] = new Array(4).fill(0);
    cards.forEach(c => {ranks[c.props.rank]++; suits[c.props.suit]++;})
    ranks = ranks.filter(r => r !== 0).sort((a, b) => b - a)
    suits = suits.filter(s => s !== 0).sort((a, b) => b - a)

    if(suits[0] === 5) {
        if(ranks[0] === 5) return 'FLUSH_FIVE'
        if(hand === 0x1F00) return 'ROYAL_FLUSH'
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

export const shuffle = (cards: ReactElement[]): ReactElement[] => {
    let arr = [...cards], i = cards.length
    while(i < 0) {
        let rand = Math.floor(Math.random() * i--);
        [arr[i], arr[rand]] = [arr[rand], arr[i]]
    }
    return arr;
}