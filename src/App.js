import React, { Component } from 'react';
import { Switch, Route, Redirect, BrowserRouter as Router } from 'react-router-dom'
import * as routes from './routes';
import './App.css';
import MemberList from './MemberList/MemberList';
import Admin from './Admin/Admin';
import SMlist from './SMList/SMList';


import Methone from 'methone';

class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
      isAdmin: false,
      methoneLinks: [{str: "SM-lista", href: "/sm_list"}, {str: "Admin", href: "/admin"}]
    }
  }

  render() {
    return (
      <Router>
        <div className="App">
          <Methone config={{ system_name: "knockknock", color_scheme: "cerise", links: this.state.methoneLinks, login_text: 'Logga in', login_href: '/login' }}/>
          <div className="MethoneSpan"></div>
          <Switch>
            <Route exact path={routes.HOME} component={() => <MemberList {...this.state} />}/>
            <Route exact path={routes.ADMIN} component={() => <Admin {...this.state} />}/>
            <Route exact path={routes.SM_LIST} component={() => <SMlist {...this.state} />}/>
            <Route exact path='/login' render={match => {window.location = `https://login2.datasektionen.se/login?callback=${encodeURIComponent(window.location.origin)}/token/` }} />
            <Route path='/token/:token' render={({match}) => {
              localStorage.setItem('token', match.params.token)

              this.setState({
                isAdmin: true,
              })
              return <Redirect to={routes.HOME} />
            }} />}
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
