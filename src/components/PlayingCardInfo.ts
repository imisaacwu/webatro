import { Suit, Rank, Enhancement, Seal } from "../Constants"
import { CardInfo } from "./CardInfo"

export interface PlayingCardInfo extends Omit<CardInfo, 'image' | 'onClick'>{
    suit: Suit
    rank: Rank

    mode?: 'standard' | 'deck-view'
    enhancement?: Enhancement
    seal?: Seal
    submitted?: boolean
    scored?: boolean
    drawn?: boolean
}