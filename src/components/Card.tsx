import './Card.css'
import { Edition, Enhancement, Rank, Seal, Suit, chipMap, suitMap } from './Constants'

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

    return (
        <div id={`card ${props.id}`} className={`card ${Suit[props.suit]}`} onClick={(e) => props.handleClick(e, props.id)}>
            {edition !== Edition.Base ? `${Edition[edition]} ` : ``}{enhancement !== Enhancement.None ? `${Enhancement[enhancement]} ` : ``}{seal !== Seal.None ? `${Seal[seal]} seal `: ``}{((chipMap.get(props.rank) ?? -1) < 10 ? chipMap.get(props.rank) : Rank[props.rank].slice(0,1))}{suitMap.get(props.suit)}
        </div>
    )
}