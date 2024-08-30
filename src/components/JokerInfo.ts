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

export enum Activation { OnPlayed, OnScored, OnHeld, Independent, OnOther, OnDiscard, EndOfRound, Passive, OnBlind }

export type JokerType = {
    name: string
    description: string
    cost: number
    rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary'
    activation: Activation[]
    counter?: number
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
    //  {
    //     name: 'Greedy Joker',
    //     description: 'Played cards with \n{orange}Diamond/ suit give \n{red}+3/ Mult when scored',
    //     cost: 5,
    //     rarity: 'Common',
    //     activation: [Activation.OnScored]
    // }, {
    //     name: 'Lusty Joker',
    //     description: 'Played cards with \n{red}Heart/ suit give \n{red}+3/ Mult when scored',
    //     cost: 5,
    //     rarity: 'Common',
    //     activation: [Activation.OnScored]
    // }, {
    //     name: 'Wrathful Joker',
    //     description: 'Played cards with \n{dark-purple}Spade/ suit give \n{red}+3/ Mult when scored',
    //     cost: 5,
    //     rarity: 'Common',
    //     activation: [Activation.OnScored]
    // }, {
    //     name: 'Gluttonous Joker',
    //     description: 'Played cards with \n{blue}Club/ suit give \n{red}+3/ Mult when scored',
    //     cost: 5,
    //     rarity: 'Common',
    //     activation: [Activation.OnScored]
    // }, {
    //     name: 'Jolly Joker',
    //     description: '{red}+8/ Mult if played hand\n contains a /{orange}Pair',
    //     cost: 3,
    //     rarity: 'Common',
    //     activation: [Activation.Independent]
    // }, {
    //     name: 'Zany Joker',
    //     description: '{red}+12/ Mult if played\n hand contains a\n {orange}Three of a Kind',
    //     cost: 4,
    //     rarity: 'Common',
    //     activation: [Activation.Independent]
    // }, {
    //     name: 'Mad Joker',
    //     description: '{red}+10/ Mult if played\nhand contains a\n {orange}Two Pair',
    //     cost: 4,
    //     rarity: 'Common',
    //     activation: [Activation.Independent]
    // }, {
    //     name: 'Crazy Joker',
    //     description: '{red}+12/ Mult if played\nhand contains a\n {orange}Straight',
    //     cost: 4,
    //     rarity: 'Common',
    //     activation: [Activation.Independent]
    // }, {
    //     name: 'Droll Joker',
    //     description: '{red}+10/ Mult if played\nhand contains a\n {orange}Flush',
    //     cost: 4,
    //     rarity: 'Common',
    //     activation: [Activation.Independent]
    // }, {
    //     name: 'Sly Joker',
    //     description: '{blue}+50/ Chips if played\n hand contains a\n{orange}Pair',
    //     cost: 3,
    //     rarity: 'Common',
    //     activation: [Activation.Independent]
    // }, {
    //     name: 'Wily Joker',
    //     description: '{blue}+100/ Chips if played\n hand contains a\n{orange}Three of a Kind',
    //     cost: 4,
    //     rarity: 'Common',
    //     activation: [Activation.Independent]
    // }, {
    //     name: 'Clever Joker',
    //     description: '{blue}+80/ Chips if played\n hand contains a\n{orange}Two Pair',
    //     cost: 4,
    //     rarity: 'Common',
    //     activation: [Activation.Independent]
    // }, {
    //     name: 'Devious Joker',
    //     description: '{blue}+100/ Chips if played\n hand contains a\n{orange}Straight',
    //     cost: 4,
    //     rarity: 'Common',
    //     activation: [Activation.Independent]
    // }, {
    //     name: 'Crafty Joker',
    //     description: '{blue}+80/ Chips if played\n hand contains a\n{orange}Flush',
    //     cost: 4,
    //     rarity: 'Common',
    //     activation: [Activation.Independent]
    // }, 
    // {
    //     name: 'Half Joker',
    //     description: '{red}+20/ Mult if played\n hand contains /{orange}3\n or fewer cards',
    //     cost: 5,
    //     rarity: 'Common',
    //     activation: [Activation.Independent]
    // }, {
    //     name: 'Joker Stencil',
    //     description: '{red}+/{nospace red-invert}X1/ Mult for each\n empty/ {orange}Joker slot.\n Joker Stencil included\n {grey} (Currently /{red}X_/ {grey} Mult)',
    //     cost: 8,
    //     rarity: 'Uncommon',
    //     activation: [Activation.Independent]
    // }, {
    //     name: 'Four Fingers',
    //     description: 'All/ {orange}Flushes/ and\n {orange}Straights/ can be made\n with 4 cards',
    //     cost: 7,
    //     rarity: 'Uncommon',
    //     activation: [Activation.Passive],
    //     copyable: false
    // }, {
    //     name: 'Mime',
    //     description: 'Retrigger all card\n {orange}held in hand/ abilities',
    //     cost: 5,
    //     rarity: 'Uncommon',
    //     activation: [Activation.OnHeld]
    // }, {
    //     name: 'Credit Card',
    //     description: 'Go up to /{red}-$20\n in debt',
    //     cost: 1,
    //     rarity: 'Common',
    //     activation: [Activation.Passive],
    //     copyable: false
    // }, // TODO: ceremonial dagger
    // {
    //     name: 'Banner',
    //     description: '{blue}+30/ Chips for each\n remaining/{orange} discard',
    //     cost: 5,
    //     rarity: 'Common',
    //     activation: [Activation.Independent]
    // }, {
    //     name: 'Mystic Summit',
    //     description: '{red}+15/ Mult when/ {orange}0\n discards remaining',
    //     cost: 5,
    //     rarity: 'Common',
    //     activation: [Activation.Independent]
    // }, {
    //     name: 'Marble Joker',
    //     description: 'Adds one /{orange}Stone/ card\n to the deck when\n{orange}Blind/ is selected',
    //     cost: 6,
    //     rarity: 'Uncommon',
    //     activation: [Activation.OnBlind]
    // }, {
    //     name: 'Loyalty Card',
    //     description: '{red-invert}X4/ Mult every/{orange}6\n hands played\n{grey}_ remaining',
    //     cost: 5,
    //     rarity: 'Uncommon',
    //     activation: [Activation.OnPlayed, Activation.Independent],
    //     counter: 6
    // }, {
    //     name: '8 Ball',
    //     description: '{green}1 in 4/ chance for each\n played/ {orange}8/ to create a\n{purple}Tarot/ card when scored\n {grey small}(Must have room)',
    //     cost: 5,
    //     rarity: 'Common',
    //     activation: [Activation.OnScored]
    // }, {
    //     name: 'Misprint',
    //     description: '{red}+?/ Mult',
    //     cost: 4,
    //     rarity: 'Common',
    //     activation: [Activation.Independent]
    // }, {
    //     name: 'Dusk',
    //     description: 'Retrigger all played cards\n in /{orange}final hand/ of the round',
    //     cost: 5,
    //     rarity: 'Uncommon',
    //     activation: [Activation.OnScored]
    // }, {
    //     name: 'Raised Fist',
    //     description: 'Adds /{orange}double/ the rank of\n {orange}lowest/ ranked card held\n in hand to Mult',
    //     cost: 5,
    //     rarity: 'Common',
    //     activation: [Activation.OnHeld]
    // } // Chaos the clown
    // , {
    //     name: 'Fibonacci',
    //     description: 'Each played /{orange}Ace/{nospace},/{orange}2/{nospace},/{orange}3/{nospace},\n{orange}5/{nospace}, or/{orange}8/ gives\n{red}+8/ Mult when scored',
    //     cost: 8,
    //     rarity: 'Uncommon',
    //     activation: [Activation.OnScored]
    // } // Steel Joker
    // , {
    //     name: 'Scary Face',
    //     description: 'Played /{orange}face/ cards give\n {blue}+30/ Chips when scored',
    //     cost: 4,
    //     rarity: 'Common',
    //     activation: [Activation.OnScored]
    // }, {
    //     name: 'Abstract Joker',
    //     description: '{red}+3/ Mult for each/ {orange}Joker/ card\n{grey}(Currently/ {red}+_/ {grey}Mult)',
    //     cost: 4,
    //     rarity: 'Common',
    //     activation: [Activation.Independent]
    // } // Delayed Gratification
    // , {
    //     name: 'Hack',
    //     description: 'Retrigger each played\n {orange}2/{nospace},/{orange}3/{nospace},/{orange}4/{nospace}, or/{orange}5',
    //     cost: 6,
    //     rarity: 'Uncommon',
    //     activation: [Activation.OnScored]
    // } // Pareidolia, Gros Michel
    // , {
    //     name: 'Even Steven',
    //     description: 'Played cards with /{orange}even/ rank\n give /{red}+4/ Mult when scored\n{grey small}(10, 8, 6, 5, 2)',
    //     cost: 4,
    //     rarity: 'Common',
    //     activation: [Activation.OnScored]
    // }, {
    //     name: 'Odd Todd',
    //     description: 'Played cards with /{orange}odd/ rank\n give /{blue}+31/ Chips when scored\n{grey small}(A, 9, 7, 5, 3)',
    //     cost: 4,
    //     rarity: 'Common',
    //     activation: [Activation.OnScored]
    // }, {
    //     name: 'Scholar',
    //     description: 'Played /{orange}Aces/ give/ {blue}+20\nChips and /{red}+4/ mult when scored',
    //     cost: 4,
    //     rarity: 'Common',
    //     activation: [Activation.OnScored]
    // }, {
    //     name: 'Business Card',
    //     description: 'Played /{orange}face/ cards have a\n{green}1 in 2/ chance to\n give/ {yellow}$2/ when scored',
    //     cost: 4,
    //     rarity: 'Common',
    //     activation: [Activation.OnScored]
    // }, {
    //     name: 'Supernova',
    //     description: 'Adds the number of times\n{orange}poker hand/ has been played\n this run to Mult',
    //     cost: 5,
    //     rarity: 'Common',
    //     activation: [Activation.Independent]
    // }, {
    //     name: 'Ride the Bus',
    //     description: 'This Joker gains/ {red}+1/ Mult per\n{orange} consecutive/ hand played without a\n scoring/ {orange} face/ card\n{grey} (Currently/ {red}+_/ {grey} Mult)',
    //     cost: 6,
    //     rarity: 'Common',
    //     activation: [Activation.OnPlayed, Activation.Independent],
    //     counter: 0
    // }, {
    //     name: 'Space Joker',
    //     description: '{green}1 in 4/ chance to\n upgrade level of played\n{orange} poker hand',
    //     cost: 5,
    //     rarity: 'Uncommon',
    //     activation: [Activation.OnPlayed]
    // }, {
    //     name: 'Egg',
    //     description: 'Gains/ {yellow}$3/ of/ {orange}sell value\n at end of round',
    //     cost: 4,
    //     rarity: 'Common',
    //     activation: [Activation.EndOfRound],
    //     counter: 0
    // }, {
    //     name: 'Burglar',
    //     description: 'When/ {orange}Blind/ is selected,\n gain/ {blue}+3/ Hands and\n {orange}lose all discards',
    //     cost: 6,
    //     rarity: 'Uncommon',
    //     activation: [Activation.OnBlind]
    // }, {
    //     name: 'Blackboard',
    //     description: '{red-invert}X3/ Mult if all cards held\n in hand are/ {dark-purple}Spades/ or/ {blue} Clubs',
    //     cost: 6,
    //     rarity: 'Uncommon',
    //     activation: [Activation.Independent]
    // }, {
    //     name: 'Runner',
    //     description: 'Gains/ {blue}+15/ Chips if played hand\n contains a/ {orange}Straight\n{grey}(Currently/ {blue}+_/{grey} Chips)',
    //     cost: 5,
    //     rarity: 'Common',
    //     activation: [Activation.OnPlayed, Activation.Independent],
    //     counter: 0
    // }, {
    //     name: 'Ice Cream',
    //     description: '{blue}+_/ Chips\n{blue}-5/ Chips for every\nhand played',
    //     cost: 5,
    //     rarity: 'Common',
    //     activation: [Activation.OnPlayed, Activation.Independent],
    //     counter: 100
    // }, 
    {
        name: 'DNA',
        description: 'If/ {orange}first hand/ of round\n has only/ {orange}1/ card, add a\n permanent copy to deck\n and draw it to/ {orange}hand',
        cost: 8,
        rarity: 'Rare',
        activation: [] // Activated in hand on submit
    }, 
    // {
    //     name: 'Splash',
    //     description: 'Every/ {orange}played card/ counts\n in scoring',
    //     cost: 3,
    //     rarity: 'Common',
    //     activation: [Activation.Passive]
    // }, {
    //     name: 'Blue Joker',
    //     description: '{blue}+2/ Chips for each remaining\n card in/ {orange}deck\n{grey}(Currently/ {blue}+_/{grey} Chips)',
    //     cost: 5,
    //     rarity: 'Common',
    //     activation: [Activation.Independent]
    // }, {
    //     name: 'Sixth Sense',
    //     description: 'If/ {orange}first hand/ of round\n is a single/ {orange}6/ destroy it\n and create a/ {blue}Spectral/ card\n{small grey}(Must have room)',
    //     cost: 6,
    //     rarity: 'Uncommon',
    //     activation: [Activation.OnPlayed]
    // }, {
    //     name: 'Constellation',
    //     description: 'This joker gains /{red-invert}X0.1/ Mult\n every time a/ {aqua}Planet/ card is used\n {grey}(Currently /{red-invert}X_/{grey} Mult)',
    //     cost: 6,
    //     rarity: 'Uncommon',
    //     activation: [Activation.Independent],
    //     counter: 1
    // }, {
    //     name: 'Hiker',
    //     description: 'Every played/ {orange} card\n permanently gains/ {blue}+5/ Chips\n when scored',
    //     cost: 5,
    //     rarity: 'Uncommon',
    //     activation: [Activation.OnScored]
    // }, {
    //     name: 'Faceless Joker',
    //     description: 'Earn/ {yellow}$5/ if/ {orange}3/ or\n more/ {orange}face cards\n are discarded at\nthe same time',
    //     cost: 4,
    //     rarity: 'Common',
    //     activation: [Activation.OnDiscard]
    // }, {
    //     name: 'Green Joker',
    //     description: '{red}+1/ Mult per hand played\n{red}-1/ Mult per discard\n{grey}(Currently/ {red}+_/ {grey}Mult)',
    //     cost: 4,
    //     rarity: 'Common',
    //     activation: [Activation.OnPlayed, Activation.OnDiscard, Activation.Independent],
    //     counter: 0
    // }, {
    //     name: 'Superposition',
    //     description: 'Create a/ {purple}Tarot/ card\n if poker hand contains an/ {orange}Ace\n and a/ {orange}Straight\n{small grey}(Must have room)',
    //     cost: 4,
    //     rarity: 'Common',
    //     activation: [Activation.OnPlayed]
    // }, { // To Do List
    //     name: 'To Do List',
    //     description: 'Earn/ {yellow}$4/ if/ {orange}poker\n {orange}hand is a\n{orange}_/,\npoker hand changes at end of round',
    //     cost: 4,
    //     rarity: 'Common',
    //     activation: [Activation.OnPlayed]
    // }, 
    // {
    //     name: 'Cavendish',
    //     description: '{red-invert}X3/ Mult\n{green}1 in 1000/ chance this card\n is destroyed at the\n end of round',
    //     cost: 4,
    //     rarity: 'Common',
    //     activation: [Activation.Independent, Activation.EndOfRound]
    // },
    // Card Sharp, Red Card
    {
        name: 'Madness',
        description: 'When/ {orange} Small Blind/ or\n {orange} Big Blind/ is selected,\n gain/ {red-invert}X0.5/ Mult and/ {orange} destroy\n a random Joker\n{grey}(Currently/ {red}X_/{grey}Mult)',
        cost: 7,
        rarity: 'Uncommon',
        activation: [Activation.OnBlind, Activation.Independent],
        counter: 1
    }, {
        name: 'Square Joker',
        description: 'This Joker gains/ {blue}+4/ Chips if\n played hand has exactly/ {orange}4/ cards\n{grey}(Currently/ {blue}_/{grey}Chips)',
        cost: 4,
        rarity: 'Common',
        activation: [Activation.OnPlayed, Activation.Independent],
        counter: 0
    }, {
        name: 'Seance',
        description: 'If/ {orange}poker hand/ is a\n {orange}Straight Flush/{nospace}, create a\n random/ {blue}Spectral/ card\n {grey small}(Must have room)',
        cost: 6,
        rarity: 'Uncommon',
        activation: [Activation.OnPlayed]
    }, {
        name: 'Riff-Raff',
        description: 'When/ {orange}Blind/ is selected,\n create/ {orange}2/ {blue}Common/ {orange}Jokers\n {small grey}(Must have room)',
        cost: 5,
        rarity: 'Common',
        activation: [Activation.OnBlind]
    }, {
        name: 'Vampire',
        description: 'This Joker gains/ {red}+/ {red-invert nospace}X0.1\n per scoring/ {orange}Enhanced\n {orange}card/ played, removes\n card/ {orange}Enhancement\n {grey}(Currently/ {red-invert}X_/ {grey}Mult)',
        cost: 7,
        rarity: 'Uncommon',
        activation: [Activation.OnScored, Activation.Independent],
        counter: 1
    }, {
        name: 'Shortcut',
        description: 'Allows/ {orange}Straights/ to be\n made with gaps of/ {orange}1 rank\n {grey}(ex:/ {orange}10 8 6 5 3/{grey nospace})',
        cost: 7,
        rarity: 'Uncommon',
        activation: [Activation.Passive]
    } // Hologram
    , {
        name: 'Vagabond',
        description: 'Create a/ {purple}Tarot/ card\n if hand is played with\n {yellow}$4/ or less\n {small grey}(Must have room)',
        cost: 8,
        rarity: 'Rare',
        activation: [Activation.OnPlayed]
    }, {
        name: 'Baron',
        description: 'Each/ {orange}King/ held in hand\n gives/ {red-invert}X1.5/ Mult',
        cost: 8,
        rarity: 'Rare',
        activation: [Activation.OnHeld]
    }, {
        name: 'Cloud 9',
        description: 'Earn/ {yellow}$1/ for each/ {orange}9\n in your/ {orange}full deck/ at\n end of round\n {grey}(Currently/ {yellow}$_/ {grey nospace})',
        cost: 7,
        rarity: 'Uncommon',
        activation: [Activation.EndOfRound]
    }
    // ,{
    //     name: 'Baseball Card',
    //     description: '{green}Uncommon/Jokers each\ngive/{red-invert}X1.5/Mult',
    //     cost: 8,
    //     rarity: 'Rare',
    //     activation: []
    // }
    , {
        name: 'Triboulet',
        description: 'Played Kings and\nQueens each give/{red-invert}X2/Mult\nwhen scored',
        cost: 20,
        rarity: 'Legendary',
        activation: [Activation.OnScored]
    }
]