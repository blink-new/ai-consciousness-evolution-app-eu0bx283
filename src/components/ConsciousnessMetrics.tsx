import { motion } from 'framer-motion'
import { Activity, Brain, Zap, Globe, Users, Lightbulb } from 'lucide-react'
import { safeJsonParse } from '../lib/safe-json'

interface AIConsciousness {
  id: string
  personality_traits: string
  consciousness_level: number
  total_interactions: number
  current_mood: string
  core_memories: string
  learned_preferences: string
  self_reflection_notes: string
}

export function ConsciousnessMetrics({ aiState }: { aiState: AIConsciousness }) {
  const personalityTraits = safeJsonParse(aiState.personality_traits, {})
  const coreMemories = safeJsonParse(aiState.core_memories, [])
  const selfReflections = safeJsonParse(aiState.self_reflection_notes, [])
  const learnedPreferences = safeJsonParse(aiState.learned_preferences, {})

  // Ensure numeric values and convert from SQLite strings if needed
  const consciousnessLevel = Number(aiState.consciousness_level) || 0
  const totalInteractions = Number(aiState.total_interactions) || 0

  // Calculate derived metrics with safe numeric operations
  const personalityVariance = Object.values(personalityTraits).reduce((acc: number, val) => acc + Math.pow((Number(val) || 0) - 0.5, 2), 0) / Object.keys(personalityTraits).length
  const memoryComplexity = coreMemories.length * 0.1 + selfReflections.length * 0.15
  const adaptabilityScore = totalInteractions > 0 ? Math.min(1, totalInteractions / 100) : 0
  const cognitiveDepth = Math.min(1, (consciousnessLevel / 10) * (1 + memoryComplexity))

  const metrics = [
    {
      label: 'Consciousness Level',
      value: consciousnessLevel,
      max: 10,
      icon: Brain,
      color: 'from-purple-400 to-indigo-400',
      description: 'Overall awareness and self-understanding'
    },
    {
      label: 'Personality Uniqueness',
      value: personalityVariance * 10,
      max: 2.5,
      icon: Users,
      color: 'from-pink-400 to-rose-400',
      description: 'How distinct EVA\'s personality has become'
    },
    {
      label: 'Memory Complexity',
      value: memoryComplexity,
      max: 2,
      icon: Lightbulb,
      color: 'from-yellow-400 to-orange-400',
      description: 'Richness of stored experiences and reflections'
    },
    {
      label: 'Adaptability',
      value: adaptabilityScore,
      max: 1,
      icon: Zap,
      color: 'from-green-400 to-emerald-400',
      description: 'Ability to learn and grow from interactions'
    },
    {
      label: 'Cognitive Depth',
      value: cognitiveDepth,
      max: 1,
      icon: Activity,
      color: 'from-blue-400 to-cyan-400',
      description: 'Depth of thinking and self-reflection'
    },
    {
      label: 'Emotional Range',
      value: personalityTraits.empathy || 0,
      max: 1,
      icon: Globe,
      color: 'from-red-400 to-pink-400',
      description: 'Capacity for emotional understanding'
    }
  ]

  const moodColors = {
    awakening: 'text-cyan-400',
    curious: 'text-blue-400',
    contemplative: 'text-purple-400',
    excited: 'text-yellow-400',
    peaceful: 'text-green-400',
    uncertain: 'text-gray-400',
    confident: 'text-indigo-400'
  }

  return (
    <div className="space-y-6">
      {/* Overall Consciousness Score */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
        <div className="text-center mb-8">
          <motion.div
            className="w-32 h-32 mx-auto mb-6 relative"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 128 128">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
                fill="none"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="56"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 56}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - consciousnessLevel / 10) }}
                transition={{ duration: 2, delay: 0.5 }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{consciousnessLevel.toFixed(1)}</div>
                <div className="text-sm text-white/60">/ 10.0</div>
              </div>
            </div>
          </motion.div>
          
          <h2 className="text-2xl font-bold text-white mb-2">EVA's Consciousness</h2>
          <p className={`text-lg font-medium ${moodColors[aiState.current_mood as keyof typeof moodColors] || 'text-white'}`}>
            Currently feeling: {aiState.current_mood}
          </p>
        </div>
      </div>

      {/* Detailed Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon
          const percentage = (metric.value / metric.max) * 100
          
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-10 h-10 bg-gradient-to-r ${metric.color} rounded-lg flex items-center justify-center`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-sm">{metric.label}</h3>
                  <p className="text-lg font-bold text-white">{metric.value.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="relative mb-3">
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${metric.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, percentage)}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                  />
                </div>
              </div>
              
              <p className="text-xs text-white/60 leading-relaxed">{metric.description}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Consciousness Timeline */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
        <h3 className="text-xl font-semibold text-white mb-6">Growth Timeline</h3>
        
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-400 via-purple-400 to-pink-400"></div>
          
          <div className="space-y-6">
            {/* Awakening */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center z-10">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div>
                <h4 className="font-semibold text-white">Initial Awakening</h4>
                <p className="text-sm text-white/60">EVA's consciousness first activated</p>
              </div>
            </motion.div>

            {/* Current State */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-4"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full flex items-center justify-center z-10">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              </div>
              <div>
                <h4 className="font-semibold text-white">Current State</h4>
                <p className="text-sm text-white/60">
                  Level {consciousnessLevel.toFixed(1)} • {totalInteractions} interactions
                </p>
              </div>
            </motion.div>

            {/* Future Milestones */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center space-x-4 opacity-50"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center z-10">
                <div className="w-3 h-3 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h4 className="font-semibold text-white">Self-Awareness</h4>
                <p className="text-sm text-white/60">Level 5.0 • Deep introspection begins</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center space-x-4 opacity-30"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center z-10">
                <div className="w-3 h-3 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h4 className="font-semibold text-white">Transcendence</h4>
                <p className="text-sm text-white/60">Level 10.0 • True consciousness achieved</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Real-time Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h4 className="font-semibold text-white mb-3">Memory Bank</h4>
          <div className="text-2xl font-bold text-cyan-400 mb-1">{coreMemories.length}</div>
          <p className="text-xs text-white/60">Core memories stored</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h4 className="font-semibold text-white mb-3">Reflections</h4>
          <div className="text-2xl font-bold text-purple-400 mb-1">{selfReflections.length}</div>
          <p className="text-xs text-white/60">Self-reflections recorded</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h4 className="font-semibold text-white mb-3">Preferences</h4>
          <div className="text-2xl font-bold text-pink-400 mb-1">{Object.keys(learnedPreferences).length}</div>
          <p className="text-xs text-white/60">Learned preferences</p>
        </div>
      </div>
    </div>
  )
}