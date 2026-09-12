import { useCallback, useEffect, useRef, useState } from 'react';

// Generic fetch hook with loading / error / empty states.
// fetcher: () => Promise<{ok,data}> — resolves to the `data` array/object.
export function useApi(fetcher, { immediate = true } = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(immediate);
    const [error, setError] = useState(null);
    const fetcherRef = useRef(fetcher);

    useEffect(() => {
        fetcherRef.current = fetcher;
    }, [fetcher]);

    const reload = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetcherRef.current();
            setData(res?.data ?? res ?? null);
        } catch (e) {
            setError(e?.message || 'خطای نامشخص');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (immediate) {
            // Fetch-on-mount: the canonical use case for this hook.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            void reload();
        }
    }, [immediate, reload]);

    const isEmpty = !loading && !error && (data === null || (Array.isArray(data) && data.length === 0));

    return { data, loading, error, isEmpty, reload, setData };
}
