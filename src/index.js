const isPromise = obj => obj && typeof obj.then === 'function';
const hasPromiseProps = obj => Object.keys(obj).some(key => isPromise(obj[key]));

const resolveProps = obj => {
  const props = Object.keys(obj);
  const values = props.map(prop => obj[prop]);

  return Promise.all(values).then(resolvedArray => {
    return props.reduce((acc, prop, index) => {
      acc[prop] = resolvedArray[index];
      return acc;
    }, {});
  });
};

const getNonPromiseProperties = obj => {
  return Object.keys(obj).filter(key => !isPromise(obj[key])).reduce((acc, key) => {
    acc[key] = obj[key];
    return acc;
  }, {});
};


export default function promisePropsMiddleware() {
  return next => action => {
    const { types, payload } = action;
    if (!types || !hasPromiseProps(action.payload)) {
      return next(action);
    }

    const nonPromiseProperties = getNonPromiseProperties(payload);

    const [PENDING, RESOLVED, REJECTED] = types;

    const pendingAction = { type: PENDING, payload: nonPromiseProperties };
    const successAction = { type: RESOLVED };
    const failureAction = { type: REJECTED, error: true, meta: nonPromiseProperties };
    if (action.meta) {
      [pendingAction, successAction, failureAction].forEach(nextAction => {
        nextAction.meta = { ...nextAction.meta, ...action.meta }
      });
    }

    next(pendingAction);
    return resolveProps(payload).then(
      results => next({ ...successAction, payload: results }),
      error => next({ ...failureAction, payload: error })
    );
  };
}
