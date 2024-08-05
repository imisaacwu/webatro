import { useContext } from 'react'
import { ConsumableInstance } from '../Constants'
import { GameStateContext } from '../GameState'
import { JokerInstance } from './JokerInfo'
import './Shop.css'
import { Joker } from './Joker'
import { Consumable } from './Consumable'

export const Shop = () => {
    const { state: game, dispatch } = useContext(GameStateContext)

    const offers = game.shop.offers.map((offer, i) => {
        if((offer as JokerInstance).joker !== undefined) {
            return <Joker key={i} {...offer as JokerInstance} />
        } else {
            return <Consumable key={i} {...offer as ConsumableInstance} />
        }
    })
    
    return (
        <div id='shop-outline'>
            <div id='shop-outline-inner'>
                <div id='shop-content'>
                    <div id='shop-top'>
                        <div id='shop-buttons'>
                            <div id='next-round' className='shop-button' onClick={() => { dispatch({type: 'state', payload: {state: 'blind-select'}}) }}>
                                <div>Next</div>
                                <div>Round</div>
                            </div>
                            <div id='reroll' className='shop-button' onClick={() => { dispatch({type: 'reroll'}) }}>
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