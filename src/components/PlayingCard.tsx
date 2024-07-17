import { MouseEventHandler, useContext } from "react";
import { Rank, rankChips, Suit } from "../Constants";
import { Card } from "./Card";
import { PlayingCardInfo } from "./PlayingCardInfo";
import { GameStateContext } from "../GameState";
const images: Record<string, { default: string }> = import.meta.glob('../assets/cards/*.webp', { eager: true })

const getImage = (suit: Suit, rank: Rank) => {
    const shortSuit = Suit[suit].charAt(0).toLowerCase()
    const shortRank = rank < 8 ? rankChips[rank] : Rank[rank].charAt(0).toLowerCase()
    const url = `../assets/cards/${shortSuit}${shortRank}.webp`
    const module = images[url]
    if(!module) { throw new Error(`no such image ${url}`) }
    return module.default
}

export const PlayingCard = ({suit, rank, mode = 'standard', scored = true, ...props}: PlayingCardInfo) => {
    const { state: game, dispatch } = useContext(GameStateContext)

    const handleClick: MouseEventHandler = () => {
        const card = game.cards.selected.find(c => c.id === props.id)!
        if((mode === 'standard' && game.cards.selected.length < 5) || game.cards.selected.includes(card)) {
            dispatch({type: 'select', payload: {card: card}})
        }
    }

    const cardName = `${rank < 9 ? rankChips[rank] : Rank[rank]} of ${Suit[suit]}`
    
    return (
        <Card
            image={getImage(suit, rank)}
            onClick={handleClick}
            {...props}
        >
            <div id='playing-card-popup'>
                <div id='playing-card-popup-inner'>
                    <div id='playing-card-name'>
                        {cardName}
                    </div>
                    <div id='playing-card-score'>
                        {props.debuffed ?
                            'Scores no chips and all abilities are disabled' :
                            <>
                                <div className='blue'>
                                    {`+${rankChips[rank]}`}
                                </div>
                                {' chips'}
                            </>
                        }
                    </div>
                </div>
            </div>
            {props.submitted && scored && !props.debuffed &&
                <div id='playing-card-scored-popup'>
                    {`+${rankChips[rank]}`}
                </div>
            }
            <div id='playing-card-scored-popup'></div>
        </Card>
    )
}