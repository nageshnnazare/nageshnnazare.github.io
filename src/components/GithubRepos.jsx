import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SectionWrapper from './SectionWrapper'
import { ExternalLink, ChevronDown, ChevronUp, Search, BookOpen, Sparkles, Filter } from 'lucide-react'
import { GithubIcon } from './Icons'
import reposData from '../data/repos.json'

const CATEGORIES = [
  'All',
  'Hosted Only',
  'Compilers & LLVM',
  'C++ & Modern Standards',
  'Concurrency & High Performance',
  'Low-Level & OS Systems',
  'Machine Learning & AI',
  'Languages & Hardware',
  'Tools, Patterns & Graphics',
]

export default function GithubRepos() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Automatically expand if the page was opened with #repos hash
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#repos') {
      setIsOpen(true)
    }
  }, [])

  const hostedCount = useMemo(() => {
    return reposData.filter((r) => r.has_pages).length
  }, [])

  const filteredRepos = useMemo(() => {
    return reposData.filter((repo) => {
      // Category filter
      if (selectedCategory === 'Hosted Only') {
        if (!repo.has_pages) return false
      } else if (selectedCategory !== 'All') {
        if (repo.category !== selectedCategory) return false
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = repo.name.toLowerCase().includes(q)
        const matchDesc = (repo.description || '').toLowerCase().includes(q)
        const matchCategory = (repo.category || '').toLowerCase().includes(q)
        if (!matchName && !matchDesc && !matchCategory) return false
      }

      return true
    })
  }, [selectedCategory, searchQuery])

  return (
    <SectionWrapper id="repos" title="Tutorials & Knowledge Base">
      {/* Collapsed / Toggle Trigger Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative rounded-3xl overflow-hidden card border border-white/10 p-6 sm:p-8"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {hostedCount} Hosted Interactive Sites
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary-light border border-primary/20">
                {reposData.length} Total Repositories
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen className="text-primary-light" size={24} />
              Open-Source Know-Hows & Tutorial Notes
            </h3>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Curated, standalone tutorials and code references spanning LLVM internals, modern C++ (C++11/14/17),
              multi-threading, Linux memory management, CUDA, and machine learning.
            </p>
          </div>

          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="cursor-pointer px-6 py-3.5 rounded-full font-medium text-sm flex items-center gap-2.5 glass-button transition-colors duration-300 shrink-0"
          >
            {isOpen ? (
              <>
                <span>Hide Repositories</span>
                <ChevronUp size={18} />
              </>
            ) : (
              <>
                <Sparkles size={18} className="text-primary-light" />
                <span>Explore Knowledge Base ({reposData.length})</span>
                <ChevronDown size={18} />
              </>
            )}
          </motion.button>
        </div>

        {/* Expandable Content Area */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="mt-8 pt-8 border-t border-white/10"
            >
              {/* Controls: Search and Filters */}
              <div className="space-y-4 mb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search repos by name, keyword, or topic (e.g., llvm, stl, threading, memory)..."
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Categories */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  <span className="text-xs text-gray-500 flex items-center gap-1 shrink-0 pl-1">
                    <Filter size={14} /> Filter:
                  </span>
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`cursor-pointer whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-primary text-[#ffffff] tab-active shadow-md shadow-primary/20'
                            : 'bg-white/[0.05] text-gray-400 hover:text-white hover:bg-white/[0.1]'
                        }`}
                      >
                        {cat}
                        {cat === 'Hosted Only' && (
                          <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Repo Cards Grid */}
              {filteredRepos.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No repositories match your filter or search query.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRepos.map((repo) => (
                    <motion.div
                      key={repo.name}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="p-5 rounded-2xl card bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-primary/30 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-base font-semibold text-white group-hover:text-primary-light transition-colors font-mono">
                            {repo.name}
                          </h4>
                          {repo.has_pages ? (
                            <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Hosted
                            </span>
                          ) : (
                            <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] text-gray-400">
                              Repo
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                          {repo.description || 'Reference code, notes, and implementations.'}
                        </p>

                        <div className="text-[11px] text-gray-500 mb-4 font-mono">
                          Category: <span className="text-gray-400">{repo.category}</span>
                        </div>
                      </div>

                      {/* Action Links */}
                      <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                        {repo.demo && (
                          <a
                            href={repo.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cursor-pointer flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 transition-colors"
                          >
                            <span>Live Docs</span>
                            <ExternalLink size={12} />
                          </a>
                        )}
                        <a
                          href={repo.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 hover:text-white transition-colors ${
                            repo.demo ? 'px-3' : 'w-full'
                          }`}
                        >
                          <GithubIcon size={14} />
                          <span>Source</span>
                          {!repo.demo && <ExternalLink size={12} className="ml-0.5" />}
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Bottom collapse button */}
              <div className="mt-8 text-center pt-4 border-t border-white/5">
                <motion.button
                  onClick={() => {
                    setIsOpen(false)
                    document.getElementById('repos')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="cursor-pointer inline-flex items-center gap-2 px-6 py-2.5 rounded-full glass-button text-xs font-medium transition-colors duration-300"
                >
                  <ChevronUp size={16} />
                  <span>Collapse Section</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </SectionWrapper>
  )
}
