import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-fade-in">
      <div className="text-6xl font-bold text-slate-700 mb-4">404</div>
      <h1 className="text-2xl font-bold text-white mb-4">Page Not Found</h1>
      <p className="text-slate-400 mb-8">The page you're looking for doesn't exist.</p>
      <Link to="/" className="text-brand-400 hover:text-brand-300 font-medium">
        &larr; Back to Home
      </Link>
    </div>
  )
}
