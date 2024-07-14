import './Calculator.css'
import { handLevels, HandType, Rank } from '../Constants'
import { useContext } from 'react'
import { GameStateContext } from '../GameState'

export const Calculator = () => {
    const { state: game } = useContext(GameStateContext)
    const handStats = handLevels[game.active.name]
    const flip = game.cards.submitted.length === 0 && !(game.cards.selected.every(c => !c.flipped))

    return (
        <div id='hand-info'>
            <div id='hand-type'>
                <div id='hand-name'>{flip ? '???' :
                    (game.active.name === 'STRAIGHT_FLUSH' &&
                        game.cards.selected.find(c => c.rank === Rank.Ace) !== undefined &&
                        game.cards.selected.find(c => c.rank === Rank.King) !== undefined) ? 'Royal Flush' :
                    HandType[game.active.name]}</div>
                <div id='hand-level'>{flip ? `lvl.?` : game.active.name !== 'NONE' ? `lvl.${handStats.level}` : ''}</div>
            </div>
            <div id='calculator'>
                <div id='chips'>{flip ? '?' : game.active.score.chips}</div>
                <div id='X'>X</div>
                <div id='mult'>{flip ? '?' : game.active.score.mult}</div>
            </div>
        </div>
    )
}
