import './App.css'
import { Blind } from './components/Blind'
import { Calculator } from './components/Calculator'
import { InfoPanel } from './components/InfoPanel'
import { Round } from './components/Round'
import Cards from './components/Cards'

export default function App() {
    return (
        <div className='container'>
            <div id='sidebar'>
                <Blind />
                <Round />
                <Calculator />
                <InfoPanel />
            </div>
            <div id='main'>
                <div id='top'>
                    <div id='jokers' className='card-container'>
                        <div id='joker-area' className='card-area'></div>
                        <div id='joker-label' className='counter'>0/5</div>
                    </div>
                    <div id='consumables' className='card-container'>
                        <div id='consumables-area' className='card-area'></div>
                        <div id='consumables-label' className='counter'>0/2</div>
                    </div>
                </div>
                <div id='mid'></div>
                <Cards handSize={8} />
            </div>
        </div>
    )
}
