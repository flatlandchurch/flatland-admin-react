import React from 'react';
import moment from 'moment';
import sortBy from 'lodash-es/sortBy';
import { Loading, Button } from '@flatland/chokhmah';
import { Link } from 'react-router-dom';

export default class BlogList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      loading: true,
      hideLoader: false,
    };
  }

  componentDidMount() {
    window.firebase.database().ref('blogMeta')
      .once('value')
      .then(data => data.val())
      .then(data => Object.keys(data)
        .map(key => Object.assign({}, data[key], {
          date: key,
        }))
        .filter(d => !d.topics.legacy))
      .then(data => {
        this.setState({
          posts: sortBy(data, ['date']).reverse(),
          loading: false,
        });
      });
  }

  hideLoader = () => {
    this.setState({ hideLoader: true });
  };

  render() {
    return (
      <React.Fragment>
        {
          !this.state.hideLoader &&
          <Loading complete={!this.state.loading} onComplete={this.hideLoader} />
        }
        <div className="card card-elevation--1 no-nudge">
          <div className="card-body">
            <header>
              <h3>Blog Posts</h3>
              <div className="spacer" />
              <Button onClick={() => window.location.href = '/blog/new'}>New</Button>
            </header>
            <table>
              <tbody>
              {
                Boolean(this.state.posts.length) &&
                  this.state.posts.map(post => (
                    <tr key={post.date}>
                      <td><Link to={`/blog/${post.permalink}`}>{post.title}</Link></td>
                      <td>{moment.unix(parseInt(post.date, 10)).format('M/D/YYYY')}</td>
                      <td className="table-publish-indicator">{post.published ? 'Published' : <em>Draft</em>}</td>
                    </tr>
                  ))
              }
              </tbody>
            </table>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
