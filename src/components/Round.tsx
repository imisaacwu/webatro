import { useContext } from 'react'
import stake_icon from '../assets/white_stake.webp'
import { GameStateContext } from '../GameState'
import './Round.css'

export const Round = () => {
    const { state: game } = useContext(GameStateContext)
    return (
        <div id='round-score'>
            <div id='round-score-text'>Round<br/>score</div>
            <div id='score-display'>
                <img id='stake-icon' src={stake_icon} />
                <div id='score'>{game.stats.score}</div>
            </div>
        </div>
    )
}
