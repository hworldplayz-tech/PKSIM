import { useEffect } from 'react';
import { ADS_UPDATED_EVENT, getAdsConfig, type AdsConfig } from '@/config/ads';

export function GlobalAdScripts() {
  useEffect(() => {
    const injectedElements: HTMLElement[] = [];

    const applyGlobalScripts = (config: AdsConfig) => {
      // Clean up previous injected elements
      injectedElements.forEach((el) => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
      injectedElements.length = 0;

      const injectSnippet = (code: string, target: 'head' | 'body') => {
        if (!code || !code.trim()) return;
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(code, 'text/html');

          const processScripts = (parent: HTMLElement) => {
            Array.from(parent.querySelectorAll('script')).forEach((oldScript) => {
              const newScript = document.createElement('script');
              Array.from(oldScript.attributes).forEach((attr) => {
                newScript.setAttribute(attr.name, attr.value);
              });
              if (oldScript.textContent) {
                newScript.textContent = oldScript.textContent;
              }
              const dest = target === 'head' ? document.head : document.body;
              dest.appendChild(newScript);
              injectedElements.push(newScript);
            });
          };

          processScripts(doc.head);
          processScripts(doc.body);

          // Also inject non-script elements (e.g. meta, link, div tags) if any
          Array.from(doc.body.children).forEach((child) => {
            if (child.nodeName.toLowerCase() !== 'script') {
              const clone = child.cloneNode(true) as HTMLElement;
              document.body.appendChild(clone);
              injectedElements.push(clone);
            }
          });
        } catch (e) {
          console.warn('[GlobalAdScripts] Error injecting scripts:', e);
        }
      };

      if (config.popunder?.enabled && config.popunder.code) {
        injectSnippet(config.popunder.code, 'body');
      }

      if (config.socialBar?.enabled && config.socialBar.code) {
        injectSnippet(config.socialBar.code, 'body');
      }

      if (config.customHeadScript?.enabled && config.customHeadScript.code) {
        injectSnippet(config.customHeadScript.code, 'head');
      }
    };

    // Initial injection
    applyGlobalScripts(getAdsConfig());

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<AdsConfig>;
      applyGlobalScripts(customEvent.detail || getAdsConfig());
    };

    window.addEventListener(ADS_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      injectedElements.forEach((el) => {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
      window.removeEventListener(ADS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return null;
}

export default GlobalAdScripts;
