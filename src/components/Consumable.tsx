import { MouseEventHandler, useContext } from "react";
import { ConsumableType, handLevels, HandType, handUpgrade } from "../Constants";
import './Consumable.css';
import { GameStateContext, handLevel } from "../GameState";
const images: Record<string, { default: string }> = import.meta.glob('../assets/consumables/*/*.png', { eager: true })

const getImagePath = (type: 'Tarot' | 'Planet' | 'Spectral', name: string) => {
    const imagePath = `../assets/consumables/${type.toLowerCase()}s/${name.toLowerCase()}.png`

    const module = images[imagePath]
    if(!module) { throw new Error(`no such image ${imagePath}`) }
    return module.default
}

export const Consumable = ({selected = false, ...props}: ConsumableType) => {
    const { state: game, dispatch } = useContext(GameStateContext)
    const image = getImagePath(props.type, props.name)
    const consumable = game.cards.consumables.find(c => c.id === props.id)
    const sellPrice = props.type === 'Spectral' ? 2 : 1

    console.log(props.name, selected)

    const sell: MouseEventHandler = () => {
        dispatch({type: 'stat', payload: {stat: 'money', amount: sellPrice}})
        dispatch({type: 'discard'})
    }

    const use: MouseEventHandler = () => {
        if(props.type === 'Planet') {
            handLevel({hand: props.hand!})
        }
        // dispatch({type: 'discard'})
    }
    
    return (
        <div id={`consumable ${props.id}`} className={props.name + `${selected ? ' selected' : ''}`}>
            <img src={image} onClick={() => {
                dispatch({type: 'select', payload: {consumable: consumable}})
            }} draggable={false} />
            {selected &&
                <div id='consumable-tabs'>
                    <div id='sell-consumable' className='consumable-tab' onClick={sell}>
                        SELL<div id='consumable-sell-price'>{`$${sellPrice}`}</div>
                    </div>
                    <div id='use-consumable' className='consumable-tab' onClick={use}>USE</div>
                </div>
            }
            <div id='consumable-popup'>
                <div id='consumable-popup-inner'>
                    <div id='consumable-name'>
                        {props.name}
                    </div>
                    <div id='consumable-info' className='planet'>
                        {props.type === 'Planet' &&
                            <>
                                <div id='level'>[<div className='yellow'>{`lvl.${handLevels[props.hand!].level}`}</div>] Level up</div>
                                <div id='planet-hand'>{HandType[props.hand as keyof typeof HandType]}</div>
                                <div className='planet-upgrade'><div className='red'>+{handUpgrade[props.hand!].mult}</div>&nbsp;Mult and</div>
                                <div className='planet-upgrade'><div className='blue'>+{handUpgrade[props.hand!].chips}</div>&nbsp;chips</div>
                            </>
                        }
                    </div>
                    <div id='consumable-type' className={props.type}>
                        {props.type}
                    </div>
                </div>
            </div>
        </div>
    )
}