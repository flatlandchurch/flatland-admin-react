export default (id) => window.firebase.database().ref(`adminTokens/${id}`)
  .set(new Date().getTime());
