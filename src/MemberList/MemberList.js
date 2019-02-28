import React, { Component } from 'react';
import './MemberList.css';
import Paper from '@material-ui/core/Paper';

class MemberList extends Component {

    constructor(props) {
        super(props)

        this.state = {
            SMInSession: {
                sm_name: "Inget SM är igång"
            },
            membersInside: [],
            sminut: [],
            state: { time: Date.now() }
        }
    }

    toTime(milli) {
        if(+milli === 0) {
            return "Ø"
        }
        console.log(milli)
        var time = new Date(+milli);
        var hours = time.getUTCHours();
        var minutes = time.getUTCMinutes();
        var out = hours + ":" + minutes;
        console.log(out);
        return out;
    }

    componentDidMount() {
        const be_base_url = 'http://localhost:4000'

        this.fetchEverything(be_base_url);

        this.interval = setInterval(() => this.fetchEverything(be_base_url), 10000);        
    }

    fetchEverything(be_base_url) {
        fetch(be_base_url + '/api/getSMInSession')
            .then(res => res.json())
            .then(sm => {
                console.log(sm)
                this.setState({
                    SMInSession: sm
                })
            })

        fetch(be_base_url + '/api/getAllMembersInside')
            .then(res => res.json())
            .then(members => {
                this.setState({
                    membersInside: members
                })
            })
        
        fetch(be_base_url + '/api/getAllSMInUt')
            .then(res => res.json())
            .then(inut => {
                this.setState({
                    sminut: inut
                })
            })
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        console.log(this.state.membersInside)
        const narvaro = this.state.membersInside.map((person, index) =>
            <td key={index} className="tableRow">{person.namn}</td>
        );

        const sminut = this.state.sminut.map((event) =>
            <tr key={event.id} className="tableRow">
                <td>{event.namn}</td>
                <td>{this.toTime(event.tid_in)}</td>
                <td>{this.toTime(event.tid_ut)}</td>
                <td>{event.punkt_in}</td>
                <td>{event.punkt_ut}</td>
            </tr>
        );

        return (
            <div className="memberListContainer">
                <div className="Header">
                    <div>
                        <h1>{this.state.SMInSession.sm_name}</h1>
                    </div>
                </div>
                <div id="tableContainer">
                    <Paper>
                        <table className="insideTable">
                            <tr id="headerRow"><h2>Närvaro</h2></tr>
                            <tbody>
                                {narvaro}
                            </tbody>
                        </table>
                    </Paper>
                    <Paper>
                        <table className="sminutTable">
                            <thead>
                                <tr><th colSpan="5"><h2>In-och-ut-lista</h2></th></tr>
                                <tr id="headerRow">
                                    <th>Namn</th>
                                    <th>Tid in</th>
                                    <th>Tid ut</th>
                                    <th>Punkt in</th>
                                    <th>Punkt ut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sminut}
                            </tbody>
                        </table>
                    </Paper>
                </div>
            </div>
        );
    }
}

export default MemberList;
