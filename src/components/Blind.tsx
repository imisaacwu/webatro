import { useContext } from 'react'
import stake_icon from '../assets/white_stake.webp'
import { Blinds, BlindType, handLevels, HandType } from '../Constants'
import './Blind.css'
import { GameStateContext } from '../GameState'
const icons: Record<string, { default: string }> = import.meta.glob('../assets/blinds/*.webp', { eager: true })

type BlindProps = {
    type: 'sidebar' | 'select' | 'post' | 'run-info'
    blind: BlindType
}

export const Blind = ({ type, blind }: BlindProps) => {
    const { state: game, dispatch } = useContext(GameStateContext)
    const req = game.blind.base * blind.mult
    let req_display = req.toLocaleString()
    if(req_display.length > 11) { req_display = req.toExponential()}

    const isCurrent =
        (game.blind.curr === 'small' && Blinds.indexOf(blind) === 0) ||
        (game.blind.curr === 'big' && Blinds.indexOf(blind) === 1) ||
        (game.blind.curr === 'boss' && Blinds.indexOf(blind) > 1)

    const img = `../assets/blinds/${blind.img}.webp`
    const url = icons[img] ? icons[img].default : ''

    const mostPlayed = Object.entries(handLevels).reduce((most, hand) => (
        most = (most[1].played < hand[1].played || most[1].chips * most[1].mult < hand[1].chips * hand[1].mult) ? hand : most
    ), Object.entries(handLevels)[12])

    return (
        <>
            {type === 'sidebar' && <>
                <div id='blind'>
                    <div id='blind-name' className='sidebar'>{blind.name}</div>
                    <div id='blind-info' className='sidebar'>
                        <div id='blind-bio'>{
                            blind.name === 'The Ox' ?
                            blind.descrip.replace('_', HandType[mostPlayed[0] as keyof typeof HandType]) :
                            blind.descrip
                        }</div>
                        <div id='blind-display'>
                            <img id='blind-icon' src={url} />
                            <div id='blind-status'>
                                <div id='blind-score-text'>Score at least</div>
                                <div id='req-display'>
                                    <img id='stake-icon' src={stake_icon} />
                                    <div id='req-score'>{req_display}</div>
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
                <div id='blind-outer' className={`${isCurrent} ${type}`}>
                    <div id='blind-container'>
                        <div id='blind-outline'>
                            <div id='blind-info' className={`select ${type}`}>
                                <div id='blind-select' className={`${isCurrent} ${type}`} onClick={() => {
                                    if(isCurrent && type === 'select'){
                                        dispatch({type: 'state', payload: {state: 'scoring'}})
                                        let draw = game.stats.handSize
                                        if(game.blind.curr === 'boss' && game.blind.boss.name === 'The Manacle') {
                                            dispatch({type: 'stat', payload: {stat: 'handSize'}})
                                            draw--
                                        }
                                        dispatch({type: 'draw', payload: {amount: draw}})
                                    }
                                }}>{
                                    isCurrent ? (type === 'select' ? 'Select' : 'Current') : ((game.blind.curr === 'boss' && Blinds.indexOf(blind) < 2) || (game.blind.curr === 'big' && Blinds.indexOf(blind) < 1)) ? 'Defeated' : 'Upcoming'
                                }</div>
                                <div id='blind-name' className='select'>
                                    <div id='blind-name-bkg'>
                                        {blind.name}
                                    </div>
                                </div>
                                <img id='blind-icon' className='select' src={url} />
                                <div id='blind-bio' className='select'>{blind.descrip}</div>
                                <div id='blind-status' className='select'>
                                    <div id='blind-score-text'>Score at least</div>
                                    <div id='req-display'>
                                        <img id='stake-icon' src={stake_icon} />
                                        <div id='req-score'>{req_display}</div>
                                    </div>
                                    <div id='reward-display'>
                                        Reward:
                                        <div id='blind-reward'>{'$'.repeat(blind.reward)+'+'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {!blind.name.match(/(Small|Big).*/) &&
                            <div id='boss-ante-label'>
                                <div id='up-ante-label' className='orange'>Up the Ante</div>
                                <div>Raise all Blinds</div>
                                <div>Refresh Blinds</div>
                            </div>
                        }
                    </div>
                </div>
            </>}
            {type === 'post' && <>
                <div id='post-blind-info'>
                    <img id='blind-icon' className='post' src={url} />
                    <div id='post-score'>
                        <div id='blind-score-text' className='post'>Score at least</div>
                        <div id='req-display'>
                            <img id='stake-icon' src={stake_icon} />
                            <div id='req-score' className='post'>{req_display}</div>
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
