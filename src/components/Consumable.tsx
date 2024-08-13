import { MouseEventHandler, useContext, useRef } from "react";
import { ConsumableInstance, Consumables, ConsumableType, editionInfo, enhancementInfo, handLevels, HandType, handUpgrade, modifierInfo, sealInfo } from "../Constants";
import './Consumable.css';
import { GameStateContext } from "../GameState";
import { useConsumable } from "./UseConsumable";
import { calcPrice, cardSnap } from "../Utilities";
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
                    {str.replace(/{totalJokerSellPrice}/, Math.min(50, game.jokers.reduce((total, j) => total += calcPrice(j).sell, 0)).toString()).replace(/{.+}/g, '')}
                </div>
            )}
        </div>
    )
    if(cons.name === 'The Fool' && game.cards.lastCon !== undefined) {
        description?.push(<div id='last-used-tag' className='small'>{game.cards.lastCon}</div>)
        cons.tags = [Consumables.find(c => c.name === game.cards.lastCon)!]
    }

    const getTagName = (tag: ConsumableType | modifierInfo) => {
        if((tag as ConsumableType).name) {
            return (tag as ConsumableType).name
        } else if((tag as keyof typeof enhancementInfo) in enhancementInfo) {
            return tag + ' Card'
        } else if((tag as keyof typeof sealInfo) in sealInfo) {
            return tag + ' Seal'
        }
        return tag as modifierInfo
    }

    const getTagDescription = (tag: ConsumableType | modifierInfo) => {
        if((tag as ConsumableType).type) {
            return (tag as ConsumableType).description
        } else if((tag as keyof typeof editionInfo) in editionInfo) {
            return editionInfo[tag as keyof typeof editionInfo]
        } else if((tag as keyof typeof enhancementInfo) in enhancementInfo) {
            return enhancementInfo[tag as keyof typeof enhancementInfo]
        } else if((tag as keyof typeof sealInfo) in sealInfo) {
            return sealInfo[tag as keyof typeof sealInfo]
        }
    }

    const popupTags = <>
        <div id='tags-side'>
            {cons.tags?.map((tag, i) =>
                <div className='tag-info' key={i}>
                    <div className='tag-info-inner'>
                        <div className='tag-name'>{getTagName(tag)}</div>
                        <div className='tag-description'>
                            {getTagDescription(tag)!.split('\n').map((line, i) => 
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
            )}
        </div>
    </>

    const sell: MouseEventHandler = () => {
        dispatch({type: 'stat', payload: {stat: 'money', amount: sellPrice}})
        dispatch({type: 'discard'})
    }

    const use: MouseEventHandler = () => {
        useConsumable(game, dispatch, cons)
    }

    const tolerance = 10, renderDelay = 100
    let dragElem: HTMLElement | null = null
    let [origX, origY, origI, startX, startY]: number[] = []
    let lastReorder  = 0

    const mouseDown = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        dragElem = (e.target as HTMLElement).parentElement!
        origX = dragElem.offsetLeft
        origY = dragElem.offsetTop
        origI = [...dragElem.parentElement!.children].indexOf(dragElem)
        startX = e.clientX - origX
        startY = e.clientY - origY
        
        document.addEventListener('mousemove', mouseMove)
        document.addEventListener('mouseup', mouseUp)
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
            const w = container.clientWidth, l = container.childElementCount - 1
            const lStep = w / (l + 1), extra = (lStep - dragElem.clientWidth) / l
            let i = Math.min(l, Math.max(0, Math.round(dragElem.offsetLeft / (lStep + extra))))
            if(Math.abs(dragElem.offsetLeft - i * (lStep + extra)) < tolerance && origI !== i) {
                const update = [...gameRef.current.cards.consumables]
                const [c] = update.splice(origI, 1)
                update.splice(i, 0, c)
                console.log(update, c, origI)
                dispatch({type: 'updateCards', payload: {cardLocation: 'consumables', update: update}})
                origI = i
                lastReorder = now
            }
        }
    }

    const mouseUp = () => {
        if (dragElem) {
            cardSnap({cards: gameRef.current.cards.consumables, idPrefix: 'consumable', r: -1})
            document.removeEventListener('mousemove', mouseMove)
            document.removeEventListener('mouseup', mouseUp)
            dragElem = null
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
            }} onMouseDown={props.shopMode ? () => {} : mouseDown} />
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
            {props.shopMode && selected && <>
                <div id='consumable-buy-button' onClick={() => {
                    if(game.stats.money >= price && game.cards.consumables.length < game.stats.consumableSize) {
                        dispatch({type: 'stat', payload: {stat: 'money', amount: -price}})
                        dispatch({type: 'shop-remove', payload: {card: {selected, consumable: cons, ...props}}})
                        dispatch({type: 'addCard', payload: {cardLocation: 'consumables', card: cons}})
                    }
                }}>BUY</div>
                {!cons.handRequired &&
                    <div id='consumable-buy-and-use-button' onClick={() => {
                        if(game.stats.money >= price) {
                            dispatch({type: 'stat', payload: {stat: 'money', amount: -price}})
                            dispatch({type: 'shop-remove', payload: {card: {selected, consumable: cons, ...props}}})
                            useConsumable(game, dispatch, cons, true)
                        }
                    }}>
                        <div id='consumable-buy-and-use-buy'>BUY</div>
                        <div id='consumable-buy-and-use-use'>& USE</div>
                    </div>
                }
            </>}
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
                        <div id='consumable-tags'>
                            {popupTags}
                        </div>
                    </div>
                    <div id='consumable-type' className={cons.type}>
                        {cons.name === 'Ceres' ? 'Dwarf Planet' : cons.type}
                    </div>
                </div>
            </div>
        </div>
    )
}