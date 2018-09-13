import 'react-dates/initialize';

import React, { Component } from 'react';
import { BrowserRouter } from 'react-router-dom';

import Layout from './pages/Layout';

import 'react-dates/lib/css/_datepicker.css';
import '@flatland/chokhmah/dist/chokhmah.css';

import './App.css';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Layout/>
      </BrowserRouter>
    );
  }
}

export default App;
