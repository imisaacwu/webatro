import "./Hand.css"

export default function Hand() {
    // const deck = Deck({"deck": "red"});
    // deck.pop(8).forEach(c => console.log(c));
    return (
        <div id="hand" className="card-container">
            <div id="hand-area" className="card-area">
                {/* {deck.pop(8).map((c) => {
                    <div key={c}>{c}</div>
                })} */}
            </div>
            <div id="hand-label" className="counter">3/8</div>
        </div>
    )
}
