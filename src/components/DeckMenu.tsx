import { useContext, useEffect, useState } from 'react'
import { aceIcon, clubs, diamonds, faceIcon, hearts, numIcon, spades } from '../assets/ui'
import { Rank, Suit, rankChips } from '../Constants'
import { cardSnap } from '../Utilities'
import './DeckMenu.css'
import { GameStateContext } from '../GameState'
import { CardInfo } from './CardInfo'
import { Card } from './Card'

type DeckMenuProps = {
    menu: boolean
    setMenu: React.Dispatch<React.SetStateAction<boolean>>
}

export default function DeckMenu(props: DeckMenuProps) {
    const { state: game } = useContext(GameStateContext)
    const [ view, setView ] = useState<'remaining' | 'full'>('remaining')

    const cards: CardInfo[][] = []
    const drawn = [...game.cards.hand, ...game.cards.hidden, ...game.cards.submitted]
    Object.values(Suit).filter(s => isNaN(Number(s))).forEach(suit => {
        const temp = [...drawn, ...game.cards.deck].filter(c => c.suit === Suit[suit as keyof typeof Suit]).sort((a, b) => b.rank - a.rank)
        cards.push(temp.map(c => ({...c,
            id: -c.id,
            mode: 'deck-view',
            draggable: false,
            drawn: (!c.flipped && view === 'remaining' && (drawn.find(d => c.id === d.id) !== undefined)),
            flipped: false,
        })))
    })

    const elements = cards.map((arr, i) =>
        <div className='deck-row' key={i} id={`deck-row-${i}`}>
            {arr.map(c => <Card key={c.id} {...c} />)}
        </div>)

    useEffect(() => {
        Object.values(Suit).filter(s => !isNaN(Number(s))).forEach(suit => {
            cardSnap({cards: cards[Number(suit)], idPrefix: 'card', r: 5000})
        })
    }, [cards])

    const rankCount: number[] = new Array(13).fill(0), suitCount: number[] = new Array(4).fill(0)
    if(game.state === 'scoring' && view === 'remaining') {
        game.cards.deck.forEach(c => {rankCount[12-c.rank]++; suitCount[c.suit]++})
    } else {
        cards.forEach(arr => arr.forEach(c => {rankCount[12-c.rank]++; suitCount[c.suit]++}))
    }

    const ranks = Object.keys(Rank).filter(r => isNaN(Number(r))).sort((a, b) => Rank[b as keyof typeof Rank] - Rank[a as keyof typeof Rank]).map(r => <div key={Rank[r as keyof typeof Rank]}>{rankChips[r as keyof typeof rankChips] < 10 ? rankChips[r as keyof typeof rankChips] : r.charAt(0)}</div>)
    
    return (
        <div id='deck-menu' className={`${props.menu}`}>
            <div id='deck-menu-views'>
                {game.state === 'scoring' &&
                    <div id='remaining' className='view-container'>
                        {view === 'remaining' && <div className='arrow' />}
                        <div className='view-button' onClick={() => setView('remaining')}>Remaining</div>
                    </div>
                }
                <div id='full' className='view-container'>
                   {(game.state !== 'scoring' || view === 'full') && <div className='arrow' />}
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
                    {elements}
                </div>
            </div>
            <div id='back' onClick={() => props.setMenu(false)}>Back</div>
        </div>
    )
}
