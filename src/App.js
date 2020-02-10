import React from 'react';
import './App.scss';
import {
  MemoryRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import Bracket from './Bracket'

export default function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li>
              <Link to="/">Winners</Link>
            </li>
            <li>
              <Link to="/losers">Losers</Link>
            </li>
          </ul>
        </nav>

        <Switch>
          <Route path="/" exact>
            <Bracket type="winners" />
          </Route>
          <Route path="/losers">
            <Bracket type="losers" />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}
