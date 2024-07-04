import { useEffect } from 'react'
import './Card.css'
import { Edition, Enhancement, Rank, Seal, Suit, rankChips, suitMap } from './Constants'

type CardProps = {
    id: number
    suit: Suit
    rank: Rank
    edition?: Edition
    enhancement?: Enhancement
    seal?: Seal
    handleClick: (e: React.MouseEvent, id: number) => void
}

export const Card = (props: CardProps) => {
    const { edition = Edition.Base, enhancement = Enhancement.None, seal = Seal.None } = props

    useEffect(() => {
        let card = document.getElementById(`card ${props.id}`) as HTMLElement
        if(card.classList.contains('submitted')) {
            let popup = document.createElement('div')
            card.appendChild(popup)
            popup.classList.add('popup')
            popup.textContent = `+${rankChips[Rank[props.rank] as keyof typeof rankChips]}`
        }
    }, [document.getElementById(`card ${props.id}`)?.classList])

    return (
        <div id={`card ${props.id}`} className={`card ${Suit[props.suit]}`} onClick={(e) => props.handleClick(e, props.id)}>
            {edition !== Edition.Base ? `${Edition[edition]} ` : ``}{enhancement !== Enhancement.None ? `${Enhancement[enhancement]} ` : ``}{seal !== Seal.None ? `${Seal[seal]} seal `: ``}{(rankChips[Rank[props.rank] as keyof typeof rankChips] < 10 ? rankChips[Rank[props.rank] as keyof typeof rankChips] : Rank[props.rank].slice(0,1))}{suitMap.get(props.suit)}
        </div>
    )
}