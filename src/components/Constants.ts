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

type HandLevel = {
    [K in keyof typeof HandType]: { level: number, chips: number, mult: number, played: number }
}

export const handLevels: HandLevel = {
    'FLUSH_FIVE': {level: 1, chips: 160, mult: 16, played: 0},
    'FLUSH_HOUSE': {level: 1, chips: 140, mult: 14, played: 0},
    'FIVE': {level: 1, chips: 120, mult: 12, played: 0},
    'ROYAL_FLUSH': {level: 1, chips: 100, mult: 8, played: 0},
    'STRAIGHT_FLUSH': {level: 1, chips: 100, mult: 8, played: 0},
    'FOUR': {level: 1, chips: 60, mult: 7, played: 0},
    'FULL_HOUSE': {level: 1, chips: 40, mult: 4, played: 0},
    'FLUSH': {level: 1, chips: 35, mult: 4, played: 0},
    'STRAIGHT': {level: 1, chips: 30, mult: 4, played: 0},
    'THREE': {level: 1, chips: 30, mult: 3, played: 0},
    'TWO_PAIR': {level: 1, chips: 20, mult: 2, played: 0},
    'PAIR': {level: 1, chips: 10, mult: 2, played: 0},
    'HIGH_CARD': {level: 1, chips: 5, mult: 1, played: 0},
    'NONE': {level: 0, chips: 0, mult: 0, played: 0}
}

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
    }, {
        img: '../assets/blinds/ox.webp',
        name: 'The Ox',
        descrip: 'Playing a _ sets money to $0',
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