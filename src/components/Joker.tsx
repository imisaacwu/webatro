import { useContext } from "react"
import { Edition } from "../Constants"
import { getImage } from "../Utilities"
import './Joker.css'
import { JokerInstance } from "./JokerInfo"
import { GameStateContext } from "../GameState"
const images: Record<string, { default: string }> = import.meta.glob('../assets/jokers/*/*.png', { eager: true })

export const Joker = ({id, joker, selected = false, ...props}: JokerInstance) => {
    const { state: game, dispatch } = useContext(GameStateContext)
    const image = getImage(`../assets/jokers/${joker.rarity}/${joker.name.replace(/\s/g, '_')}.png`, images)
    const self: JokerInstance = {id, joker, selected, ...props}

    const price = joker.cost
    const sellPrice = Math.floor(price / 2)

    const description = joker.description.split('\n').map((line, i) =>
        <div key={i}>
            {line.split('/').map((str, i) =>
                <div key={i} className={str.match(/{.+}/)?.[0].slice(1, -1)} style={{display: 'inline'}}>
                    {str.replace(/{.+}/g, '')}
                </div>
            )}
        </div>
    )

    return (
        <div
            id={`joker_${id}`}
            className={`${props.shopMode ? 'shopping' : ''}` +
                `${selected ? ' selected' : ''}` +
                ` ${props.edition !== undefined ? Edition[props.edition] : ''}`
            }
        >
            <img src={image} onClick={() => {
                if(props.shopMode) {
                    dispatch({type: 'shop-select', payload: {card: self}})
                } else {
                    dispatch({type: 'select', payload: {card: self}})
                }
            }} draggable={false} />
            <div id='joker-description-outline'>
                <div id='joker-description'>
                    <div id='joker-name'>
                        {joker.name}
                    </div>
                    <div id='joker-info'>
                        {description}
                    </div>
                    <div id='joker-rarity' className={joker.rarity}>
                        {joker.rarity}
                    </div>
                </div>
            </div>
            {props.shopMode &&
                <div id='joker-price-tab'>
                    <div id='joker-price' className='yellow'>
                        ${price}
                    </div>
                </div>
            }
            {props.shopMode && selected &&
                <div id='joker-buy-button' onClick={() => {
                    if(game.stats.money >= price && game.jokers.length < game.stats.jokerSize) {
                        dispatch({type: 'stat', payload: {stat: 'money', amount: -price}})
                        dispatch({type: 'shop-remove', payload: {card: self}})
                        dispatch({type: 'addJoker', payload: {card: self}})
                    }
                }}>BUY</div>
            }
            {!props.shopMode && selected &&
                <div id='sell-joker' onClick={() => {
                    dispatch({type: 'stat', payload: {stat: 'money', amount: sellPrice}})
                    dispatch({type: 'removeJoker', payload: {card: self}})
                }}>
                    SELL
                    <div id='joker-sell-price'>{`$${sellPrice}`}</div>
                </div>
            }
        </div>
    )
}