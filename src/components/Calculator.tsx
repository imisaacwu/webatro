import './Calculator.css'
import { handLevels, HandType } from '../Constants'
import { useContext } from 'react'
import { GameStateContext } from '../GameState'

export const Calculator = () => {
    const { state: game } = useContext(GameStateContext)
    const handStats = handLevels[game.active.name]

    return (
        <div id='hand-info'>
            <div id='hand-type'>
                <div id='hand-name'>{HandType[game.active.name]}</div>
                <div id='hand-level'>{game.active.name !== 'NONE' ? `lvl.${handStats.level}` : ''}</div>
            </div>
            <div id='calculator'>
                <div id='chips'>{game.active.score.chips}</div>
                <div id='X'>X</div>
                <div id='mult'>{game.active.score.mult}</div>
            </div>
        </div>
    )
}
