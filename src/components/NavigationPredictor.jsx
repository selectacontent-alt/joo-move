"use client";

import { useEffect, useRef } from 'react';
import { prefetchJson } from '../lib/prefetchCache';

const normalizePath = path => {
  const clean = String(path || '/').split('?')[0].replace(/\/+$/, '');
  return clean || '/';
};

const prefetchDocument = path => {
  if (!path || document.head.querySelector(`link[data-nav-prefetch="${path}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = 'document';
  link.href = path;
  link.dataset.navPrefetch = path;
  document.head.appendChild(link);
};

export default function NavigationPredictor({ currentPath, language }) {
  const previousPath = useRef(null);

  useEffect(() => {
    const path = normalizePath(currentPath);
    const fromPath = previousPath.current || sessionStorage.getItem('alrehab_previous_path');

    if (fromPath && fromPath !== path) {
      fetch('/api/navigation/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: normalizePath(fromPath), to: path }),
        keepalive: true,
      }).catch(() => {});
    }

    previousPath.current = path;
    sessionStorage.setItem('alrehab_previous_path', path);

    const runPrediction = () => {
      fetch(`/api/navigation/predict?from=${encodeURIComponent(path)}&lang=${encodeURIComponent(language)}`)
        .then(response => response.json())
        .then(data => {
          for (const prediction of data.predictions || []) {
            prefetchDocument(prediction.path);
            for (const resource of prediction.resources || []) prefetchJson(resource);
          }
        })
        .catch(() => {});
    };

    const idleId = 'requestIdleCallback' in window
      ? window.requestIdleCallback(runPrediction, { timeout: 1800 })
      : window.setTimeout(runPrediction, 700);

    return () => {
      if ('cancelIdleCallback' in window) window.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
    };
  }, [currentPath, language]);

  return null;
}
