"use client"

import { useInView } from 'react-intersection-observer'
import { useState, useEffect } from 'react'

export function TestIntersection() {
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });
  
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (inView) {
      setCount(prev => prev + 1);
    }
  }, [inView]);
  
  return (
    <div style={{ height: '800px', border: '1px solid black' }}>
      <div>Scroll down to see the effect</div>
      <div style={{ marginTop: '400px' }}>Viewed {count} times</div>
      <div ref={ref} style={{ marginTop: '300px' }}>
        Observer Target (I am {inView ? 'visible' : 'not visible'})
      </div>
    </div>
  );
} 