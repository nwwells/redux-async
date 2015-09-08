redux-async
=============

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Downloads][downloads-image]][downloads-url]

[FSA](https://github.com/kolodny/flux-standard-action)-compliant promise [middleware](https://github.com/gaearon/redux/blob/master/docs/middleware.md) for Redux.

Make sure that the value that you resolve to returns an object since it will get spread to the `payload` for successful resolutions and `meta` for rejected ones:

```js
const isValidPromise = new Promise(res => setTimeout( res(Math.random() > .5)));
const promiseForAction = isValidPromise.then(isValid => { return {isValid}; });
```


## Install

```js
npm install --save redux-async
```

## Adding as middleware

```js
import asyncMiddleware from 'redux-async';
let createStoreWithMiddleware = applyMiddleware(
  asyncMiddleware,
)(createStore);
```

## Usage

```js
// action-creators.js
export const loadUsersForAdmin = adminId => {
  return {
    types: [GET_USERS_REQUEST, GET_USERS_SUCCESS, GET_USERS_FAILURE],
    promise: api.getUsersForAdmin(adminId).then(obj => ({users: obj.users})),
    adminId
  };
}

// reducers.js
import { createReducer } from 'redux-create-reducer';
import { GET_USERS_REQUEST, GET_USERS_SUCCESS, GET_USERS_FAILURE } from '../constants/actions';

const initialState = {};

export default createReducer(initialState, {
  [GET_USERS_REQUEST](state, action) {
    return {
      isFetching: true,
      adminId: action.adminId
    };
  },
  [GET_USERS_SUCCESS](state, action) {
    return {
      isFetching: false,
      users: actions.payload.users, // from promise
      adminId: action.payload.adminId // from ...rest
    };
  },
  [GET_USERS_FAILURE](state, action) {
    // assert(action.error === true && action.payload instanceof Error);
    // assert(action.meta.adminId);
    return {errorMessage: action.payload.message}; // from Error.prototype.message
  },
});


// smart-container.js
// ... snipped to the middle of the render function
<div>
  {
    !users ?
      <button onClick={() => dispatch(loadUsersForAdmin(localStorage.adminId))}>Load Users</button> :
      (isFetching) ? (<span>isFetching for {adminId}...</span>) : (<pre>{JSON.stringify(users, null, 2)}</pre>)
  }
  { errorMessage && <div className="error">errorMessage</div> }
</div>
```


[npm-image]: https://img.shields.io/npm/v/redux-async.svg?style=flat-square
[npm-url]: https://npmjs.org/package/redux-async
[travis-image]: https://img.shields.io/travis/kolodny/redux-async.svg?style=flat-square
[travis-url]: https://travis-ci.org/kolodny/redux-async
[coveralls-image]: https://img.shields.io/coveralls/kolodny/redux-async.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/kolodny/redux-async
[downloads-image]: http://img.shields.io/npm/dm/redux-async.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/redux-async
