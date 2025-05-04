'use client';
import { useState } from 'react';
import Image from 'next/image';

interface ProjectImageWithLoadingProps {
  src: string;
  alt: string;
}

export function ProjectImageWithLoading({ src, alt }: ProjectImageWithLoadingProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full max-h-96 mb-6 rounded-xl overflow-hidden" style={{ height: '384px' }}>
      {!loaded && (
        <div className="absolute inset-0 z-10 animate-pulse bg-neutral-200" />
      )}
      <Image
        src={src}
        alt={alt}
        width={800}
        height={384}
        className={`w-full h-full object-cover rounded-xl transition-all duration-500 ${loaded ? '' : 'blur-md scale-105'}`}
        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        priority={false}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
} 