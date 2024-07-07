import { useCardState } from './contexts/CardStateContext'
import './DeckMenu.css'
import { Card } from './Card'
import { ReactElement, useEffect, useState } from 'react'
import { Rank, Suit, rankChips } from './Constants'
import { aceIcon, faceIcon, numIcon, spades, hearts, clubs, diamonds } from '../assets/ui';
import { useGameState } from './contexts/GameStateContext'

type DeckMenuProps = {
    setMenu: React.Dispatch<React.SetStateAction<boolean>>
}

export default function DeckMenu(props: DeckMenuProps) {
    const { state: game } = useGameState()
    const { state } = useCardState()
    const [ view, setView ] = useState<'remaining' | 'full'>('remaining')

    const cards = [...state.deck, ...state.hand, ...state.hidden, ...state.submitted].map(c => (
        <Card
            id={-1-c.props.id}
            key={-1-c.props.id}
            suit={c.props.suit}
            rank={c.props.rank}
            handleClick={() => {}}
        />
    ))
    
    useEffect(() => {
        cards.forEach(c => document.getElementById(`card ${c.props.id}`)?.classList.add('deck-view'));
    }, [cards])

    useEffect(() => {
        if(game.mode === 'scoring' && view === 'remaining') {
            [...state.hand, ...state.hidden, ...state.submitted].forEach(c => document.getElementById(`card ${-1-c.props.id}`)?.classList.add('drawn'))
        } else {
            [...state.hand, ...state.hidden, ...state.submitted].forEach(c => document.getElementById(`card ${-1-c.props.id}`)?.classList.remove('drawn'))
        }
    }, [game.mode, view])

    const deck: ReactElement[][] = [];
    Object.values(Suit).filter(s => !isNaN(Number(s))).forEach(suit => {
        deck.push(cards.filter(c => c.props.suit === suit).sort((a, b) => b.props.rank - a.props.rank))
    })

    useEffect(() => {
        // https://www.desmos.com/calculator/vaaglwvmxl
        for(let suit = 0; suit < 4; suit++) {
            const hand = document.getElementById(`deck-row-${suit}`)
            const w = hand!.clientWidth - 20;
            const cards = document.querySelectorAll(`#deck-row-${suit} .card`) as NodeListOf<HTMLElement>
            const cardW = cards[0].clientWidth
    
            const r = 5000
            const h = w / 2
            const k = -Math.sqrt(r*r-h*h)
    
            let lStep = w / (cards.length)
            const extra = (lStep - cardW) / (cards.length - 1);
    
            cards.forEach((c, i) => {
                const left = i * (lStep + extra) + 10
                c.style.left = `${left}px`
    
                const x = Math.abs(h - (left + (cardW / 2)))
                const y = Math.sqrt(r * r - (h - (i * lStep + (cardW / 2))) ** 2) + k;
                c.style.bottom = `${y}px`
    
                let rot = Math.acos(x/r)
                rot -= Math.PI / 2
                rot *= (i < cards.length / 2 ? 1 : -1)
    
                c.style.rotate = `${rot}rad`
            })
        }
    })

    const rankCount: number[] = new Array(13).fill(0), suitCount: number[] = new Array(4).fill(0)
    if(game.mode === 'scoring' && view === 'remaining') {
        [...state.deck].forEach(c => {rankCount[12-c.props.rank]++; suitCount[c.props.suit]++})
    } else {
        cards.forEach(c => {rankCount[12-c.props.rank]++; suitCount[c.props.suit]++})
    }

    const ranks = Object.keys(Rank).filter(r => isNaN(Number(r))).sort((a, b) => Rank[b as keyof typeof Rank] - Rank[a as keyof typeof Rank]).map(r => <div key={Rank[r as keyof typeof Rank]}>{rankChips[r as keyof typeof rankChips] < 10 ? rankChips[r as keyof typeof rankChips] : r.charAt(0)}</div>)
    
    return (
        <div id='menu'>
            <div id='deck-views'>
                {game.mode === 'scoring' &&
                    <div id='remaining' className='view-container'>
                        {view === 'remaining' && <div className='arrow' />}
                        <div className='view-button' onClick={() => setView('remaining')}>Remaining</div>
                    </div>
                }
                <div id='full' className='view-container'>
                   {(game.mode !== 'scoring' || view === 'full') && <div className='arrow' />}
                    <div className='view-button' onClick={() => setView('full')}>Full Deck</div>
                </div>
            </div>
            <div id='deck-view'>
                <div id='deck-info'>
                    <div id='deck-info-left'>
                        <div id='deck-name'>
                            Red Deck
                            <div id='deck-bio'>
                                +1 discard<br />every round
                            </div>
                        </div>
                        <div id='suit-info-container'>
                            <div id='suit-info'>
                                Base Cards
                                <div id='rank-types'>
                                    <div className='type'>
                                        <img src={aceIcon} />
                                        {rankCount[0]}
                                    </div>
                                    <div className='type'>
                                        <img src={faceIcon} />
                                        {rankCount.slice(1,4).reduce((t, r) => t += r, 0)}
                                    </div>
                                    <div className='type'>
                                        <img src={numIcon} />
                                        {rankCount.slice(4).reduce((t, r) => t += r, 0)}
                                    </div>
                                </div>
                                <div id='suits'>
                                    <table>
                                        <tbody>
                                            <tr>
                                                <td className='type'>
                                                    <img src={spades} />
                                                    {suitCount[0]}
                                                </td>
                                                <td className='type'>
                                                    <img src={hearts} />
                                                    {suitCount[1]}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className='type'>
                                                    <img src={clubs} />
                                                    {suitCount[2]}
                                                </td>
                                                <td className='type'>
                                                    <img src={diamonds} />
                                                    {suitCount[3]}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id='rank-info'>
                        {ranks}
                    </div>
                    <div id='rank-counts'>
                        {rankCount.map((r, i) => <div key={i}>{r}</div>)}
                    </div>
                </div>
                <div id='deck-cards'>
                    {deck.map((arr, i) => <div className='deck-row' key={i} id={`deck-row-${i}`}>{arr}</div>)}
                </div>
            </div>
            <div id='back' onClick={() => props.setMenu(false)}>Back</div>
        </div>
    )
}
