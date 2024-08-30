import { useState } from 'react'
import logo from '../assets/logo.png'
// import ace from '../assets/cards/SA.webp'
// import cardBack from '../assets/cards/modifiers/enhancements/Base.png'
import './MainMenu.css'
import { PlayMenu } from './PlayMenu'

export const MainMenu = () => {
    const [ playMenu, setPlayMenu ] = useState(false)

    return (
        <div id='main-menu'>
            <img id='logo' src={logo} />
            {/* <div id='main-menu-ace'>
                <img id='ace-bkg' src={cardBack} />
                <img id='ace' src={ace} />
            </div> */}
            <div id='main-menu-buttons'>
                <div id='play' onClick={() => setPlayMenu(true)}>PLAY</div>
            </div>
            {playMenu && <PlayMenu setMenu={setPlayMenu} />}
        </div>
    )
}