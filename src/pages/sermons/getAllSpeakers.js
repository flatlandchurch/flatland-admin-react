export default () => window.firebase.database()
  .ref('speakers')
  .once('value')
  .then((data) => data.val())
  .then((data) => Object.keys(data).map((key) => ({
    ...data[key],
    permalink: key,
  })));