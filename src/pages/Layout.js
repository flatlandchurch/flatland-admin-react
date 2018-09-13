import React from 'react';
import { Route } from 'react-router-dom';
import { Menu, Button } from '@flatland/chokhmah';
import cx from 'classnames';

import Login from './login/Login';
import BlogList from './blogs/BlogList';
import BlogEditor from './blogs/BlogEditor';
import SermonList from './sermons/SermonList';
import SermonEditor from './sermons/SermonEditor';
import SeriesList from './series/SeriesList';
import SeriesEditor from './series/SeriesEditor';

import Lock from '../icons/Lock';
import getAdminToken from '../utils/getAdminToken';
import getMenu from '../utils/getMenu';

export default class Page extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      menuIsOpen: false,
      user: {},
    };
  }

  componentDidMount() {
    const user = JSON.parse(window.localStorage.getItem('flatland:adminUser') || '{}');
    getAdminToken(user.id)
      .then(() => {
        this.setState({ user });
      })
      .catch((err) => {
        if (err.code === 'PERMISSION_DENIED' && window.location.pathname !== '/') {
          this.logOut();
        }
      });
  }

  logOut = () => {
    this.setState({ user: {} });
    window.firebase.auth().signOut();
    window.location.href = '/';
  };

  toggleMenu = () => {
    this.setState((prevState) => ({
      menuIsOpen: !prevState.menuIsOpen,
    }), () => {
      document.body.style.overflow = this.state.menuIsOpen ? 'hidden' : 'inherit';
    });
  };

  render() {
    const Dashboard = () => (
      <React.Fragment>
        <header>
          <div
            className={cx('menu-toggle', {active: this.state.menuIsOpen})}
            onClick={this.toggleMenu}
          >
            <span/>
            <span/>
            <span/>
          </div>
          <div className="spacer"/>
          <Button onClick={this.logOut}>Log out</Button>
        </header>
        {
          this.state.menuIsOpen &&
          <Menu
            menuItems={getMenu()}
            onClick={this.toggleMenu}
          />
        }
        <Route path="/dashboard" render={() => (<div style={{textAlign: 'center'}}><h1>Flatland Admin</h1></div>)}/>
        <Route exact path="/blog" component={BlogList}/>
        <Route path="/blog/:permalink" component={BlogEditor}/>
        <Route exact path="/sermons" component={SermonList} />
        <Route path="/sermons/:permalink" component={SermonEditor} />
        <Route exact path="/series" component={SeriesList} />
        <Route path="/series/:permalink" component={SeriesEditor} />
      </React.Fragment>
    );

    return (
      <React.Fragment>
        <Route exact path="/" component={Login} />
        {
          window.location.pathname !== '/' &&
          (
            <React.Fragment>
              {
                Boolean(Object.keys(this.state.user).length) ?
                  <Dashboard/> :
                  <div className="auth-lock">
                    <Lock/>
                  </div>
              }
            </React.Fragment>
          )
        }
      </React.Fragment>
    );
  }
}
