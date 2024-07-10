import './Card.css'
import { Edition, Enhancement, Rank, Seal, Suit, rankChips } from '../Constants'
import { useContext, useRef } from 'react';
import { GameStateContext } from '../GameState';
const images: Record<string, { default: string }> = import.meta.glob('../assets/cards/*.webp', { eager: true });

type CardProps = {
    id: number
    suit: Suit
    rank: Rank
    edition?: Edition
    enhancement?: Enhancement
    seal?: Seal
    deckView?: boolean
}

const getImagePath = (suit: Suit, rank: Rank) => {
    const fileName = `${Suit[suit].charAt(0).toLowerCase()}${rankChips[Rank[rank] as keyof typeof rankChips] < 10 ? rankChips[Rank[rank] as keyof typeof rankChips] : Rank[rank].charAt(0).toLowerCase()}.webp`;
    const imagePath = `../assets/cards/${fileName}`;
  
    const module = images[imagePath]
    return module ? module.default : null
};

export const Card = (props: CardProps) => {
    const { deckView = false } = props;
    const { state: game, dispatch } = useContext(GameStateContext)
    const gameRef = useRef(game);
    gameRef.current = game;

    const image = getImagePath(props.suit, props.rank);
    if(!image) { throw new Error(`no such image ${Suit[props.suit].charAt(0).toLowerCase()}${rankChips[Rank[props.rank] as keyof typeof rankChips] < 10 ? rankChips[Rank[props.rank] as keyof typeof rankChips] : Rank[props.rank].charAt(0).toLowerCase()}.webp`) }

    return (
        <div id={`card ${props.id}`} className={`card ${Suit[props.suit]} ${deckView ? 'deck-view' : ''}`} onClick={() => {
            dispatch({type: 'select', payload: {card: gameRef.current.cards.hand.find(c => c.props.id === props.id)}})
        }}>
            <img src={image} alt={`${Rank[props.rank]} of ${Suit[props.suit]}`}/>
            {/* {document.getElementById(`card ${props.id}`)?.classList.contains('submitted') && <div className='popup'></div>} */}
        </div>
    )
}