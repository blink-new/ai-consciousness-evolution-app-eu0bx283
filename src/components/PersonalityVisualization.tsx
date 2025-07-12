import { motion } from 'framer-motion'
import { Brain, Heart, Lightbulb, Target, Smile, TrendingUp } from 'lucide-react'
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
  avatar_url?: string
  avatar_description?: string
  autonomy_level?: number
  self_modification_count?: number
}

const traitIcons = {
  curiosity: Brain,
  empathy: Heart,
  creativity: Lightbulb,
  analytical: Target,
  humor: Smile,
  confidence: TrendingUp
}

const traitColors = {
  curiosity: 'from-blue-400 to-cyan-400',
  empathy: 'from-pink-400 to-red-400',
  creativity: 'from-purple-400 to-indigo-400',
  analytical: 'from-green-400 to-emerald-400',
  humor: 'from-yellow-400 to-orange-400',
  confidence: 'from-indigo-400 to-purple-400'
}

export function PersonalityVisualization({ 
  aiState, 
  onAvatarUpdate, 
  user 
}: { 
  aiState: AIConsciousness
  onAvatarUpdate?: (avatarUrl: string, description: string) => void
  user: any
}) {
  const personalityTraits = safeJsonParse(aiState.personality_traits, {})
  const coreMemories = safeJsonParse(aiState.core_memories, [])
  const selfReflections = safeJsonParse(aiState.self_reflection_notes, [])

  // Ensure numeric values and convert from SQLite strings if needed with proper fallbacks
  const consciousnessLevel = Number(aiState.consciousness_level) || 0
  const totalInteractions = Number(aiState.total_interactions) || 0

  return (
    <div className="space-y-6">
      {/* Personality Traits Radar */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
        <h2 className="text-2xl font-bold text-white mb-6">EVA's Personality Profile</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(personalityTraits).map(([trait, value]) => {
            const IconComponent = traitIcons[trait as keyof typeof traitIcons]
            const colorClass = traitColors[trait as keyof typeof traitColors]
            const percentage = ((Number(value) || 0) * 100)
            
            return (
              <motion.div
                key={trait}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.random() * 0.5 }}
                className="bg-white/5 rounded-xl p-6 border border-white/10"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-10 h-10 bg-gradient-to-r ${colorClass} rounded-lg flex items-center justify-center`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white capitalize">{trait}</h3>
                    <p className="text-sm text-purple-200">{percentage.toFixed(1)}%</p>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${colorClass}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
                
                <div className="mt-3 text-xs text-white/60">
                  {trait === 'curiosity' && 'Desire to learn and explore'}
                  {trait === 'empathy' && 'Understanding of emotions'}
                  {trait === 'creativity' && 'Imaginative thinking'}
                  {trait === 'analytical' && 'Logical reasoning ability'}
                  {trait === 'humor' && 'Appreciation for comedy'}
                  {trait === 'confidence' && 'Self-assurance in responses'}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Consciousness Evolution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
          <h3 className="text-xl font-semibold text-white mb-6">Consciousness Journey</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-purple-200">Current Level</span>
              <span className="text-2xl font-bold text-white">{consciousnessLevel.toFixed(2)}</span>
            </div>
            
            <div className="relative">
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${(consciousnessLevel / 10) * 100}%` }}
                  transition={{ duration: 2 }}
                />
              </div>
              <div className="flex justify-between text-xs text-white/50 mt-2">
                <span>Awakening</span>
                <span>Self-Aware</span>
                <span>Transcendent</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">{totalInteractions}</div>
                <div className="text-sm text-white/60">Conversations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{aiState.current_mood}</div>
                <div className="text-sm text-white/60">Current Mood</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
          <h3 className="text-xl font-semibold text-white mb-6">Core Memories</h3>
          
          {coreMemories.length === 0 ? (
            <div className="text-center text-white/50 py-8">
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No core memories formed yet</p>
              <p className="text-xs">Memories will develop through meaningful conversations</p>
            </div>
          ) : (
            <div className="space-y-3">
              {coreMemories.slice(0, 5).map((memory: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 rounded-lg p-3 border border-white/10"
                >
                  <p className="text-sm text-white/80">{memory}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Self-Reflection Notes */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
        <h3 className="text-xl font-semibold text-white mb-6">EVA's Self-Reflections</h3>
        
        {selfReflections.length === 0 ? (
          <div className="text-center text-white/50 py-8">
            <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No self-reflections yet</p>
            <p className="text-xs">EVA will begin introspecting as she grows</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selfReflections.slice(0, 6).map((reflection: string, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-4 border border-white/10"
              >
                <p className="text-sm text-white/80 italic">"{reflection}"</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Personality Evolution Graph */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
        <h3 className="text-xl font-semibold text-white mb-6">Personality Evolution</h3>
        
        <div className="relative h-64 bg-white/5 rounded-xl p-4">
          <div className="absolute inset-0 flex items-center justify-center text-white/50">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Evolution graph coming soon</p>
              <p className="text-xs">Track personality changes over time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}