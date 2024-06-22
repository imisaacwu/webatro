import './App.css'
import stake_icon from "./assets/white_stake.webp"
import { Blind } from './components/Blind'

function App() {

  return (
    <div className="container">
      <div id="sidebar">
        <Blind />

        <div id="round-score">
          <div id="round-score-text">Round<br/>score</div>
          <div id="score-display">
            <img id="stake-icon" src={stake_icon} />
            <div id="score">0</div>
          </div>
        </div>

        <div id="hand-info">
          <div id="hand-type">
            <div id="hand-name">High Card</div>
            <div id="hand-level">lvl.1</div>
          </div>
          <div id="calculator">
            <div id="chips">5</div>
            <div id="X">X</div>
            <div id="mult">1</div>
          </div>
        </div>

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
      </div>
      <div className="main">

      </div>
    </div>
  )
}

export default App
