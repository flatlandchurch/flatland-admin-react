import React from 'react';
import orderBy from 'lodash-es/orderBy';
import { Loading, Button } from '@flatland/chokhmah';
import { Link } from 'react-router-dom';

export default class SeriesList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      loading: true,
      hideLoader: false,
    };
  }

  componentDidMount() {
    window.firebase.database().ref('series')
      .once('value')
      .then(data => data.val())
      .then(data => Object.keys(data)
        .map(key => Object.assign({}, data[key], {
          permalink: key,
        })))
      .then(data => {
        console.log(data);
        const completedPosts = data.filter(d => d.started);
        const incompletePosts = data.filter(d => !d.started);
        this.setState({
          posts: [
            ...orderBy(completedPosts, ['started'], ['desc']),
            ...orderBy(incompletePosts, ['title'], ['asc']),
          ],
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
              <h3>Sermon Series</h3>
              <div className="spacer" />
              <Button onClick={() => window.location.href = '/series/new'}>New</Button>
            </header>
            <table className="list">
              <tbody>
              {
                Boolean(this.state.posts.length) &&
                this.state.posts.map(post => (
                  <tr key={post.date}>
                    <td><Link to={`/series/${post.permalink}`}>{post.title}</Link></td>
                    <td className="table-publish-indicator">
                      {post.image ? '' : <em>Needs Image</em>}
                      </td>
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
