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
    next({ type: PENDING, payload: {...nonPromiseProperties} });
    return resolveProps(payload).then(
      results => next({ type: RESOLVED, payload: {...results} }),
      error => next({ type: REJECTED, error: true, payload: error, meta: {...nonPromiseProperties} })
    );
  };
}
