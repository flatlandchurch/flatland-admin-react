import React, { Component } from 'react';
import { BrowserRouter } from 'react-router-dom';

import Pages from './pages';

import '@flatland/chokhmah/dist/chokhmah.css';

import './App.css';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Pages/>
      </BrowserRouter>
    );
  }
}

export default App;
