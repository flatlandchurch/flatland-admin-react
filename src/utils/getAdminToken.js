export default (id) => window.firebase.database().ref(`adminTokens/${id}`)
  .once('value')
  .then((data) => data.val());
