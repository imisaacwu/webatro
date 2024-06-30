import './Card.css'
import { Edition, Enhancement, Rank, Seal, Suit } from './CardTypes'

const chipMap = new Map([
    [Rank.Two, 2],
    [Rank.Three, 3],
    [Rank.Four, 4],
    [Rank.Five, 5],
    [Rank.Six, 6],
    [Rank.Seven, 7],
    [Rank.Eight, 8],
    [Rank.Nine, 9],
    [Rank.Ten, 10],
    [Rank.Jack, 10],
    [Rank.Queen, 10],
    [Rank.King, 10],
    [Rank.Ace, 11]  
])

const suitMap = new Map([
    [Suit.Spades, '♠'],
    [Suit.Hearts, '♥'],
    [Suit.Clubs, '♣'],
    [Suit.Diamonds, '♦']
])

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