import { motion } from 'framer-motion'

// Brand mark: a hand-drawn "NN" monogram set in Excalidraw's Virgil font, in a
// single solid colour (no gradient). On hover it spins a full 360°, echoing
// Daniel Lawrence Lu's rotating hero logo (daniel.lawrence.lu). It also plays
// the spin once on mount.
const DUR = 0.8

const spin = {
  rest: { rotate: 0 },
  hover: { rotate: 360 },
}

export default function Logo({ size = 30 }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Nagesh N Nazare"
      className="shrink-0 overflow-visible"
      style={{ transformOrigin: '50% 50%' }}
      variants={spin}
      initial={{ rotate: -360 }}
      animate="rest"
      whileHover="hover"
      whileFocus="hover"
      transition={{ duration: DUR, ease: 'easeInOut' }}
    >
      <text
        x="32"
        y="34"
        textAnchor="middle"
        dominantBaseline="central"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        paintOrder="stroke"
        style={{ fontFamily: "'Virgil', 'Comic Sans MS', cursive", fontSize: '40px', letterSpacing: '-2px' }}
      >
        NN
      </text>
    </motion.svg>
  )
}
