import { useEffect, useRef, useState } from 'react';
import { ADS_UPDATED_EVENT, getAdsConfig, type AdsConfig } from '@/config/ads';

interface AdSlotProps {
  slotId: keyof AdsConfig;
  className?: string;
  showBorder?: boolean;
}

export function AdSlot({ slotId, className = '', showBorder = false }: AdSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [adsConfig, setAdsConfig] = useState<AdsConfig>(() => getAdsConfig());

  useEffect(() => {
    const handleAdsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<AdsConfig>;
      if (customEvent.detail) {
        setAdsConfig(customEvent.detail);
      } else {
        setAdsConfig(getAdsConfig());
      }
    };

    window.addEventListener(ADS_UPDATED_EVENT, handleAdsUpdate);
    window.addEventListener('storage', handleAdsUpdate);
    return () => {
      window.removeEventListener(ADS_UPDATED_EVENT, handleAdsUpdate);
      window.removeEventListener('storage', handleAdsUpdate);
    };
  }, []);

  const slot = adsConfig[slotId];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous contents
    container.innerHTML = '';

    if (!slot || !slot.enabled || !slot.code.trim()) {
      return;
    }

    try {
      // Parse HTML string into DOM
      const parser = new DOMParser();
      const doc = parser.parseFromString(slot.code, 'text/html');

      // Create a fragment
      const fragment = document.createDocumentFragment();

      // Process body child nodes
      Array.from(doc.body.childNodes).forEach((node) => {
        if (node.nodeName.toLowerCase() === 'script') {
          const oldScript = node as HTMLScriptElement;
          const newScript = document.createElement('script');

          // Copy all attributes
          Array.from(oldScript.attributes).forEach((attr) => {
            newScript.setAttribute(attr.name, attr.value);
          });

          // Copy inline script content
          if (oldScript.textContent) {
            newScript.textContent = oldScript.textContent;
          }

          fragment.appendChild(newScript);
        } else {
          fragment.appendChild(node.cloneNode(true));
        }
      });

      // Also process any scripts that were in head of the parsed doc
      Array.from(doc.head.querySelectorAll('script')).forEach((oldScript) => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        if (oldScript.textContent) {
          newScript.textContent = oldScript.textContent;
        }
        fragment.appendChild(newScript);
      });

      container.appendChild(fragment);
    } catch (err) {
      console.warn(`[AdSlot:${slotId}] Error rendering ad code:`, err);
    }
  }, [slot?.enabled, slot?.code, slotId]);

  if (!slot || !slot.enabled || !slot.code.trim()) {
    return null;
  }

  return (
    <div
      data-testid={`ad-slot-${slotId}`}
      className={`pksim-ad-wrapper relative mx-auto my-4 w-full flex flex-col items-center justify-center overflow-hidden transition-all ${
        showBorder
          ? 'rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card)_/_0.6)] p-2'
          : ''
      } ${className}`}
    >
      <div
        ref={containerRef}
        className="w-full flex items-center justify-center min-h-[50px] overflow-x-auto text-center"
      />
    </div>
  );
}

export default AdSlot;
