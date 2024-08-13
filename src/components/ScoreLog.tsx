import { useContext } from "react"
import { GameStateContext } from "../GameState"
import './ScoreLog.css'

type ScoreLogProps = {
    setMenu: React.Dispatch<React.SetStateAction<boolean>>
}

export const ScoreLog = (props: ScoreLogProps) => {
    const { state: game } = useContext(GameStateContext)

    const chipFormat = (chips: number | undefined, mult: number | undefined, mult_type: string | undefined) => {
        if(chips !== undefined) {
            if(mult !== undefined && mult_type === undefined) { return <td className='blue' style={{fontSize: '24px'}}>{chips}</td>}
            return <td className='blue'>{`+${chips}`}</td>
        }
        return <td />
    }

    const multFormat = (mult: number | undefined, mult_type: string | undefined) => {
        if(mult !== undefined) {
            if(mult < 0) { return <td className='red'>{mult}</td> }
            if(mult_type === undefined) { return <td className='red' style={{fontSize: '24px'}}>{mult}</td>}
            if(mult_type === '+') { return <td className='red'>{`+${mult}`}</td>}
            return <td className='red-invert'>{`X${mult}`}</td>
        }
        return <td />
    }

    return (
        <div id='score-log-outline'>
            <div id='score-log'>
                <table style={{width: '100%'}}>
                    <tr id='headings'>
                        <th style={{width: '60%'}}>Name</th>
                        <th>Chips</th>
                        <th>Mult</th>
                    </tr>
                    {game.scoreLog.map((entry, i) => (
                        entry.chips === undefined && entry.mult === undefined ?
                            <tr key={i} style={{fontSize: '24px', backgroundColor: 'var(--dark-grey)'}}><td colSpan={3}>{entry.name}</td></tr> :
                            <tr key={i}>
                                <td>{entry.name}</td>
                                {chipFormat(entry.chips, entry.mult, entry.mult_type)}
                                {multFormat(entry.mult, entry.mult_type)}
                            </tr>
                        )
                    )}
                </table>
            </div>
            <div id='score-log-back' onClick={() => props.setMenu(false)}>Back</div>
        </div>
    )
}