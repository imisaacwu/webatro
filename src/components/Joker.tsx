import { Edition } from "../Constants"
import { getImage } from "../Utilities"
import './Joker.css'
import { JokerInstance } from "./JokerInfo"
const images: Record<string, { default: string }> = import.meta.glob('../assets/jokers/*/*.png', { eager: true })

export const Joker = ({id, joker, ...props}: JokerInstance) => {
    const image = getImage(`../assets/jokers/${joker.rarity}/${joker.name.replace(/\s/g, '_')}.png`, images)

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
                ` ${props.edition !== undefined ? Edition[props.edition] : ''}`
            }
        >
            <img src={image} />
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
                        ${joker.cost}
                    </div>
                </div>
            }
        </div>
    )
}