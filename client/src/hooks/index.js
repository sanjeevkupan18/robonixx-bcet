import { useState, useEffect, useCallback } from 'react';
import { eventsAPI, membersAPI, galleryAPI, contentAPI } from '../utils/api';

// ─── useEvents ────────────────────────────────────────────────────────────────
export function useEvents(params = {}) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });

  const fetch = useCallback(async (overrides = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await eventsAPI.getAll({ ...params, ...overrides });
      setEvents(data.events);
      setMeta({ total: data.total, page: data.page, pages: data.pages });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { events, loading, error, meta, refetch: fetch };
}

// ─── useEvent ─────────────────────────────────────────────────────────────────
export function useEvent(slug) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    eventsAPI.getOne(slug)
      .then(({ data }) => setEvent(data.event))
      .catch(err => setError(err.response?.data?.message || 'Event not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  return { event, loading, error };
}

// ─── useMembers ───────────────────────────────────────────────────────────────
export function useMembers(params = {}) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await membersAPI.getAll(params);
      setMembers(data.members);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { members, loading, error, refetch: fetch };
}

// ─── useGallery ───────────────────────────────────────────────────────────────
export function useGallery(params = {}) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });

  useEffect(() => {
    setLoading(true);
    galleryAPI.getAll(params)
      .then(({ data }) => { setImages(data.images); setMeta({ total: data.total, pages: data.pages }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [JSON.stringify(params)]);

  return { images, loading, meta };
}

// ─── useSiteContent ───────────────────────────────────────────────────────────
export function useSiteContent(key = 'site_settings') {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contentAPI.get(key)
      .then(({ data }) => setContent(data.content))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [key]);

  return { content, loading };
}

// ─── useLocalStorage ─────────────────────────────────────────────────────────
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : initialValue; }
    catch { return initialValue; }
  });

  const set = useCallback((val) => {
    try {
      const stored = val instanceof Function ? val(value) : val;
      setValue(stored);
      localStorage.setItem(key, JSON.stringify(stored));
    } catch (err) { console.error(err); }
  }, [key, value]);

  return [value, set];
}

// ─── useDebounce ──────────────────────────────────────────────────────────────
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─── useIntersection ─────────────────────────────────────────────────────────
export function useIntersection(ref, options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting && options.once) observer.disconnect();
    }, options);
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return isIntersecting;
}
