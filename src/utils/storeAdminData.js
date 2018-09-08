export default (id) => (data) => window.localStorage.setItem(
  'flatland:adminUser',
  JSON.stringify(Object.assign({}, data, { id })),
);
