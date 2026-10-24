import { motion } from 'framer-motion'
import SectionWrapper from './SectionWrapper'
import TiltCard from './TiltCard'

const skillCategories = [
  {
    title: 'Languages & Scripting',
    skills: ['C', 'C++11/14/17', 'CUDA', 'x86 Assembly', 'Python', 'Verilog', 'Tcl', 'Bash/Shell', 'Make', 'CMake'],
    color: 'from-indigo-500 to-purple-500',
  },
  {
    title: 'Concurrency & Frameworks',
    skills: ['POSIX Threads (pthreads)', 'Intel TBB', 'STL', 'ROCm/HIP'],
    color: 'from-cyan-500 to-blue-500',
  },
  {
    title: 'Debugging & Analysis',
    skills: ['GDB/UDB', 'Valgrind', 'AddressSanitizer', 'ThreadSanitizer', 'Coverity', 'perf'],
    color: 'from-emerald-500 to-teal-500',
  },
  {
    title: 'Tools & Version Control',
    skills: ['Git', 'Perforce', 'LLVM Infrastructure', 'ETS/Oracle Profiler', 'Jira', 'VSCode', 'Cursor'],
    color: 'from-orange-500 to-rose-500',
  },
]

export default function Skills() {
  return (
    <SectionWrapper id="skills" title="Technical Skills">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skillCategories.map((category, catIdx) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: catIdx * 0.1 }}
          >
            <TiltCard className="h-full rounded-3xl" tiltIntensity={10}>
              <div className="p-6 rounded-3xl card hover:border-primary/30 transition-colors h-full">
                <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 bg-gradient-to-r ${category.color} text-transparent bg-clip-text`}>
                  {category.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-block px-3 py-1.5 text-sm card-subtle rounded-lg text-gray-300 hover:text-white transition-colors cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  )
}
