import { useContext } from 'react'
import { handLevels, HandType, Rank } from '../Constants'
import { GameStateContext } from '../GameState'
import './Calculator.css'

export const Calculator = () => {
    const { state: game } = useContext(GameStateContext)
    const handStats = handLevels[game.active.name], selected = game.cards.selected
    const anyFlipped = game.cards.submitted.length === 0 && !(selected.every(c => !c.flipped))
    
    let handName: string = HandType[game.active.name]
    if(handName === 'STRAIGHT_FLUSH' && [Rank.Ace, Rank.King].every(r => selected.some(c => c.rank == r))) {
        handName = 'Royal Flush'
    }
    if(anyFlipped) { handName = '???' }

    return (
        <div id='hand-info'>
            <div id='hand-type'>
                <div id='hand-name'>{handName}</div>
                <div id='hand-level'>{anyFlipped ? `lvl.?` : game.active.name !== 'NONE' ? `lvl.${handStats.level}` : ''}</div>
            </div>
            <div id='calculator'>
                <div id='chips'>{anyFlipped ? '?' : game.active.score.chips}</div>
                <div id='X'>X</div>
                <div id='mult'>{anyFlipped ? '?' : game.active.score.mult}</div>
            </div>
        </div>
    )
}
