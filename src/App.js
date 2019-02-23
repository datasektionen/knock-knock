import React, { Component } from 'react';
import { Link, Switch, Route, BrowserRouter as Router } from 'react-router-dom'
import * as routes from './routes';
import './App.css';
import { model } from './data/model';
import MemberList from './MemberList/MemberList';
import Admin from './Admin/Admin';


import Methone from 'methone';

class App extends Component {

  render() {
    return (
      <Router>
        <div className="App">
          <Methone config={{ system_name: "smappen", color_scheme: "cerise", links: [{str: "Admin", href: "/admin"}] }}/>
          <div className="MethoneSpan"></div>
          <Switch>
            <Route exact path={routes.HOME} component={() => <MemberList/>}/>
            <Route exact path={routes.ADMIN} component={() => <Admin/>}/>
            <Route exact path={routes.SM_LIST} component={() => <SM-list model={model}/>}/>
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
