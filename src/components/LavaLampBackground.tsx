import React, { useEffect, useRef, useMemo } from 'react';
import { motion, useSpring, useMotionValue, MotionValue } from 'motion/react';

export default function LavaLampBackground() {
  const mouseX = useMotionValue(-1000); // Start off-screen
  const mouseY = useMotionValue(-1000);

  // Smooth spring for cursor tracking
  const springConfig = { damping: 30, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Generate 12 varied blobs
  const blobs = useMemo(() => {
    const colors = [
      'rgba(173, 198, 255, 0.25)', // Primary
      'rgba(255, 183, 134, 0.2)',  // Secondary
      'rgba(173, 198, 255, 0.15)', // Primary variant
    ];
    
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      color: colors[i % colors.length],
      size: Math.random() * 10 + 10 + 'vw', // 10vw to 20vw
      initialX: Math.random() * 100 + '%',
      initialY: Math.random() * 100 + '%',
      // Unique lava lamp paths
      animate: {
        x: [
          (Math.random() * 20 - 10) + '%',
          (Math.random() * 20 - 10) + '%',
          (Math.random() * 20 - 10) + '%'
        ],
        y: [
          (Math.random() * 20 - 10) + '%',
          (Math.random() * 20 - 10) + '%',
          (Math.random() * 20 - 10) + '%'
        ],
        scale: [1, 1.2, 0.9, 1],
      },
      duration: 15 + Math.random() * 15,
    }));
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none obsidian-gradient">
      <div className="absolute inset-0 blur-[80px]">
        {blobs.map((blob) => (
          <InteractiveBlob 
            key={blob.id} 
            blob={blob} 
            mouseX={smoothX} 
            mouseY={smoothY} 
          />
        ))}
      </div>

      {/* Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}

interface BlobProps {
  key?: React.Key;
  blob: {
    id: number;
    color: string;
    size: string;
    initialX: string;
    initialY: string;
    animate: any;
    duration: number;
  };
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
}

function InteractiveBlob({ blob, mouseX, mouseY }: BlobProps) {
  const blobRef = useRef<HTMLDivElement>(null);
  
  // Local displacement values
  const dX = useMotionValue(0);
  const dY = useMotionValue(0);

  useEffect(() => {
    const unsubscribeX = mouseX.on("change", (latestX) => {
      if (!blobRef.current) return;
      
      const rect = blobRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const latestY = mouseY.get();

      const diffX = latestX - centerX;
      const diffY = latestY - centerY;
      const distance = Math.sqrt(diffX * diffX + diffY * diffY);
      
      const threshold = 300; // Local interaction radius
      
      if (distance < threshold) {
        const power = (threshold - distance) / threshold;
        const force = power * 80; // Max push distance
        
        // Push away from cursor
        const angle = Math.atan2(diffY, diffX);
        dX.set(Math.cos(angle) * -force);
        dY.set(Math.sin(angle) * -force);
      } else {
        dX.set(0);
        dY.set(0);
      }
    });

    return () => unsubscribeX();
  }, [mouseX, mouseY, dX, dY]);

  // Smooth out the displacement
  const smoothDX = useSpring(dX, { damping: 20, stiffness: 100 });
  const smoothDY = useSpring(dY, { damping: 20, stiffness: 100 });

  return (
    <motion.div
      ref={blobRef}
      className="absolute rounded-full"
      style={{
        backgroundColor: blob.color,
        width: blob.size,
        height: blob.size,
        left: blob.initialX,
        top: blob.initialY,
        x: smoothDX,
        y: smoothDY,
        willChange: "transform",
      }}
    >
      {/* Lava lamp drift animation */}
      <motion.div
        className="w-full h-full rounded-full"
        animate={blob.animate}
        transition={{
          duration: blob.duration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          backgroundColor: 'inherit',
          transform: "translateZ(0)" 
        }}
      />
    </motion.div>
  );
}
