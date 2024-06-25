import stake_icon from '../assets/white_stake.webp'
import './Round.css'

export const Round = () => {
  return (
    <div id='round-score'>
        <div id='round-score-text'>Round<br/>score</div>
        <div id='score-display'>
        <img id='stake-icon' src={stake_icon} />
        <div id='score'>0</div>
        </div>
    </div>
  )
}
