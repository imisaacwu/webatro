import { MouseEventHandler, useContext, useRef } from "react";
import { ConsumableInstance, Consumables, ConsumableType, DeckType, Edition, Enhancement, handLevels, HandType, handUpgrade, Rank, Seal, Suit } from "../Constants";
import './Consumable.css';
import { GameStateContext, levelHand } from "../GameState";
import { debuffCards } from "../App";
const images: Record<string, { default: string }> = import.meta.glob('../assets/consumables/*/*.png', { eager: true })

const getImage = (type: 'Tarot' | 'Planet' | 'Spectral', name: string) => {
    const imagePath = `../assets/consumables/${type.toLowerCase()}s/${name.toLowerCase()}.png`

    const module = images[imagePath]
    if(!module) { throw new Error(`no such image ${imagePath}`) }
    return module.default
}

export const Consumable = ({ selected = false, consumable: cons, ...props }: ConsumableInstance) => {
    const { state: game, dispatch } = useContext(GameStateContext)
    const gameRef = useRef(game)
    gameRef.current = game
    const image = getImage(cons.type, cons.type === 'Tarot' ? cons.name.replace(/The /,'') : cons.name)
    const price = cons.type === 'Spectral' ? 4 : 3
    const sellPrice = Math.floor(price / 2)
    const description = cons.description?.split('\n').map((line, i) =>
        <div key={i}>
            {line.split('/').map((str, i) =>
                <div key={i} className={str.match(/{.+}/)?.[0].slice(1, -1)} style={{display: 'inline'}}>
                    {str.replace(/{.+}/g, '')}
                </div>
            )}
        </div>
    )
    if(cons.name === 'The Fool' && game.cards.lastCon !== undefined) {
        description?.push(<div>{game.cards.lastCon}</div>)
    }

    const suits = Object.keys(Suit).filter(k => isNaN(Number(k))).map(s => s as keyof typeof Suit)
    const ranks = Object.keys(Rank).filter(r => isNaN(Number(r))).map(r => r as keyof typeof Rank)
    const enhancements = Object.keys(Enhancement).filter(e => isNaN(Number(e))).map(e => e as keyof typeof Enhancement)

    const sell: MouseEventHandler = () => {
        dispatch({type: 'stat', payload: {stat: 'money', amount: sellPrice}})
        dispatch({type: 'discard'})
    }

    const use: MouseEventHandler = () => {
        if(game.cards.submitted.length === 0) {
            if(cons.type === 'Planet') {
                levelHand({hand: cons.hand!})
            } else if(cons.type === 'Spectral') {
                switch(cons.name) {
                    case 'Familiar':
                        if(game.state !== 'scoring') { return }
                        dispatch({type: 'removeCard', payload: {cardLocation: 'hand', card: game.cards.hand[Math.floor(Math.random() * game.cards.hand.length)]}})

                        for(let i = 0; i < 3; i++) {
                            dispatch({type: 'addCard', payload: {cardLocation: 'hand', card: {
                                suit: Suit[suits[Math.floor(Math.random()*suits.length)]],
                                rank: Rank[ranks[Math.floor(Math.random()*3)+9]],
                                enhancement: Enhancement[enhancements[Math.floor(Math.random()*(enhancements.length-1))+1]],
                                deck: DeckType.Red
                            }}})
                        }
                        break
                    case 'Grim':
                        if(game.state !== 'scoring') { return }
                        dispatch({type: 'removeCard', payload: {cardLocation: 'hand', card: game.cards.hand[Math.floor(Math.random() * game.cards.hand.length)]}})

                        for(let i = 0; i < 2; i++) {
                            dispatch({type: 'addCard', payload: {cardLocation: 'hand', card: {
                                suit: Suit[suits[Math.floor(Math.random()*suits.length)]],
                                rank: Rank.Ace,
                                enhancement: Enhancement[enhancements[Math.floor(Math.random()*(enhancements.length-1))+1]],
                                deck: DeckType.Red
                            }}})
                        }
                        break
                    case 'Incantation':
                        if(game.state !== 'scoring') { return }
                        dispatch({type: 'removeCard', payload: {cardLocation: 'hand', card: game.cards.hand[Math.floor(Math.random() * game.cards.hand.length)]}})

                        for(let i = 0; i < 4; i++) {
                            dispatch({type: 'addCard', payload: {cardLocation: 'hand', card: {
                                suit: Suit[suits[Math.floor(Math.random()*suits.length)]],
                                rank: Rank[ranks[Math.floor(Math.random()*9)]],
                                enhancement: Enhancement[enhancements[Math.floor(Math.random()*(enhancements.length-1))+1]],
                                deck: DeckType.Red
                            }}})
                        }
                        break
                    case 'Talisman':
                        if(game.state !== 'scoring' || game.cards.selected.length !== 1) { return }
                        game.cards.selected[0].seal = Seal.Gold
                        break
                    case 'Aura':
                        if(game.state !== 'scoring' || game.cards.selected.length !== 1) { return }
                        switch(Math.floor(Math.random() * 3)) {
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
                    case 'Wraith': // TODO (after jokers)
                        dispatch({type: 'stat', payload: {stat: 'money', amount: -game.stats.money}})
                        break
                    case 'Sigil':
                        if(game.state !== 'scoring') { return }
                        let suit = suits[Math.floor(Math.random()*suits.length)]
                        game.cards.hand.forEach(c => c.suit = Suit[suit])
                        break
                    case 'Ouija':
                        if(game.state !== 'scoring') { return }
                        let rank = ranks[Math.floor(Math.random()*ranks.length)]
                        game.cards.hand.forEach(c => c.rank = Rank[rank])
                        dispatch({type: 'stat', payload: {stat: 'handSize'}})
                        break
                    case 'Ectoplasm':
                        let nonEditionJokers = game.jokers.filter(j => j.edition === undefined)
                        if(nonEditionJokers.length > 0) {
                            nonEditionJokers[Math.floor(Math.random() * nonEditionJokers.length)].edition = Edition.Negative
                            dispatch({type: 'stat', payload: {stat: 'handSize'}})
                            dispatch({type: 'stat', payload: {stat: 'jokerSize', amount: 1}})
                        }
                        break
                    case 'Immolate':
                        if(game.state !== 'scoring') { return }
                        let update = game.cards.hand;
                        for(let i = 0; i < 5; i++) {
                            update.splice(Math.floor(Math.random()*update.length), 1)
                        }
                        dispatch({type: 'updateCards', payload: {cardLocation: 'hand', update: update}})
                        dispatch({type: 'stat', payload: {stat: 'money', amount: 20}})
                        break
                    case 'Ankh':
                        if(game.jokers.length > 0) {
                            let toCopy = game.jokers[Math.floor(Math.random() * game.jokers.length)]
                            game.jokers.forEach(j => {
                                if(j.id !== toCopy.id) {
                                    dispatch({type: 'removeJoker', payload: {card: j}})
                                }
                            })
                            dispatch({type: 'addJoker', payload: {card: {...toCopy, edition: (toCopy.edition === Edition?.Negative ? undefined : toCopy.edition)}}})
                        }
                        break
                    case 'Deja Vu':
                        if(game.state !== 'scoring' || game.cards.selected.length !== 1) { return }
                        game.cards.selected[0].seal = Seal.Red
                        break
                    case 'Hex':
                        if(game.jokers.length > 0) {
                            let nonEditionJokers = game.jokers.filter(j => j.edition === undefined)
                            if(nonEditionJokers.length > 0) {
                                let toPoly = nonEditionJokers[Math.floor(Math.random() * nonEditionJokers.length)]
                                game.jokers.forEach(j => {
                                    if(j.id !== toPoly.id) {
                                        dispatch({type: 'removeJoker', payload: {card: j}})
                                    }
                                })
                                toPoly.edition = Edition.Polychrome
                            }
                        }
                        break
                    case 'Trance':
                        if(game.state !== 'scoring' || game.cards.selected.length !== 1) { return }
                        game.cards.selected[0].seal = Seal.Blue
                        break
                    case 'Medium':
                        if(game.state !== 'scoring' || game.cards.selected.length !== 1) { return }
                        game.cards.selected[0].seal = Seal.Purple
                        break
                    case 'Cryptid':
                        if(game.state !== 'scoring' || game.cards.selected.length !== 1) { return }
                        const { id: _, selected: __, ...card } = game.cards.selected[0]
                        for(let i = 0; i < 2; i++) {
                            dispatch({type: 'addCard', payload: {cardLocation: 'hand', card: {
                                selected: false,
                                ...card
                            }}})
                        }
                        break
                    case 'The Soul': // TODO (after jokers)
                        break
                    case 'Black Hole':
                        Object.keys(handLevels).filter(k => isNaN(Number(k))).map(h => h as keyof typeof handLevels).forEach(h => {
                            levelHand({hand: h})
                        })
                        break
                        
                }
            } else if(cons.type === 'Tarot') {
                switch(cons.name) {
                    case 'The Fool':
                        if(game.cards.lastCon === undefined || game.cards.lastCon === 'The Fool') { return }
                        dispatch({type: 'addCard', payload: {card: Consumables.find(c => c.name === game.cards.lastCon)}})
                        break
                    case 'The Magician':
                        if(game.state !== 'scoring' || game.cards.selected.length !== 1) { return }
                        game.cards.selected[0].enhancement = Enhancement.Lucky
                        break
                    case 'The High Priestess':
                        let validPlanets = Consumables.slice(0, 11)
                        validPlanets = validPlanets.filter(c => game.cards.consumables.every(con => con.consumable.name !== c.name) && (!c.name.match('Planet X|Ceres|Eris') || handLevels[c.hand!].played > 0))
                        if(validPlanets.length === 0) { validPlanets.push(Consumables[0]) }

                        let planet: Omit<ConsumableType, 'id'>
                        for(let i = 0; i < Math.min(2, game.stats.consumableSize - game.cards.consumables.length + 1); i++) {
                            planet = validPlanets[Math.floor(Math.random() * validPlanets.length)]
                            dispatch({type: 'addCard', payload: {card: planet}})
                            validPlanets = validPlanets.filter(c => c.name !== planet.name)
                            if(validPlanets.length === 0) { validPlanets.push(Consumables[0]) }
                        }
                        break
                    case 'The Empress':
                        if(game.state !== 'scoring' || game.cards.selected.length < 1 || game.cards.selected.length > 2) { return }
                        game.cards.selected.forEach(c => c.enhancement = Enhancement.Mult)
                        break
                    case 'The Emperor':
                        let validTarots = Consumables.slice(29, 51)
                        validTarots = validTarots.filter(c => game.cards.consumables.every(con => con.consumable.name !== c.name))
                        if(validTarots.length === 0) { validTarots.push(Consumables[40])}

                        let tarot: Omit<ConsumableType, 'id'>
                        for(let i = 0; i < Math.min(2, game.stats.consumableSize - game.cards.consumables.length + 1); i++) {
                            tarot = validTarots[Math.floor(Math.random() * validTarots.length)]
                            dispatch({type: 'addCard', payload: {card: tarot}})
                            validTarots = validTarots.filter(c => c.name !== tarot.name)
                            if(validTarots.length === 0) { validTarots.push(Consumables[40]) }
                        }
                        break
                    case 'The Heirophant':
                        if(game.state !== 'scoring' || game.cards.selected.length < 1 || game.cards.selected.length > 2) { return }
                        game.cards.selected.forEach(c => c.enhancement = Enhancement.Bonus)
                        break
                    case 'The Lovers':
                        if(game.state !== 'scoring' || game.cards.selected.length !== 1) { return }
                        game.cards.selected[0].enhancement = Enhancement.Wild
                        break
                    case 'The Chariot':
                        if(game.state !== 'scoring' || game.cards.selected.length !== 1) { return }
                        game.cards.selected[0].enhancement = Enhancement.Steel
                        break
                    case 'Justice':
                        if(game.state !== 'scoring' || game.cards.selected.length !== 1) { return }
                        game.cards.selected[0].enhancement = Enhancement.Glass
                        break
                    case 'The Hermit':
                        dispatch({type: 'stat', payload: {stat: 'money', amount: Math.min(20, game.stats.money)}})
                        break
                    case 'The Wheel of Fortune': // TODO (after jokers)
                        break
                    case 'Strength':
                        if(game.state !== 'scoring' || game.cards.selected.length < 1 || game.cards.selected.length > 2) { return }
                        game.cards.selected.forEach(c => c.rank = Rank[ranks[(c.rank + 1) % ranks.length]])
                        break
                    case 'The Hanged Man':
                        if(game.state !== 'scoring' || game.cards.selected.length < 1 || game.cards.selected.length > 2) { return }
                        game.cards.selected.forEach(c => dispatch({type: 'removeCard', payload: {cardLocation: 'hand', card: c}}))
                        break
                    case 'Death':
                        if(game.state !== 'scoring' || game.cards.selected.length !== 2) { return }
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
                        break
                    case 'The Devil':
                        if(game.state !== 'scoring' || game.cards.selected.length !== 1) { return }
                        game.cards.selected[0].enhancement = Enhancement.Gold
                        break
                    case 'The Tower':
                        if(game.state !== 'scoring' || game.cards.selected.length !== 1) { return }
                        game.cards.selected[0].enhancement = Enhancement.Stone
                        break
                    case 'The Star':
                        if(game.state !== 'scoring' || game.cards.selected.length < 1 || game.cards.selected.length > 3) { return }
                        game.cards.selected.forEach(c => c.suit = Suit.Diamonds)
                        break
                    case 'The Moon':
                        if(game.state !== 'scoring' || game.cards.selected.length < 1 || game.cards.selected.length > 3) { return }
                        game.cards.selected.forEach(c => c.suit = Suit.Clubs)
                        break
                    case 'The Sun':
                        if(game.state !== 'scoring' || game.cards.selected.length < 1 || game.cards.selected.length > 3) { return }
                        game.cards.selected.forEach(c => c.suit = Suit.Hearts)
                        break
                    case 'Judgement':
                        break
                    case 'The World':
                        if(game.state !== 'scoring' || game.cards.selected.length < 1 || game.cards.selected.length > 3) { return }
                        game.cards.selected.forEach(c => c.suit = Suit.Spades)
                        break
                }
            }
            if(game.blind.curr === 'boss') {
                debuffCards(game.blind.boss, game.cards.hand, game.cards.played)
            }
            dispatch({type: 'setLastUsedConsumable', payload: {card: game.cards.consumables.find(c => c.id === props.id)}})
            dispatch({type: 'discard'})
        }
    }
    
    return (
        <div
            id={`consumable_${props.id}`}
            className={cons.name +
                `${selected ? ' selected' : ''}` +
                `${props.shopMode ? ' shopping' : ''}`
            }
        >
            <img src={image} onClick={() => {
                if(props.shopMode) {
                    dispatch({type: 'shop-select', payload: {card: game.shop.offers.find(c => c.id === props.id)}})
                } else {
                    dispatch({type: 'select', payload: {card: game.cards.consumables.find(c => c.id === props.id)}})
                }
            }} draggable={false} />
            {props.shopMode &&
                <div id='consumable-price-tab'>
                    <div id='consumable-price' className='yellow'>
                        ${price}
                    </div>
                </div>
            }
            {!props.shopMode && selected &&
                <div id='consumable-tabs'>
                    <div id='sell-consumable' className='consumable-tab' onClick={sell}>
                        SELL<div id='consumable-sell-price'>{`$${sellPrice}`}</div>
                    </div>
                    <div id='use-consumable' className='consumable-tab' onClick={use}>USE</div>
                </div>
            }
            {props.shopMode && selected &&
                <div id='consumable-buy-button' onClick={() =>{
                    if(game.stats.money >= price && game.cards.consumables.length < game.stats.consumableSize) {
                        dispatch({type: 'stat', payload: {stat: 'money', amount: -price}})
                        dispatch({type: 'shop-remove', payload: {card: {selected, consumable: cons, ...props}}})
                        dispatch({type: 'addCard', payload: {cardLocation: 'consumables', card: cons}})
                    }
                }}>BUY</div>
            }
            <div id='consumable-popup'>
                <div id='consumable-popup-inner'>
                    <div id='consumable-name'>
                        {cons.name}
                    </div>
                    <div id='consumable-info'>
                        {cons.type === 'Planet' &&
                            <>
                                <div>
                                    <div>{'('}</div>
                                    <div className='yellow nospace'>{`lvl.${handLevels[cons.hand!].level}`}</div>
                                    <div className='nospace'>{') Level up'}</div>
                                </div>
                                <div className='orange'>
                                    {HandType[cons.hand as keyof typeof HandType]}
                                </div>
                                <div>
                                    <div className='red'>+{handUpgrade[cons.hand!].mult}</div>
                                    <div>Mult and</div>
                                </div>
                                <div>
                                    <div className='blue'>+{handUpgrade[cons.hand!].chips}</div>
                                    <div>chips</div>
                                </div>
                            </>
                        }
                        {(cons.type === 'Spectral' || cons.type === 'Tarot') && <>{description}</>}
                    </div>
                    <div id='consumable-type' className={cons.type}>
                        {cons.name === 'Ceres' ? 'Dwarf Planet' : cons.type}
                    </div>
                </div>
            </div>
        </div>
    )
}