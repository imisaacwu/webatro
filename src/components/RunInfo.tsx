import { useContext, useEffect, useState } from 'react'
import { Blinds, handLevels, HandType } from '../Constants'
import { Blind } from './Blind'
import './RunInfo.css'
import { GameStateContext } from '../GameState'

type RunInfoProps = {
    setMenu: React.Dispatch<React.SetStateAction<boolean>>
}

export default function RunInfo(props: RunInfoProps) {
    const { state: game } = useContext(GameStateContext)
    const [ window, setWindow ] = useState<'poker-hands' | 'blinds' | 'vouchers'>('poker-hands')

    const hands = Object.keys(handLevels).filter(k => (
        isNaN(Number(k)) && !k.match('NONE') && (!k.match('FLUSH_FIVE|FLUSH_HOUSE|FIVE') || handLevels[k as keyof typeof handLevels].played > 0)
    ))

    useEffect(() => {
        Object.keys(handLevels).filter(k => isNaN(Number(k))).forEach(h => {
            if(handLevels[h as keyof typeof handLevels].played > 9) {
                document.getElementById(`freq-display-${h}`)?.classList.add('double')
            }
        })
    }, [handLevels])

    useEffect(() => {
        const arrow = document.getElementById('run-info-arrow')!
        const button = document.getElementById(window)!, rect = button.getBoundingClientRect()
        const left = button.offsetLeft + (rect.width - arrow.getBoundingClientRect().width) / 2
        arrow.style.left = `${left}px`
    }, [window])

    const levelDisplay = hands.map((h, i) => (
        <div id='hand-display' key={i}>
            <div id='level-outline'>
                <div id='level-display'>{`lvl.${handLevels[h as keyof typeof handLevels].level}`}</div>
            </div>
            <div id='hand-name' className='base'>{HandType[h as keyof typeof HandType]}</div>
            <div style={{'display': 'flex'}}>
                <div id='base-calc'>
                    <div id='chips' className='base'>{handLevels[h as keyof typeof handLevels].chips}</div>
                    <div id='X' className='base'>X</div>
                    <div id='mult' className='base'>{handLevels[h as keyof typeof handLevels].mult}</div>
                </div>
                <div id='hand-freq'>
                    #<div id={`freq-display-${h}`}>{handLevels[h as keyof typeof handLevels].played}</div>
                </div>
            </div>
        </div>
    ))

    return (
        <div id='run-info'>
            <div id='run-info-views'>
                <div id='run-info-arrow' className='arrow' />
                <div id='poker-hands' className='view-container'>
                    <div className='run-info-view' onClick={() => setWindow('poker-hands')}>Poker Hands</div>
                </div>
                <div id='blinds' className='view-container'>
                    <div className='run-info-view' onClick={() => setWindow('blinds')}>Blinds</div>
                </div>
                <div id='vouchers' className='view-container'>
                    <div className='run-info-view' onClick={() => setWindow('vouchers')}>Vouchers</div>
                </div>
            </div>
            <div id='run-info-area'>
                {window === 'poker-hands' &&
                    <div id='hand-levels'>
                        {levelDisplay}
                    </div>
                }
                {window === 'blinds' &&
                    <div id='blind-view'>
                        <Blind type='run-info' blind={Blinds[0]}/>
                        <Blind type='run-info' blind={Blinds[1]}/>
                        <Blind type='run-info' blind={game.blind.boss}/>
                    </div>
                }
            </div>
            <div id='run-info-back' onClick={() => props.setMenu(false)}>Back</div>
        </div>
    )
}
