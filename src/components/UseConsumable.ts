import { Suit, Rank, Enhancement, DeckType, Seal, Edition, handLevels, Consumables, ConsumableType } from "../Constants"
import { GameAction, GameState, levelHand, Random } from "../GameState"
import { calcPrice, debuffCards } from "../Utilities"
import { Jokers } from "./JokerInfo"

const suits = Object.keys(Suit).filter(k => isNaN(Number(k))).map(s => s as keyof typeof Suit)
const ranks = Object.keys(Rank).filter(r => isNaN(Number(r))).map(r => r as keyof typeof Rank)
const enhancements = Object.keys(Enhancement).filter(e => isNaN(Number(e))).map(e => e as keyof typeof Enhancement)

export const useConsumable = (game: GameState, dispatch: React.Dispatch<GameAction>, consumable: ConsumableType) => {
    if(game.cards.submitted.length === 0) {
        if(consumable.type === 'Planet') {
            levelHand({hand: consumable.hand!})
        } else if(consumable.type === 'Spectral') {
            switch(consumable.name) {
                case 'Familiar':
                    if(game.state !== 'scoring') { return false }
                    dispatch({type: 'removeCard', payload: {cardLocation: 'hand', card: game.cards.hand[Math.floor(Random.next() * game.cards.hand.length)]}})

                    for(let i = 0; i < 3; i++) {
                        dispatch({type: 'addCard', payload: {cardLocation: 'hand', card: {
                            suit: Suit[suits[Math.floor(Random.next()*suits.length)]],
                            rank: Rank[ranks[Math.floor(Random.next()*3)+9]],
                            enhancement: Enhancement[enhancements[Math.floor(Random.next()*(enhancements.length-1))+1]],
                            deck: DeckType.Red
                        }}})
                    }
                    break
                case 'Grim':
                    if(game.state !== 'scoring') { return false }
                    dispatch({type: 'removeCard', payload: {cardLocation: 'hand', card: game.cards.hand[Math.floor(Random.next() * game.cards.hand.length)]}})

                    for(let i = 0; i < 2; i++) {
                        dispatch({type: 'addCard', payload: {cardLocation: 'hand', card: {
                            suit: Suit[suits[Math.floor(Random.next()*suits.length)]],
                            rank: Rank.Ace,
                            enhancement: Enhancement[enhancements[Math.floor(Random.next()*(enhancements.length-1))+1]],
                            deck: DeckType.Red
                        }}})
                    }
                    break
                case 'Incantation':
                    if(game.state !== 'scoring') { return false }
                    dispatch({type: 'removeCard', payload: {cardLocation: 'hand', card: game.cards.hand[Math.floor(Random.next() * game.cards.hand.length)]}})

                    for(let i = 0; i < 4; i++) {
                        dispatch({type: 'addCard', payload: {cardLocation: 'hand', card: {
                            suit: Suit[suits[Math.floor(Random.next()*suits.length)]],
                            rank: Rank[ranks[Math.floor(Random.next()*9)]],
                            enhancement: Enhancement[enhancements[Math.floor(Random.next()*(enhancements.length-1))+1]],
                            deck: DeckType.Red
                        }}})
                    }
                    break
                case 'Talisman':
                    if(game.state !== 'scoring' || game.cards.selected.length !== 1) { return false }
                    game.cards.selected[0].seal = Seal.Gold
                    break
                case 'Aura':
                    if(game.state !== 'scoring' || game.cards.selected.length !== 1) { return false }
                    switch(Math.floor(Random.next() * 3)) {
                        case 0:
                            game.cards.selected[0].edition = Edition.Foil
                            break
                        case 1:
                            game.cards.selected[0].edition = Edition.Holographic
                            break
                        case 2:
                            game.cards.selected[0].edition = Edition.Polychrome
                            break
                    }
                    break
                case 'Wraith':
                    const rareJokers = Jokers.filter(j => j.rarity === 'Rare' && !game.jokers.some(joker => joker.joker === j))
                    if(rareJokers.length === 0 || game.jokers.length === game.stats.jokerSize) { return false }
                    dispatch({type: 'addJoker', payload: {card: rareJokers[Math.floor(Random.next() * rareJokers.length)]}})
                    dispatch({type: 'stat', payload: {stat: 'money', amount: -game.stats.money}})
                    break
                case 'Sigil':
                    if(game.state !== 'scoring') { return false }
                    const suit = suits[Math.floor(Random.next()*suits.length)]
                    game.cards.hand.forEach(c => c.suit = Suit[suit])
                    break
                case 'Ouija':
                    if(game.state !== 'scoring') { return false }
                    let rank = ranks[Math.floor(Random.next()*ranks.length)]
                    game.cards.hand.forEach(c => c.rank = Rank[rank])
                    dispatch({type: 'stat', payload: {stat: 'handSize'}})
                    break
                case 'Ectoplasm':
                    let ectoplasmJokers = game.jokers.filter(j => j.edition === undefined)
                    if(ectoplasmJokers.length === 0) { return false }
                    ectoplasmJokers[Math.floor(Random.next() * ectoplasmJokers.length)].edition = Edition.Negative
                    dispatch({type: 'stat', payload: {stat: 'handSize'}})
                    dispatch({type: 'stat', payload: {stat: 'jokerSize', amount: 1}})
                    break
                case 'Immolate':
                    if(game.state !== 'scoring') { return false }
                    let update = game.cards.hand;
                    for(let i = 0; i < 5; i++) {
                        update.splice(Math.floor(Random.next()*update.length), 1)
                    }
                    dispatch({type: 'updateCards', payload: {cardLocation: 'hand', update: update}})
                    dispatch({type: 'stat', payload: {stat: 'money', amount: 20}})
                    break
                case 'Ankh':
                    if(game.jokers.length === 0) { return false }
                    let toCopy = game.jokers[Math.floor(Random.next() * game.jokers.length)]
                    game.jokers.forEach(j => {
                        if(j.id !== toCopy.id) {
                            dispatch({type: 'removeJoker', payload: {card: j}})
                        }
                    })
                    dispatch({type: 'addJoker', payload: {card: {...toCopy, edition: (toCopy.edition === Edition?.Negative ? undefined : toCopy.edition)}}})
                    break
                case 'Deja Vu':
                    if(game.state !== 'scoring' || game.cards.selected.length !== 1) { return false }
                    game.cards.selected[0].seal = Seal.Red
                    break
                case 'Hex':
                    let hexJokers = game.jokers.filter(j => j.edition === undefined)
                    if(hexJokers.length === 0) { return false }
                    let toPoly = hexJokers[Math.floor(Random.next() * hexJokers.length)]
                    game.jokers.forEach(j => {
                        if(j.id !== toPoly.id) {
                            dispatch({type: 'removeJoker', payload: {card: j}})
                        }
                    })
                    toPoly.edition = Edition.Polychrome
                    break
                case 'Trance':
                    if(game.state !== 'scoring' || game.cards.selected.length !== 1) { return false }
                    game.cards.selected[0].seal = Seal.Blue
                    break
                case 'Medium':
                    if(game.state !== 'scoring' || game.cards.selected.length !== 1) { return false }
                    game.cards.selected[0].seal = Seal.Purple
                    break
                case 'Cryptid':
                    if(game.state !== 'scoring' || game.cards.selected.length !== 1) { return false }
                    const { id: _, selected: __, ...card } = game.cards.selected[0]
                    for(let i = 0; i < 2; i++) {
                        dispatch({type: 'addCard', payload: {cardLocation: 'hand', card: {
                            selected: false,
                            ...card
                        }}})
                    }
                    break
                case 'The Soul':
                    const legendaryJokers = Jokers.filter(j => j.rarity === 'Legendary' && !game.jokers.some(joker => joker.joker === j))
                    if(legendaryJokers.length === 0 || game.jokers.length === game.stats.jokerSize) { return false }
                    dispatch({type: 'addJoker', payload: {card: legendaryJokers[Math.floor(Random.next() * legendaryJokers.length)]}})
                    break
                case 'Black Hole':
                    Object.keys(handLevels).filter(k => isNaN(Number(k))).map(h => h as keyof typeof handLevels).forEach(h => {
                        levelHand({hand: h})
                    })
                    break
                    
            }
        } else if(consumable.type === 'Tarot') {
            switch(consumable.name) {
                case 'The Fool':
                    if(game.cards.lastCon === undefined || game.cards.lastCon === 'The Fool') { return false }
                    dispatch({type: 'addCard', payload: {card: Consumables.find(c => c.name === game.cards.lastCon)}})
                    break
                case 'The Magician':
                    if(game.state !== 'scoring' || game.cards.selected.length !== 1) { return false }
                    game.cards.selected[0].enhancement = Enhancement.Lucky
                    break
                case 'The High Priestess':
                    let validPlanets = Consumables.slice(0, 12)
                    validPlanets = validPlanets.filter(c => game.cards.consumables.every(con => con.consumable.name !== c.name) && (!c.name.match('Planet X|Ceres|Eris') || handLevels[c.hand!].played > 0))
                    if(validPlanets.length === 0) { validPlanets.push(Consumables[0]) }

                    let planet: Omit<ConsumableType, 'id'>
                    for(let i = 0; i < Math.min(2, game.stats.consumableSize - game.cards.consumables.length + 1); i++) {
                        planet = validPlanets[Math.floor(Random.next() * validPlanets.length)]
                        dispatch({type: 'addCard', payload: {card: planet}})
                        validPlanets = validPlanets.filter(c => c.name !== planet.name)
                        if(validPlanets.length === 0) { validPlanets.push(Consumables[0]) }
                    }
                    break
                case 'The Empress':
                    if(game.state !== 'scoring' || game.cards.selected.length < 1 || game.cards.selected.length > 2) { return false }
                    game.cards.selected.forEach(c => c.enhancement = Enhancement.Mult)
                    break
                case 'The Emperor':
                    let validTarots = Consumables.slice(30, 52)
                    validTarots = validTarots.filter(c => game.cards.consumables.every(con => con.consumable.name !== c.name))
                    if(validTarots.length === 0) { validTarots.push(Consumables[40])}

                    let tarot: Omit<ConsumableType, 'id'>
                    for(let i = 0; i < Math.min(2, game.stats.consumableSize - game.cards.consumables.length + 1); i++) {
                        tarot = validTarots[Math.floor(Random.next() * validTarots.length)]
                        dispatch({type: 'addCard', payload: {card: tarot}})
                        validTarots = validTarots.filter(c => c.name !== tarot.name)
                        if(validTarots.length === 0) { validTarots.push(Consumables[40]) }
                    }
                    break
                case 'The Heirophant':
                    if(game.state !== 'scoring' || game.cards.selected.length < 1 || game.cards.selected.length > 2) { return false }
                    game.cards.selected.forEach(c => c.enhancement = Enhancement.Bonus)
                    break
                case 'The Lovers':
                    if(game.state !== 'scoring' || game.cards.selected.length !== 1) { return false }
                    game.cards.selected[0].enhancement = Enhancement.Wild
                    break
                case 'The Chariot':
                    if(game.state !== 'scoring' || game.cards.selected.length !== 1) { return false }
                    game.cards.selected[0].enhancement = Enhancement.Steel
                    break
                case 'Justice':
                    if(game.state !== 'scoring' || game.cards.selected.length !== 1) { return false }
                    game.cards.selected[0].enhancement = Enhancement.Glass
                    break
                case 'The Hermit':
                    dispatch({type: 'stat', payload: {stat: 'money', amount: Math.min(20, game.stats.money)}})
                    break
                case 'The Wheel of Fortune':
                    const WoFJokers = game.jokers.filter(j => j.edition === undefined)
                    if(WoFJokers.length === 0) { return false }
                    if(Random.next() < .25) {
                        const joker = WoFJokers[Math.floor(Random.next() * WoFJokers.length)]
                        switch(Math.floor(Random.next() * 3)) {
                            case 0: joker.edition = Edition.Foil; break
                            case 1: joker.edition = Edition.Holographic; break
                            case 2: joker.edition = Edition.Polychrome; break
                        }
                    }
                    break
                case 'Strength':
                    if(game.state !== 'scoring' || game.cards.selected.length < 1 || game.cards.selected.length > 2) { return }
                    game.cards.selected.forEach(c => c.rank = Rank[ranks[(c.rank + 1) % ranks.length]])
                    break
                case 'The Hanged Man':
                    if(game.state !== 'scoring' || game.cards.selected.length < 1 || game.cards.selected.length > 2) { return false }
                    game.cards.selected.forEach(c => dispatch({type: 'removeCard', payload: {cardLocation: 'hand', card: c}}))
                    break
                case 'Death':
                    if(game.state !== 'scoring' || game.cards.selected.length !== 2) { return false }
                    const l = game.cards.selected[0], r = game.cards.selected[1]
                    dispatch({type: 'select', payload: {card: l}})
                    l.suit = r.suit
                    l.rank = r.rank
                    l.edition = r.edition
                    l.enhancement = r.enhancement
                    l.seal = r.seal
                    dispatch({type: 'select', payload: {card: l}})
                    break
                case 'Temperance':
                    if(game.jokers.length === 0) { return false }
                    dispatch({type: 'stat', payload: {stat: 'money', amount: Math.min(50, game.jokers.reduce((total, j) => total += calcPrice(j).sell, 0))}})
                    break
                case 'The Devil':
                    if(game.state !== 'scoring' || game.cards.selected.length !== 1) { return false }
                    game.cards.selected[0].enhancement = Enhancement.Gold
                    break
                case 'The Tower':
                    if(game.state !== 'scoring' || game.cards.selected.length !== 1) { return false }
                    game.cards.selected[0].enhancement = Enhancement.Stone
                    break
                case 'The Star':
                    if(game.state !== 'scoring' || game.cards.selected.length < 1 || game.cards.selected.length > 3) { return false }
                    game.cards.selected.forEach(c => c.suit = Suit.Diamonds)
                    break
                case 'The Moon':
                    if(game.state !== 'scoring' || game.cards.selected.length < 1 || game.cards.selected.length > 3) { return false }
                    game.cards.selected.forEach(c => c.suit = Suit.Clubs)
                    break
                case 'The Sun':
                    if(game.state !== 'scoring' || game.cards.selected.length < 1 || game.cards.selected.length > 3) { return false }
                    game.cards.selected.forEach(c => c.suit = Suit.Hearts)
                    break
                case 'Judgement':
                    if(game.jokers.length === game.stats.jokerSize) { return false }
                    const rare_roll = Random.next()
                    const rarity = rare_roll < .7 ? 'Common' : rare_roll < .95 ? 'Uncommon' : 'Rare'
                    const validJokers = Jokers.filter(j => j.rarity === rarity && !game.jokers.find(joker => joker.joker.name === j.name))
                    if(validJokers.length === 0) { validJokers.push(Jokers[0])}
                    dispatch({type: 'addJoker', payload: {card: validJokers[Math.floor(Random.next() * validJokers.length)]}})
                    break
                case 'The World':
                    if(game.state !== 'scoring' || game.cards.selected.length < 1 || game.cards.selected.length > 3) { return false }
                    game.cards.selected.forEach(c => c.suit = Suit.Spades)
                    break
            }
        }
        if(game.blind.curr === 'boss') {
            debuffCards(game.blind.boss, game.cards.hand, game.cards.played)
        }
        dispatch({type: 'setLastUsedConsumable', payload: {card: consumable}})
        dispatch({type: 'discard'})
    }
}