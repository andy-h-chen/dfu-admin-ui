import React, { Component } from 'react';
import decode from 'jwt-decode';
import ReactDom from 'react-dom';
import { Button, FormGroup, FormControl, ControlLabel, Nav, Navbar, NavItem, Glyphicon, Modal } from "react-bootstrap";
//import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
//import { LinkContainer } from "react-router-bootstrap";
import './App.css';

// Import React Table
import ReactTable from "react-table";
import "react-table/react-table.css";

import Popup from "react-popup";

import Select from 'react-select';
//import 'react-select/dist/react-select.css';

const ID_TOKEN_KEY = 'id_token';

export function getIdToken() {
  return localStorage.getItem(ID_TOKEN_KEY);
}
function clearIdToken() {
  localStorage.removeItem(ID_TOKEN_KEY);
}
export function logout(callback) {
  clearIdToken();
  if (callback)
    callback();
}
// Get and store id_token in local storage
export function setIdToken(idToken) {
  localStorage.setItem(ID_TOKEN_KEY, idToken);
}

export function isLoggedIn() {
  const idToken = getIdToken();
  return !!idToken && !isTokenExpired(idToken);
}
function isTokenExpired(token) {
  const expirationDate = getTokenExpirationDate(token);
  return expirationDate < new Date();
}
function getTokenExpirationDate(encodedToken) {
  const token = decode(encodedToken);
  if (!token.exp) { return null; }

  const date = new Date(0);
  date.setUTCSeconds(token.exp);
  return date;
}

ReactDom.render(
    <Popup />,
    document.getElementById('popupContainer')
);

var domainName = "https://wip.remocare.net";



/** The prompt content component */
class PromptSelect extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedOption: this.props.selectedOption,
            availableOptions: this.props.options,
            value: '',
        };
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevState.value !== this.state.value) {
            this.props.onChange(this.state.value);
        }
    }
    handleChange = (selectedOption) => {
      this.setState({ selectedOption });
          // selectedOption can be null when the `x` (close) button is clicked
          if (selectedOption) {
            console.log(`Selected: ${selectedOption.value}`);
            this.setState({value: selectedOption.value});
          }
    }

    render() {
        const { selectedOption } = this.state;
        const { availableOptions } = this.state;
        return (
          <div>
          <Select
            name="form-field-name"
            value={selectedOption}
            onChange={this.handleChange}
            options = {availableOptions}
          />
          <br /><br /><br /><br /><br />
          </div>
        );
    }
}

/** Prompt plugin */
Popup.registerPlugin('prompt_select', function (options, selectedOption, placeholder, callback) {
    let promptValue = null;
    let promptChange = function (value) {
        promptValue = value;
    };

    this.create({
        title: 'Add a new email',
        content: <PromptSelect onChange={promptChange} placeholder={placeholder} options={options} selectedOption={selectedOption} />,
        buttons: {
            left: ['cancel'],
            right: [{
                text: 'Save',
                className: 'success',
                action: function () {
                    callback(promptValue);
                    Popup.close();
                }
            }]
        }
    });
});


/** The prompt input content component */
class PromptInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.value
        };

        this.onChange = (e) => this._onChange(e);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.value !== this.state.value) {
            this.props.onChange(this.state.value);
        }
    }

    _onChange(e) {
        let value = e.target.value;

        this.setState({value: value});
    }

    render() {
        return <input type="text" placeholder={this.props.placeholder} className="mm-popup__input" value={this.state.value} onChange={this.onChange} />;
    }
}

Popup.registerPlugin('prompt_input', function (defaultValue, placeholder, callback) {
    let promptValue = null;
    let promptChange = function (value) {
        promptValue = value;
    };

    this.create({
        title: 'Please input the agent ID',
        content: <PromptInput onChange={promptChange} placeholder={placeholder} value={defaultValue} />,
        buttons: {
            left: ['cancel'],
            right: [{
                text: 'Save',
                className: 'success',
                action: function () {
                    callback(promptValue);
                    Popup.close();
                }
            }]
        }
    });
});

class UserList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: this.props.users,
    }
  }
  render() {
    const { users } = this.state;
    return (
      <div>
        <ReactTable
          data={users}
          columns={[{
      Header: 'User management',
      columns: [{
        Header: 'User ID',
        id: '_id',
        accessor: '_id'
      }, {
        Header: 'Email',
        id: 'email',
        accessor: 'email'
      }, {
        Header: 'Agent ID',
        id: 'agentId',
        accessor: 'agentId',
        Cell: row =>
        {
          let self = this;
          let agent_id = row.value;
          let btn = <Button bsSize='xs' bsStyle='default' onClick={() => { Popup.plugins().prompt_input(agent_id, '', function(value) { self.modifyAgentId(value, row.index); })}}><Glyphicon glyph="pencil" /></Button>;
          return <div>{agent_id}<br />{btn}</div>;
        }
      }]
      }]}
          defaultPageSize={10}
          className="-striped -highlight" /></div>
    );
  }
  modifyAgentId(value, index) {
    this.props.agentIDHandler.bind(this.props.app)(value, index);
  }

}

class DfuList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data,
      showModal: false,
      modalSelectOptions: [],
      modalSelectHandler: null,
    }
  }
  componentDidMount() {
    //this.getData();
  }
  onModalClose() {
    this.setState({showModal: false});
  }
  onModalSave(selected) {
    console.log(selected);
    this.onModalClose();
  }
  render() {
    const { data } = this.state;
    return (
      <div>
        <ReactTable
          data={data}
          columns={[{
      Header: 'DFU management',
      columns: [{
        Header: 'DFU ID',
        id: 'dfuId',
        accessor: 'dfuId',
        maxWidth: 80
      }, {
        Header: 'Device ID',
        id: 'deviceId',
        accessor: 'deviceId',
        maxWidth: 200
      }, {
        Header: 'Site Name',
        id: 'deviceName',
        accessor: 'deviceName',
        maxWidth: 200
      }, {
        Header: 'User Status',
        maxWidth: 100,
        accessor: 'status',
        Cell: row => {
            let statusOptions = [{value: 0, label: 'Trial'}, {value: 1, label: 'Regular'}, {value:2, label:'VIP'}];
            let self = this;
            let btn = <Button bsSize='xsmall' bsStyle='default' onClick={() => { Popup.plugins().prompt_select(statusOptions, row.value, '', function(value) { self.handleUserStatusChange(value, row.index); })}}><Glyphicon glyph="pencil" /></Button>;
            let status = row.value === 0 ? 'Trial' : (row.value === 1 ? 'Regular' : 'VIP');
            return <div>{status}<br />{btn}</div>;
        }
      }, {
        Header: 'Register Date',
        accessor: 'registerDate'
      }, {
        Header: 'Last Alarm',
        accessor: 'lastAlarm'
      }, {
        Header: 'Agent ID',
        id: 'admin_id',
        accessor: 'admin_id',
        Cell: row =>
        {
          let self = this;
          let agent_id = row.value ? row.value.agentId : '';
          //let btn = <Button bsSize='xsmall' bsStyle='default' onClick={() => { Popup.plugins().prompt_select(self.props.agents, null, '', function(value) { self.modifyAgentId(value, row.index); })}}><Glyphicon glyph="pencil" /></Button>;
          let btnHandler = function() {
            self.setState({
              showModal: true,
              modalSelectOptions: self.props.agents,
              modalSelectHandler: function(value) { self.modifyAgentId(value, row.index); self.onModalClose()}
            });
          };
          let btn = <Button bsSize='xsmall' bsStyle='default' onClick={btnHandler}><Glyphicon glyph="pencil" /></Button>;
          return <div>{agent_id}<br />{btn}</div>;
        }
      }, {
        Header: 'Associated Emails',
        id: 'users_id',
        accessor: 'users_id',
        maxWidth: 300,
        Cell: row => 
        {
          let self = this;
          let content = [];
          for(var i=0; i<row.value.length; i++) {
            content.push(<div><input type='checkbox' name='userid' value={row.value[i]._id} defaultChecked onChange={(e) => { console.log(e.target.name, e.target.value); self.modifyAssociatedEmail(e.target.value, row.index, false); }} />{row.value[i].email}</div>);
          }
          /*
          let btn1 = <Button bsSize='xsmall' bsStyle='default' onClick={() => { Popup.plugins().prompt_select(self.props.users, null, '', function(value) { self.modifyAssociatedEmail(value, row.index, true); })}}><Glyphicon glyph="plus" /></Button>;
          */
          let btnHandler = function() {
            self.setState({
              showModal: true,
              modalSelectOptions: self.props.users,
              modalSelectHandler: function(value) { self.modifyAssociatedEmail(value, row.index, true); self.onModalClose()}
            });
          };
          let btn = <Button bsSize='xsmall' bsStyle='default' onClick={btnHandler}><Glyphicon glyph="plus" /></Button>;
          return <div>{content}{btn}</div>;
        }
      }, {
        Header: 'Take Action',
        maxWidth: 200,
        accessor: 'enabled',
        Cell: row => (
          <div><form>
            <input type="radio" name="action" value="enabled" checked={row.value } onChange={ () => {this.onEnableRow(row.index, row.value, true) }} />Enable<br />
            <input type="radio" name="action" value="disable"  checked={!row.value} onChange={ () => {this.onEnableRow(row.index, row.value, false) }} />Disable<br /></form>
            <Button bsSize='xsmall' bsStyle='default' onClick={() => { if (window.confirm('Are you sure you wish to delete this item?')) this.onDeleteRow(row.index) }}><Glyphicon glyph="remove" /></Button>
          </div>
        )
      }]
    }]}
          defaultPageSize={10}
          className="-striped -highlight"
        />   
        {this.state.showModal ?
        <MyModal show={this.state.showModal} onHide={this.onModalClose.bind(this)} onSave={this.state.modalSelectHandler} options={this.state.modalSelectOptions} />
        : null}        
      </div>
    );
  }

  onDeleteRow = (index) => {
    var d = this.state.data;
    var deleted = d.splice(index, 1);
    this.setState({data: d});

    var url = domainName + '/api/v1/dfus/' + deleted[0]._id;
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('x-access-token', getIdToken());
    var init = {
      method: 'DELETE',
      headers: headers
    };
    var request = new Request(url, init);
    fetch(request)
      .then(response => response.json())
      .then(data => {
        console.log(data);
      })
      .catch(error => console.error(error));
  }
  onEnableRow = (index, value, enabled) => {
    var d = this.state.data;
    var theRow = d[index];
    theRow.enabled = enabled;
    d[index] = theRow;
    this.setState({data: d});
    
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('x-access-token', getIdToken());
    var url = domainName + '/api/v1/dfus/' + theRow._id + '/enabled';
    var body = JSON.stringify({
        _id: theRow._id,
        enabled: theRow.enabled
    });
    var init = {
        method: 'PATCH',
        headers: headers,
        body: body
    };
    var request = new Request(url, init);
    fetch(request)
      .then(response => response.json())
      .then(data => {
        console.log(data);
      })
      .catch(error => console.error(error));
  }

  modifyAssociatedEmail = (userId, index, isAdd) => {
    var users = this.props.users,
        theUser = null;
    for(var i=0; i<users.length; i++) {
      if (users[i].value === userId) {
        theUser = {_id: userId, email: users[i].label};
        break;
      }
    }
    if (!theUser) return;

    var d = this.props.data;
    var theRow = d[index];
    if (isAdd) {
      d[index].users_id.push(theUser);
    } else {
      var findUserIndex = function(elm, index, array) {
        return elm._id === theUser._id;
      };
      var removedIndex = theRow.users_id.findIndex(findUserIndex);
      console.log(removedIndex, theUser, theRow.users_id);
      d[index].users_id.splice(removedIndex);
    }
    this.setState({data: d});
    // Save to db
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('x-access-token', getIdToken());
    var url = domainName + '/api/v1/dfus/' + theRow._id + '/users_id';
    var body = JSON.stringify({
        _id: theRow._id,
        users_id: theRow.users_id
    });
    var init = {
        method: 'PATCH',
        headers: headers,
        body: body
    };
    var request = new Request(url, init);
    fetch(request)
      .then(response => response.json())
      .then(data => {
        console.log(data);
      })
      .catch(error => console.error(error));
  }
  handleUserStatusChange = (userStatus, index) => {
    console.log(userStatus, index);
    var d = this.state.data;
    var theRow = d[index];
    d[index].status = userStatus;
    this.setState({data: d});

    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('x-access-token', getIdToken());
    var url = domainName + '/api/v1/dfus/' + theRow._id + '/status';
    var body = JSON.stringify({
        _id: theRow._id,
        status: theRow.status
    });
    var init = {
        method: 'PATCH',
        headers: headers,
        body: body
    };
    var request = new Request(url, init);
    fetch(request)
      .then(response => response.json())
      .then(data => {
        console.log(data);
      })
      .catch(error => console.error(error));
  }
  modifyAgentId = (userId, index) => {
    var agents = this.props.agents,
        theUser = null;
    for(var i=0; i<agents.length; i++) {
      if (agents[i].value === userId) {
        theUser = {_id: userId, agentId : agents[i].label};
        break;
      }
    }
    if (!theUser) return;
    var d = this.state.data;
    d[index].admin_id = theUser;
    var theRow = d[index];
    this.setState({data: d});

    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('x-access-token', getIdToken());
    var url = domainName + '/api/v1/dfus/' + theRow._id + '/admin_id';
    var body = JSON.stringify({
        _id: theRow._id,
        admin_id: theRow.admin_id
    });
    var init = {
        method: 'PATCH',
        headers: headers,
        body: body
    };
    var request = new Request(url, init);
    fetch(request)
      .then(response => response.json())
      .then(data => {
        console.log(data);
      })
      .catch(error => console.error(error));
  }
}

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: ''
    };
  }
  validateForm() {
    return this.state.email.length > 0 && this.state.password.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = event => {
    event.preventDefault();
    this.props.submitHandler({email: event.target.email.value, password: event.target.password.value});
  }
  render() {
    return (
      <div className="Login">
        <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="email" bsSize="large">
            <ControlLabel>Email</ControlLabel>
            <FormControl
              autoFocus
              type="text"
              value={this.state.email}
              onChange={this.handleChange}
            />
          </FormGroup>
          <FormGroup controlId="password" bsSize="large">
            <ControlLabel>Password</ControlLabel>
            <FormControl
              value={this.state.password}
              onChange={this.handleChange}
              type="password"
            />
          </FormGroup>
          <Button
            block
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
          >
            Login
          </Button>
        </form>
      </div>
    );
  }
}

class MyModal extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
          selectedOption: this.props.selectedOption,
          availableOptions: this.props.options,
          value: '',
      };
  }
  handleChange = (selectedOption) => {
    this.setState({ selectedOption });
        // selectedOption can be null when the `x` (close) button is clicked
        if (selectedOption) {
          console.log(`Selected: ${selectedOption.value}`);
          this.setState({value: selectedOption.value});
        }
  }
  handleSave = () => {
    this.props.onSave(this.state.value);
  }
  render() {
    return (
      <div>
        <Modal
          {...this.props}
          bsSize="small"
          aria-labelledby="contained-modal-title-sm">
          <Modal.Header closeButton>
            <Modal.Title>Modal heading</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            <Select
            name="form-field-name"
            value={this.state.selectedOption}
            onChange={this.handleChange}
            options = {this.state.availableOptions}
          />
          <br /><br />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.props.onHide}>Cancel</Button>
            <Button onClick={this.handleSave}>Save</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: null,
      allUsers: [],
      dfus: [],
      options: [],
      users: [],
      agents: [],
      isLoggedIn: isLoggedIn(),
      showLogin: true,
      showUsers: false,
      showDfus: false,
      errMsg: null
    };
  }
  componentDidMount() {
    if (this.state.isLoggedIn) {
      if (!this.state.currentUser) {
        var decodedToken = decode(getIdToken());
        this.getDataForUser(decodedToken);
      }
    }
  }
  modifyAgentIdForUser(agentId, index) {
    console.log(agentId, index);
    var users = this.state.users;
    users[index].agentId = agentId;
    this.setState({users: users});
    
    var theRow = users[index];
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('x-access-token', getIdToken());
    var url = domainName + '/api/v1/users/' + theRow._id + '/agentid';
    var body = JSON.stringify({
        _id: theRow._id,
        agentId: theRow.agentId
    });
    var init = {
        method: 'PATCH',
        headers: headers,
        body: body
    };
    var request = new Request(url, init);
    fetch(request)
      .then(response => response.json())
      .then(data => {
        console.log(data);
      })
      .catch(error => console.error(error));
  }
  getDataForUser(value) {
    this.setState({showUsers: false, showDfus: false});
    if (value && value.agentId) {
        this.setState({currentUser: value});
        this.getAllSubAgentDfu(value.agentId);
        this.getAllSubAgentUser(value.agentId);
        this.getAllUsers();
    }
    console.log(value);
  }
  getAllSubAgentDfu(agentId) {
    const url = domainName + '/api/v1/dfus/allsubagent';
    var that = this;
    this.getData1(url, agentId, function(data) {
        that.setState({dfus: data, showDfus: true});
    });
  }
  getAllSubAgentUser(agentId) {
    const url = domainName + '/api/v1/users/allsubagent';
    var that = this;
    this.getData1(url, agentId, function(data) {
      that.setState({users: data, showUsers: true});
    });
  }
  getAllUsers() {
    const url = domainName + '/api/v1/users';
    var that = this;
    this.getData1(url, 0, function(data) {
      var agents = [];
      for (var i=0; i<data.length; i++) {
        data[i].value = data[i]._id;
        data[i].label = data[i].email;
        if (data[i].agentId)
          agents.push({value: data[i]._id, label: data[i].agentId + ' - ' + data[i].email});
      }
      that.setState({allUsers: data, agents: agents});
    }, 'GET');
  }
  getData1(url, agentId, callback, method) {
    var body = JSON.stringify({
        user: {agentId: agentId}
    });
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('x-access-token', getIdToken());
    var init = {
        method: 'POST',
        headers: headers,
        body: body
    };
    if (method === 'GET') {
      init.body = undefined;
      init.method = 'GET';
    }
    var request = new Request(url, init);
    fetch(request)
      .then(response => response.json())
      .then(callback)
      .catch(error => console.error(error));
  }
  getData = () => {
    const url_users = domainName + '/api/v1/users';
    fetch(url_users)
      .then(response => response.json())
      .then(data => {
        for (var i=0; i<data.length; i++) {
          data[i].value = data[i]._id;
          data[i].label = data[i].email;
        }
        this.setState({allUsers: data});
      })
      .catch(error => console.error(error));
  }
  loginHandler(data) {
    console.log(data);
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    var url = domainName + '/api/v1/auth/login';
    var body = JSON.stringify({
        username: data.email,
        password: data.password,
        target: 'admin'
    });
    var init = {
        method: 'POST',
        headers: headers,
        body: body
    };
    var request = new Request(url, init);
    fetch(request)
      .then(response => response.json())
      .then(data => {
        if (data.auth && data.token) {
          setIdToken(data.token);
        }
        this.setState({
          isLoggedIn: isLoggedIn(),
          errMsg: null
        });
        var decodedToken = decode(data.token);
        this.getDataForUser(decodedToken);
      })
      .catch(error => {
        this.setState({errMsg: error.message});
      });
  }
  handleLogout() {
    var that = this;
    logout(function() {
      that.setState({
        isLoggedIn: isLoggedIn(),
        showDfus: false,
        showUsers: false
      });
    });
  }
  render() {
    return (
    <div>
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="#home">DFU Management</a>
          </Navbar.Brand>
        </Navbar.Header>

        {!this.state.isLoggedIn ?
        <Nav pullRight>
          <NavItem>Login</NavItem>
        </Nav>
          : 
        <Nav pullRight>
          <NavItem>
            <Button bsStyle="link">
              {this.state.currentUser ? this.state.currentUser.email : null}
            </Button>
          </NavItem>
          <NavItem>
              <Button
                block
                bsStyle="link"
                onClick={this.handleLogout.bind(this)}
              >
                Logout
              </Button>
          </NavItem>
        </Nav>
        }
      </Navbar>
      { !this.state.isLoggedIn ?
        <div className="Login">
        <Login submitHandler={this.loginHandler.bind(this)} />
        <div id='errMsg'>{this.state.errMsg}</div>
              
        </div>
        :
        null
      }
      <div>
        {this.state.showDfus ?
           <DfuList data={this.state.dfus} agents={this.state.agents} users={this.state.allUsers} /> : null
        }
        {this.state.showUsers ?
           <UserList users={this.state.users} agentIDHandler={this.modifyAgentIdForUser} app={this} />
           :
           null
        }
      </div>
    </div>
    );
  }
}

export default App;

