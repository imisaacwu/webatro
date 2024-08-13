import { useContext, useRef } from "react"
import { DeckType, Edition, editionInfo } from "../Constants"
import { calcPrice, cardSnap, debuffCards, getImage } from "../Utilities"
import debuff from '../assets/cards/modifiers/debuffed.webp'
import { GameStateContext } from "../GameState"
import './Joker.css'
import { JokerInstance } from "./JokerInfo"
const images: Record<string, { default: string }> = import.meta.glob('../assets/jokers/*/*.png', { eager: true })

export const Joker = ({id, joker, edition, selected = false, ...props}: JokerInstance) => {
    const { state: game, dispatch } = useContext(GameStateContext)
    const gameRef = useRef(game)
    gameRef.current = game
    
    const image = getImage(`../assets/jokers/${joker.rarity}/${joker.name.replace(/\s/g, '_')}.png`, images)
    const back = getImage(`../assets/decks/${DeckType[game.stats.deck]}.png`, import.meta.glob('../assets/decks/*.png', { eager: true }))
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
    
    const popupTags = <>
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
                const update = [...gameRef.current.jokers]
                const [c] = update.splice(origI, 1)
                update.splice(i, 0, c)
                console.log(update, c, origI)
                dispatch({type: 'updateJokers', payload: {update: update}})
                origI = i
                lastReorder = now
            }
        }
    }

    const mouseUp = () => {
        if (dragElem) {
            cardSnap({cards: gameRef.current.jokers, idPrefix: 'joker', r: -1})
            document.removeEventListener('mousemove', mouseMove)
            document.removeEventListener('mouseup', mouseUp)
            dragElem = null
        }
    }

    return (
        <div
            id={`joker_${id}`}
            className={`${props.shopMode ? 'shopping' : ''}` +
                `${selected ? ' selected' : ''}` +
                ` ${edition !== undefined && !props.flipped ? Edition[edition] : ''}`
            }
        >
            <img src={props.flipped ? back : image} onClick={() => {
                if(props.shopMode) {
                    dispatch({type: 'shop-select', payload: {card: self}})
                } else {
                    dispatch({type: 'select', payload: {card: self}})
                }
            }} onMouseDown={props.shopMode ? () => {} : mouseDown} />
            {props.debuffed && <img className='debuff' src={debuff} />}
            {!props.flipped && <div id='joker-description-outline'>
                <div id='joker-description'>
                    <div id='joker-name'>
                        {joker.name}
                    </div>
                    <div id='joker-info'>
                        {props.debuffed ?
                            <>
                                <div><div>All abilities</div></div>
                                <div><div>are disabled</div></div>
                            </> :
                        description}
                    </div>
                    <div id='joker-tags'>
                        {props.debuffed ?
                            <div id='joker-debuffed'>Debuffed</div> :
                            <>
                                <div id='joker-rarity' className={joker.rarity}>
                                    {joker.rarity}
                                </div>
                                {popupTags}
                            </>
                        }
                    </div>
                </div>
            </div>}
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
            {!props.shopMode && selected && !props.flipped &&
                <div id='sell-joker' onClick={() => {
                    dispatch({type: 'stat', payload: {stat: 'money', amount: sell}})
                    dispatch({type: 'removeJoker', payload: {card: self}})
                    if(game.blind.curr === 'boss' && game.blind.boss.name === 'Verdant Leaf') {
                        debuffCards(game.blind.boss, [...game.cards.deck, ...game.cards.hand], [], true)
                    }
                }}>
                    SELL
                    <div id='joker-sell-price'>{`$${sell}`}</div>
                </div>
            }
        </div>
    )
}