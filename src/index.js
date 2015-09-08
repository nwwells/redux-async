export default function promiseMiddleware() {
  return next => action => {
    const { promise, types, ...rest } = action;
    if (!types || !promise) {
      return next(action);
    }

    const [PENDING, RESOLVED, REJECTED] = types;
    next({ type: PENDING, payload: {...rest} });
    return promise.then(
      result => next({ type: RESOLVED, payload: {...rest, ...result} }),
      error => next({ type: REJECTED, error: true, payload: error, meta: {...rest} })
    );
  };
}
