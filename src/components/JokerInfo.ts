import { Edition, Sticker } from "../Constants"

export type JokerInstance = {
    id: number
    joker: JokerType

    edition?: Edition
    sticker?: Sticker
    selected?: boolean
    shopMode?: boolean
}

export enum Activation { OnPlayed, OnScored, OnHeld, Independent, OnOther, OnDiscard, PostScoring, Passive }

export type JokerType = {
    name: string
    description: string
    cost: number
    rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary'
    activation: Activation[]
    copyable?: boolean
    perishable?: boolean
    eternal?: boolean
}

export const Jokers: JokerType[] = [
    {
        name: 'Joker',
        description: '{red}+4/Mult',
        cost: 2,
        rarity: 'Common',
        activation: [Activation.Independent]
    }
]