import React from 'react';
import PropTypes from 'prop-types';

import BlogEditor from '../pages/blogs/BlogEditor';
import BlogList from '../pages/blogs/BlogList';

const routes = [
  { path: /\/blog\/([\w\s\d-]*)/, component: BlogEditor },
  { path: /\/blog/, component: BlogList, title: 'Blog Posts | Flatland Church Admin' },
];

export default class Router extends React.Component {
  static propTypes = {
    children: PropTypes.element,
  };

  static defaultProps = {
    children: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      path: window.location.pathname,
    };
  }

  render() {
    const route = routes.find((route) => route.path.test(this.state.path));
    const id = route.path.exec(this.state.path)[1] || 'new';
    const Component = route.component;

    if (route.title) {
      document.title = route.title;
    }

    return <Component id={id} type={id === 'new' ? 'create' : 'edit'} />;
  }
}
