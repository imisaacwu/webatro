import React from 'react'
import "./App.css"
import { Blind } from "./components/Blind";
import { Round } from "./components/Round";
import { Calculator } from './components/Calculator';
import { InfoPanel } from './components/InfoPanel';

export default function App() {
    return (
        <div className="container">
            <div id="sidebar">
                <Blind />
                <Round />
                <Calculator />
                <InfoPanel />
            </div>
            <div id="main">
                <div id="top"></div>
                <div id="mid"></div>
                <div id="bot">
                    <div id="hand">
                        <div id="hand-label" className="counter">3/8</div>
                    </div>
                    
                    <div id="deck"></div>
                </div>
            </div>
        </div>
    )
}
