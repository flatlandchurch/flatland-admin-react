import sortBy from 'lodash-es/sortBy';

export default () => window.firebase.database()
  .ref('series')
  .once('value')
  .then((data) => data.val())
  .then((data) => Object.keys(data).map((key) => ({
    ...data[key],
    permalink: key,
  })))
  .then((data) => sortBy(data, ['started']).reverse());
