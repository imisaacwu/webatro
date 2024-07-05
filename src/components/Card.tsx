import { useEffect } from 'react'
import './Card.css'
import { Edition, Enhancement, Rank, Seal, Suit, rankChips } from './Constants'
const images: Record<string, { default: string }> = import.meta.glob('../assets/cards/*.webp', { eager: true });

type CardProps = {
    id: number
    suit: Suit
    rank: Rank
    edition?: Edition
    enhancement?: Enhancement
    seal?: Seal
    handleClick: (e: React.MouseEvent, id: number) => void
}

const getImagePath = (suit: Suit, rank: Rank) => {
    const fileName = `${Suit[suit].charAt(0).toLowerCase()}${rankChips[Rank[rank] as keyof typeof rankChips] < 10 ? rankChips[Rank[rank] as keyof typeof rankChips] : Rank[rank].charAt(0).toLowerCase()}.webp`;
    const imagePath = `../assets/cards/${fileName}`;
  
    const module = images[imagePath]
    return module ? module.default : null
};

export const Card = (props: CardProps) => {
    useEffect(() => {
        let card = document.getElementById(`card ${props.id}`) as HTMLElement
        if(card?.classList.contains('submitted')) {
            let popup = document.createElement('div')
            card.appendChild(popup)
            popup.classList.add('popup')
            popup.textContent = `+${rankChips[Rank[props.rank] as keyof typeof rankChips]}`
        }
    }, [document.getElementById(`card ${props.id}`)?.classList])

    const image = getImagePath(props.suit, props.rank);
    if(!image) { throw new Error(`no such image ${Suit[props.suit].charAt(0).toLowerCase()}${rankChips[Rank[props.rank] as keyof typeof rankChips] < 10 ? rankChips[Rank[props.rank] as keyof typeof rankChips] : Rank[props.rank].charAt(0).toLowerCase()}.webp`) }

    return (
        <div id={`card ${props.id}`} className={`card ${Suit[props.suit]}`} onClick={(e) => props.handleClick(e, props.id)}>
            <img src={image} alt={`${Rank[props.rank]} of ${Suit[props.suit]}`}/>
        </div>
    )
}