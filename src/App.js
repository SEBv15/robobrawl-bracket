import React from 'react';
import './App.scss';
import {
  MemoryRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import HashLoader from "react-spinners/HashLoader";

import Bracket from './Bracket'

import fx from './fx'

export default class App extends React.Component {
  state = {
    bracket: null,
    loading: true,
    fail: false,
    highlight: null,
    matchHeight: 56,
    width: 0,
    height: 0,
  }
  componentDidMount() {
    var bracket = fx.getQueryVariable("bracket")
    if (bracket) {
      this.setState({bracket})
      this.updateData(bracket)
    } else {
      this.setState({loading: false})
    }

    this.updateWindowDimensions();
    window.addEventListener("resize", this.updateWindowDimensions);

    this.updateInterval = setInterval(() => {
      this.updateData()
    }, 10000)
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateWindowDimensions);
    clearInterval(this.updateInterval)
  }
  updateWindowDimensions = () => {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }
  updateData = async (bracket = null) => {
    var data = await fetch("https://robobrawl.strempfer.dev/wp-json/robobrawl-bracket/v1/get-bracket/"+(bracket?bracket:this.state.bracket), {mode: 'no-cors'})
    //var data = await fetch("http://localhost/")
    data = await data.json()
    if (data.length == 0) {
      this.setState({loading: false, fail: true})
      return
    }
    this.name = data.name
    this.rawBracket = JSON.parse(data.data)
    this.lastUpdate = this.rawBracket.time?new Date(this.rawBracket.time):null
    this.bracket = fx.parseBracket(this.rawBracket)
    this.setState({loading: false, fail: false})
  }
  setHighlight = (name) => {
    if (name == "")
      return
    this.setState({highlight: name})
  }
  render() {
    return (
      <Router>
        <div className="App">
          <nav>
            <ul>
              {(this.state.width > 780 && this.name)?(
                <li>
                  <span className="title">{this.name}</span>
                </li>
              ):null}
              <li>
                <Link to="/">Winners</Link>
              </li>
              <li>
                <Link to="/losers">Losers</Link>
              </li>
            </ul>
          </nav>

          {this.bracket?(
            <Switch>
              <Route path="/" exact>
                <Bracket height={this.state.matchHeight} rounds={this.bracket.winners} highlight={this.state.highlight} setHighlight={this.setHighlight} />
              </Route>
              <Route path="/losers">
                <Bracket height={this.state.matchHeight} rounds={this.bracket.losers} highlight={this.state.highlight} setHighlight={this.setHighlight} />
              </Route>
            </Switch>
          ):(
            <div className="loading">
              <div>
                {this.state.loading?(
                  <HashLoader 
                    size={150}
                    color={"#ef7806"}
                    />
                ):(
                  <h2>Couldn't load bracket</h2>
                )}
              </div>
            </div>
          )}
          <div className="updatedAt">
            Updated: {this.lastUpdate?this.lastUpdate.getHours()+":"+String(this.lastUpdate.getMinutes()).padStart(2,"0")+":"+String(this.lastUpdate.getSeconds()).padStart(2,"0"):"never"}
          </div>
        </div>
      </Router>
    );
  }
}
