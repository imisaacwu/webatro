import { Edition, Sticker } from "../Constants"

export type JokerInstance = {
    id: number
    joker: JokerType

    edition?: Edition
    sticker?: Sticker
    selected?: boolean
    debuffed?: boolean
    flipped?: boolean
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
    }, {
        name: 'Greedy Joker',
        description: 'Played cards with \n{orange}Diamond/ suit give \n{red}+3/ Mult when scored',
        cost: 5,
        rarity: 'Common',
        activation: [Activation.OnScored]
    }, {
        name: 'Lusty Joker',
        description: 'Played cards with \n{red}Heart/ suit give \n{red}+3/ Mult when scored',
        cost: 5,
        rarity: 'Common',
        activation: [Activation.OnScored]
    }, {
        name: 'Wrathful Joker',
        description: 'Played cards with \n{dark-purple}Spade/ suit give \n{red}+3/ Mult when scored',
        cost: 5,
        rarity: 'Common',
        activation: [Activation.OnScored]
    }, {
        name: 'Gluttonous Joker',
        description: 'Played cards with \n{blue}Club/ suit give \n{red}+3/ Mult when scored',
        cost: 5,
        rarity: 'Common',
        activation: [Activation.OnScored]
    }, {
        name: 'Jolly Joker',
        description: '{red}+8/ Mult if played hand\n contains a /{orange}Pair',
        cost: 3,
        rarity: 'Common',
        activation: [Activation.Independent]
    }, {
        name: 'Zany Joker',
        description: '{red}+12/ Mult if played\n hand contains a\n {orange}Three of a Kind',
        cost: 4,
        rarity: 'Common',
        activation: [Activation.Independent]
    }, {
        name: 'Mad Joker',
        description: '{red}+10/ Mult if played\nhand contains a\n {orange}Two Pair',
        cost: 4,
        rarity: 'Common',
        activation: [Activation.Independent]
    }, {
        name: 'Crazy Joker',
        description: '{red}+12/ Mult if played\nhand contains a\n {orange}Straight',
        cost: 4,
        rarity: 'Common',
        activation: [Activation.Independent]
    }, {
        name: 'Droll Joker',
        description: '{red}+10/ Mult if played\nhand contains a\n {orange}Flush',
        cost: 4,
        rarity: 'Common',
        activation: [Activation.Independent]
    }, {
        name: 'Sly Joker',
        description: '{blue}+50/ Chips if played\n hand contains a\n{orange}Pair',
        cost: 3,
        rarity: 'Common',
        activation: [Activation.Independent]
    }, {
        name: 'Wily Joker',
        description: '{blue}+100/ Chips if played\n hand contains a\n{orange}Three of a Kind',
        cost: 4,
        rarity: 'Common',
        activation: [Activation.Independent]
    }, {
        name: 'Clever Joker',
        description: '{blue}+80/ Chips if played\n hand contains a\n{orange}Two Pair',
        cost: 4,
        rarity: 'Common',
        activation: [Activation.Independent]
    }, {
        name: 'Devious Joker',
        description: '{blue}+100/ Chips if played\n hand contains a\n{orange}Straight',
        cost: 4,
        rarity: 'Common',
        activation: [Activation.Independent]
    }, {
        name: 'Crafty Joker',
        description: '{blue}+80/ Chips if played\n hand contains a\n{orange}Flush',
        cost: 4,
        rarity: 'Common',
        activation: [Activation.Independent]
    }, {
        name: 'Half Joker',
        description: '{red}+20/ Mult if played\n hand contains /{orange}3\n or fewer cards',
        cost: 5,
        rarity: 'Common',
        activation: [Activation.Independent]
    }
    
    
    
    
    
    ,{
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