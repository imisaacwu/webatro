import { useContext, useRef } from 'react'
import debuff from '../assets/cards/debuffed.webp'
import { Deck } from '../Constants'
import { cardSnap } from '../Utilities'
import './Card.css'
import { CardInfo } from './CardInfo'
import { GameStateContext } from '../GameState'
const decks: Record<string, { default: string }> = import.meta.glob('../assets/decks/*.png', { eager: true })

const getCardBack = (deck: Deck) => {
    const url = `../assets/decks/${Deck[deck].toLowerCase()}.png`
    const module = decks[url]
    if(!module) { throw new Error(`no such image ${url}`) }
    return module.default
}

export const Card = ({id, image, deck, onClick, children, draggable = true, selected = false, flipped = false, debuffed = false}: CardInfo) => {
    const { state: game, dispatch } = useContext(GameStateContext)
    const gameRef = useRef(game)
    gameRef.current = game

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
            // origI = gameRef.current.cards.hand.findIndex(c => c.id === id)
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
                dispatch({type: 'updateHand', payload: {hand: update}})
                origI = i
                lastReorder = now
            }
        }
    }

    const mouseUp = () => {
        if (dragElem) {
            cardSnap(gameRef.current.cards.hand, 6000)
            document.removeEventListener('mousemove', mouseMove)
            document.removeEventListener('mouseup', mouseUp)
            dragElem.style.zIndex = 'auto'
            dragElem = null
        }
    }

    return (
        <div
            id={`card ${id}`}
            className={`card` +
                `${selected ? ' selected' : ''}` +
                `${debuffed ? ' debuffed' : ''}`
            }
            onClick={onClick}
            onMouseDown={mouseDown}
            onMouseUp={mouseUp}
        >
            <img src={flipped ? getCardBack(deck) : image} />
            {game.state === 'scoring' && debuffed && <img className='debuff' src={debuff} />}
            {!dragElem && !flipped && children}
        </div>
    )
}