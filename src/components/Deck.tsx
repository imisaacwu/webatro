import "./Deck.css"
import { Card, Rank, Suit } from './Card.ts';

const makeDeck = (deck: string) => {
    const arr = [];
    if(["red"].includes(deck)) {
        for(const suit of [Suit.Spades, Suit.Hearts, Suit.Clubs, Suit.Diamonds]) {
            for(const rank of [Rank.Ace, Rank.Two, Rank.Three, Rank.Four, Rank.Five, Rank.Six, Rank.Seven, Rank.Eight, Rank.Nine, Rank.Ten, Rank.Jack, Rank.Queen, Rank.King]) {
                arr.push(new Card(suit, rank));
            }
        }
    }
    return arr;
}

const shuffle = (deck: Card[]) => {
    let i = deck.length;
    while(i > 0) {
        let rand = Math.floor(Math.random() * i);
        i--;
        [deck[i], deck[rand]] = [deck[rand], deck[i]];
    }
}

export default function Deck({deck}: {deck: string}) {
    const cards: Card[] = makeDeck(deck);
    shuffle(cards);

    const pop = (n: number) => cards.slice(-n);

    return (
        <div id="deck" className="card-container">
            <div id="deck-area" className="card-area"></div>
            <div id="deck-label" className="counter">{cards.length}/52</div>
        </div>
    )
}