import React from 'react';
import get from 'lodash-es/get';
import uuid from 'uuid/v4';
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

import getAllSpeakers from './getAllSpeakers';
import getAllSeries from './getAllSeries';

export default class SermonEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingFormData: true,
      loadingSermonData: true,
      hideLoader: false,
      data: {},
      dateFocused: false,
      speakers: [],
      series: [],
    };
    this.typeTitle = get(this.props, 'match.params.permalink', ) === 'new' ? 'Publish' : 'Edit';
  }

  componentDidMount() {
    Promise.all([
      getAllSpeakers(),
      getAllSeries(),
    ])
      .then(([ speakers, series ]) => this.setState(
        { speakers, series, loadingFormData: false },
      ));

    if (this.typeTitle === 'Publish') {
      this.setState({ loadingSermonData: false });
    }
  }

  handleDateChange = (date) => {
    this.setState((prevState) => ({
      data: {
        ...prevState.data,
        preached: date,
      }
    }));
  };

  handleDateFocus = ({ focused }) => {
    this.setState({ dateFocused: focused });
  };

  handleFileUpload = (e) => {
    e.preventDefault();
    const storageRef = window.firebase.storage().ref();
    const sermonImageRef = storageRef.child(`sermons/${uuid()}`);
    sermonImageRef.put(this.fileSelector.files[0])
      .then(() => sermonImageRef.getDownloadURL())
      .then((url) => this.setState((prevState) => ({
        data: {
          ...prevState.data,
          image: url,
        }
      })));
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
          <Loading complete={!this.state.loadingFormData && !this.state.loadingSermonData} onComplete={this.hideLoader} />
        }
        <Jumbotron
          title={`${this.typeTitle} Sermon`}
          image={this.state.data.image}
        />
        <PageCard>
          <div className="card-body">
            <Breadcrumbs
              links={[
                { url: '/sermons', label: 'Sermons' },
              ]}
            />
            <form className="sermons-form">
              <TextField
                label="Sermon Title"
                required
                value={this.state.data.title}
                onBlur={this.handleTitleChange}
              />
              <label htmlFor={id}>Date Preached</label>
              <SingleDatePicker
                date={this.state.data.preached}
                onDateChange={this.handleDateChange}
                focused={this.state.dateFocused}
                onFocusChange={this.handleDateFocus}
                id={id}
                numberOfMonths={1}
              />
              <div className="form-field">
                <label>Sermon Series</label>
                <select>
                  {
                    Boolean(this.state.series.length) &&
                    this.state.series.map((s) => (
                      <option value={s.permalink} key={s.permalink}>{s.title}</option>
                    ))
                  }
                </select>
              </div>
              <div className="form-field">
                <label>Speaker</label>
                <select>
                  {
                    Boolean(this.state.speakers.length) &&
                    this.state.speakers.map((s) => (
                      <option value={s.permalink} key={s.permalink}>{s.name}</option>
                    ))
                  }
                </select>
              </div>
              <TextField
                label="Vimeo ID"
                helpText="The numbers at the end of a vimeo url"
                required
                value={this.state.data.vimeoId}
              />
              <Button onClick={this.openFileSelector}>Upload Image</Button>
              <input
                type="file"
                style={{ display: 'none' }}
                ref={(input) => this.fileSelector = input}
                onChange={this.handleFileUpload}
              />
              <Button context="primary">
                {
                  this.typeTitle === 'Create' ?
                    'Publish' :
                    'Save'
                }
              </Button>
            </form>
          </div>
        </PageCard>
      </React.Fragment>
    )
  }
}
