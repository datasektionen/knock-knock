import React, { Component } from 'react';
import { Link, Switch, Route, BrowserRouter as Router } from 'react-router-dom'
import * as routes from './routes';
import './App.css';
import MemberList from './MemberList/MemberList';
import Admin from './Admin/Admin';
import SMlist from './SMList/SMList';


import Methone from 'methone';

class App extends Component {

  render() {
    return (
      <Router>
        <div className="App">
          <Methone config={{ system_name: "smappen", color_scheme: "cerise", links: [{str: "Admin", href: "/admin"}, {str: "SM-lista", href: "/sm_list"}] }}/>
          <div className="MethoneSpan"></div>
          <Switch>
            <Route exact path={routes.HOME} component={() => <MemberList/>}/>
            <Route exact path={routes.ADMIN} component={() => <Admin/>}/>
            <Route exact path={routes.SM_LIST} component={() => <SMlist/>}/>
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
