import './Card.css'

export enum Suit { Spades, Hearts, Clubs, Diamonds }
export enum Rank { Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten, Jack, Queen, King, Ace }
export enum Edition { Base, Foil, Holographic, Negative, Polychrome }
export enum Enhancement { Bonus, Glass, Gold, Lucky, Mult, None, Steel, Stone, Wild }
export enum Seal { Blue, Gold, None, Purple, Red }

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
    suit: Suit
    rank: Rank
    edition?: Edition
    enhancement?: Enhancement
    seal?: Seal
}

export const Card = (props: CardProps) => {
    const { edition = Edition.Base, enhancement = Enhancement.None, seal = Seal.None } = props

    return (
        <div className='card'>
            {edition !== Edition.Base ? `${Edition[edition]} ` : ``}{enhancement !== Enhancement.None ? `${Enhancement[enhancement]} ` : ``}{seal !== Seal.None ? `${Seal[seal]} seal `: ``}{((chipMap.get(props.rank) ?? -1) < 10 ? chipMap.get(props.rank) : Rank[props.rank].slice(0,1))}{suitMap.get(props.suit)}
        </div>
    )
}

//{`${Rank[props.rank]} of ${Suit[props.suit]}`}