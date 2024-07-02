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

export const chipMap = new Map([
    [Rank.Two, 2],
    [Rank.Three, 3],
    [Rank.Four, 4],
    [Rank.Five, 5],
    [Rank.Six, 6],
    [Rank.Seven, 7],
    [Rank.Eight, 8],
    [Rank.Nine, 9],
    [Rank.Ten, 10],
    [Rank.Jack, 10],
    [Rank.Queen, 10],
    [Rank.King, 10],
    [Rank.Ace, 11]  
])

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
}