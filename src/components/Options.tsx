import './Options.css'
import { seed } from '../GameState'

type OptionsProps = {
    setMenu: React.Dispatch<React.SetStateAction<boolean>>
}

export const Options = (props: OptionsProps) => {
    return (
        <div id='options-outline'>
            <div id='options-menu'>
                <div id='seed-menu'>
                    <div>Seed:</div>
                    <div id='seed'>{seed}</div>
                    <div id='copy-seed' onClick={() => {
                        navigator.clipboard.writeText(seed)
                    }}>Copy</div>
                </div>
                <div id='new-run' className='options-button'>New Run</div>
                <div id='options-back' onClick={() => props.setMenu(false)}>Back</div>
            </div>
        </div>
    )
}