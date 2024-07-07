export type CardActionType = 'init' | 'select' | 'shuffle' | 'draw' | 'submit' | 'discard' | 'scored' | 'reset' | 'sort'

export const DeckType = {
    Abandoned: 'Abandoned',
    Anaglyph: 'Anaglyph',
    Black: 'Black',
    Blue: 'Blue',
    Challenge: 'Challenge',
    Checkered: 'Checkered',
    Erratic: 'Erratic',
    Ghost: 'Ghost',
    Green: 'Green',
    Magic: 'Magic',
    Nebula: 'Nebula',
    Painted: 'Painted',
    Plasma: 'Plasma',
    Red: 'Red',
    Yellow: 'Yellow',
    Zodiac: 'Zodiac'
} as const

export enum Suit { Spades, Hearts, Clubs, Diamonds }
export enum Rank { Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten, Jack, Queen, King, Ace }
export enum Edition { Base, Foil, Holographic, Negative, Polychrome }
export enum Enhancement { Bonus, Glass, Gold, Lucky, Mult, None, Steel, Stone, Wild }
export enum Seal { Blue, Gold, None, Purple, Red }

export const rankChips: { [R in keyof typeof Rank]: number } = {
    Two: 2,
    Three: 3,
    Four: 4,
    Five: 5,
    Six: 6,
    Seven: 7,
    Eight: 8,
    Nine: 9,
    Ten: 10,
    Jack: 10,
    Queen: 10,
    King: 10,
    Ace: 11
} as const

export const suitMap = new Map([
    [Suit.Spades, '♠'],
    [Suit.Hearts, '♥'],
    [Suit.Clubs, '♣'],
    [Suit.Diamonds, '♦']
])

export const HandType = {
    FLUSH_FIVE: 'Flush Five',
    FLUSH_HOUSE: 'Flush House',
    FIVE: 'Five of a Kind',
    ROYAL_FLUSH: 'Royal Flush',
    STRAIGHT_FLUSH: 'Straight Flush',
    FOUR: 'Four of a Kind',
    FULL_HOUSE: 'Full House',
    FLUSH: 'Flush',
    STRAIGHT: 'Straight',
    THREE: 'Three of a Kind',
    TWO_PAIR: 'Two Pair',
    PAIR: 'Pair',
    HIGH_CARD: 'High Card',
    NONE: ''
} as const

export type BlindType = {
    img: string
    name: string
    descrip: string
    ante: number
    mult: number
    reward: number
}

export const Blinds: BlindType[] = [
    {
        img: '../assets/blinds/small_blind.webp',
        name: 'Small Blind',
        descrip: '',
        ante: 1,
        mult: 1,
        reward: 3
    }, {
        img: '../assets/blinds/big_blind.webp',
        name: 'Big Blind',
        descrip: '',
        ante: 1,
        mult: 1.5,
        reward: 4
    }, {
        img: '../assets/blinds/hook.webp',
        name: 'The Hook',
        descrip: 'Discards 2 random cards per hand played',
        ante: 1,
        mult: 2,
        reward: 5
    }
]

export const AnteChips = {
    0: 100,
    1: 300,
    2: 800,
    3: 2000,
    4: 5000,
    5: 11000,
    6: 20000,
    7: 35000,
    8: 50000
}