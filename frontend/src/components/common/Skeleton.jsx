import React from 'react'

export function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden">
      <div className="aspect-[2/3] shimmer-skeleton rounded-xl" />
      <div className="p-3 space-y-2">
        <div className="h-4 shimmer-skeleton rounded w-3/4" />
        <div className="h-3 shimmer-skeleton rounded w-1/2" />
      </div>
    </div>
  )
}

export function SkeletonLine({ className = '' }) {
  return <div className={`shimmer-skeleton rounded ${className}`} />
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-3 shimmer-skeleton rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  )
}
