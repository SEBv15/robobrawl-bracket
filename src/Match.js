import React from 'react';

import './match.scss'

function getConnectorType(prev) {
    var type = "merge"
    var prevWinner = [prev[0].startsWith("W"),prev[1].startsWith("W")]
    if (prevWinner[0] && prevWinner[1])
        type = "merge"
    // winner continues and other is from different bracket
    if (prevWinner[0] && !prevWinner[1])
        type = "winner-loser"
    // for the final match if it needs redo
    if (prev[0].startsWith("W-W") && prev[1].startsWith("L-W"))
        type = "both"
    // when merging winner and loser bracket
    if (prev[0].startsWith("W-W") && prev[1].startsWith("W-L"))
        type = "winner-loser"
    return type
}

function Connector(props) {
    var scale = props.scale?props.scale:1
    var type = props.type
    type = (type)?type:getConnectorType(props.prev)
    if (type === "merge") {
        return (
            <svg width={16} height={56*scale} xmlns="http://www.w3.org/2000/svg">
                <g>
                    <title>Layer 1</title>
                    <line strokeLinecap="round" strokeLinejoin="round" id="svg_2" y2={1} x2={8} y1={1} x1={1} strokeWidth="2" stroke="#000" fill="none"/>
                    <line strokeLinecap="round" strokeLinejoin="round" id="svg_3" y2={56*scale-1} x2={8} y1={1} x1={8} strokeWidth="2" stroke="#000" fill="none"/>
                    <line strokeLinecap="round" strokeLinejoin="round" id="svg_4" y2={56*scale-1} x2={8} y1={56*scale-1} x1={1} strokeWidth="2" stroke="#000" fill="none"/>
                    <line strokeLinecap="round" strokeLinejoin="round" id="svg_5" y2={28*scale} x2={15} y1={28*scale} x1={9} strokeWidth="2" stroke="#000" fill="none"/>
                </g>
            </svg>
        )
    } else if (type === "winner-loser") {
        return (
            <svg width={16} height={56} xmlns="http://www.w3.org/2000/svg">
                <g>
                    <title>Layer 1</title>
                    <line strokeLinecap="round" strokeLinejoin="round" id="svg_2" y2={28} x2={8} y1={28} x1={1} strokeWidth="2" stroke="#000" fill="none"/>
                    <line strokeLinecap="round" strokeLinejoin="round" id="svg_3" y2={17} x2={8} y1={28} x1={8} strokeWidth="2" stroke="#000" fill="none"/>
                    <line strokeLinecap="round" strokeLinejoin="round" id="svg_4" y2={17} x2={15} y1={17} x1={8} strokeWidth="2" stroke="#000" fill="none"/>
                </g>
            </svg>
        )       
    } else if (type === "both") {
        return (
            <svg width={16} height={56} xmlns="http://www.w3.org/2000/svg">
                <g>
                    <title>Layer 1</title>
                    <line strokeLinecap="round" strokeLinejoin="round" id="svg_2" y2={17} x2={15} y1={17} x1={1} strokeWidth="2" stroke="#000" fill="none"/>
                    <line strokeLinecap="round" strokeLinejoin="round" id="svg_3" y2={39} x2={15} y1={39} x1={1} strokeWidth="2" stroke="#000" fill="none"/>
                </g>
            </svg>
        )           
    }
    return <></>
}

export default class Match extends React.Component {
    state = {
        height: this.props.height
    }
    getMarginTop = (round) => {
        if (this.props.type == "winners") {
            switch(round) {
                case 0:
                    return 0
                case 1:
                    return this.state.height
                case 2:
                    return 3*this.state.height
                case 3:
                    return 7*this.state.height
                case 4:
                    return 8*this.state.height
                case 5:
                    return 8*this.state.height
                case 6:                
                    return 8*this.state.height
            }
        } else {
            switch(round) {
                case 2:
                case 3:
                    return this.state.height
                case 4:
                case 5:
                    return this.state.height*3
                case 6:
                case 7:
                    return this.state.height*7
            }
        }
        return 0
    }
    getConnectorScale = (round) => {
        if (this.props.type == "winners") {
            switch(round) {
                case 3:
                    return 4;
                case 4:
                    return 8;
            }
        } else {
            switch (round) {
                case 6:
                    return 4
            }
            return round/2
        }
        return round
    }
    getPrevMatchRef = (id) => {
        var matchId = id.split("-")[1]
        var startText = ((id.split("-")[0] == "W")?"Winner":"Loser") + " of match #"
        for (let tab of ["winners", "losers"]) {
            for (let round of this.props.bracket[tab]) {
                let filtered = round.filter((e) => e.id.startsWith(matchId))
                if (filtered.length > 0) {
                    return (filtered[0].matchNumber?startText + filtered[0].matchNumber:"")
                }
            }
        }
    }
    render() {
        var connectorMargin = (getConnectorType(this.props.prevMatches) == "merge"?-(this.getConnectorScale(this.props.round)-1)*this.props.height/2:0)-4
        return (
            <div className="match" style={{height: this.props.height, marginTop: this.getMarginTop(this.props.round)}}>
                {this.props.round != 0?(
                <div className="connection" style={{marginTop: connectorMargin}}>
                    <Connector scale={this.getConnectorScale(this.props.round)} prev={this.props.prevMatches} />
                </div>
                ):null}
                <div className="box">
                    <div className="number">
                        <small>#</small>{this.props.matchNumber?this.props.matchNumber:"#"}
                    </div>
                    <div className="contestants">
                        <span 
                            className="contA" 
                            style={{backgroundColor:this.props.highlight === this.props.contestants[0]?"orange":(this.props.winner === this.props.contestants[0]?"#0455A4":"unset")}}
                            onMouseEnter={()=>this.props.setHighlight(this.props.contestants[0])}
                            onMouseLeave={()=>this.props.setHighlight(null)}
                            onClick={()=>alert("Open Bot Info Dialog")}
                            >
                            {this.props.contestants[0]?this.props.contestants[0]:<i>{this.getPrevMatchRef(this.props.prevMatches[0])}</i>}
                        </span>
                        <span 
                            className="contB" 
                            style={{backgroundColor:this.props.highlight === this.props.contestants[1]?"orange":(this.props.winner === this.props.contestants[1]?"#0455A4":"unset")}}
                            onMouseEnter={()=>this.props.setHighlight(this.props.contestants[1])}
                            onMouseLeave={()=>this.props.setHighlight(null)}
                            onClick={()=>alert("Open Bot Info Dialog")}
                            >
                            {this.props.contestants[1]?this.props.contestants[1]:<i>{this.getPrevMatchRef(this.props.prevMatches[1])}</i>}
                        </span>
                    </div>
                    <div className="time">
                        {this.props.time?this.props.time:"TDB"}
                    </div>
                </div>
            </div>
        )
    }
}