import { useContext } from 'react'
import './Options.css'
import { GameStateContext } from '../GameState'

type OptionsProps = {
    setMenu: React.Dispatch<React.SetStateAction<boolean>>
}

export const Options = (props: OptionsProps) => {
    const { state: game, dispatch } = useContext(GameStateContext)

    return (
        <div id='options-outline'>
            <div id='options-menu'>
                <div id='seed-menu'>
                    <div>Seed:</div>
                    <div id='seed'>{game.seed}</div>
                    <div id='copy-seed' onClick={() => {
                        navigator.clipboard.writeText(game.seed)
                    }}>Copy</div>
                </div>
                <div id='main-menu' className='options-button' onClick={() => {
                    dispatch({type: 'init', payload: {deck: game.stats.deck}})
                    dispatch({type: 'state', payload: {state: 'blind-select'}})
                    props.setMenu(false)
                }}>Main Menu</div>
                <div id='main-menu' className='options-button' onClick={() => {
                    dispatch({type: 'state', payload: {state: 'main-menu'}})
                }}>Main Menu</div>
                <div id='options-back' onClick={() => props.setMenu(false)}>Back</div>
            </div>
        </div>
    )
}