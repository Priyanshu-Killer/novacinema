import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchMovies, clearMovies } from '../store/slices/movieSlice'
import MovieCard from '../components/common/MovieCard'
import { SkeletonCard } from '../components/common/Skeleton'

const GENRES = [
  'Action', 'Sci-Fi', 'Drama', 'Comedy', 'Thriller',
  'Horror', 'Romance', 'Animation', 'Fantasy', 'Adventure', 'Neo-Noir', 'Family'
]

export default function MoviesPage() {
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()
  const { movies, loading, total } = useSelector(s => s.movies)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(searchParams.get('status') || '')
  const [genre,  setGenre]  = useState('')

  useEffect(() => {
    dispatch(clearMovies())
    const params = { limit: 100 }
    if (status) params.status = status
    if (genre)  params.genre  = genre
    if (search) params.search = search
    dispatch(fetchMovies(params))
  }, [status, genre, search, dispatch])

  const toggleStatus = (val) => setStatus(prev => prev === val ? '' : val)
  const toggleGenre  = (val) => setGenre(prev  => prev === val ? '' : val)
  const clearAll = () => { setStatus(''); setGenre(''); setSearch('') }
  const hasFilters = status || genre || search

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="py-8">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="section-heading mb-1">Browse Movies</motion.h1>
          <p className="text-nova-400 text-sm">
            {loading ? 'Loading…' : `${total} movie${total !== 1 ? 's' : ''} available`}
          </p>
        </div>

        {/* Filters */}
        <div className="space-y-4 mb-8">

          {/* Search */}
          <div className="relative max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nova-500"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search movies…"
              className="w-full bg-nova-800/50 border border-nova-600/30 rounded-xl pl-10 pr-10 py-3
                         text-white placeholder-nova-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-nova-500 hover:text-white transition-colors">
                ✕
              </button>
            )}
          </div>

          {/* Status pills — now sends 'now_showing' to match backend */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-nova-500 font-mono mr-1">STATUS:</span>
            {[
              { value: 'now_showing', label: '● Now Showing', active: 'bg-cyan-500/20 text-cyan-400 border-cyan-500' },
              { value: 'upcoming',    label: '◆ Upcoming',    active: 'bg-yellow-500/20 text-yellow-400 border-yellow-500' },
            ].map(opt => (
              <button key={opt.value} onClick={() => toggleStatus(opt.value)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono font-semibold border transition-all ${
                  status === opt.value ? opt.active : 'border-nova-600/30 text-nova-400 hover:border-nova-500'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>

          {/* Genre pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-nova-500 font-mono mr-1">GENRE:</span>
            {GENRES.map(g => (
              <button key={g} onClick={() => toggleGenre(g)}
                className={`px-3 py-1 rounded-full text-xs border transition-all ${
                  genre === g
                    ? 'bg-nova-500/30 text-nova-200 border-nova-400'
                    : 'border-nova-700/40 text-nova-500 hover:border-nova-500 hover:text-nova-300'
                }`}>
                {g}
              </button>
            ))}
          </div>

          {hasFilters && (
            <button onClick={clearAll}
              className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1">
              ✕ Clear all filters
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {Array(10).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20 glass rounded-2xl">
            <div className="text-5xl mb-4">🎬</div>
            <p className="text-nova-300 text-lg font-semibold">No movies found</p>
            <p className="text-nova-500 text-sm mt-1">
              {hasFilters ? 'Try adjusting your filters' : 'No movies have been added yet'}
            </p>
            {hasFilters && (
              <button onClick={clearAll} className="nova-btn-outline mt-4 text-sm">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {movies.map((movie, i) => (
                <MovieCard key={movie._id} movie={movie} index={i} />
              ))}
            </div>
            <p className="text-center text-nova-600 text-xs mt-8">
              Showing {movies.length} of {total} movies
            </p>
          </>
        )}
      </div>
    </div>
  )
}