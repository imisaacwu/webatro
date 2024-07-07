import stake_icon from '../assets/white_stake.webp'
import './Blind.css'
import { Blinds, BlindType } from './Constants'
import { useGameState } from './contexts/GameStateContext';
const icons: Record<string, { default: string }> = import.meta.glob('../assets/blinds/*.webp', { eager: true });

type BlindProps = {
    type: 'sidebar' | 'select'
    blind: BlindType
}

export const Blind = ({ type, blind }: BlindProps) => {
    const { state: game, dispatch: gameDispatch } = useGameState()

    const anteChips = game.reqBase;
    const blindMult = blind.mult;
    const req_score = (blindMult * anteChips).toLocaleString().length < 11 ? (blindMult * anteChips).toLocaleString() : (blindMult * anteChips).toExponential()
    const select = (game.currBlind === 'small' && Blinds.indexOf(blind) === 0) || (game.currBlind === 'big' && Blinds.indexOf(blind) === 1) || (game.currBlind === 'boss' && Blinds.indexOf(blind) > 1)

    return (
        <>
            {type === 'sidebar' && <>
                <div id='blind'>
                    <div id='blind-name' className='sidebar'>{blind.name}</div>
                    <div id='blind-info' className='sidebar'>
                        <div id='blind-bio'>{blind.descrip}</div>
                        <div id='blind-display'>
                            <img id='blind-icon' src={!icons[blind.img] ? '' : icons[blind.img].default} />
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
            {type === 'select' && <>
                <div id='outer' className={`${select}`}>
                    <div id='container'>
                        <div id='outline'>
                            <div id='blind-info' className='select'>
                                <div id={'select'} className={`${select}`} onClick={() => {if(select){gameDispatch({type: 'select'})}}}>{
                                    select ? 'Select' : ((game.currBlind === 'boss' && Blinds.indexOf(blind) < 2) || (game.currBlind === 'big' && Blinds.indexOf(blind) < 1)) ? 'Defeated' : 'Upcoming'
                                }</div>
                                <div id='blind-name' className='select'>
                                    <div id='blind-name-bkg'>
                                        {blind.name}
                                    </div>
                                </div>
                                <img id='blind-icon' className='select' src={!icons[blind.img] ? '' : icons[blind.img].default} />
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
        </>
    )
}
