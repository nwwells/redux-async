redux-async
=============

[![build status](https://img.shields.io/travis/kolodny/redux-async/master.svg?style=flat-square)](https://travis-ci.org/kolodny/redux-async)
[![npm version](https://img.shields.io/npm/v/redux-async.svg?style=flat-square)](https://www.npmjs.com/package/redux-async)

[FSA](https://github.com/kolodny/flux-standard-action)-compliant promise [middleware](https://github.com/gaearon/redux/blob/master/docs/middleware.md) for Redux.

Make sure that the value that you resolve to returns an object since it will get spread to the payload:

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
