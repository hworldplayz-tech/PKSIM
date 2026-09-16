import { useEffect, useRef } from 'react';

interface AdsterraBannerProps {
  className?: string;
}

export function AdsterraBanner({ className = '' }: AdsterraBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous content
    container.innerHTML = '';

    // Create an isolated iframe so atOptions and invoke.js render cleanly without blocking React
    const iframe = document.createElement('iframe');
    iframe.width = '300';
    iframe.height = '250';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.style.display = 'block';
    iframe.scrolling = 'no';
    iframe.title = 'ad-banner';

    const adHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body, html {
        margin: 0;
        padding: 0;
        width: 300px;
        height: 250px;
        overflow: hidden;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    </style>
  </head>
  <body>
    <script type="text/javascript">
      atOptions = {
        'key' : 'eadb73ee01335aee00f07bb976fc8c4e',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    <\/script>
    <script type="text/javascript" src="https://verticallysaturate.com/eadb73ee01335aee00f07bb976fc8c4e/invoke.js"><\/script>
  </body>
</html>`;

    iframe.srcdoc = adHtml;
    container.appendChild(iframe);
  }, []);

  return (
    <div
      data-testid="adsterra-banner-300"
      className={`flex items-center justify-center overflow-hidden my-3 ${className}`}
    >
      <div
        ref={containerRef}
        className="w-[300px] h-[250px] flex items-center justify-center"
      />
    </div>
  );
}

export default AdsterraBanner;
