import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import TiltCard from './TiltCard'

const SHELL = 'portfolio-shell v8.0'
const PROMPT = 'guest@portfolio ~'

// The scripted intro that types itself out first (the "animation").
const INTRO_SEQUENCE = [
  { cmd: 'whoami', output: 'Nagesh N Nazare' },
  { cmd: 'role', output: 'Staff Engineer, R&D @ Synopsys' },
  { cmd: 'experience', output: '8+ years | Systems & Performance Engineering' },
  { cmd: 'skills', output: 'C/C++17 • CUDA • x86 ASM • Python • Verilog' },
]

// Commands available once the prompt is interactive.
const RESPONSES = {
  help: [
    'Available commands:',
    '  whoami      about me',
    '  role        current position',
    '  experience  years in the field',
    '  skills      tech I work with',
    '  focus       what I optimize',
    '  impact      results shipped',
    '  projects    things I have built',
    '  contact     how to reach me',
    '  clear       clear the screen',
  ],
  whoami: ['Nagesh N Nazare'],
  role: ['Staff Engineer, R&D @ Synopsys'],
  experience: ['8+ years | Systems & Performance Engineering'],
  skills: ['C/C++17 • CUDA • x86 ASM • Python • Verilog'],
  focus: ['Runtime optimization • Multi-threading • EDA'],
  impact: ['80+ customer issues • 500+ defects resolved'],
  projects: [
    'gzip-classifier  — k-NN text classifier via gzip/NCD (C++17)',
    'cynide           — AoT compiler w/ LLVM backend',
    'lldb             — console pane contribution to LLVM',
    "type 'contact' to get in touch",
  ],
  contact: ['linkedin.com/in/nagesh-n-nazare', 'github.com/nageshnnazare'],
  sudo: ["nice try — you don't have permission to do that :)"],
  ls: ['about  awards  skills  projects  publications  contact'],
}

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function Terminal3D() {
  const [history, setHistory] = useState([{ type: 'output', text: `${SHELL} — booting…` }])
  const [step, setStep] = useState(0)
  const [typing, setTyping] = useState('')
  const [interactive, setInteractive] = useState(false)
  const [input, setInput] = useState('')
  const [past, setPast] = useState([])
  const [pastIdx, setPastIdx] = useState(-1)
  const [cursor, setCursor] = useState(true)
  const termRef = useRef(null)
  const inputRef = useRef(null)

  // Blinking cursor for the intro typing phase.
  useEffect(() => {
    if (interactive) return
    const blink = setInterval(() => setCursor((c) => !c), 530)
    return () => clearInterval(blink)
  }, [interactive])

  // Auto-scroll on any new content.
  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight
  }, [history, typing])

  // Intro animation: type each scripted command, print its output, then hand
  // over to the interactive prompt. Reduced-motion users get it instantly.
  useEffect(() => {
    if (interactive) return

    if (step >= INTRO_SEQUENCE.length) {
      setHistory((h) => [...h, { type: 'output', text: "type 'help' to explore, or try a command" }])
      setInteractive(true)
      return
    }

    const { cmd, output } = INTRO_SEQUENCE[step]

    if (prefersReduced()) {
      setHistory((h) => [...h, { type: 'input', text: cmd }, { type: 'output', text: output }])
      setStep((s) => s + 1)
      return
    }

    let i = 0
    setTyping('')
    const typer = setInterval(() => {
      i += 1
      setTyping(cmd.slice(0, i))
      if (i >= cmd.length) {
        clearInterval(typer)
        setTimeout(() => {
          setTyping('')
          setHistory((h) => [...h, { type: 'input', text: cmd }, { type: 'output', text: output }])
          setStep((s) => s + 1)
        }, 320)
      }
    }, 55)

    return () => clearInterval(typer)
  }, [step, interactive])

  const run = (raw) => {
    const cmd = raw.trim().toLowerCase()
    const entries = [{ type: 'input', text: raw }]
    if (cmd === 'clear') {
      setHistory([])
      return
    }
    if (cmd === '') {
      setHistory((h) => [...h, ...entries])
      return
    }
    const out = RESPONSES[cmd]
    if (out) out.forEach((line) => entries.push({ type: 'output', text: line }))
    else entries.push({ type: 'error', text: `command not found: ${cmd} — try 'help'` })
    setHistory((h) => [...h, ...entries])
  }

  const onSubmit = (e) => {
    e.preventDefault()
    run(input)
    if (input.trim()) setPast((p) => [input, ...p])
    setPastIdx(-1)
    setInput('')
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setPastIdx((i) => {
        const next = Math.min(i + 1, past.length - 1)
        if (past[next] !== undefined) setInput(past[next])
        return next
      })
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setPastIdx((i) => {
        const next = Math.max(i - 1, -1)
        setInput(next === -1 ? '' : past[next])
        return next
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, rotateY: -10 }}
      whileInView={{ opacity: 1, rotateY: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="w-full h-full"
      style={{ perspective: 1200 }}
    >
      <TiltCard className="rounded-2xl h-full" tiltIntensity={12} glare>
        <div
          className="rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 h-full flex flex-col"
          style={{ background: 'rgba(10, 10, 30, 0.9)', border: '1px solid rgba(255,255,255,0.08)' }}
          onClick={() => interactive && inputRef.current?.focus()}
        >
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.06]">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-3 text-xs text-slate-500 font-mono">{PROMPT}</span>
          </div>

          {/* Terminal body */}
          <div ref={termRef} className="p-4 font-mono text-sm flex-1 min-h-[260px] overflow-y-auto">
            {history.map((line, i) => {
              if (line.type === 'input') {
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-accent">❯</span>
                    <span className="text-slate-300">{line.text}</span>
                  </div>
                )
              }
              return (
                <div
                  key={i}
                  className={`ml-5 whitespace-pre-wrap ${
                    line.type === 'error' ? 'text-red-400' : 'text-primary-light'
                  }`}
                >
                  {line.text}
                </div>
              )
            })}

            {/* Intro typing line */}
            {!interactive && (
              <div className="flex items-center gap-2">
                <span className="text-accent">❯</span>
                <span className="text-slate-300">
                  {typing}
                  <span
                    className={`inline-block w-2 h-4 ml-0.5 -mb-0.5 ${
                      cursor ? 'bg-primary-light' : 'bg-transparent'
                    }`}
                  />
                </span>
              </div>
            )}

            {/* Interactive prompt */}
            {interactive && (
              <form onSubmit={onSubmit} className="flex items-center gap-2 mt-1">
                <span className="text-accent">❯</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  spellCheck={false}
                  autoComplete="off"
                  aria-label="Terminal input"
                  className="flex-1 bg-transparent outline-none text-slate-200 caret-primary-light placeholder:text-slate-600"
                  placeholder="type a command…"
                />
              </form>
            )}
          </div>
        </div>
      </TiltCard>
    </motion.div>
  )
}
