import React from 'react';

import Match from './Match'

import './bracket.scss'

// Get ?parameter=value
function getQueryVariable(variable) {
    var query = window.location.search.split("?")[1];
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
      var pair = vars[i].split("=");
      if(pair[0] == variable) {
        return pair[1];
      }
    }
    return false;
  }

function calculateRounds(raw) {
    function lineToGame(line, secondIsLoser = false) {
        if (!line)
            return undefined
        return {
            prevMatches: [line[1], line[2]],
            contestants: [line[3], line[4]],
            secondIsLoser: secondIsLoser,
            winner: line[5]?line[5]:null,
            time: line[6]?line[6]:null,
            matchNumber: line[8]?line[8]:null,
            id: line[0]
        }
    }

    var winners = []

    // first round
    winners[0] = []
    for (let i = 1; i <= 16; i++) {
        winners[0].push(lineToGame(raw.first[i]))
    }
    // second
    winners[1] = []
    for (let i = 1; i <= 8; i++) {
        winners[1].push(lineToGame(raw.winners[i]))
    }
    // third
    winners[2] = []
    for (let i = 10; i <= 13; i++) {
        winners[2].push(lineToGame(raw.winners[i]))
    }
    // fourth
    winners[3] = []
    for (let i = 15; i <= 16; i++) {
        winners[3].push(lineToGame(raw.winners[i]))
    }
    // fifth
    winners[4] = [lineToGame(raw.winners[18])]

    // sixth
    winners[5] = [lineToGame(raw.winners[20])]

    // seventh
    winners[6] = [lineToGame(raw.winners[22], true)]

    var losers = []
    var round = 0;
    let isLoser = false;
    for (let i = 1; i <= 37; i++) {
        switch(i) {
            case 9:
                round++
                isLoser = true
                continue
            case 18:
                round++
                continue
            case 23:
                round++
                isLoser = true
                continue
            case 28:
                round++
                continue
            case 31:
                round++
                isLoser = true
                continue
            case 34:
                round++
                continue
            case 36:
                round++
                isLoser = true
                continue
        }
        if (!losers[round])
            losers[round] = []

        losers[round].push(lineToGame(raw.losers[i], isLoser))
    }

    return {
        winners,
        losers
    }

} 

export default class Bracket extends React.Component {
    state = {
        small: false,
        height: 56, // Match height
        highlight: null // The team to highlight (is currently hovered on)
    }
    async componentDidMount() {
        this.updateData()
        this.updateInterval = setInterval(() => {
            this.updateData()
        }, 10000)
    }
    componentWillUnmount() {
        clearInterval(this.updateInterval)
    }
    updateData = async () => {
        this.sheetId = getQueryVariable("sheetId")
        if (this.sheetId) {
          var data = await fetch("https://robobrawl.strempfer.dev/wp-json/robobrawl-bracket/v1/get-bracket/"+this.sheetId, {mode: 'no-cors'})
          //var data = await fetch("http://192.168.1.185/")
          data = await data.json()
          this.lastUpdate = data.time?new Date(data.time):null
          this.bracket = calculateRounds(data)
          this.forceUpdate()
        }
    }
    setHighlight = (name) => {
        if (!name && !(name === null))
            return
        this.setState({highlight: name})
    }
    render() {
        if (this.props.type == "winners") {
            return (
                <>
                <div className="scroll">
                <div className="bracket">
                {this.bracket?(
                    <>
                        {this.bracket.winners.map((round, i) => {
                            return (
                                <div className="round" style={{
                                    marginTop: i==0?0:((i==2?-this.state.height:(i==3?-3*this.state.height:0))-this.state.height/2)
                                }}>
                                    {round.map((match) => <Match setHighlight={this.setHighlight} highlight={this.state.highlight} height={this.state.height} bracket={this.bracket} type={"winners"} round={i} small={this.state.small} {...match} /> )}
                                </div>
                            )
                        })}
                    </>
                ):null}
                </div>
                </div>
                <div class="updateTimeStamp">
                    Updated: {this.lastUpdate?this.lastUpdate.getHours()+":"+String(this.lastUpdate.getMinutes()).padStart(2,"0")+":"+String(this.lastUpdate.getSeconds()).padStart(2,"0"):"never"}
                </div>
                </>
            )
        } else {
            return (
                <>
                <div className="scroll">
                <div className="bracket">
                {this.bracket?(
                    <>
                    {this.bracket.losers.map((round, i) => {
                        return (
                            <div className="round" style={{
                                marginTop: (i < 2?0:(i==2 || i==3?-this.state.height/2:(i==4 || i==5?-this.state.height*1.5:-this.state.height*3.5)))
                            }}>
                                {round.map((match) => <Match setHighlight={this.setHighlight} highlight={this.state.highlight} height={this.state.height} bracket={this.bracket} round={i} type={"losers"} small={this.state.small} {...match} /> )}
                            </div>
                        )
                    })}
                    </>
                ):null}
                </div>
                </div>
                <div class="updateTimeStamp">
                    Updated: {this.lastUpdate?this.lastUpdate.getHours()+":"+String(this.lastUpdate.getMinutes()).padStart(2,"0")+":"+String(this.lastUpdate.getSeconds()).padStart(2,"0"):"never"}
                </div>
                </>
            )
        }
    }
}