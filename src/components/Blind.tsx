import small_blind from '../assets/small_blind.webp'
import stake_icon from '../assets/white_stake.webp'
import './Blind.css'
import { BlindNames, Blinds } from './Constants'

type BlindProps = {
    name: BlindNames,
    score: number,
    reward: number
}

export const Blind = (props: BlindProps) => {
  return (
    <div id='blind'>
        <div id='blind-name'>{Blinds[props.name]}</div>
        <div id='blind-info'>
            <div id='blind-bio'></div>
            <div id='blind-display'>
                <img id='blind-icon' src={small_blind} />
                <div id='blind-status'>
                    <div id='blind-score-text'>Score at least</div>
                    <div id='req-display'>
                        <img id='stake-icon' src={stake_icon} />
                        <div id='req-score'>{props.score}</div>
                    </div>
                    <div id='reward-display'>
                        Reward:
                        <div id='blind-reward'>{'$'.repeat(props.reward)}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
