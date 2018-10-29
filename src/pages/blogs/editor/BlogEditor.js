import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash-es/get';
import {
  TextField,
  Button,
  FormField,
} from '@flatland/chokhmah';
import SimpleMDE from 'simplemde';
import cx from 'classnames';

import './BlogEditor.css';

import validateForm from '../../../utils/validateForm';
import fieldInfo from './fieldInfo';

export default class BlogEditor extends React.Component {
  static propTypes = {
    mode: PropTypes.oneOf(['create', 'save']),
    post: PropTypes.object,
    saving: PropTypes.bool,
    onSave: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      authors: [],
      errors: [],
      images: [],
      imageSearchText: '',
      mde: null,
      post: props.post || {
        title: '',
        content: '',
        category: '',
        author: {},
        image: '',
        published: false,
      },
    };
  }

  componentDidMount() {
    this.setState({
      mde: new SimpleMDE({
        element: document.getElementById('editor'),
        forceSync: true,
      }),
    });

    window.firebase.database()
      .ref('blogAuthors').once('value')
      .then((data) => data.val())
      .then((data) => {
        this.setState({
          authors: Object.keys(data).map((key) => Object.assign({}, data[key], {
            id: key,
          })),
        });
      });
  }

  handleAuthorChange = ({ target: { value } }) => {
    this.setState((prevState) => ({
      post: {
        ...prevState.post,
        author: this.state.authors.find((a) => a.id === value),
      }
    }));
  };

  handleCategoryChange = ({ target: { value } }) => {
    this.setState((prevState) => ({
      post: {
        ...prevState.post,
        category: value,
      }
    }));
  };

  handleImageClick = (selectedImage) => () => {
    this.setState((prevState) => ({
      post: {
        ...prevState.post,
        image: selectedImage.urls.full,
        imageAttribution: {
          authorUrl: `https://unsplash.com/@${get(selectedImage, 'user.username', '')}?utm_source=flatland-church&utm_medium=referral`,
          author: get(selectedImage, 'user.name', ''),
          unsplash: 'https://unsplash.com/?utm_sourc=flatland-church&utm_medium=referral',
        },
      }
    }));
  };

  handleImageSearchTextChange = (e) => {
    this.setState({ imageSearchText: e });
  };

  handleImageSearch = (e) => {
    e.preventDefault();
    fetch(`https://api.unsplash.com/search/photos?query=${this.state.imageSearchText}`, {
      headers: {
        authorization: `Client-ID 8364d075845420ad7199c1a18d8b63a2179e9b6ef0cd00696eb3145dce6c341c`,
      }
    })
      .then((data) => data.json())
      .then((data) => {
        this.setState({
          images: data.results,
        });
      });
  };

  handleSave = ({ published }) => (e) => {
    e.preventDefault();

    const errors = validateForm(fieldInfo, this.state.post);

    if (errors.length) {
      this.setState({ errors });
    } else {
      this.setState({ errors: [] });
      this.props.onSave(Object.assign({}, this.state.post, {
        content: this.state.mde.value(),
        published,
      }));
    }
  };

  handleTitleChange = (title) => {
    if (title === this.state.post.title) {
      return;
    }

    this.setState((prevState) => ({
      post: {
        ...prevState.post,
        title,
      },
    }));
  };

  setPublished = () => {
    this.setState((prevState) => ({
      post: {
        ...prevState,
        published: true,
      }
    }));
  };

  render() {
    return (
      <form className="blog-form" onSubmit={this.handleSave({ published: true })}>
        {
          this.state.errors.map((error, idx) => (
            <div className="error-bar" key={`error-${idx}`}>
              {error}
            </div>
          ))
        }
        <TextField
          label="Post Title"
          required
          value={this.state.post.title}
          onChange={this.handleTitleChange}
        />
        <textarea id="editor" />
        <FormField>
          <label>Author</label>
          <select
            value={get(this.state.post, 'author.id', '')}
            onChange={this.handleAuthorChange}
          >
            <option disabled value="">Select an Author</option>
            {
              this.state.authors.map((author) => (
                <option value={author.id} key={author.id}>{author.name}</option>
              ))
            }
          </select>
        </FormField>
        <FormField>
          <label>Category</label>
          <select
            value={this.state.post.category}
            onChange={this.handleCategoryChange}
          >
            <option disabled value="">Select a Category</option>
            <option value="bible-study">Bible Study</option>
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
        <hr />
        {
          this.state.post.image &&
          <div className="saved-image">
            <img src={this.state.post.image} />
          </div>
        }
        <div className="image-search">
          <div className="search-row">
            <TextField
              label="Search for Image"
              required
              value={this.state.imageSearchText}
              onChange={this.handleImageSearchTextChange}
            />
            <Button onClick={this.handleImageSearch}>Search Image</Button>
          </div>
          <div className="image-grid">
            {
              this.state.images.map((image, idx) => (
                <div
                  className={cx('image-grid-item', {
                    active: this.state.post.image ===  image.urls.full,
                  })}
                  key={`image-grid-item-${idx}`}
                  role="button"
                  onClick={this.handleImageClick(image)}
                >
                  <img src={image.urls.thumb} />
                </div>
              ))
            }
          </div>
        </div>
        {
          !this.props.saving ?
            <div className="publish-bar">
              <Button
                context={this.props.mode === 'create' ? 'subtle' : 'primary'}
                onClick={this.handleSave({ published: false })}
                disabled={this.state.saving}
              >
                Save
              </Button>
              {
                this.props.mode === 'create' &&
                <Button
                  context="primary"
                  disabled={this.state.saving}
                  type="submit"
                >
                  Publish
                </Button>
              }
            </div> :
            <p>Saving...</p>
        }
      </form>
    );
  }
}
