import { Deck, Rank, Suit } from "../Constants"

export type CardInfo = {
    id: number
    suit: Suit
    rank: Rank
    deck: Deck

    mode?: 'standard' | 'deck-view'
    // edition?: Edition
    // enhancement?: Enhancement
    // seal?: Seal
    draggable?: boolean
    selected?: boolean
    submitted?: boolean
    scored?: boolean
    drawn?: boolean
    flipped?: boolean
    debuffed?: boolean
}