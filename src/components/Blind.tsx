import stake_icon from '../assets/white_stake.webp'
import './Blind.css'
import { Blinds, BlindType, handLevels, HandType } from '../Constants'
import { useContext } from 'react';
import { GameStateContext } from '../GameState';
const icons: Record<string, { default: string }> = import.meta.glob('../assets/blinds/*.webp', { eager: true });

type BlindProps = {
    type: 'sidebar' | 'select' | 'post' | 'run-info'
    blind: BlindType
}

export const Blind = ({ type, blind }: BlindProps) => {
    const { state: game, dispatch } = useContext(GameStateContext)

    const anteChips = game.blind.base;
    const blindMult = blind.mult;
    const req_score = (blindMult * anteChips).toLocaleString().length < 11 ? (blindMult * anteChips).toLocaleString() : (blindMult * anteChips).toExponential()
    const select = (game.blind.curr === 'small' && Blinds.indexOf(blind) === 0) || (game.blind.curr === 'big' && Blinds.indexOf(blind) === 1) || (game.blind.curr === 'boss' && Blinds.indexOf(blind) > 1)
    const icon = !icons[blind.img] ? '' : icons[blind.img].default
    if(blind.name === 'The Ox') {
        blind.descrip = blind.descrip.replace('_', HandType[Object.entries(handLevels).find(h => h[1] === Object.entries(handLevels).reduce((most, h) => most = (most.played < h[1].played || (most.chips * most.mult < h[1].chips * h[1].mult) ? h[1] : most), handLevels.NONE))![0] as keyof typeof HandType])
    }

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
                                <div id='blind-select' className={`${select} ${type}`} onClick={() => {
                                    if(select && type === 'select'){
                                        dispatch({type: 'state', payload: {state: 'scoring'}})
                                        dispatch({type: 'draw', payload: {amount: game.stats.handSize}})
                                    }
                                }}>{
                                    select ? (type === 'select' ? 'Select' : 'Current') : ((game.blind.curr === 'boss' && Blinds.indexOf(blind) < 2) || (game.blind.curr === 'big' && Blinds.indexOf(blind) < 1)) ? 'Defeated' : 'Upcoming'
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
