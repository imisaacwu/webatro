import { useContext, useRef } from 'react'
import debuff from '../assets/cards/modifiers/debuffed.webp'
import { DeckType, Edition, editionInfo, Enhancement, enhancementInfo, Rank, rankChips, Seal, sealInfo, Suit } from '../Constants'
import { cardSnap } from '../Utilities'
import './Card.css'
import { CardInfo } from './CardInfo'
import { GameStateContext } from '../GameState'
const images: Record<string, { default: string }> = import.meta.glob([
    '../assets/cards/*.webp',
    '../assets/decks/*.png',
    '../assets/cards/modifiers/*/*.png'
], { eager: true })

const getImage = (url: string) => {
    const module = images[url]
    if(!module) { throw new Error(`no such image ${url}`) }
    return module.default
}

export const Card = ({
        id, suit, rank, deck,
        mode = 'standard',
        edition, enhancement = Enhancement.Base, seal,
        draggable = true,
        selected, submitted, scored, drawn, flipped, debuffed
    }: CardInfo) => {

    const { state: game, dispatch } = useContext(GameStateContext)
    const gameRef = useRef(game)
    gameRef.current = game

    const cardName = <>{rank < 9 ? rank + 2 : Rank[rank]} of&nbsp;<div className={Suit[suit]}>{Suit[suit]}</div></>
    const image = getImage(`../assets/cards/${Suit[suit].charAt(0)}${rank < 8 ? rank + 2 : Rank[rank].charAt(0)}.webp`)
    const bkg = getImage(`../assets/cards/modifiers/enhancements/${Enhancement[enhancement]}.png`)
    const back = getImage(`../assets/decks/${DeckType[deck]}.png`)
    const description = game.state === 'scoring' && debuffed ? 
        <>
            <div id='playing-card-debuffed'>Scores no chips</div>
            <div id='playing-card-debuffed'>and all abilities</div>
            <div id='playing-card-debuffed'>are disabled</div>
        </> :
        <>
            {(enhancement === undefined || enhancement !== Enhancement.Stone) &&
                <div id='playing-card-chips'>
                    <div className='blue'>
                        {`+${rankChips[Rank[rank] as keyof typeof rankChips]}`}
                    </div>&nbsp;{'chips'}
                </div>
            }
            <div id='playing-card-enhancement-info'>
                {enhancement !== undefined && enhancement !== Enhancement.Base &&
                    enhancementInfo[Enhancement[enhancement] as keyof typeof enhancementInfo].split('\n').map((line, i) => 
                        <div key={i}>
                            {line.split('/').map((str, i) =>
                                <div key={i} className={str.match(/{.+}/)?.[0].slice(1, -1)} style={{display: 'inline'}}>
                                    {str.replace(/{.+}/g, '')}
                                </div>
                            )}
                        </div>
                    )
                }
            </div>
        </>
    const popupTags = game.state === 'scoring' && debuffed ?
        <div id='debuffed-tag' className='tag'>Debuffed</div> :
        <>
            {enhancement !== undefined && enhancement !== Enhancement.Base &&
                <div id='enhancement' className={`tag ${enhancement}`}>{`${Enhancement[enhancement]} Card`}</div>
            }
            {edition !== undefined &&
                <div id='edition' className={`tag ${edition}`}>{Edition[edition]}</div>
            }
            {seal !== undefined &&
                <div id='seal' className={`tag ${seal}`}>{`${Seal[seal]} Seal`}</div>
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
                {seal !== undefined &&
                    <div className='tag-info'>
                        <div className='tag-info-inner'>
                            <div className='tag-name'>{Seal[seal]} Seal</div>
                            <div className='tag-description'>
                                {sealInfo[Seal[seal] as keyof typeof sealInfo].split('\n').map((line, i) => 
                                    <div key={i}>
                                        {line.split('/').map((str, i) =>
                                            <div key={i} className={str.match(/{.+}/)?.[0].slice(1, -1)} style={{display: 'inline-block'}}>
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
        if(draggable) {
            dragElem = e.target as HTMLElement
            origX = dragElem.offsetLeft
            origY = dragElem.offsetTop
            origI = [...dragElem.parentElement!.children].indexOf(dragElem)
            startX = e.clientX - origX
            startY = e.clientY - origY
            
            dragElem.style.zIndex = '2'

            document.addEventListener('mousemove', mouseMove)
            document.addEventListener('mouseup', mouseUp)
        }
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
                const update = [...gameRef.current.cards.hand]
                const [c] = update.splice(origI, 1)
                update.splice(i, 0, c)
                dispatch({type: 'updateCards', payload: {cardLocation: 'hand', update: update}})
                origI = i
                lastReorder = now
            }
        }
    }

    const mouseUp = () => {
        if (dragElem) {
            cardSnap({cards: gameRef.current.cards.hand, idPrefix: 'card'})
            document.removeEventListener('mousemove', mouseMove)
            document.removeEventListener('mouseup', mouseUp)
            dragElem.style.zIndex = 'auto'
            dragElem = null
        }
    }

    return (
        <div
            id={`card${id}`}
            className={`card ${mode}` +
                `${selected ? ' selected' : ''}` +
                `${mode === 'standard' && submitted ? ' submitted' : ''}` +
                `${mode === 'standard' && scored && !debuffed ? '' : ' unscored'}` +
                `${debuffed ? ' debuffed' : ''}` +
                `${mode === 'deck-view' && drawn && !flipped ? ' drawn' : ''}` +
                ` ${edition !== undefined ? Edition[edition] : ''}`
            }
            onClick={() => {
                const card = game.cards.hand.find(c => c.id === id)!
                if((mode === 'standard' && game.cards.selected.length < 5) || game.cards.selected.includes(card)) {
                    dispatch({type: 'select', payload: {card: card}})
                }
            }}
            onMouseDown={mouseDown}
            onMouseUp={mouseUp}
        >
            {(enhancement === undefined || enhancement !== Enhancement.Stone) && <img src={flipped ? back : image} />}
            {!flipped && <img id='card-bkg' src={bkg} />}
            {game.state === 'scoring' && debuffed && <img className='debuff' src={debuff} />}
            {seal !== undefined && <img id='seal-icon' src={getImage(`../assets/cards/modifiers/seals/${Seal[seal]}.png`)} />}
            {!dragElem && !flipped && !drawn && <div id='playing-card-popup'>
                <div id='playing-card-popup-inner'>
                    {(enhancement === undefined || enhancement !== Enhancement.Stone) &&
                        <div id='playing-card-name'>
                            {cardName}
                        </div>
                    }
                    <div id='playing-card-description'>
                        {description}
                    </div>
                    <div id='playing-card-tags'>
                        {popupTags}
                    </div>
                </div>
            </div>}
            {submitted && scored && !debuffed &&
                <div id='playing-card-scored-popup'>
                    {`+${rankChips[Rank[rank] as keyof typeof rankChips]}`}
                </div>
            }
        </div>
    )
}