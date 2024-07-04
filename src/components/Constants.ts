export type CardActionType = 'init' | 'select' | 'shuffle' | 'draw' | 'submit' | 'discard' | 'reset' | 'sort'

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

export const Blinds = {
    SMALL_BLIND: 'Small Blind',
    BIG_BLIND: 'Big Blind'
}
export type BlindNames = keyof typeof Blinds