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

export type CardInfo = {
    id: number
    suit: Suit
    rank: Rank
    edition?: Edition
    enhancement?: Enhancement
    seal?: Seal

    mode?: 'standard' | 'deck-view'
    selected?: boolean
    submitted?: boolean
    scored?: boolean
    drawn?: boolean
    flipped?: boolean
    debuffed?: boolean
}

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

export const HandType = {
    FLUSH_FIVE: 'Flush Five',
    FLUSH_HOUSE: 'Flush House',
    FIVE: 'Five of a Kind',
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

export const handUpgrade = {
    'FLUSH_FIVE': {chips: 50, mult: 3},
    'FLUSH_HOUSE': {chips: 40, mult: 4},
    'FIVE': {chips: 35, mult: 3},
    'STRAIGHT_FLUSH': {chips: 40, mult: 4},
    'FOUR': {chips: 30, mult: 3},
    'FULL_HOUSE': {chips: 25, mult: 2},
    'FLUSH': {chips: 15, mult: 2},
    'STRAIGHT': {chips: 30, mult: 3},
    'THREE': {chips: 20, mult: 2},
    'TWO_PAIR': {chips: 20, mult: 1},
    'PAIR': {chips: 15, mult: 1},
    'HIGH_CARD': {chips: 10, mult: 1},
    'NONE': {chips: 0, mult: 0}
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
    }, {
        img: '../assets/blinds/ox.webp',
        name: 'The Ox',
        descrip: 'Playing a _ sets money to $0',
        ante: 6,
        mult: 2,
        reward: 5
    }, {
        img: '../assets/blinds/house.webp',
        name: 'The House',
        descrip: 'First hand is drawn face down',
        ante: 2,
        mult: 2,
        reward: 5
    }, {
        img: '../assets/blinds/wall.webp',
        name: 'The Wall',
        descrip: 'Extra large blind',
        ante: 2,
        mult: 4,
        reward: 5
    }, {
        img: '../assets/blinds/wheel.webp',
        name: 'The Wheel',
        descrip: '1 in 7 cards drawn face down',
        ante: 2,
        mult: 2,
        reward: 5
    }, {
        img: '../assets/blinds/arm.webp',
        name: 'The Arm',
        descrip: 'Decrease level of played poker hand', // Does not lower if at lvl.1
        ante: 2,
        mult: 2,
        reward: 5
    }, {
        img: '../assets/blinds/club.webp',
        name: 'The Club',
        descrip: 'All Club cards are debuffed',
        ante: 1,
        mult: 2,
        reward: 5,
    }, {
        img: '../assets/blinds/fish.webp',
        name: 'The Fish',
        descrip: 'Cards drawn face down after each hand played',
        ante: 2,
        mult: 2,
        reward: 5
    }, {
        img: '../assets/blinds/psychic.webp',
        name: 'The Psychic',
        descrip: 'Must play 5 cards', // TODO: warning
        ante: 1,
        mult: 2,
        reward: 5
    }, {
        img: '../assets/blinds/goad.webp',
        name: 'The Goad',
        descrip: 'All Spade cards are debuffed',
        ante: 1,
        mult: 2,
        reward: 5
    }, {
        img: '../assets/blinds/water.webp',
        name: 'The Water',
        descrip: 'Start with 0 discards',
        ante: 2,
        mult: 2,
        reward: 5
    }, {
        img: '../assets/blinds/window.webp',
        name: 'The Window',
        descrip:  'All Diamond cards are debuffed',
        ante: 1,
        mult: 2,
        reward: 5
    }, {
        img: '../assets/blinds/manacle.webp',
        name: 'The Manacle',
        descrip: '-1 Hand Size',
        ante: 1,
        mult: 2,
        reward: 5
    }, {
        img: '../assets/blinds/eye.webp',
        name: 'The Eye',
        descrip: 'No repeat hand types this round',
        ante: 3,
        mult: 2,
        reward: 5
    }, {
        img: '../assets/blinds/mouth.webp',
        name: 'The Mouth',
        descrip: 'Play only 1 hand type this round',
        ante: 2,
        mult: 2,
        reward: 5
    }, {
        img: '../assets/blinds/plant.webp',
        name: 'The Plant',
        descrip: 'All face cards are debuffed',
        ante: 4,
        mult: 2,
        reward: 5
    }, {
        img: '../assets/blinds/serpent.webp',
        name: 'The Serpent',
        descrip: 'After Play or Discard, always draw 3 cards',
        ante: 5,
        mult: 2,
        reward: 5
    }, {
        img: '../assets/blinds/pillar.webp',
        name: 'The Pillar',
        descrip: 'Cards played previously this Ante are debuffed',
        ante: 1,
        mult: 2,
        reward: 5
    }, {
        img: '../assets/blinds/needle.webp',
        name: 'The Needle',
        descrip: 'Play only 1 hand',
        ante: 2,
        mult: 1,
        reward: 5
    }, {
        img: '../assets/blinds/head.webp',
        name: 'The Head',
        descrip: 'All Heart cards are debuffed',
        ante: 1,
        mult: 2,
        reward: 5
    }, {
        img: '../assets/blinds/tooth.webp',
        name: 'The Tooth',
        descrip: 'Lose $1 per card played', // TODO: add to post-scoring menu
        ante: 3,
        mult: 2,
        reward: 5
    }, {
        img: '../assets/blinds/flint.webp',
        name: 'The Flint',
        descrip: 'Base Chips and Mult are halved',
        ante: 2,
        mult: 2,
        reward: 5
    }, {
        img: '../assets/blinds/mark.webp',
        name: 'The Mark',
        descrip: 'All face cards are drawn face down',
        ante: 2,
        mult: 2,
        reward: 5
    }, {
        img: '../assets/blinds/amber_acorn.webp',
        name: 'Amber Acorn',
        descrip: 'Flips and shuffles all Joker cards', // TODO
        ante: 81,
        mult: 2,
        reward: 8
    }, {
        img: '../assets/blinds/verdant_leaf.webp',
        name: 'Verdant Leaf',
        descrip: 'All cards debuffed until 1 Joker sold', // TODO
        ante: 81,
        mult: 2,
        reward: 8
    }, {
        img: '../assets/blinds/violet_vessel.webp',
        name: 'Violet Vessel',
        descrip: 'Very large blind',
        ante: 8,
        mult: 6,
        reward: 8
    }, {
        img: '../assets/blinds/crimson_heart.webp',
        name: 'Crimson Heart',
        descrip: 'One random Joker disabled every hand', // TODO
        ante: 81,
        mult: 2,
        reward: 8
    }, {
        img: '../assets/blinds/cerulean_bell.webp',
        name: 'Cerulean Bell',
        descrip: 'Forces 1 card to always be selected',
        ante: 8,
        mult: 2,
        reward: 8
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