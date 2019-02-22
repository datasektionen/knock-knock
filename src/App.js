import React, { Component } from 'react';
import { Link, Switch, Route, BrowserRouter as Router } from 'react-router-dom'
import * as routes from './routes';
import './App.css';
import MemberList from './MemberList/MemberList';
import Admin from './Admin/Admin';

import Methone from 'methone';

class App extends Component {

  render() {
    return (
      <Router>
        <div className="App">
          <Methone config={{ system_name: "smappen", color_scheme: "dark-blue", links: [{str: "Admin", href: "/admin"}] }}/>
          <div className="MethoneSpan"></div>
          <Switch>
            <Route exact path={routes.HOME} component={() => <MemberList/>}/>
            <Route exact path={routes.ADMIN} component={() => <Admin/>}/>
            <Route exact path={}
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
