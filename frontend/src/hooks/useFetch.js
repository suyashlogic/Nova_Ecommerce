import { useCallback, useEffect, useState } from 'react';

// Wraps the "load data from the API" pattern every page needs, so each page
// handles the same four states: loading, error, empty and success.
//
//   const { data, loading, error, reload } = useFetch(() => listProducts({ limit: 4 }), []);
//
// The second argument lists values that should trigger a re-fetch when they change
// (like a product id from the URL).
export default function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    // "ignore" prevents a slow, outdated response from overwriting a newer one
    // (for example when the user changes filters quickly).
    let ignore = false;
    setState((previous) => ({ ...previous, loading: true, error: null }));

    fetcher()
      .then((data) => {
        if (!ignore) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!ignore) setState({ data: null, loading: false, error });
      });

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadCount]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  return { ...state, reload };
}
