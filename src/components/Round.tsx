import { useContext, useState } from 'react'
import stake_icon from '../assets/white_stake.webp'
import { GameStateContext } from '../GameState'
import './Round.css'
import { ScoreLog } from './ScoreLog'

export const Round = () => {
    const { state: game } = useContext(GameStateContext)
    const [ logMenu, setLogMenu ] = useState(false)

    const score = game.stats.score.toLocaleString().length > 9 ? game.stats.score.toExponential(2) : game.stats.score.toLocaleString()

    return (
        <div id='round-score'>
            <div id='round-score-text'>Round<br/>score</div>
            <div id='score-display' onClick={() => setLogMenu(true)}>
                <img id='stake-icon' src={stake_icon} />
                <div id='score'>{score}</div>
            </div>
            {logMenu && <ScoreLog setMenu={setLogMenu} />}
        </div>
    )
}
