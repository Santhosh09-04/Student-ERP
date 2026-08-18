import React from "react"

export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} aria-hidden="true" />
)

export const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <Skeleton className="h-4 w-1/3 mb-3" />
    <Skeleton className="h-8 w-2/3" />
  </div>
)

export const PageSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
  </div>
)

export default Skeleton