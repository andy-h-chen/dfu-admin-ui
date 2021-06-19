import React, {Component, useState } from 'react';
import decode from 'jwt-decode';
import Fragment from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter, Switch, Route } from 'react-router-dom';

import Jumbotron from 'react-bootstrap/Jumbotron';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import { LinkContainer } from 'react-router-bootstrap';
import {Nav, Navbar, NavDropdown, Form, FormControl, FormGroup, FormLabel} from 'react-bootstrap';

import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

// Import React Table
import {useTable, usePagination} from "react-table";
import styled from 'styled-components'
//import "react-table/react-table.css";
import makeData from './makeData';
import './App.css';

const ID_TOKEN_KEY = 'id_token';

const domainName = "https://wip.remocare.net";

const Styles = styled.div`
  padding: 1rem;

  table {
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }
    }
  }
`

function getTokenExpirationDate(encodedToken) {
  const token = decode(encodedToken);
  if (!token.exp) { return null; }

  const date = new Date(0);
  date.setUTCSeconds(token.exp);
  return date;
}

export function getIdToken() {
  return localStorage.getItem(ID_TOKEN_KEY);
}

export function setIdToken(idToken) {
  localStorage.setItem(ID_TOKEN_KEY, idToken);
}

function clearIdToken() {
  localStorage.removeItem(ID_TOKEN_KEY);
}

export function isLoggedIn() {
  const idToken = getIdToken();
  return !!idToken && !isTokenExpired(idToken);
}

function isTokenExpired(token) {
  const expirationDate = getTokenExpirationDate(token);
  return expirationDate < new Date();
}

export function logout(callback) {
  clearIdToken();
  if (callback)
    callback();
}


function UserTable({ columns, data}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page, // Instead of using 'rows', we'll use page,
    // which has only the rows for the active page

    // The rest of these things are super handy, too ;)
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0 },
    },
    usePagination
  )


  // Render the UI for your table
  return (
    <div>
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {page.map((row, i) => {
          prepareRow(row)
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {
                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
      <div className="pagination">
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {'<<'}
        </button>{' '}
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {'<'}
        </button>{' '}
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {'>'}
        </button>{' '}
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          {'>>'}
        </button>{' '}
        <span>
          Page{' '}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{' '}
        </span>
      </div>
    </div>
  )
}

class UserList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.users,
      //app: this.props.app,
    }
  }
  componentDidMount() {
    //this.getData();
  }

  onDeleteRow = (row) => {
    var d = this.props.users;
    var deleted = d.splice(row.index, 1);
    console.log("row.index", row.index, "deleted[0]._id", deleted[0]._id);
    this.setState({data: d});
    var url = domainName + '/api/v1/users/' + deleted[0]._id;
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

  onEnableRow = (row, enabled) => {
    var d = this.state.data;
    var theRow = d[row.index];
    theRow.enabled = enabled;
    d[row.index] = theRow;
    this.setState({data: d});
    
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('x-access-token', getIdToken());
    var url = domainName + '/api/v1/users/' + theRow._id + '/enabled';
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

  render() {
    const columns = [
        {
          Header: 'User Management',
          columns: [
            {
              Header: 'User ID',
              accessor: '_id',
            },
            {
              Header: 'Email',
              accessor: 'email',
            },
            {
              Header: 'Agent ID',
              accessor: 'agentId',
              Cell: row =>
              {
                let agent_id = row.value;
                return (
                  <div>
                    {agent_id}
                    <Popup trigger={<button>Edit</button>} modal>
                      <div className="header"> Edit Agent ID </div>
                      <span> Modal content </span>
                    </Popup>
                  </div>);
              }
            },
            {
              Header: 'Take Action',
              maxWidth: 200,
              accessor: 'enabled',
              Cell: row => (
                <div><form>
                  <input type="radio" name="action" value="enabled" checked={row.value } onChange={ () => {this.onEnableRow(row.row, true) }} />Enable<br />
                  <input type="radio" name="action" value="disable" checked={!row.value} onChange={ () => {this.onEnableRow(row.row, false) }} />Disable<br />
                </form>
                  <Button  onClick={() => { if (window.confirm('Are you sure you wish to delete this item?')) this.onDeleteRow(row.row) }}>X</Button>
                </div>
              )
            }

          ],
        },
    ];
    const {data} = this.state;
    return (
      <Styles>
        <UserTable columns={columns} data={this.props.users} />
      </Styles>
    )
  }
}

function DfuTable({ columns, data }) {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page, // Instead of using 'rows', we'll use page,
    // which has only the rows for the active page

    // The rest of these things are super handy, too ;)
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0 },
    },
    usePagination
  )

  // Render the UI for your table
  return (
    <div>

      <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => {
                  return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
      {/* 
        Pagination can be built however you would like. 
        This is just a very basic UI implementation:
      */}
      <div className="pagination">
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {'<<'}
        </button>{' '}
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {'<'}
        </button>{' '}
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {'>'}
        </button>{' '}
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          {'>>'}
        </button>{' '}
        <span>
          Page{' '}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{' '}
        </span>
      </div>
    </div>
  )
}

class DfuList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.dfu,
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
  onDeleteRow = (row) => {
    var d = this.state.data;
    var deleted = d.splice(row.index, 1);
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

  onEnableRow = (row, enabled) => {
    var d = this.state.data;
    var theRow = d[row.index];
    theRow.enabled = enabled;
    d[row.index] = theRow;
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

  render() {
    const columns = [
      {
        Header: 'DFU Management',
        columns: [
          {
            Header: 'DFU ID',
            accessor: 'dfuId',
          },
          {
            Header: 'Device ID',
            accessor: 'deviceId',
          },
          {
            Header: 'Site Name',
            id: 'deviceName',
            accessor: 'deviceName',
            maxWidth: 200
          },
          {
            Header: 'Register Date',
            accessor: 'registerDate'
          }, {
            Header: 'Last Alarm',
            accessor: 'lastAlarm'
          },
         {
            Header: 'Take Action',
            maxWidth: 200,
            accessor: 'enabled',
            Cell: row => (
              <div><form>
                <input type="radio" name="action" value="enabled" checked={row.value } onChange={ () => {this.onEnableRow(row.row, true) }} />Enable<br />
                <input type="radio" name="action" value="disable" checked={!row.value} onChange={ () => {this.onEnableRow(row.row, false) }} />Disable<br />
              </form>
                <Button  onClick={() => { if (window.confirm('Are you sure you wish to delete this item?')) this.onDeleteRow(row.row) }}>X</Button>
              </div>
            )
          }
        ]
      }
    ];
    const {data} = this.state;
    return (
      <Styles>
        <DfuTable columns={columns} data={data}  />
      </Styles>
    );
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
            <FormLabel>Email</FormLabel>
            <FormControl
              autoFocus
              type="text"
              value={this.state.email}
              onChange={this.handleChange}
            />
          </FormGroup>
          <FormGroup controlId="password" bsSize="large">
            <FormLabel>Password</FormLabel>
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
    fetch(request, {mode: 'cors'})
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
    var users = this.state.allUsers;
    return (
      <Container className="p-3">
        <Navbar bg="light" expand="lg">
          <Navbar.Brand href="#home">DFU Management</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#link">Link</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        { !this.state.isLoggedIn ?
          <div className="Login">
          <Login submitHandler={this.loginHandler.bind(this)} />
          <div id='errMsg'>{this.state.errMsg}</div>
                
          </div>
          :
          null
        }
        {this.state.showDfus ?
          <DfuList dfu={this.state.dfus} agents={this.state.agents} users={this.state.allUsers} /> : null
        }
        {this.state.showUsers ?
          <UserList users={users} agentIDHandler={this.modifyAgentIdForUser} app={this} /> : null
        }
      </Container>    
      
    )
  }
}

export default App;