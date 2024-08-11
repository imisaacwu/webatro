export enum DeckType { Abandoned, Anaglyph, Black, Blue, Challenge, Checkered, Erratic, Ghost, Green, Magic, Nebula, Painted, Plasma, Red, Yellow, Zodiac }

export enum Suit { Spades, Hearts, Clubs, Diamonds }
export enum Rank { Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten, Jack, Queen, King, Ace }
export enum Edition { Foil, Holographic, Negative, Polychrome }
export enum Enhancement { Base, Bonus, Glass, Gold, Lucky, Mult, Steel, Stone, Wild }
export enum Seal { Blue, Gold, Purple, Red }
export enum Sticker { Eternal, Perishable, Rental }

export const editionInfo: {[E in keyof typeof Edition]: string} = {
    Foil: '{blue}+50/ Chips',
    Holographic: '{red}+10/ Mult',
    Negative: '{purple}+1/ Joker slot',
    Polychrome: '{red-invert}X1.5/ Mult'
}

export const enhancementInfo: {[E in keyof typeof Enhancement]: string} = {
    Base: "",
    Bonus: "{blue}+30/ extra chips",
    Glass: "{red-invert}X2/ Mult\n{green}1 in 4/ chance\nto destroy card",
    Gold: "{yellow}+$3/ if this\ncard is held in hand\nat end of round",
    Lucky: "{green}1 in 5/ chance\nfor /{red}+20/ Mult\n{green}1 in 15/ chance\nto win /{yellow}$20",
    Mult: "{red}+4/ Mult",
    Steel: "{red-invert}X1.5/ Mult\nwhile this card\nstays in hand",
    Stone: "{blue}+50/ Chips\nno rank or suit",
    Wild: "Can be used\nas any suit"
}

export const sealInfo: {[S in keyof typeof Seal]: string} = {
    Blue: "Creates the/{aqua}Planet/card\nfor final played/{orange}poker hand\nof round if/{orange}held/in hand\n{grey}(Must have room)",
    Gold: "Earn/{yellow}$3/when this\ncard is played\nand scores",
    Purple: "Creates a/{purple}Tarot/card\nwhen/{orange}discarded\n{grey}(Must have room)",
    Red: "Retrigger this\ncard/{orange}1/time"
}

export const rankChips: {[R in keyof typeof Rank]: number} = {
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

export type HandLevel = {
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
        img: 'small_blind',
        name: 'Small Blind',
        descrip: '',
        ante: 1,
        mult: 1,
        reward: 3
    }, {
        img: 'big_blind',
        name: 'Big Blind',
        descrip: '',
        ante: 1,
        mult: 1.5,
        reward: 4
    }, {
        img: 'hook',
        name: 'The Hook',
        descrip: 'Discards 2 random cards per hand played',
        ante: 1,
        mult: 2,
        reward: 5
    }, {
        img: 'ox',
        name: 'The Ox',
        descrip: 'Playing a _ sets money to $0',
        ante: 6,
        mult: 2,
        reward: 5
    }, {
        img: 'house',
        name: 'The House',
        descrip: 'First hand is drawn face down',
        ante: 2,
        mult: 2,
        reward: 5
    }, {
        img: 'wall',
        name: 'The Wall',
        descrip: 'Extra large blind',
        ante: 2,
        mult: 4,
        reward: 5
    }, {
        img: 'wheel',
        name: 'The Wheel',
        descrip: '1 in 7 cards drawn face down',
        ante: 2,
        mult: 2,
        reward: 5
    }, {
        img: 'arm',
        name: 'The Arm',
        descrip: 'Decrease level of played poker hand', // Does not lower if at lvl.1
        ante: 2,
        mult: 2,
        reward: 5
    }, {
        img: 'club',
        name: 'The Club',
        descrip: 'All Club cards are debuffed',
        ante: 1,
        mult: 2,
        reward: 5,
    }, {
        img: 'fish',
        name: 'The Fish',
        descrip: 'Cards drawn face down after each hand played',
        ante: 2,
        mult: 2,
        reward: 5
    }, {
        img: 'psychic',
        name: 'The Psychic',
        descrip: 'Must play 5 cards', // TODO: warning
        ante: 1,
        mult: 2,
        reward: 5
    }, {
        img: 'goad',
        name: 'The Goad',
        descrip: 'All Spade cards are debuffed',
        ante: 1,
        mult: 2,
        reward: 5
    }, {
        img: 'water',
        name: 'The Water',
        descrip: 'Start with 0 discards',
        ante: 2,
        mult: 2,
        reward: 5
    }, {
        img: 'window',
        name: 'The Window',
        descrip:  'All Diamond cards are debuffed',
        ante: 1,
        mult: 2,
        reward: 5
    }, {
        img: 'manacle',
        name: 'The Manacle',
        descrip: '-1 Hand Size',
        ante: 1,
        mult: 2,
        reward: 5
    }, {
        img: 'eye',
        name: 'The Eye',
        descrip: 'No repeat hand types this round',
        ante: 3,
        mult: 2,
        reward: 5
    }, {
        img: 'mouth',
        name: 'The Mouth',
        descrip: 'Play only 1 hand type this round',
        ante: 2,
        mult: 2,
        reward: 5
    }, {
        img: 'plant',
        name: 'The Plant',
        descrip: 'All face cards are debuffed',
        ante: 4,
        mult: 2,
        reward: 5
    }, {
        img: 'serpent',
        name: 'The Serpent',
        descrip: 'After Play or Discard, always draw 3 cards',
        ante: 5,
        mult: 2,
        reward: 5
    }, {
        img: 'pillar',
        name: 'The Pillar',
        descrip: 'Cards played previously this Ante are debuffed',
        ante: 1,
        mult: 2,
        reward: 5
    }, {
        img: 'needle',
        name: 'The Needle',
        descrip: 'Play only 1 hand',
        ante: 2,
        mult: 1,
        reward: 5
    }, {
        img: 'head',
        name: 'The Head',
        descrip: 'All Heart cards are debuffed',
        ante: 1,
        mult: 2,
        reward: 5
    }, {
        img: 'tooth',
        name: 'The Tooth',
        descrip: 'Lose $1 per card played', // TODO: add to post-scoring menu
        ante: 3,
        mult: 2,
        reward: 5
    }, {
        img: 'flint',
        name: 'The Flint',
        descrip: 'Base Chips and Mult are halved',
        ante: 2,
        mult: 2,
        reward: 5
    }, {
        img: 'mark',
        name: 'The Mark',
        descrip: 'All face cards are drawn face down',
        ante: 2,
        mult: 2,
        reward: 5
    }, {
        img: 'amber_acorn',
        name: 'Amber Acorn',
        descrip: 'Flips and shuffles all Joker cards',
        ante: 8,
        mult: 2,
        reward: 8
    }, {
        img: 'verdant_leaf',
        name: 'Verdant Leaf',
        descrip: 'All cards debuffed until 1 Joker sold',
        ante: 8,
        mult: 2,
        reward: 8
    }, {
        img: 'violet_vessel',
        name: 'Violet Vessel',
        descrip: 'Very large blind',
        ante: 8,
        mult: 6,
        reward: 8
    }, {
        img: 'crimson_heart',
        name: 'Crimson Heart',
        descrip: 'One random Joker disabled every hand',
        ante: 8,
        mult: 2,
        reward: 8
    }, {
        img: 'cerulean_bell',
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

export type ConsumableInstance = {
    id: number
    consumable: ConsumableType
    selected?: boolean
    shopMode?: boolean
}

export type modifierInfo = keyof typeof editionInfo | keyof typeof enhancementInfo | keyof typeof sealInfo

export type ConsumableType = {
    name: string
    description?: string
    tags?: (modifierInfo | ConsumableType)[]
    hand?: keyof typeof HandType
    type: 'Planet' | 'Spectral'| 'Tarot'
    handRequired?: boolean
}

export const Consumables: ConsumableType[] = [
    {
        name: 'Pluto',
        hand: 'HIGH_CARD',
        type: 'Planet'
    }, {
        name: 'Mercury',
        hand: 'PAIR',
        type: 'Planet'
    }, {
        name: 'Uranus',
        hand: 'TWO_PAIR',
        type: 'Planet'
    }, {
        name: 'Venus',
        hand: 'THREE',
        type: 'Planet'
    }, {
        name: 'Saturn',
        hand: 'STRAIGHT',
        type: 'Planet'
    }, {
        name: 'Jupiter',
        hand: 'FLUSH',
        type: 'Planet',
    }, {
        name: 'Earth',
        hand: 'FULL_HOUSE',
        type: 'Planet',
    }, {
        name: 'Mars',
        hand: 'FOUR',
        type: 'Planet'
    }, {
        name: 'Neptune',
        hand: 'STRAIGHT_FLUSH',
        type: 'Planet'
    }, {
        name: 'Planet X',
        hand: 'FIVE',
        type: 'Planet'
    }, {
        name: 'Ceres',
        hand: 'FLUSH_HOUSE',
        type: 'Planet'
    }, {
        name: 'Eris',
        hand: 'FLUSH_FIVE',
        type: 'Planet'
    }, {
        name: 'Familiar',
        description: 'Destroy /{orange}1/ random\ncard in your hand, add /{orange}3\nrandom /{orange}Enhanced\n{orange}face cards/ to your hand',
        type: 'Spectral',
        handRequired: true
    }, {
        name: 'Grim',
        description: 'Destroy /{orange}1/ random\ncard in your hand, add /{orange}2\nrandom /{orange}Enhanced\n{orange}Aces/ to your hand',
        type: 'Spectral',
        handRequired: true
    }, {
        name: 'Incantation',
        description: 'Destroy /{orange}1/ random\ncard in your hand, add /{orange}4\nrandom /{orange}Enhanced numbered\n{orange}cards/ to your hand',
        type: 'Spectral',
        handRequired: true
    }, {
        name: 'Talisman',
        description: 'Add a /{orange}Gold Seal/ to\n{orange}1/ selected card\nin your hand',
        tags: ['Gold'],
        type: 'Spectral',
        handRequired: true
    }, {
        name: 'Aura',
        description: 'Add /{indigo}Foil/{nospace}, /{indigo}Holographic/{nospace}, or\n{indigo}Polychrome/ effect to\n{orange}1/ selected card in hand',
        tags: ['Foil', 'Holographic', 'Polychrome'],
        type: 'Spectral',
        handRequired: true
    }, {
        name: 'Wraith',
        description: 'Creates a random\n{red}Rare/{orange}Joker/{nospace},\nsets money to /{yellow}$0',
        type: 'Spectral'
    }, {
        name: 'Sigil',
        description: 'Converts all cards\nin hand to a single\nrandom suit',
        type: 'Spectral',
        handRequired: true
    }, {
        name: 'Ouija',
        description: 'Converts all cards\nin hand to a single\nrandom Rank.\n{red}-1/ hand size',
        type: 'Spectral',
        handRequired: true
    }, {
        name: 'Ectoplasm',
        description: 'Add /{indigo}Negative/ to\na random Joker.\n{red}-1/ hand size',
        tags: ['Negative'],
        type: 'Spectral'
    }, {
        name: 'Immolate',
        description: 'Destroys /{orange}5/ random\ncards in hand,\ngain /{yellow}$20/',
        type: 'Spectral',
        handRequired: true
    }, {
        name: 'Ankh',
        description: 'Create a copy of\na random /{orange}Joker/{nospace},\ndestroy all other /{orange}Jokers\n/{small grey}(Removes /{small purple}Negative/{small grey} from copy)',
        type: 'Spectral'
    }, {
        name: 'Deja Vu',
        description: 'Add a /{red}Red Seal\nto /{orange}1/selected\ncard in your hand',
        tags: ['Red'],
        type: 'Spectral',
        handRequired: true
    }, {
        name: 'Hex',
        description: 'Add/{indigo}Polychrome/to\na random /{orange}Joker/{nospace},\ndestroy all other /{orange}Jokers',
        tags: ['Polychrome'],
        type: 'Spectral'
    }, {
        name: 'Trance',
        description: 'Add a /{blue}Blue Seal\nto /{orange}1/ selected\ncard in your hand',
        tags: ['Blue'],
        type: 'Spectral',
        handRequired: true
    }, {
        name: 'Medium',
        description: 'Add a /{purple}Purple Seal\nto /{orange}1/ selected\ncard in your hand',
        tags: ['Purple'],
        type: 'Spectral',
        handRequired: true
    }, {
        name: 'Cryptid',
        description: 'Creates /{orange}2/ copies\nof /{orange}1/ selected\ncard in your hand',
        type: 'Spectral',
        handRequired: true
    }, {
        name: 'The Soul',
        description: 'Creates a\n{indigo}Legendary/ Joker\n{small grey}(Must have room)',
        type: 'Spectral'
    }, {
        name: 'Black Hole',
        description: 'Upgrade every poker\nhand by /{orange}1/ level',
        type: 'Spectral'
    }, {
        name: 'The Fool',
        description: 'Create the last\n{purple}Tarot/ or /{aqua}Planet/ card\nused during this run\n{small purple}The Fool /{small} excluded',
        type: 'Tarot'
    }, {
        name: 'The Magician',
        description: 'Enhances /{orange}1/ selected\ncard into a\n{orange}Lucky Card',
        tags: ['Lucky'],
        type: 'Tarot',
        handRequired: true
    }, {
        name: 'The High Priestess',
        description: 'Creates up to /{orange}2\nrandom /{aqua}Planet/ cards\n{grey}(Must have room)',
        type: 'Tarot'
    }, {
        name: 'The Empress',
        description: 'Enhances /{orange}2\nselected cards to\n{orange}Mult Cards',
        tags: ['Mult'],
        type: 'Tarot',
        handRequired: true
    }, {
        name: 'The Emperor',
        description: 'Creates up to /{orange}2\nrandom /{purple}Tarot/ cards\n{grey}(Must have room)',
        type: 'Tarot'
    }, {
        name: 'The Hierophant',
        description: 'Enhances /{orange}2\nselected cards to\n{orange}Bonus Cards',
        tags: ['Bonus'],
        type: 'Tarot',
        handRequired: true
    }, {
        name: 'The Lovers',
        description: 'Enhances /{orange}1/ selected\ncard into a\n{orange}Wild Card',
        tags: ['Wild'],
        type: 'Tarot',
        handRequired: true
    }, {
        name: 'The Chariot',
        description: 'Enhances /{orange}1/ selected\ncard into a\n{orange}Steel Card',
        tags: ['Steel'],
        type: 'Tarot',
        handRequired: true
    }, {
        name: 'Justice',
        description: 'Enhances /{orange}1/ selected\ncard into a\n{orange}Glass Card',
        tags: ['Glass'],
        type: 'Tarot',
        handRequired: true
    }, {
        name: 'The Hermit',
        description: 'Doubles money\n{grey}(Max of /{yellow}$20/{grey nospace})',
        type: 'Tarot'
    }, {
        name: 'The Wheel of Fortune',
        description: '{green}1 in 4/ chance to add\n{indigo}Foil/{nospace},/{indigo}Holographic/{nospace}, or\n{indigo}Polychrome/ edition\nto a random /{orange}Joker',
        tags: ['Foil', 'Holographic', 'Polychrome'],
        type: 'Tarot'
    }, {
        name: 'Strength',
        description: 'Increases rank of\nup to /{orange}2/ selected\ncards by /{orange}1',
        type: 'Tarot',
        handRequired: true
    }, {
        name: 'The Hanged Man',
        description: 'Destroys up to\n{orange}2/ selected cards',
        type: 'Tarot',
        handRequired: true
    }, {
        name: 'Death',
        description: 'Select /{orange}2/ cards,\nconvert the /{orange}left/ card\ninto the /{orange}right/ card\n{grey}(Drag to rearrange)',
        type: 'Tarot',
        handRequired: true
    }, {
        name: 'Temperance',
        description: 'Gives the total sell\nvalue of all current\nJokers /{grey}(Max of /{yellow}$50/{grey nospace})\n{grey}(Currently /{yellow current-joker}${totalJokerSellPrice}/{grey nospace})',
        type: 'Tarot'
    }, {
        name: 'The Devil',
        description: 'Enhances /{orange}1/ selected\ncard into a\n{orange}Gold Card',
        tags: ['Gold'],
        type: 'Tarot',
        handRequired: true
    }, {
        name: 'The Tower',
        description: 'Enhances /{orange}1/ selected\ncard into a\n{orange}Stone Card',
        tags: ['Stone'],
        type: 'Tarot',
        handRequired: true
    }, {
        name: 'The Star',
        description: 'Converts up to\n{orange}3/ selected cards\n to /{orange}Diamonds',
        type: 'Tarot',
        handRequired: true
    }, {
        name: 'The Moon',
        description: 'Converts up to\n{orange}3/ selected cards\n to /{blue}Clubs',
        type: 'Tarot',
        handRequired: true
    }, {
        name: 'The Sun',
        description: 'Converts up to\n{orange}3/ selected cards\n to /{red}Hearts',
        type: 'Tarot',
        handRequired: true
    }, {
        name: 'Judgement',
        description: 'Creates a random\n{orange}Joker/ card\n{grey}(Must have room)',
        type: 'Tarot'
    }, {
        name: 'The World',
        description: 'Converts up to\n{orange}3/ selected cards\n to /{dark-purple}Spades',
        type: 'Tarot',
        handRequired: true
    }
]