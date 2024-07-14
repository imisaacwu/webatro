import { useContext, useRef } from 'react';
import { CardInfo, Rank, Suit, rankChips } from '../Constants';
import { GameStateContext } from '../GameState';
import { cardSnap } from '../Utilities';
import './Card.css';
import { redDeck } from '../assets/decks';
const images: Record<string, { default: string }> = import.meta.glob('../assets/cards/*.webp', { eager: true });

const getImagePath = (suit: Suit, rank: Rank) => {
    const fileName = `${Suit[suit].charAt(0).toLowerCase()}${rankChips[Rank[rank] as keyof typeof rankChips] < 10 ? rankChips[Rank[rank] as keyof typeof rankChips] : Rank[rank].charAt(0).toLowerCase()}.webp`;
    const imagePath = `../assets/cards/${fileName}`;
  
    const module = images[imagePath]
    return module ? module.default : null
};

export const Card = (props: CardInfo) => {
    const {
        mode = 'standard', 
        selected = false,
        submitted = false,
        scored = false,
        drawn = false,
        flipped = false, 
        debuffed = false
    } = props;
    const { state: game, dispatch } = useContext(GameStateContext)
    const gameRef = useRef(game);
    gameRef.current = game;

    const image = getImagePath(props.suit, props.rank);
    if(!image) { throw new Error(`no such image ${Suit[props.suit].charAt(0).toLowerCase()}${rankChips[Rank[props.rank] as keyof typeof rankChips] < 10 ? rankChips[Rank[props.rank] as keyof typeof rankChips] : Rank[props.rank].charAt(0).toLowerCase()}.webp`) }

    let dragElem: HTMLElement | null = null, origX: number, origY: number, origI: number, startX: number, startY: number;

    const mouseDown = (e: React.MouseEvent<HTMLElement>) => {
        if(mode === 'standard') {
            dragElem = e.target as HTMLElement
            origX = dragElem.offsetLeft
            origY = dragElem.offsetTop
            origI = gameRef.current.cards.hand.findIndex(c => c.id === props.id)
            startX = e.clientX - origX
            startY = e.clientY - origY
            
            dragElem.style.zIndex = '2'

            document.addEventListener('mousemove', mouseMove)
            document.addEventListener('mouseup', mouseUp)
        }
    }

    const tolerance = 10, renderDelay = 100;
    let lastReorder  = 0;

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
                origI = i;
                lastReorder = now;
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
            id={`card ${props.id}`}
            className={`card ${Suit[props.suit]}` +
                ` ${mode}` + 
                `${selected ? ' selected' : ''}` +
                `${submitted ? ' submitted' : ''}` +
                `${submitted && !scored ? ' unscored' : ''}` +
                `${drawn ? ' drawn' : ''}`
            }
            onClick={() => {
                if(mode === 'standard' && (gameRef.current.cards.selected.length < 5 || props.selected)) {
                    dispatch({type: 'select', payload: {card: game.cards.hand.find(c => c.id === props.id)}})
                }
            }}
            onMouseDown={mouseDown}
            onMouseUp={mouseUp}
        >
            {!flipped && <img src={image} alt={`${Rank[props.rank]} of ${Suit[props.suit]}`} />}
            {flipped && <img src={redDeck} />}
            {!dragElem && !flipped &&
                <div id='info-popup'>
                    <div id='inner'>
                        <div id='card-name'>
                            {`${props.rank < 9 ? rankChips[Rank[props.rank] as keyof typeof rankChips] : Rank[props.rank]} of`}&nbsp;<div className={Suit[props.suit]}>{Suit[props.suit]}</div>
                        </div>
                        <div id='score-info'>
                            {debuffed ?
                                'Scores no chips and all abilities are disabled' :
                                <><div className='chip'>{`+${rankChips[Rank[props.rank] as keyof typeof rankChips]}`}</div>&nbsp;chips</>
                            }
                        </div>
                    </div>
                </div>
            }
            {submitted && scored && <div className='popup'>{`+${rankChips[Rank[props.rank] as keyof typeof rankChips]}`}</div>}
        </div>
    )
}