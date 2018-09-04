import React from 'react';
import moment from 'moment';

export default class BlogList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
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
          posts: data.sort((a, b) => a.date < b.date),
        });
      });
  }

  render() {
    return (
      <div className="card card-elevation--1 no-nudge">
        <div className="card-body">
          <h3>Blog Posts</h3>
          <table>
            <tbody>
            {
              Boolean(this.state.posts.length) &&
                this.state.posts.map(post => (
                  <tr key={post.date}>
                    <td><a href={`/blog/${post.permalink}`}>{post.title}</a></td>
                    <td>{moment.unix(parseInt(post.date, 10)).format('MMM D')}</td>
                    <td className="table-publish-indicator">{post.published ? 'Published' : <em>Draft</em>}</td>
                  </tr>
                ))
            }
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
