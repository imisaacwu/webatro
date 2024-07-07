import stake_icon from '../assets/white_stake.webp'
import './Blind.css'
import { Blinds, BlindType } from './Constants'
import { useGameState } from './contexts/GameStateContext';
const icons: Record<string, { default: string }> = import.meta.glob('../assets/blinds/*.webp', { eager: true });

type BlindProps = {
    type: 'sidebar' | 'select' | 'post' | 'run-info'
    blind: BlindType
}

export const Blind = ({ type, blind }: BlindProps) => {
    const { state: game, dispatch: gameDispatch } = useGameState()

    const anteChips = game.reqBase;
    const blindMult = blind.mult;
    const req_score = (blindMult * anteChips).toLocaleString().length < 11 ? (blindMult * anteChips).toLocaleString() : (blindMult * anteChips).toExponential()
    const select = (game.currBlind === 'small' && Blinds.indexOf(blind) === 0) || (game.currBlind === 'big' && Blinds.indexOf(blind) === 1) || (game.currBlind === 'boss' && Blinds.indexOf(blind) > 1)
    const icon = !icons[blind.img] ? '' : icons[blind.img].default

    return (
        <>
            {type === 'sidebar' && <>
                <div id='blind'>
                    <div id='blind-name' className='sidebar'>{blind.name}</div>
                    <div id='blind-info' className='sidebar'>
                        <div id='blind-bio'>{blind.descrip}</div>
                        <div id='blind-display'>
                            <img id='blind-icon' src={icon} />
                            <div id='blind-status'>
                                <div id='blind-score-text'>Score at least</div>
                                <div id='req-display'>
                                    <img id='stake-icon' src={stake_icon} />
                                    <div id='req-score'>{req_score}</div>
                                </div>
                                <div id='reward-display'>
                                    Reward:
                                    <div id='blind-reward'>{'$'.repeat(blind.reward)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>}
            {(type === 'select' || type === 'run-info') && <>
                <div id='blind-outer' className={`${select} ${type}`}>
                    <div id='blind-container'>
                        <div id='blind-outline'>
                            <div id='blind-info' className={`select ${type}`}>
                                <div id='blind-select' className={`${select} ${type}`} onClick={() => {if(select && type === 'select'){gameDispatch({type: 'select'})}}}>{
                                    select ? (type === 'select' ? 'Select' : 'Current') : ((game.currBlind === 'boss' && Blinds.indexOf(blind) < 2) || (game.currBlind === 'big' && Blinds.indexOf(blind) < 1)) ? 'Defeated' : 'Upcoming'
                                }</div>
                                <div id='blind-name' className='select'>
                                    <div id='blind-name-bkg'>
                                        {blind.name}
                                    </div>
                                </div>
                                <img id='blind-icon' className='select' src={icon} />
                                <div id='blind-bio' className='select'>{blind.descrip}</div>
                                <div id='blind-status' className='select'>
                                    <div id='blind-score-text'>Score at least</div>
                                    <div id='req-display'>
                                        <img id='stake-icon' src={stake_icon} />
                                        <div id='req-score'>{req_score}</div>
                                    </div>
                                    <div id='reward-display'>
                                        Reward:
                                        <div id='blind-reward'>{'$'.repeat(blind.reward)+'+'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>}
            {type === 'post' && <>
                <div id='post-blind-info'>
                    <img id='blind-icon' className='post' src={icon} />
                    <div id='post-score'>
                        <div id='blind-score-text' className='post'>Score at least</div>
                        <div id='req-display'>
                            <img id='stake-icon' src={stake_icon} />
                            <div id='req-score' className='post'>{req_score}</div>
                        </div>
                    </div>
                    <div id='blind-reward' className='post'>
                        {'$'.repeat(blind.reward)}
                    </div>
                </div>
            </>}
        </>
    )
}
