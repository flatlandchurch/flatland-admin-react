import React from 'react';
import moment from 'moment';
import get from 'lodash-es/get';
import cloneDeep from 'lodash-es/cloneDeep';
import {
  PageCard,
  TextField,
  Button,
  FormField,
  Jumbotron,
  Breadcrumbs,
  Loading,
} from '@flatland/chokhmah';
import { SingleDatePicker } from 'react-dates';
import uuid from 'uuid/v4';
import slugify from 'slugify/index';
import removeRegex from '../../utils/removeRegex';

export default class SeriesEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hideLoader: false,
      loading: true,
      data: {
        started: moment(),
      },
      dateFocused: false,
      permalink: get(this.props, 'match.params.permalink'),
      saving: false,
    };
    this.typeTitle = get(this.props, 'match.params.permalink') === 'new' ? 'Create' : 'Edit';
  }

  componentDidMount() {
    if (this.typeTitle === 'Create') {
      this.setState({ loading: false });
    } else {
      window.firebase.database().ref(`series/${this.state.permalink}`)
        .once('value')
        .then((data) => data.val())
        .then((data) => {
          data.started = data.started ? moment.unix(data.started) : moment();
          this.setState({ data, loading: false });
        });
    }
  }

  handleDateChange = (date) => {
    this.setState((prevState) => ({
      data: {
        ...prevState.data,
        started: date,
      }
    }));
  };

  handleDateClose = () => {
    this.setState({ dateFocused: false });
  };

  handleDateFocus = ({ focused }) => {
    this.setState({ dateFocused: focused });
  };

  handleFileUpload = (e) => {
    e.preventDefault();
    const storageRef = window.firebase.storage().ref();
    const sermonImageRef = storageRef.child(`series/${uuid()}`);
    sermonImageRef.put(this.fileSelector.files[0])
      .then(() => sermonImageRef.getDownloadURL())
      .then((url) => this.setState((prevState) => ({
        data: {
          ...prevState.data,
          image: url,
        }
      })));
  };
  
  handleSave = (e) => {
    e.preventDefault();
    this.setState({ saving: true });
    const data = cloneDeep(this.state.data);
    data.started = data.started.unix();
    window.firebase.database().ref(`series/${this.state.permalink}`)
      .set(data, () => {
        window.location.href = `/series/${this.state.permalink}`;
      });
    this.setState({ saving: false });
  };

  handleTextChange = (field) => (value) => {
    this.setState((prevState) => ({
      data: {
        ...prevState.data,
        [field]: value,
      },
    }));

    if (field === 'title' && this.typeTitle === 'Create') {
      this.setState({
        permalink: slugify(value, {
          remove: removeRegex,
          lower: true,
        }),
      });
    }
  };

  hideLoader = () => {
    this.setState({ hideLoader: true });
  };

  openFileSelector = (e) => {
    e.preventDefault();
    this.fileSelector.click();
  };

  render() {
    const id = uuid();
    return (
      <React.Fragment>
        {
          !this.state.hideLoader &&
          <Loading complete={!this.state.loading} onComplete={this.hideLoader} />
        }
        <Jumbotron
          title={`${this.typeTitle} Series`}
          image={this.state.data.image}
        />
        <PageCard>
          <div className="card-body">
            <Breadcrumbs
              links={[
                { url: '/series', label: 'Series' },
              ]}
            />
            <form className="series-form" onSubmit={this.handleSave}>
              <TextField
                label="Series Title"
                required
                value={this.state.data.title}
                onChange={this.handleTextChange('title')}
              />
              <TextField
                label="Description"
                required
                textarea
                value={this.state.data.description}
                rows={6}
              />
              <label htmlFor={id}>Date of Week 1</label>
              <SingleDatePicker
                date={this.state.data.started}
                onDateChange={this.handleDateChange}
                focused={this.state.dateFocused}
                onFocusChange={this.handleDateFocus}
                id={id}
                numberOfMonths={1}
                appendToBody
                withFullScreenPortal
                required
                onClose={this.handleDateClose}
                isOutsideRange={(e) => {}}
              />
              <input
                type="file"
                style={{ display: 'none' }}
                ref={(input) => this.fileSelector = input}
                onChange={this.handleFileUpload}
              />
              <Button onClick={this.openFileSelector}>
                {
                  this.state.data.image ?
                    'Change Image' :
                    'Upload New Image'
                }
              </Button>
              <Button context="primary">
                {
                  this.typeTitle === 'Create' ?
                    'Create Series' :
                    'Save'
                }
              </Button>
            </form>
          </div>
        </PageCard>
      </React.Fragment>
    );
  }
}
