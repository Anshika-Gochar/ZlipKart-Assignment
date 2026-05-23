import React from 'react'
import { Link } from 'react-router-dom'
import { PackageSearch, Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div
      className="min-h-[70vh] flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#f1f3f6' }}
    >
      <div className="bg-white rounded-sm shadow-md w-full max-w-lg px-8 py-12 flex flex-col items-center text-center">
        {/* Icon */}
        <div className="flex items-center justify-center w-32 h-32 rounded-full bg-blue-50 mb-6">
          <PackageSearch className="w-24 h-24" style={{ color: '#2874f0' }} strokeWidth={1.5} />
        </div>

        {/* 404 */}
        <h1 className="text-7xl font-extrabold tracking-tight mb-2" style={{ color: '#2874f0' }}>
          404
        </h1>

        {/* Headline */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">
          Oops! Page Not Found
        </h2>

        {/* Subtext */}
        <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm">
          The page you're looking for seems to have gone on a shopping spree and got lost!
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center mb-8">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-sm text-white text-sm font-semibold transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ backgroundColor: '#2874f0', focusRingColor: '#2874f0' } as React.CSSProperties}
          >
            <Home className="w-4 h-4" />
            Go to Homepage
          </Link>

          <Link
            to="/products"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-sm text-sm font-semibold border transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ borderColor: '#2874f0', color: '#2874f0' }}
          >
            <Search className="w-4 h-4" />
            Browse Products
          </Link>
        </div>

        {/* Friendly suggestion */}
        <div className="flex flex-col items-center gap-1 mb-6">
          <p className="text-gray-500 text-sm font-medium">Looking for something specific?</p>
          <Link
            to="/products"
            className="text-sm font-semibold flex items-center gap-1 hover:underline"
            style={{ color: '#2874f0' }}
          >
            Explore all products →
          </Link>
        </div>

        {/* Divider */}
        <div className="w-full border-t border-gray-100 pt-5">
          {/* Flavor text */}
          <p className="text-xs text-gray-400">
            Error code: 404 &nbsp;|&nbsp; The product page has been discontinued
          </p>
        </div>
      </div>
    </div>
  )
}
