import React from "react"

export const Spinner = ({ size = "md" }) => {
  const sizeCls = size === "sm" ? "h-5 w-5 border-2" : size === "lg" ? "h-12 w-12 border-4" : "h-8 w-8 border-4"
  return (
    <div
      className={`${sizeCls} border-indigo-200 border-t-indigo-600 rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    />
  )
}

export const ButtonSpinner = () => <Spinner size="sm" />

export default Spinner