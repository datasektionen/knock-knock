import React from 'react';
import { withRouter } from 'react-router';

export default function requireAuth(Component) {

  class AuthenticatedComponent extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            isAdmin: false
        }
    }


    componentWillMount() {
        this.checkAuth();
    }

    checkAuth() {
        fetch('http://localhost:4000/api/isAdmin?token=' + localStorage.getItem('token'), {
            method: 'POST'
        })
            .then(res => res.json())
            .then(res => {
                this.setState({
                    isAdmin: res.isAdmin
                })
            })
            .catch(err => {
                console.log(err)
            })
    }

    render() {
      return this.state.isAdmin
        ? <Component { ...this.props } />
        : <h1>You are not an admin! >:(</h1>;
    }

  }

  return withRouter(AuthenticatedComponent);
}