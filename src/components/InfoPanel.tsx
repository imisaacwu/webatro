import { useState } from 'react'
import { useGameState } from './contexts/GameStateContext'
import './InfoPanel.css'
import RunInfo from './RunInfo'

export const InfoPanel = () => {
    const { state: game } = useGameState()
    const [ runMenu, setRunMenu ] = useState(false);

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
                        <div id='hands'>{game.hands}</div>
                    </div>
                    <div id='discards-box' className='box'>
                        Discards
                        <div id='discards'>{game.discards}</div>
                    </div>
                </div>
                <div id='money-box'>
                    <div id='money'>{`$${game.money}`}</div>
                </div>
                <div id='run-stats'>
                    <div id='ante-box' className='box'>
                        Ante
                        <div id='ante-display'>
                            <div id='ante'>{game.ante}</div>/&nbsp;8
                        </div>
                    </div>
                    <div id='round-box' className='box'>
                        Round
                        <div id='round'>{game.round}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
