import forIn from 'lodash-es/forIn';
import fromPairs from 'lodash-es/fromPairs';

const breakDownString = (string, separator1, separator2) => (
  string.split(separator1).map((substring) => substring.split(separator2))
);

// Encode should be used to turn an object of properties into a valid url search string.
const encode = (object) => {
  let string = '?';
  forIn(object, (value, key) => {
    string += `${key}=${value}&`;
  });
  return string.slice(0, -1);
};

// Parse should be used to parse history.location.search strings. It will return an object with all
// of the search params and their values in string format.
const parse = (query) => {
  let object = {};
  if (query) {
    const array = breakDownString(query.replace(/%20/g, ' ').substr(1), '&', '=');
    object = fromPairs(array);
  }

  return object;
};

export default {
  encode,
  parse,
};
