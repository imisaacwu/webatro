import React from 'react'
import "./InfoPanel.css"

export const InfoPanel = () => {
  return (
    <div id="info">
        <div id="buttons">
            <div id="run-info"><b>Run</b><br/>Info</div>
            <div id="options">Options</div>
        </div>
        <div id="stats">
            <div id="hands-discards">
                <div id="hands-box" className="box">
                    Hands
                    <div id="hands">4</div>
                </div>
                <div id="discards-box" className="box">
                    Discards
                    <div id="discards">3</div>
                </div>
            </div>
            <div id="money-box">
                <div id="money">$21</div>
            </div>
            <div id="run-stats">
                <div id="ante-box" className="box">
                    Ante
                    <div id="ante-display">
                        <div id="ante">2</div>/&nbsp;8
                    </div>
                </div>
                <div id="round-box" className="box">
                    Round
                    <div id="round">3</div>
                </div>
            </div>
        </div>
    </div>
  )
}
