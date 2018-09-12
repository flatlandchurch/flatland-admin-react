import React from 'react';
import { Loading, Button, Lozenge } from '@flatland/chokhmah';
import sortBy from 'lodash-es/sortBy';
import moment from 'moment/moment';
import { Link } from 'react-router-dom';

export default class SermonList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      hideLoader: false,
      sermons: [],
    };
  }

  componentDidMount() {
    window.firebase.database().ref('sermons')
      .once('value')
      .then(data => data.val())
      .then(data => Object.keys(data)
        .map(key => Object.assign({}, data[key], {
          permalink: key,
        })))
      .then(data => {
        this.setState({
          sermons: sortBy(data, ['preached']).reverse(),
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
              <h3>Sermons</h3>
              <div className="spacer" />
              <Button onClick={() => window.location.href = '/sermons/new'}>New</Button>
            </header>
            <table className="list">
              <tbody>
              {
                Boolean(this.state.sermons.length) &&
                this.state.sermons.map(post => (
                  <tr key={post.permalink}>
                    <td><Link to={`/sermons/${post.permalink}`}>{post.title}</Link></td>
                    <td>
                      {
                        post.series && post.series.title &&
                        <Lozenge label={post.series.title} />
                      }
                    </td>
                    <td>{moment.unix(parseInt(post.preached, 10)).format('M/D/YYYY')}</td>
                  </tr>
                ))
              }
              </tbody>
            </table>
          </div>
        </div>
      </React.Fragment>
    )
  }
}
