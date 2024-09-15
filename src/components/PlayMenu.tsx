import { useContext, useEffect, useState } from 'react'
import './PlayMenu.css'
import { deckInfo, DeckType } from '../Constants'
import { getImage } from '../Utilities'
import { GameStateContext } from '../GameState'
const images: Record<string, { default: string }> = import.meta.glob('../assets/decks/*.png', { eager: true })

export const PlayMenu = ({ setMenu }: {setMenu: React.Dispatch<React.SetStateAction<boolean>>}) => {
    const { dispatch } = useContext(GameStateContext)
    const [ view, setView ] = useState<'new-run'>('new-run')
    const decks = [DeckType.Red, DeckType.Blue, DeckType.Yellow, DeckType.Green, DeckType.Black, DeckType.Ghost, DeckType.Abandoned, DeckType.Checkered, DeckType.Painted, DeckType.Erratic]
    const [ deckIndex, setDeckIndex ] = useState(0)
    const [ seeded, setSeeded ] = useState(false)
    const [ seed, setSeed ] = useState<string>()

    useEffect(() => {
        const arrow = document.getElementById('play-menu-arrow')!
        const button = document.getElementById(view)!, rect = button.getBoundingClientRect()
        const left = button.offsetLeft + (rect.width - arrow.getBoundingClientRect().width) / 2
        arrow.style.left = `${left}px`
    }, [view])

    const deckImage = getImage(`../assets/decks/${DeckType[decks[deckIndex]]}.png`, images)
    const deckDescription = deckInfo[DeckType[decks[deckIndex]] as keyof typeof deckInfo].split('\n').map((line, i) =>
        <div key={i}>
            {line.split('/').map((str, i) =>
                <div key={i} className={str.match(/{.+}/)?.[0].slice(1, -1) ?? 'black'} style={{display: 'inline'}}>
                    {str.replace(/{.+}/g, '')}
                </div>
            )}
        </div>
    )

    return (
        <div id='play-menu'>
            <div id='views'>
                <div id='play-menu-arrow' className='arrow' />
                <div id='new-run' className='view-container'>
                    <div className='view' onClick={() => setView('new-run')}>New Run</div>
                </div>
            </div>
            <div id='new-run-area'>
                {view === 'new-run' && <>
                    <div id='deck-selection'>
                        <div className='cycle-button' onClick={() => setDeckIndex(Math.max(0, deckIndex - 1))}>{'<'}</div>
                        <div id='deck-display'>
                            <img src={deckImage}/>
                            <div id='deck-info'>
                                <div id='deck-name'>{`${DeckType[decks[deckIndex]]} Deck`}</div>
                                <div id='description-bkg'>
                                    <div id='description'>
                                        {deckDescription}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='cycle-button' onClick={() => setDeckIndex(Math.min(decks.length-1, deckIndex + 1))}>{'>'}</div>
                    </div>
                    <div id='stake-selection'></div>
                    <div id='seeded-info'>
                        {seeded && <>
                            <div id='seed-disclaimer'>All Unlocks and Discoveries disabled</div>
                            <input type='text' id='enter-seed' placeholder='Enter Seed' value={seed} onChange={e => setSeed(e.target.value)}/>
                            <div id='paste-seed' onClick={() => {
                                navigator.clipboard.readText().then(text => {
                                    setSeed(text)
                                }).catch(_ => {
                                    alert("Failed to read clipboard contents! (Make sure to allow us to read your clipboard contents)")
                                })
                            }}>Paste Seed</div>
                        </>}
                    </div>
                    <div id='bottom'>
                        <div id='seeded'>
                            <div>Seeded Run</div>
                            <input id='isSeeded' type='checkbox' checked={seeded} onChange={() => setSeeded(!seeded)} />
                        </div>
                        <div id='play-button' onClick={() => {
                            dispatch({type: 'init', payload: {deck: decks[deckIndex], seed: seed}})
                            dispatch({type: 'state', payload: {state: 'blind-select'}})
                        }}>PLAY</div>
                    </div>
                </>}
            </div>
            <div id='play-menu-back' onClick={() => setMenu(false)}>Back</div>
        </div>
    )
}