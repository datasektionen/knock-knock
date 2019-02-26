import React, { Component } from 'react';
import { Link, Switch, Route, Redirect, BrowserRouter as Router } from 'react-router-dom'
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
          <Methone config={{ system_name: "smappen", color_scheme: "cerise", links: [{str: "SM-lista", href: "/sm_list"}, {str: "Admin", href: "/admin"}], login_text: 'Logga in', login_href: '/login' }}/>
          <div className="MethoneSpan"></div>
          <Switch>
            <Route exact path={routes.HOME} component={() => <MemberList/>}/>
            <Route exact path={routes.ADMIN} component={() => <Admin/>}/>
            <Route exact path={routes.SM_LIST} component={() => <SMlist/>}/>
            <Route exact path='/login' render={match => {window.location = `https://login2.datasektionen.se/login?callback=${encodeURIComponent(window.location.origin)}/token/` }} />
            <Route path='/token/:token' render={({match}) => {
              localStorage.setItem('token', match.params.token)
              return <Redirect to={routes.HOME} />
            }} />}
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
