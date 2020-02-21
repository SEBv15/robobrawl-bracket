import React from 'react';

import Match from './Match'

import './bracket.scss'

export default class Bracket extends React.Component {
    render() {
        return (
            <div className="scroll">
                <div className="bracket">
                    {this.props.rounds.map((round, i) => {
                        return (
                            <div className="round" key={i} style={{
                                marginTop: round.offset * this.props.height
                            }}>
                                {round.matches.map((match) => {
                                    return <Match 
                                        bots={this.bots} 
                                        setHighlight={this.props.setHighlight} 
                                        key={match.id} 
                                        highlight={this.props.highlight} 
                                        height={this.props.height} 
                                        spacing={round.spacing} 
                                        connector={round.connector}
                                        connectorHeight={round.connectorHeight}
                                        {...match} 
                                        /> 
                                })}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
}