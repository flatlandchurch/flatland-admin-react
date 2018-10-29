import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash-es/get';
import {
  PageCard,
  TextField,
  Button,
  FormField,
  Jumbotron,
  Breadcrumbs,
  Loading,
} from '@flatland/chokhmah';
import SimpleMDE from 'simplemde';
import moment from 'moment';
import slugify from 'slugify';
import qs from 'qs';

import removeRegex from '../../utils/removeRegex';

import './BlogEditor.css';

export default class BlogEditor extends React.Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    const queryStringRaw = window.location.search.replace('?', '');

    this.state = {
      mde: null,
      title: '',
      content: '',
      category: '',
      published: false,
      image: {},
      images: [],
      cursor: 0,
      hasSavedImage: false,
      imageUrl: '',
      oldData: {},
      saving: false,
      loading: true,
      hideLoader: false,
      query: qs.parse(queryStringRaw),
    };
    this.typeTitle = props.match.params.permalink === 'new' ? 'Create' : 'Edit';
  }

  componentDidMount() {
    if (this.typeTitle === 'Create') {
      this.setState({ loading: false });
    }
    this.setState({
      mde: new SimpleMDE({
        element: document.getElementById('editor'),
        forceSync: true,
      }),
    });

    if (this.props.id !== 'new') {
      window.firebase.database().ref(`blogContents/${this.props.match.params.permalink}`)
        .once('value')
        .then(data => data.val())
        .then(data => {
          if (!data) {
            return this.setState({
              error: 'Whoops, it looks like the post you tried to edit does not exist.',
            });
          }

          this.state.mde.value(data.content);
          this.setState({
            title: data.title,
            category: Object.keys(data.topics).find(category => category),
            published: data.published,
            imageUrl: data.image,
            hasSavedImage: Boolean(data.image),
            oldData: data,
            loading: false,
          });
        });
    }
  }

  handleSave = (publish) => (e) => {
    e.preventDefault();
    this.setState({ saving: true });
    const user = JSON.parse(window.localStorage.getItem('flatland:adminUser'));

    if (this.typeTitle === 'Create') {
      const data = {
        approved: true,
        author: {
          name: user.name,
          position: user.role,
        },
        content: this.state.mde.value(),
        date: moment().unix(),
        image: get(this.state.image, 'urls.full'),
        imageAttribution: {
          authorUrl: `https://unsplash.com/@${get(this.state.image, 'user.username', '')}?utm_source=flatland-church&utm_medium=referral`,
          author: get(this.state.image, 'user.name', ''),
          unsplash: 'https://unsplash.com/?utm_sourc=flatland-church&utm_medium=referral',
        },
        published: publish,
        title: this.state.title,
        topics: {
          [this.state.category]: true,
        },
        permalink: slugify(this.state.title, {
          remove: removeRegex,
          lower: true,
        }),
      };
      window.firebase.database()
        .ref(`blogContents/${data.permalink}`)
        .set(data, () => {
          window.firebase.database()
            .ref(`blogMeta/${data.date}`)
            .set({
              approved: data.approved,
              author: user.name,
              image: data.image,
              published: data.published,
              title: data.title,
              topics: data.topics,
              permalink: data.permalink,
            }, () => {
              this.setState({ saving: false });
              if (publish) {
                if (this.state.category && this.state.category === 'devotionals') {
                  fetch('https://api.flatlandchurch.com/v2/emails/devotional?key=202f1c42-7054-46ee-8ca2-ddc85f9c789b', {
                    body: JSON.stringify({
                      permalink: data.permalink,
                      userId: JSON.parse(window.localStorage.getItem('flatland:adminUser') || '{}').id
                    }),
                    method: 'POST',
                    headers: {
                      'content-type': 'application/json',
                    }
                  }).then(() => {
                    window.location.href = `/blog/${data.permalink}`;
                  });
                } else {
                  window.location.href = `/blog/${data.permalink}`;
                }
              }
            });
        });
    } else {
      const data = Object.assign({}, this.state.oldData, {
        content: this.state.mde.value(),
        title: this.state.title,
        topics: {
          [this.state.category]: true,
        },
        date: this.state.oldData.published ? this.state.oldData.date : moment().unix(),
      });
      window.firebase.database()
        .ref(`blogContents/${data.permalink}`)
        .set(data, () => {
          window.firebase.database()
            .ref(`blogMeta/${data.date}`)
            .set({
              approved: data.approved,
              author: user.name,
              image: data.image,
              published: data.published,
              title: data.title,
              topics: data.topics,
              permalink: data.permalink,
            }, () => {
              this.setState({saving: false});
            });
        });
    }
  };

  handleCategoryChange = (e) => {
    this.setState({
      category: e.target.value,
    });
  };

  handleTitleChange = (e) => {
    if (e === this.state.title) {
      return;
    }
    fetch(`https://api.unsplash.com/search/photos?query=${e}`, {
      headers: {
        authorization: `Client-ID 8364d075845420ad7199c1a18d8b63a2179e9b6ef0cd00696eb3145dce6c341c`,
      }
    })
      .then((data) => data.json())
      .then((data) => {
        console.log(data);
        this.setState({
          title: e,
          image: data.results[0],
          images: data.results,
        });
      });
  };

  getNextPicture = () => {
    if (this.state.hasSavedImage) {
      return;
    }
    if (this.state.images.length - 1 > this.state.cursor) {
      this.setState((prevState) => ({
        image: prevState.images[prevState.cursor + 1],
        cursor: prevState.cursor + 1,
      }));
    } else {
      this.setState((prevState) => ({
        image: prevState.images[0],
        cursor: 0,
      }));
    }
  };

  hideLoader = () => {
    this.setState({ hideLoader: true });
  };

  render() {
    const shouldShowPublish = this.typeTitle === 'Create' ||
      (this.typeTitle === 'Edit' && !this.state.published);
    return (
      <React.Fragment>
        {
          !this.state.hideLoader &&
            <Loading complete={!this.state.loading} onComplete={this.hideLoader} />
        }
        {
          !this.state.hasSavedImage && Boolean(this.state.images.length) &&
          <div className="shuffle-pic">
            <Button onClick={this.getNextPicture}>Get New Picture</Button>
          </div>
        }
        {
          this.state.query && this.state.query.status &&
            <div className="status-toast-row">
              {
                this.state.query.status === 'saved' ?
                  <div className="toast"><i className="material-icons">saved</i> Saved!</div> :
                  <div className="toast"><i className="material-icons">public</i> Created!</div>
              }
            </div>
        }
        <Jumbotron
          title={`${this.typeTitle} Post`}
          image={
            this.state.hasSavedImage ?
              this.state.imageUrl :
              get(this.state.image, 'urls.full')
          }
        />
        <PageCard>
          <div className="card-body">
            <Breadcrumbs
              links={[
                { url: '/blog', label: 'Blogs' },
              ]}
            />
            <form className="blog-form">
              <TextField
                label="Post Title"
                required
                value={this.state.title}
                onBlur={this.handleTitleChange}
              />
              <textarea id="editor" />
              <FormField>
                <label>Category</label>
                <select
                  value={this.state.category}
                  onChange={this.handleCategoryChange}
                >
                  <option disabled value="">Select a Category</option>
                  <option value="culture">Culture</option>
                  <option value="devotionals">Devotionals</option>
                  <option value="homes-of-influence">Homes of Influence</option>
                  <option value="marriage">Marriage</option>
                  <option value="missions">Missions</option>
                  <option value="parenting">Parenting</option>
                  <option value="testimonies">Testimonies</option>
                  <option value="volunteering">Volunteering</option>
                </select>
              </FormField>
              <p>Please confirm that the image above is appropriate for both the topic and publication.</p>
              <div className="publish-bar">
                <Button
                  context={shouldShowPublish ? 'subtle' : 'primary'}
                  onClick={this.handleSave(false)}
                  disabled={this.state.saving}
                >
                  Save
                </Button>
                {
                  shouldShowPublish &&
                    <Button
                      context="primary"
                      disabled={this.state.saving}
                      onClick={this.handleSave(true)}
                    >
                      Publish
                    </Button>
                }
              </div>
            </form>
          </div>
        </PageCard>
      </React.Fragment>
    )
  }
}
