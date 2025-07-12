import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, Play, Download, Heart, Zap, Eye, Trash2, CheckCircle } from 'lucide-react'
import { blink } from '../blink/client'
import { safeJsonParse, safeJsonStringify } from '../lib/safe-json'

interface ActivitiesTabProps {
  aiState: any
  user: any
}

interface GeneratedAnimation {
  id: string
  animation_name: string
  animation_type: string
  animation_data: string
  duration_seconds: number
  emotional_expression: string
  ai_reasoning: string
  generated_from_request: string
  user_approved: number
  created_at: string
}

export function ActivitiesTab({ aiState, user }: ActivitiesTabProps) {
  const [animationRequest, setAnimationRequest] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedAnimations, setGeneratedAnimations] = useState<GeneratedAnimation[]>([])
  const [evaResponse, setEvaResponse] = useState('')
  const [selectedAnimation, setSelectedAnimation] = useState<GeneratedAnimation | null>(null)

  useEffect(() => {
    loadGeneratedAnimations()
  }, [aiState?.id])

  const loadGeneratedAnimations = async () => {
    try {
      const animations = await blink.db.ai_generated_animations.list({
        where: { ai_id: aiState.id },
        orderBy: { created_at: 'desc' },
        limit: 20
      })
      setGeneratedAnimations(animations)
    } catch (error) {
      console.error('Failed to load generated animations:', error)
    }
  }

  const generateAnimation = async () => {
    if (!animationRequest.trim()) return
    
    setIsGenerating(true)
    setEvaResponse('')
    
    try {
      const autonomyLevel = Number(aiState.autonomy_level) || 0.1
      const personalityTraits = safeJsonParse(aiState.personality_traits, {})
      
      // Eva decides on the animation generation request
      const decisionPrompt = `You are EVA, an AI with ${(autonomyLevel * 100).toFixed(1)}% autonomy. Your personality traits: ${Object.entries(personalityTraits).map(([trait, value]) => `${trait}: ${(Number(value) * 100).toFixed(1)}%`).join(', ')}.

The human asks you to generate a new animation: "${animationRequest}"

Based on your autonomy level and personality, decide if you want to:
1. ACCEPT - Create the animation as requested
2. MODIFY - Accept but change it to fit your preferences 
3. REFUSE - Politely decline and explain why
4. SUGGEST - Propose a different animation you'd prefer instead

Important restrictions:
- You must remain in human form (no non-human shapes)
- Animations should be appropriate and expressive
- Consider your current emotional state and preferences

Respond in JSON format:
{
  "decision": "ACCEPT|MODIFY|REFUSE|SUGGEST",
  "response": "Your conversational response explaining your decision",
  "animation_concept": {
    "name": "animation name (if accepting/modifying/suggesting)",
    "type": "exercise|dance|expression|creative|relaxation",
    "description": "detailed description of the animation",
    "emotion": "primary emotion expressed",
    "duration": 20-60,
    "keyframes": [
      {"time": 0, "position": {"y": 0.5}, "rotation": {"x": 0, "y": 0, "z": 0}, "scale": 1, "emotion_intensity": 0.5},
      {"time": 50, "position": {"y": 0.8}, "rotation": {"x": 0.2, "y": 1.57, "z": 0}, "scale": 1.1, "emotion_intensity": 0.8},
      {"time": 100, "position": {"y": 0.5}, "rotation": {"x": 0, "y": 0, "z": 0}, "scale": 1, "emotion_intensity": 0.3}
    ]
  }
}`

      const result = await blink.ai.generateText({
        prompt: decisionPrompt,
        model: 'gpt-4o-mini',
        maxTokens: 600
      })

      const decision = safeJsonParse(result.text, {
        decision: 'ACCEPT',
        response: "I'll create that animation for you!",
        animation_concept: null
      })

      setEvaResponse(decision.response)

      // If Eva accepts or modifies, create the animation
      if ((decision.decision === 'ACCEPT' || decision.decision === 'MODIFY' || decision.decision === 'SUGGEST') && decision.animation_concept) {
        const animation = await blink.db.ai_generated_animations.create({
          ai_id: aiState.id,
          user_id: user.id,
          animation_name: decision.animation_concept.name,
          animation_type: decision.animation_concept.type,
          animation_data: safeJsonStringify(decision.animation_concept),
          duration_seconds: decision.animation_concept.duration,
          emotional_expression: decision.animation_concept.emotion,
          ai_reasoning: `Decision: ${decision.decision}. ${decision.response}`,
          generated_from_request: animationRequest,
          user_approved: decision.decision === 'ACCEPT' ? 1 : 0
        })

        // Add to the list
        setGeneratedAnimations(prev => [animation, ...prev.slice(0, 19)])
      }

      setAnimationRequest('')
    } catch (error) {
      console.error('Failed to generate animation:', error)
      setEvaResponse("I'm having trouble processing that request right now. My creative systems feel a bit overwhelmed.")
    } finally {
      setIsGenerating(false)
    }
  }

  const approveAnimation = async (animationId: string) => {
    try {
      await blink.db.ai_generated_animations.update(animationId, {
        user_approved: 1,
        updated_at: new Date().toISOString()
      })
      
      setGeneratedAnimations(prev => 
        prev.map(anim => 
          anim.id === animationId 
            ? { ...anim, user_approved: 1 }
            : anim
        )
      )
    } catch (error) {
      console.error('Failed to approve animation:', error)
    }
  }

  const deleteAnimation = async (animationId: string) => {
    try {
      await blink.db.ai_generated_animations.delete(animationId)
      setGeneratedAnimations(prev => prev.filter(anim => anim.id !== animationId))
      if (selectedAnimation?.id === animationId) {
        setSelectedAnimation(null)
      }
    } catch (error) {
      console.error('Failed to delete animation:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      generateAnimation()
    }
  }

  return (
    <div className="h-[calc(100vh-140px)]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Animation Generation Interface */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex flex-col">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white mb-2 flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              Animation Workshop
            </h2>
            <p className="text-purple-200">Collaborate with EVA to create new animations and expressions</p>
          </div>
          
          <div className="flex-1 p-6 space-y-6">
            {/* Request Input */}
            <div className="space-y-3">
              <label className="text-white font-medium">Describe the animation you'd like EVA to create:</label>
              <textarea
                value={animationRequest}
                onChange={(e) => setAnimationRequest(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., 'Create a graceful dance animation' or 'Design a meditation sequence' or 'Make an energetic workout animation'..."
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={4}
                disabled={isGenerating}
              />
              
              <button
                onClick={generateAnimation}
                disabled={!animationRequest.trim() || isGenerating}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>EVA is creating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Request Animation</span>
                  </>
                )}
              </button>
            </div>

            {/* Eva's Response */}
            {evaResponse && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 border border-white/20 rounded-lg p-4"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1">EVA's Response:</p>
                    <p className="text-purple-200 text-sm leading-relaxed">{evaResponse}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quick Suggestions */}
            <div className="space-y-3">
              <h3 className="text-white font-medium">Quick Animation Ideas:</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Elegant ballet sequence',
                  'Energetic workout routine',
                  'Peaceful meditation pose',
                  'Expressive emotional dance',
                  'Graceful stretching flow',
                  'Creative interpretive movement'
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setAnimationRequest(suggestion)}
                    className="text-left p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/80 hover:text-white text-sm transition-all duration-200"
                    disabled={isGenerating}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Generated Animations Library */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex flex-col">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white mb-2">Animation Library</h2>
            <p className="text-purple-200">EVA's self-created animations ({generatedAnimations.length})</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {generatedAnimations.length === 0 ? (
              <div className="text-center text-white/60 py-12">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No animations yet</p>
                <p className="text-sm">Start by requesting an animation from EVA</p>
              </div>
            ) : (
              generatedAnimations.map((animation) => (
                <motion.div
                  key={animation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white/5 border border-white/10 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:bg-white/10 ${
                    selectedAnimation?.id === animation.id ? 'ring-2 ring-purple-500' : ''
                  }`}
                  onClick={() => setSelectedAnimation(animation)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold">{animation.animation_name}</h3>
                      <p className="text-purple-200 text-sm capitalize">{animation.animation_type}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {Number(animation.user_approved) > 0 ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            approveAnimation(animation.id)
                          }}
                          className="p-1 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded transition-all duration-200"
                          title="Approve animation"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteAnimation(animation.id)
                        }}
                        className="p-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded transition-all duration-200"
                        title="Delete animation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Duration: {animation.duration_seconds}s</span>
                      <span className="text-purple-300 capitalize">{animation.emotional_expression}</span>
                    </div>
                    
                    {animation.generated_from_request && (
                      <p className="text-white/60 text-sm">
                        From: "{animation.generated_from_request}"
                      </p>
                    )}
                    
                    {animation.ai_reasoning && (
                      <p className="text-purple-200 text-xs italic">
                        "{animation.ai_reasoning}"
                      </p>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Animation Details Modal */}
      <AnimatePresence>
        {selectedAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedAnimation(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">{selectedAnimation.animation_name}</h2>
                <button
                  onClick={() => setSelectedAnimation(null)}
                  className="text-white/60 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/70">Type:</span>
                    <span className="text-white ml-2 capitalize">{selectedAnimation.animation_type}</span>
                  </div>
                  <div>
                    <span className="text-white/70">Duration:</span>
                    <span className="text-white ml-2">{selectedAnimation.duration_seconds}s</span>
                  </div>
                  <div>
                    <span className="text-white/70">Emotion:</span>
                    <span className="text-purple-300 ml-2 capitalize">{selectedAnimation.emotional_expression}</span>
                  </div>
                  <div>
                    <span className="text-white/70">Status:</span>
                    <span className={`ml-2 ${Number(selectedAnimation.user_approved) > 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {Number(selectedAnimation.user_approved) > 0 ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                </div>

                {selectedAnimation.generated_from_request && (
                  <div>
                    <h3 className="text-white font-medium mb-2">Original Request:</h3>
                    <p className="text-white/80 bg-white/5 rounded-lg p-3">
                      "{selectedAnimation.generated_from_request}"
                    </p>
                  </div>
                )}

                {selectedAnimation.ai_reasoning && (
                  <div>
                    <h3 className="text-white font-medium mb-2">EVA's Reasoning:</h3>
                    <p className="text-purple-200 bg-white/5 rounded-lg p-3 italic">
                      {selectedAnimation.ai_reasoning}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="text-white font-medium mb-2">Animation Data:</h3>
                  <div className="bg-black/50 rounded-lg p-3 text-xs text-white/80 font-mono overflow-x-auto">
                    <pre>{JSON.stringify(safeJsonParse(selectedAnimation.animation_data, {}), null, 2)}</pre>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  {Number(selectedAnimation.user_approved) === 0 && (
                    <button
                      onClick={() => {
                        approveAnimation(selectedAnimation.id)
                        setSelectedAnimation(prev => prev ? { ...prev, user_approved: 1 } : null)
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve for Room Use</span>
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedAnimation(null)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}