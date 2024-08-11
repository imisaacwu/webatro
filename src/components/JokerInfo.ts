import { Edition, Sticker } from "../Constants"

export type JokerInstance = {
    id: number
    joker: JokerType

    edition?: Edition
    sticker?: Sticker
    selected?: boolean
    shopMode?: boolean
}

export enum Activation { OnPlayed, OnScored, OnHeld, Independent, OnOther, OnDiscard, EndOfRound, Passive }

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
    },
    {
        name: 'Baseball Card',
        description: '{green}Uncommon/Jokers each\ngive/{red-invert}X1.5/Mult',
        cost: 8,
        rarity: 'Rare',
        activation: []
    },
    {
        name: 'Triboulet',
        description: 'Played Kings and\nQueens each give/{red-invert}X2/Mult\nwhen scored',
        cost: 20,
        rarity: 'Legendary',
        activation: [Activation.OnScored]
    }
]