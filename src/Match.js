import React from 'react';

import './match.scss'

import BotInfo from './BotInfo'

export default class Match extends React.Component {
    state = {
        infoOpen: false
    }
    getPrevMatchRef = (team) => {
        if (this.props.prevMatches[team] == "none") {
            return ""
        }
        try {
            if (this.props.prevMatchNumbers[team]) {
                return (this.props.prevMatches[team].startsWith("W")?"Winner":"Loser") + " of round #" + this.props.prevMatchNumbers[team]
            }
        } catch(err) {}
        return ""
    }
    render() {
        return (
            <div 
                className="match" 
                style={{
                    height: this.props.height, 
                    marginTop: this.props.spacing * this.props.height,
                    opacity: this.props.connector == "both"?(!this.props.teams[0] && !this.props.teams[1]?0.3:1):1, // grey out optional final match unless teams are slotted to for it
                }}
                >
                {this.props.connector != null?(
                <div 
                    className="connection" 
                    style={{
                        marginTop: (this.props.connector == "winner-winner"? - (this.props.connectorHeight - 1)/2 * this.props.height - 4 : -4)
                    }}
                    >
                    <Connector scale={this.props.connectorHeight} type={this.props.connector} />
                </div>
                ):null}
                <div className="box" data-current-match={this.props.currentMatch}>
                    <div className="number">
                        <small>#</small>{this.props.number?this.props.number:"#"}
                    </div>
                    <div className="teams">
                        {[0,1].map((i) => 
                            <span 
                                className={"cont"+i} 
                                key={i}
                                style={{
                                    backgroundColor:this.props.highlight === this.props.teams[i]?"#aaa":(this.props.winner === this.props.teams[i]?"orange":"unset"),
                                    cursor: this.props.highlight === this.props.teams[i]?"pointer":"default"
                                }}
                                onMouseEnter={()=>this.props.setHighlight(this.props.teams[i])}
                                onMouseLeave={()=>this.props.setHighlight(null)}
                                onClick={()=>this.setState({
                                    infoOpen: true, 
                                    infoName: this.props.teams[i], 
                                    infoId: this.props.teamScrapyardIds[i]
                                })}
                                >
                                {this.props.teams[i]?this.props.teams[i]:<i>{this.getPrevMatchRef(i)}</i>}
                            </span>
                        )}
                    </div>
                    <div className="time">
                        {this.props.timeString?(
                            <span class="time">
                                {this.props.timeString.split(" ")[0]}
                                <span className="ampm">{this.props.timeString.split(" ")[1].toUpperCase()}</span>
                            </span>
                            ):"TBA"}
                        {this.props.dateString?(
                            <span class="date">
                                {this.props.dateString}
                            </span>
                        ):null}
                    </div>
                </div>
                {this.state.infoOpen&&this.state.infoName?(
                    <BotInfo 
                        open={this.state.infoName?this.state.infoOpen:false} 
                        name={this.state.infoName} 
                        scrapyardId={this.state.infoId}
                        close={()=>this.setState({infoOpen: false})} 
                        />
                    ):null}
            </div>
        )
    }
}

function Connector(props) {
    var scale = props.scale?props.scale:1
    var type = props.type
    var stroke = "#fff"
    type = props.type
    if (type === "winner-winner") {
        return (
            <svg width={16} height={56*scale} xmlns="http://www.w3.org/2000/svg">
                <g>
                    <title>Layer 1</title>
                    <line strokeLinecap="round" strokeLinejoin="round" id="svg_2" y2={1} x2={8} y1={1} x1={1} strokeWidth="2" stroke={stroke} fill="none"/>
                    <line strokeLinecap="round" strokeLinejoin="round" id="svg_3" y2={56*scale-1} x2={8} y1={1} x1={8} strokeWidth="2" stroke={stroke} fill="none"/>
                    <line strokeLinecap="round" strokeLinejoin="round" id="svg_4" y2={56*scale-1} x2={8} y1={56*scale-1} x1={1} strokeWidth="2" stroke={stroke} fill="none"/>
                    <line strokeLinecap="round" strokeLinejoin="round" id="svg_5" y2={28*scale} x2={15} y1={28*scale} x1={9} strokeWidth="2" stroke={stroke} fill="none"/>
                </g>
            </svg>
        )
    } else if (type === "winner-loser") {
        return (
            <svg width={16} height={56} xmlns="http://www.w3.org/2000/svg">
                <g>
                    <title>Layer 1</title>
                    <line strokeLinecap="round" strokeLinejoin="round" id="svg_2" y2={28} x2={8} y1={28} x1={1} strokeWidth="2" stroke={stroke} fill="none"/>
                    <line strokeLinecap="round" strokeLinejoin="round" id="svg_3" y2={17} x2={8} y1={28} x1={8} strokeWidth="2" stroke={stroke} fill="none"/>
                    <line strokeLinecap="round" strokeLinejoin="round" id="svg_4" y2={17} x2={15} y1={17} x1={8} strokeWidth="2" stroke={stroke} fill="none"/>
                </g>
            </svg>
        )       
    } else if (type === "both") {
        return (
            <svg width={16} height={56} xmlns="http://www.w3.org/2000/svg">
                <g>
                    <title>Layer 1</title>
                    <line strokeLinecap="round" strokeLinejoin="round" id="svg_2" y2={17} x2={15} y1={17} x1={1} strokeWidth="2" stroke={stroke} fill="none"/>
                    <line strokeLinecap="round" strokeLinejoin="round" id="svg_3" y2={39} x2={15} y1={39} x1={1} strokeWidth="2" stroke={stroke} fill="none"/>
                </g>
            </svg>
        )           
    }
    return <></>
}