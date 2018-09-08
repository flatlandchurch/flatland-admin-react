export default (id) => window.firebase.database().ref(`users/${id}`)
  .once('value')
  .then(data => data.val());
