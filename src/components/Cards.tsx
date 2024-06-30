import { Component, ReactElement } from 'react'
import { Deck } from './Deck'
import Hand from './Hand'
import { Card } from './Card'
import { Suit, Rank } from './CardTypes'

type CardsProps = {
    handSize: number
}

type CardsState = {
    deck: ReactElement[]
    hand: ReactElement[]
    selected: ReactElement[]
}

export class Cards extends Component<CardsProps, CardsState> {
    constructor(props: CardsProps) {
        super(props)

        this.state = {
            deck: [],
            hand: [],
            selected: []
        }
    }

    componentDidMount() {
        Object.keys(Suit)
            .filter(key => isNaN(Number(key)))
            .forEach(suit => {
                Object.keys(Rank)
                    .filter(key => isNaN(Number(key)))
                    .forEach(rank => {
                        this.setState(prev => ({
                            deck: [...prev.deck,
                                <Card
                                    key={prev.deck.length}
                                    id={prev.deck.length}
                                    suit={Suit[suit as keyof typeof Suit]}
                                    rank={Rank[rank as keyof typeof Rank]}
                                    handleClick={this.handleClick}
                                />
                            ]
                        }))
                    })
            })
        this.setState(prev => ({
            deck: this.shuffle(prev.deck)
        }), () => {
            this.draw(this.props.handSize)
        })

        document.addEventListener('keydown', this.handleKeys)
    }

    handleClick = (e: React.MouseEvent, id: number) => {
        const div = e.currentTarget, card = this.state.hand.find(card => card.props.id === id)
        if(card) {
            if(!div.getAttribute('class')!.includes('selected') && this.state.selected.length < 5) {
                div.setAttribute('class', div.getAttribute('class') + ' selected')
                this.setState(prev => ({
                    selected: [...prev.selected, card]
                }), () => console.log(this.state.selected))
            } else {
                div.setAttribute('class', div.getAttribute('class')!.replace(' selected', ''))
                this.setState((prev) => ({
                    selected: prev.selected.filter(c => c.props.id !== id)
                }), () => console.log(this.state.selected))
            }
        } else { throw Error(`no find`) }
    }

    shuffle = (deck: ReactElement[]) => {
        let arr = [...deck], i = deck.length
        while(i > 0) {
            let rand = Math.floor(Math.random() * i--);
            [arr[i], arr[rand]] = [arr[rand], arr[i]]
        }
        return arr;
    }

    draw = (n: number) => {
        this.setState(prev => ({
            hand: [...prev.hand, ...prev.deck.slice(-n)],
            deck: prev.deck.slice(0, -n)
        }))
    }

    handleKeys = (e: KeyboardEvent) => {
        if(e.key === 'Escape') {
            this.setState({
                selected: []
            })
            this.state.hand.forEach(card => {
                let c = document.getElementById(`card ${card.props.id}`)
                c!.setAttribute('class', c!.getAttribute('class')!.replace(' selected', ''))
            })
        }
    }

    render() {
        return (
            <div id='bot'>
                <Hand
                    hand={this.state.hand}
                    handSize={this.props.handSize}
                    selected={this.state.selected.length > 0}
                    submitted={false}
                />
                <Deck num={this.state.deck.length} />
            </div>
        )
    }
}

export default Cards