import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper';

class SMList extends Component {

    constructor(props) {
        super(props)
        this.state = {
            SM_history: null,
        }
    }


    componentDidMount() {
        const be_base_url = 'http://localhost:4000/api/'
        
        this.fetchSMList(be_base_url);
    }


    fetchSMList(be_base_url) {
        fetch(be_base_url + 'getAllSM')
            .then(res => res.json())
            .then(SMs => {
                console.log(SMs);
                this.setState({
                    SM_history: SMs,
                })
            })
    }

    render() {
        return (
        <div className="SMListContainer">
            <div className="Header">
                <div>
                    <h1>SM-lista</h1>
                </div>
            </div>
            <Paper>
                <div id="SMListContainer">
                    {(this.state.SM_history === null)
                        ? (<h1>Loading...</h1>)
                        : (
                        <div>
                        {this.state.SM_history.map(function(d) {
                            return (<li key={d.sm_id}>{d.sm_name}</li>)
                        })}
                        </div>
                        )
                    }
                </div>
            </Paper>  
        </div>)
    }
}

export default SMList;
