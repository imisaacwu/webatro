import './Calculator.css'
import { useHandState } from './HandStateContext'
import { HandType, Rank, rankChips } from './Constants'
import { useCardState } from './CardStateContext'

export const Calculator = () => {
    const { state: cards } = useCardState()
    const { state: hand } = useHandState()

    return (
        <div id='hand-info'>
            <div id='hand-type'>
                <div id='hand-name'>{HandType[hand.hand.name]}</div>
                <div id='hand-level'>{hand.hand.name !== 'NONE' ? `lvl.${hand.hand.level.level}` : ''}</div>
            </div>
            <div id='calculator'>
                <div id='chips'>{hand.hand.level.chips + (cards.submitted.length > 0 ? cards.submitted.reduce((t, c) => t += rankChips[Rank[c.props.rank] as keyof typeof rankChips], 0) : 0)}</div>
                <div id='X'>X</div>
                <div id='mult'>{hand.hand.level.mult}</div>
            </div>
        </div>
    )
}
