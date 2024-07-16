import { useContext, useState } from 'react'
import './InfoPanel.css'
import RunInfo from './RunInfo'
import { GameStateContext } from '../GameState'

export const InfoPanel = () => {
    const { state: game } = useContext(GameStateContext)
    const [ runMenu, setRunMenu ] = useState(false)

    return (
        <div id='info'>
            <div id='buttons'>
                <div id='run-info' onClick={() => setRunMenu(true)}><b style={{fontSize: '36px'}}>Run</b><br />Info</div>
                {runMenu && <RunInfo setMenu={setRunMenu} />}
                <div id='options'>Options</div>
            </div>
            <div id='stats'>
                <div id='hands-discards'>
                    <div id='hands-box' className='box'>
                        Hands
                        <div id='hands'>{game.stats.hands}</div>
                    </div>
                    <div id='discards-box' className='box'>
                        Discards
                        <div id='discards'>{game.stats.discards}</div>
                    </div>
                </div>
                <div id='money-box'>
                    <div id='money'>{`$${game.stats.money}`}</div>
                </div>
                <div id='run-stats'>
                    <div id='ante-box' className='box'>
                        Ante
                        <div id='ante-display'>
                            <div id='ante'>{game.stats.ante}</div>/&nbsp;8
                        </div>
                    </div>
                    <div id='round-box' className='box'>
                        Round
                        <div id='round'>{game.stats.round}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
