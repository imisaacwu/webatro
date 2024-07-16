import { ConsumableType, handLevels, HandType } from "../Constants";
import './Consumable.css';
const images: Record<string, { default: string }> = import.meta.glob('../assets/consumables/*/*.png', { eager: true })

const getImagePath = (type: 'Tarot' | 'Planet' | 'Spectral', name: string) => {
    const imagePath = `../assets/consumables/${type.toLowerCase()}s/${name.toLowerCase()}.png`

    const module = images[imagePath]
    if(!module) { throw new Error(`no such image ${imagePath}`) }
    return module.default
}

export const Consumable = (props: ConsumableType) => {
    const image = getImagePath(props.type, props.name)
    
    return (
        <div id={`consumable ${props.id}`} className={props.name}>
            <img src={image} />
            <div id='info-popup'>
                <div id='inner'>
                    <div id='consumable-name'>
                        {props.name}
                    </div>
                    <div id='score-info' className='planet'>
                        {props.type === 'Planet' &&
                            <div>
                                <div id='level'>[<div className='yellow'>{`lvl.${handLevels[props.hand!].level}`}</div>] Level up</div>
                                <div id='planet-hand'>{HandType[props.hand as keyof typeof HandType]}</div>
                                <div><div className='red'>+1</div>&nbsp;Mult and</div>
                                <div><div className='blue'>+15</div>&nbsp;chips</div>
                            </div>
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