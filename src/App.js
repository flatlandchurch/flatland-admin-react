import React, { Component } from 'react';
import firebase from 'firebase';
import { Menu } from '@flatland/chokhmah';

import '@flatland/chokhmah/dist/chokhmah.css';

import './App.css';

import Router from './utils/Router';
import Login from './pages/login/Login';

class App extends Component {
  constructor(props) {
    super(props);
    firebase.initializeApp({
      apiKey: "AIzaSyD-k4hwSlh70enDXsZQbGJLumTp8oRVrCk",
      authDomain: "flatland-api.firebaseapp.com",
      databaseURL: "https://flatland-api.firebaseio.com",
      projectId: "flatland-api",
      storageBucket: "flatland-api.appspot.com",
      messagingSenderId: "851671163539"
    });
    window.firebase = firebase;

    this.state = {
      currentUser: JSON.parse(window.localStorage.getItem('flatland:adminUser') || '{}'),
    };
  }

  componentDidMount() {
    window.addEventListener('historyChange', () => {
      const currentRoute = window.location.href;
      console.debug(currentRoute);
      window.location.href = currentRoute;
    });
  }

  openMenu = () => {
    this.setState((prevState) => ({ menuOpen: !prevState.menuOpen }), () => {
      if (this.state.menuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'inherit';
      }
    });
  };

  setCurrentUser = (user) => this.setState({ currentUser: user });

  render() {
    return Object.keys(this.state.currentUser).length ?
      <React.Fragment>
        <div
          className="menu-toggle"
          onClick={this.openMenu}
        >
          <span />
          <span />
          <span />
        </div>
        {
          this.state.menuOpen &&
          <Menu
            menuItems={{
              publishing: [
                { uri: '/blog', label: 'Blog' },
              ],
            }}
          />
        }
        <Router />
      </React.Fragment> :
      <Login onLogin={this.setCurrentUser} />;
  }
}

export default App;
