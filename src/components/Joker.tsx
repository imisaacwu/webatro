import { useContext } from "react"
import { Edition, editionInfo } from "../Constants"
import { calcPrice, getImage } from "../Utilities"
import './Joker.css'
import { JokerInstance } from "./JokerInfo"
import { GameStateContext } from "../GameState"
const images: Record<string, { default: string }> = import.meta.glob('../assets/jokers/*/*.png', { eager: true })

export const Joker = ({id, joker, edition, selected = false, ...props}: JokerInstance) => {
    const { state: game, dispatch } = useContext(GameStateContext)
    const image = getImage(`../assets/jokers/${joker.rarity}/${joker.name.replace(/\s/g, '_')}.png`, images)
    const self: JokerInstance = {id, joker, edition, selected, ...props}
    const { price, sell } = calcPrice(self)

    const description = joker.description.split('\n').map((line, i) =>
        <div key={i}>
            {line.split('/').map((str, i) =>
                <div key={i} className={str.match(/{.+}/)?.[0].slice(1, -1)} style={{display: 'inline'}}>
                    {str.replace(/{.+}/g, '')}
                </div>
            )}
        </div>
    )
    
    const popupTags =
        <>
            {edition !== undefined &&
                <div className={`tag ${edition}`}>{Edition[edition]}</div>
            }
            <div id='tags-side'>
                {edition !== undefined &&
                    <div className='tag-info'>
                        <div className='tag-info-inner'>
                            <div className='tag-name'>{Edition[edition]}</div>
                            <div className='tag-description'>
                                {editionInfo[Edition[edition] as keyof typeof editionInfo].split('\n').map((line, i) => 
                                    <div key={i}>
                                        {line.split('/').map((str, i) =>
                                            <div key={i} className={str.match(/{.+}/)?.[0].slice(1, -1)} style={{display: 'inline'}}>
                                                {str.replace(/{.+}/g, '')}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                }
            </div>
        </>

    return (
        <div
            id={`joker_${id}`}
            className={`${props.shopMode ? 'shopping' : ''}` +
                `${selected ? ' selected' : ''}` +
                ` ${edition !== undefined ? Edition[edition] : ''}`
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
                    <div id='joker-tags'>
                        <div id='joker-rarity' className={joker.rarity}>
                            {joker.rarity}
                        </div>
                        {popupTags}
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
                    dispatch({type: 'stat', payload: {stat: 'money', amount: sell}})
                    dispatch({type: 'removeJoker', payload: {card: self}})
                }}>
                    SELL
                    <div id='joker-sell-price'>{`$${sell}`}</div>
                </div>
            }
        </div>
    )
}