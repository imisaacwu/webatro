import './Deck.css'
import { Card, Rank, Suit } from './Card.tsx'
import { Component } from 'react'

export enum DeckType {
    Abandoned = 'abandoned',
    Anaglyph = 'anaglyph',
    Black = 'black',
    Blue = 'blue',
    Challenge = 'challenge',
    Checkered = 'checkered',
    Erratic = 'erratic',
    Ghost = 'ghost',
    Green = 'green',
    Magic = 'magic',
    Nebula = 'nebula',
    Painted = 'painted',
    Plasma = 'plasma',
    Red = 'red',
    Yellow = 'yellow',
    Zodiac = 'zodiac'
}

type DeckProps = {
    deck: DeckType
}

type DeckState = {
    deck: typeof Card[],      // Deck (added cards)
    currDeck: typeof Card[],  // Deck for each round, resets after each round
}

class Deck extends Component<DeckProps, DeckState> {
    arr: JSX.Element[]
    constructor(props: DeckProps) {
        super(props)

        this.arr = []
        if([DeckType.Red].includes(this.props.deck)) {
            for(const suit of [Suit.Spades, Suit.Hearts, Suit.Clubs, Suit.Diamonds]) {
                for(const rank of [Rank.Ace, Rank.Two, Rank.Three, Rank.Four, Rank.Five, Rank.Six, Rank.Seven, Rank.Eight, Rank.Nine, Rank.Ten, Rank.Jack, Rank.Queen, Rank.King]) {
                    this.arr.push(<Card suit={suit} rank={rank} />)
                }
            }
        }

        this.shuffle(this.arr)

        console.log('deck initialized')
    }

    // componentDidMount(): void {
    //     this.setState({
    //         deck: this.arr,
    //         currDeck: this.arr
    //     })
    // }

    render() {
        return (
            <>
                {/* {this.arr} */}
            </>
            // <div id='deck' className='card-container'>
            //     <div id='deck-area' className='card-area'></div>
            //     <div id='deck-label' className='counter'>52/52</div>
            // </div>
        )
    }

    // draw = (n: number) => {
        // this.setState({
        //     currDeck: this.state.currDeck.slice(0, -n)
        // })
        // return this.state.deck.slice(-n)
    // }   

    shuffle = (deck: JSX.Element[]) => {
        let i = deck.length
        while(i > 0) {
            let rand = Math.floor(Math.random() * i--);
            [deck[i], deck[rand]] = [deck[rand], deck[i]]
        }
    }
}

export default Deck