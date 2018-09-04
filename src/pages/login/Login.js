import React from 'react';
import PropTypes from 'prop-types';
import {
  TextField,
  Button,
} from '@flatland/chokhmah';

export default class Login extends React.Component {
  static propTypes = {
    onLogin: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      emailError: '',
      generalError: '',
    };
  }

  handleChange = (type) => (val) => {
    this.setState({ [type]: val });
  };

  login = (e) => {
    e.preventDefault();
    window.firebase.auth()
      .signInWithEmailAndPassword(
        this.state.email,
        this.state.password,
      )
      .then((user) => window.firebase.database().ref(`users/${user.user.uid}`)
          .once('value')
          .then(data => data.val()))
      .then((user) => {
        window.localStorage.setItem('flatland:adminUser', JSON.stringify(user));
        return this.props.onLogin(user);
      })
      .catch((err) => {
        if (err.message.includes('email')) {
          return this.setState({
            emailError: err.message,
          });
        }
        return this.setState({
          generalError: err.message,
        });
      });
  };

  render() {
    return (
      <div className="card card-elevation--1 no-nudge">
        <div className="card-body">
          {
            this.state.generalError &&
            <span className="general-error">{this.state.generalError}</span>
          }
          <form>
            <TextField
              label="Email"
              name="email"
              onChange={this.handleChange('email')}
              value={this.state.email}
            />
            {
              this.state.emailError &&
              <span className="inline-error">{this.state.emailError}</span>
            }
            <TextField
              label="Password"
              type="password"
              onChange={this.handleChange('password')}
              value={this.state.password}
            />
            <Button
              context="primary"
              onClick={this.login}
              onKeyDown={this.login}
            >
              Login
            </Button>
          </form>
        </div>
      </div>
    );
  }
}
