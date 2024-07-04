import { useEffect, useState } from 'react'
import stake_icon from '../assets/white_stake.webp'
import './Round.css'
import { useCardState } from './CardStateContext'
import { useHandState } from './HandStateContext'

export const Round = () => {
    const { state: cards } = useCardState()
    const { state: hand } = useHandState()
    const [ score, setScore ] = useState(0)

    useEffect(() => {
        if(cards.submitted.length > 0) {
            console.log(hand.score)
            setScore(prev => prev + hand.score)
        }
    }, [cards.submitted])

    // useEffect(() => {
    //     if(hand > )
    // })

    return (
        <div id='round-score'>
            <div id='round-score-text'>Round<br/>score</div>
            <div id='score-display'>
                <img id='stake-icon' src={stake_icon} />
                <div id='score'>{score}</div>
            </div>
        </div>
    )
}
