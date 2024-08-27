import { useState } from 'react'
import logo from '../assets/logo.png'
import './MainMenu.css'
import { PlayMenu } from './PlayMenu'

export const MainMenu = () => {
    const [ playMenu, setPlayMenu ] = useState(false)

    return (
        <div id='main-menu'>
            <img id='logo' src={logo} />
            <div id='main-menu-buttons'>
                <div id='play' onClick={() => setPlayMenu(true)}>PLAY</div>
            </div>
            {playMenu && <PlayMenu setMenu={setPlayMenu} />}
        </div>
    )
}