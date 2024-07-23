import { MouseEventHandler, useContext, useRef } from "react";
import { ConsumableType, handLevels, HandType, handUpgrade } from "../Constants";
import './Consumable.css';
import { GameStateContext, handLevel } from "../GameState";
import { cardSnap } from "../Utilities";
const images: Record<string, { default: string }> = import.meta.glob('../assets/consumables/*/*.png', { eager: true })

const getImagePath = (type: 'Tarot' | 'Planet' | 'Spectral', name: string) => {
    const imagePath = `../assets/consumables/${type.toLowerCase()}s/${name.toLowerCase()}.png`

    const module = images[imagePath]
    if(!module) { throw new Error(`no such image ${imagePath}`) }
    return module.default
}

export const Consumable = ({selected = false, ...props}: ConsumableType) => {
    const { state: game, dispatch } = useContext(GameStateContext)
    const gameRef = useRef(game)
    gameRef.current = game
    const image = getImagePath(props.type, props.name)
    const consumable = game.cards.consumables.find(c => c.id === props.id)
    const sellPrice = props.type === 'Spectral' ? 2 : 1

    const sell: MouseEventHandler = () => {
        dispatch({type: 'stat', payload: {stat: 'money', amount: sellPrice}})
        dispatch({type: 'discard'})
    }

    const use: MouseEventHandler = () => {
        if(props.type === 'Planet') {
            handLevel({hand: props.hand!})
        }
        dispatch({type: 'discard'})
    }

    const tolerance = 10, renderDelay = 100
    let dragElem: HTMLElement | null = null
    let [origX, origY, origI, startX, startY]: number[] = []
    let lastReorder  = 0

    const mouseDown = (e: React.MouseEvent<HTMLElement>) => {
        dragElem = (e.target as HTMLElement).parentElement!
        if(dragElem.id === 'consumable-tabs') { return }
        origX = dragElem.offsetLeft
        origY = dragElem.offsetTop
        origI = [...dragElem.parentElement!.children].indexOf(dragElem)
        startX = e.clientX - origX
        startY = e.clientY - origY
        
        dragElem.style.zIndex = '2'

        document.addEventListener('mousemove', mouseMove)
        document.addEventListener('mouseup', mouseUp)

        console.log(dragElem, origX, origY, origI, startX, startY)
    }

    const mouseMove = (e: MouseEvent) => {
        if(dragElem) {
            const x = e.clientX - startX
            const y = startY - e.clientY
            requestAnimationFrame(() => {
                if(dragElem) {
                    dragElem!.style.left = `${x}px`
                    dragElem!.style.bottom = `${y}px`
                }
            })

            const now = Date.now()
            if(now - lastReorder < renderDelay) { return }

            const container = dragElem.parentElement!
            const w = container.clientWidth, l = container.childElementCount
            const lStep = w / l, extra = (lStep - dragElem.clientWidth) / (l - 1)
            let i = Math.min(l, Math.max(0, Math.round(dragElem.offsetLeft / (lStep + extra))))
            if(Math.abs(dragElem.offsetLeft - i * (lStep + extra)) < tolerance && origI !== i) {
                const update = [...gameRef.current.cards.consumables]
                const [c] = update.splice(origI, 1)
                update.splice(i, 0, c)
                dispatch({type: 'reorder', payload: {cards: 'consumables', update: update}})
                origI = i
                lastReorder = now
            }
        }
    }

    const mouseUp = () => {
        if (dragElem) {
            cardSnap({cards: gameRef.current.cards.consumables, r: -1})
            document.removeEventListener('mousemove', mouseMove)
            document.removeEventListener('mouseup', mouseUp)
            dragElem.style.zIndex = 'auto'
            dragElem = null
        }
    }
    
    return (
        <div id={`consumable ${props.id}`} className={props.name + `${selected ? ' selected' : ''}`} onMouseDown={mouseDown} onMouseUp={mouseUp}>
            <img src={image} onClick={() => {
                dispatch({type: 'select', payload: {consumable: consumable}})
            }} draggable={false}/>
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