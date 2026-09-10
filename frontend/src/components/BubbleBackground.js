import React, { useEffect, useRef } from 'react';

const BubbleBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const colors = [
      'rgba(79, 109, 245, 0.15)',
      'rgba(236, 72, 153, 0.12)',
      'rgba(16, 185, 129, 0.12)',
      'rgba(245, 158, 11, 0.10)',
      'rgba(99, 102, 241, 0.12)',
      'rgba(20, 184, 166, 0.10)',
      'rgba(236, 72, 153, 0.08)',
    ];

    const createBubble = () => {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      
      const size = Math.random() * 200 + 50;
      const left = Math.random() * 100;
      const duration = Math.random() * 20 + 15;
      const delay = Math.random() * 10;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${left}%`;
      bubble.style.animationDuration = `${duration}s`;
      bubble.style.animationDelay = `${delay}s`;
      bubble.style.background = color;
      
      return bubble;
    };

    // Create initial bubbles
    for (let i = 0; i < 20; i++) {
      const bubble = createBubble();
      container.appendChild(bubble);
    }

    // Add new bubbles periodically
    const interval = setInterval(() => {
      if (container.children.length < 30) {
        const bubble = createBubble();
        container.appendChild(bubble);
        
        // Remove old bubbles
        setTimeout(() => {
          if (bubble.parentNode) {
            bubble.remove();
          }
        }, 30000);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      container.innerHTML = '';
    };
  }, []);

  return <div ref={containerRef} className="bubble-container" />;
};

export default BubbleBackground;