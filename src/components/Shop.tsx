import { useContext } from 'react'
import { Consumables, handLevels } from '../Constants'
import { GameStateContext } from '../GameState'
import { Jokers } from './JokerInfo'
import './Shop.css'
import { Joker } from './Joker'
import { Consumable } from './Consumable'

const weights = {
    Joker: 20,
    Tarot: 4,
    Planet: 4,
    Card: 0,
    Spectral: 0
}

const slots = 2

export const Shop = () => {
    const { state: game, dispatch } = useContext(GameStateContext)
    const total = Object.values(weights).reduce((n, w) => n += w)
    const offers = []
    
    for(let i = 1; i <= slots; i++) {
        const roll = Math.random()
        if(roll < weights.Joker / total) {
            const rare_roll = Math.random()
            const rarity = rare_roll < .7 ? 'Common' : rare_roll < .95 ? 'Uncommon' : 'Rare'
            const validJokers = Jokers.filter(j => j.rarity === rarity && !game.jokers.find(joker => joker.joker.name === j.name))
            if(validJokers.length === 0) { validJokers.push(Jokers[0])}
            offers.push(
                <Joker id={-i} key={-i} shopMode={true} joker={validJokers[Math.floor(Math.random() * validJokers.length)]} />
            )
        } else if(roll < (weights.Joker + weights.Tarot) / total) {
            const validTarots = Consumables.slice(29, 51).filter(c => game.cards.consumables.every(con => con.name !== c.name))
            if(validTarots.length === 0) { validTarots.push(Consumables[40])}
            offers.push(
                <Consumable id={-i} key={-i} shopMode={true} {...validTarots[Math.floor(Math.random() * validTarots.length)]} />
            )
        } else if(roll < (weights.Joker + weights.Tarot + weights.Planet) / total) {
            const validPlanets = Consumables.slice(0, 11).filter(c => game.cards.consumables.every(con => con.name !== c.name) && (!c.name.match('Planet X|Ceres|Eris') || handLevels[c.hand!].played > 0))
            if(validPlanets.length === 0) { validPlanets.push(Consumables[0]) }
            offers.push(
                <Consumable id={-i} key={-i} shopMode={true} {...validPlanets[Math.floor(Math.random() * validPlanets.length)]} />
            )
        }
    }

    return (
        <div id='shop-outline'>
            <div id='shop-outline-inner'>
                <div id='shop-content'>
                    <div id='shop-top'>
                        <div id='shop-buttons'>
                            <div id='next-round' className='shop-button' onClick={() => {dispatch({type: 'state', payload: {state: 'blind-select'}})}}>
                                <div>Next</div>
                                <div>Round</div>
                            </div>
                            <div id='reroll' className='shop-button'>
                                <div>Reroll</div>
                                <div id='reroll-price'>$5</div>
                            </div>
                        </div>
                        <div id='buying-area'>
                            {offers}
                        </div>
                    </div>
                    <div id='shop-bottom'>
                        <div id='voucher-outline'>
                            <div id='voucher-content'>
                                <div id='ante-voucher-label'>
                                    {`ANTE ${game.stats.ante} VOUCHER`}
                                </div>
                                <div id='voucher-area'>

                                </div>
                            </div>
                        </div>
                        <div id='booster-packs'>
                            {}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}