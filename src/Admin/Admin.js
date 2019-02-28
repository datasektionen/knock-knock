import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import requireAuth from '../requireAuth';

import './Admin.css';


class Admin extends Component {

    constructor(props) {
        super(props)
        this.state = {
            sm_name_field: ""
        }
    }


    doPostRequest(api, paramString) {
        console.log(localStorage.getItem("token"))
        return fetch("http://localhost:4000/api/" + api + "?token=" + localStorage.getItem("token") + "&" + paramString, {
            method: "POST",
        });
    }

    doGetRequest(api) {
        return fetch("http://localhost:4000/api/" + api + "?token=" + localStorage.getItem("token"), {
            method: "GET",
        });
    } 

    handleChange = name => event => {
        this.setState({ [name]: event.target.value });
      };
    


    render() {
        return (
        <div className="adminContainer">
            <Paper>
                <div className="Header">
                    <div>
                        <h1>Admin</h1>
                    </div>
                </div>
            </Paper>
            <Paper>
                <div className="adminContainer">
                    <h2 id="adminTitle">Hej Admin!</h2>
                    <div id="buttonContainer">
                        <div id="createSMContainer">
                            <Button variant="contained" onClick={() => {this.doPostRequest("createNewSM", "sm_name=" + this.state.sm_name_field)}}>Starta ett nytt SM</Button>
                            <TextField value={this.state.sm_name_field} onChange={this.handleChange("sm_name_field")}/>
                        </div>
                        <div id="endSMContainer">
                            <Button variant="contained" onClick={() => {this.doGetRequest("endCurrentSM")}}>Avsluta nuvarande SM</Button>
                        </div>
                    </div>
                </div>
            </Paper>
        </div>)
    }
}

export default requireAuth(Admin);
