import small_blind from "../assets/small_blind.webp"
import stake_icon from "../assets/white_stake.webp"
import "./Blind.css"

export const Blind = () => {
  return (
    <div id="blind">
        <div id="blind-name">Small Blind</div>
        <div id="blind-info">
            <div id="blind-bio"></div>
            <div id="blind-display">
                <img id="blind-icon" src={small_blind} />
                <div id="blind-status">
                    <div id="blind-score-text">Score at least</div>
                    <div id="req-display">
                        <img id="stake-icon" src={stake_icon} />
                        <div id="req-score">800</div>
                    </div>
                    <div id="reward-display">
                        Reward:
                        <div id="blind-reward">$$$</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
