export enum Suit {
    Spades = 'spades',
    Hearts = 'hearts',
    Clubs = 'clubs',
    Diamonds = 'diamonds'
}

export enum Rank {
    Two = 2,
    Three = 3,
    Four = 4,
    Five = 5,
    Six = 6,
    Seven = 7,
    Eight = 8,
    Nine = 9,
    Ten = 10,
    Jack = 10,
    Queen = 10,
    King = 10,
    Ace = 11
}

export enum Edition {
    Base = 'base',
    Foil = 'foil',
    Holo = 'holo',
    Negative = 'negative',
    Poly = 'poly'
}

export enum Enhancement {
    Bonus = 'bonus',
    Glass = 'glass',
    Gold = 'gold',
    Lucky = 'lucky',
    Mult = 'mult',
    None = 'none',
    Steel = 'steel',
    Stone = 'stone',
    Wild = 'wild'
}

export enum Seal {
    Blue = 'blue',
    Gold = 'gold',
    None = 'none',
    Purple = 'purple',
    Red = 'red'
}

export class Card {
    suit: Suit
    rank: Rank
    edition: Edition
    enhancement: Enhancement
    seal: Seal

    constructor(suit: Suit, rank: Rank, edition: Edition = Edition.Base, enhancement: Enhancement = Enhancement.None, seal: Seal = Seal.None) {
        this.suit = suit
        this.rank = rank
        this.enhancement = enhancement
        this.edition = edition
        this.seal = seal
    }

    toString() {
        return `${this.rank} of ${this.suit}`
    }
}