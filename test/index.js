import expect from 'expect';
import { createStore, applyMiddleware } from 'redux';

import middleware from '../src';

const getNewStore = () => {
  const reducer = function(state, action) {
    return action;
  }
  const store = applyMiddleware(middleware)(createStore)(reducer);
  return store;
};


describe('redux-async', () => {

  it('handles a normal case', (done) => {
    const randomData = {randomData: Math.random()};
    const store = getNewStore();
    store.subscribe(() => {
      expect(store.getState()).toEqual({type: 'SOMETHING_RESOLVED', payload: randomData});
      done();
    });
    store.dispatch({type: 'SOMETHING_RESOLVED', payload: randomData});
  });

  it('handles a resolved promise case', (done) => {
    const store = getNewStore();
    const thingsToHappen = [
      { type: 'SOMETHING_PENDING',  payload: {            rest: 'ing'} },
      { type: 'SOMETHING_RESOLVED', payload: {isOk: true, rest: 'ing'} }
    ];
    store.subscribe(() => {
      const expectedCurrentState = thingsToHappen.shift();
        expect(store.getState()).toEqual(expectedCurrentState);
      if (!thingsToHappen.length) done();
    });
    store.dispatch({
      types: ['SOMETHING_PENDING', 'SOMETHING_RESOLVED', 'SOMETHING_REJECTED'],
      payload: {
        isOk: Promise.resolve(true),
        rest: 'ing'
      }
    });
  });

  it('handles a rejected promise case', (done) => {
    const store = getNewStore();
    const thingsToHappen = [ { type: 'SOMETHING_PENDING',  payload: { rest: 'ing'} }];
    store.subscribe(() => {
      if (thingsToHappen.length) {
        const expectedCurrentState = thingsToHappen.shift();
        expect(store.getState()).toEqual(expectedCurrentState);
      } else {
        const state = store.getState();
        expect(state.type).toEqual('SOMETHING_REJECTED');
        expect(state.error).toBeTruthy();
        expect(state.meta).toEqual({rest: 'ing'});
        expect(state.payload).toBeAn(Error);
        expect(state.payload.message).toEqual('something went wrong');
        done();
      }
    });
    store.dispatch({
      types: ['SOMETHING_PENDING', 'SOMETHING_RESOLVED', 'SOMETHING_REJECTED'],
      payload: {
        isOk: Promise.reject(new Error('something went wrong')),
        rest: 'ing',
      }
    });
  });

  it('handles resolved and rejected promises case in the same payload', (done) => {
    const store = getNewStore();
    const thingsToHappen = [ { type: 'SOMETHING_PENDING',  payload: { rest: 'ing'} }];
    store.subscribe(() => {
      if (thingsToHappen.length) {
        const expectedCurrentState = thingsToHappen.shift();
        expect(store.getState()).toEqual(expectedCurrentState);
      } else {
        const state = store.getState();
        expect(state.type).toEqual('SOMETHING_REJECTED');
        expect(state.error).toBeTruthy();
        expect(state.meta).toEqual({rest: 'ing'});
        expect(state.payload).toBeAn(Error);
        expect(state.payload.message).toEqual('something went wrong');
        done();
      }
    });
    store.dispatch({
      types: ['SOMETHING_PENDING', 'SOMETHING_RESOLVED', 'SOMETHING_REJECTED'],
      payload: {
        isOk: Promise.reject(new Error('something went wrong')),
        isOk2: Promise.resolve(33),
        rest: 'ing',
      }
    });
  });

});
