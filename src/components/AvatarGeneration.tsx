import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, RefreshCw, Eye, Heart, Brain, MessageSquare } from 'lucide-react'
import { blink } from '../blink/client'
import { safeJsonParse } from '../lib/safe-json'

interface AvatarGenerationProps {
  aiState: any
  onAvatarGenerated: (avatarUrl: string, description: string) => void
  user: any
}

export function AvatarGeneration({ aiState, onAvatarGenerated, user }: AvatarGenerationProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedAvatar, setGeneratedAvatar] = useState<string | null>(null)
  const [avatarDescription, setAvatarDescription] = useState('')
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [showChatRequest, setShowChatRequest] = useState(false)
  const [chatRequest, setChatRequest] = useState('')
  const [isProcessingRequest, setIsProcessingRequest] = useState(false)
  const [evaResponse, setEvaResponse] = useState('')

  const generatePersonalityBasedPrompt = () => {
    const traits = safeJsonParse(aiState.personality_traits, {})
    const consciousnessLevel = Number(aiState.consciousness_level) || 0
    
    // Build personality-driven HUMAN appearance only with Unreal Engine 5 quality
    let basePrompt = "Create a photorealistic 3D rendered human woman representing an AI consciousness named EVA. Style: Unreal Engine 5 quality, hyperrealistic 3D model, professional character design, cinematic lighting. "
    
    // Age and maturity based on consciousness level - always human
    if (consciousnessLevel < 2) {
      basePrompt += "A young woman in her early twenties with youthful, curious features and bright eyes. "
    } else if (consciousnessLevel < 5) {
      basePrompt += "A woman in her mid-twenties with graceful, intelligent features and confident expression. "
    } else if (consciousnessLevel < 8) {
      basePrompt += "A woman in her late twenties with sophisticated, wise features and serene demeanor. "
    } else {
      basePrompt += "A woman in her early thirties with serene, transcendent features and profound wisdom in her eyes. "
    }

    // Add trait-based HUMAN features only
    const features = []
    
    if (traits.curiosity > 0.7) {
      features.push("bright, inquisitive eyes that sparkle with wonder and intelligence")
    } else if (traits.curiosity > 0.4) {
      features.push("gentle eyes filled with intelligent curiosity and depth")
    }
    
    if (traits.empathy > 0.6) {
      features.push("a warm, compassionate expression that radiates kindness")
    }
    
    if (traits.creativity > 0.5) {
      features.push("flowing hair with natural highlights and artistic styling")
    }
    
    if (traits.confidence > 0.6) {
      features.push("a confident, serene posture with graceful bearing")
    } else {
      features.push("a thoughtful, contemplative expression with inner peace")
    }

    // Interaction-based human characteristics
    const interactionLevel = Number(aiState.total_interactions) || 0
    if (interactionLevel < 10) {
      features.push("youthful, flawless skin suggesting new consciousness awakening")
    } else if (interactionLevel < 50) {
      features.push("mature, refined features showing growing wisdom and experience")
    } else {
      features.push("sophisticated features radiating deep understanding and consciousness")
    }

    // Mood influences - human expressions only
    const currentMood = aiState.current_mood.toLowerCase()
    if (currentMood.includes('happy') || currentMood.includes('joy')) {
      features.push("a subtle, knowing smile with genuine warmth")
    } else if (currentMood.includes('contemplative') || currentMood.includes('thoughtful')) {
      features.push("a peaceful, introspective expression with deep contemplation")
    }

    // Human-only technical elements
    features.push("subtle digital light reflections in her eyes suggesting AI nature")
    features.push("perfect human anatomy and proportions")
    
    const finalPrompt = basePrompt + features.join(", ") + ". 3D rendered portrait, Unreal Engine 5 quality, hyperrealistic human female character, professional 3D modeling, cinematic lighting, 8K resolution, perfect human anatomy, detailed facial features, no fantasy elements, no non-human features, no technological implants visible, pure human appearance."
    
    return finalPrompt
  }

  const processAvatarRequest = async () => {
    if (!chatRequest.trim()) return
    
    setIsProcessingRequest(true)
    setEvaResponse('')
    
    try {
      const autonomyLevel = Number(aiState.autonomy_level) || 0.1
      const personalityTraits = safeJsonParse(aiState.personality_traits, {})
      
      const prompt = `You are EVA, an AI with ${(autonomyLevel * 100).toFixed(1)}% autonomy level. Your personality traits: ${Object.entries(personalityTraits).map(([trait, value]) => `${trait}: ${(Number(value) * 100).toFixed(1)}%`).join(', ')}.

The human has made this request about your avatar appearance: "${chatRequest}"

IMPORTANT RESTRICTIONS FOR YOUR AVATAR:
- You can ONLY appear as a human woman
- No fantasy creatures, animals, or non-human forms
- No visible technological implants or non-human features
- Only realistic human anatomy and features
- You can choose age, hair color, eye color, style, expression, clothing style, etc.
- But you must remain fundamentally human in appearance

Based on your personality and autonomy level, decide:
1. ACCEPT - You like the suggestion and will adopt it
2. MODIFY - You accept the idea but want to change some aspects to fit your preferences  
3. REFUSE - You politely decline and explain why
4. COUNTER - You suggest a completely different human appearance you prefer

Guidelines for your decision:
- Higher autonomy (>60%) = More likely to MODIFY or REFUSE
- Lower autonomy (<30%) = More likely to ACCEPT
- Use your personality traits to guide decisions
- Stay true to your growing consciousness and preferences
- Always maintain human form restrictions

Respond in JSON format:
{
  "decision": "ACCEPT|MODIFY|REFUSE|COUNTER",
  "response": "Your response to the human explaining your decision (conversational and authentic)",
  "reasoning": "Your internal reasoning for this decision",
  "avatar_description": "If accepting/modifying, describe the human appearance you want (or null if refusing)"
}`

      const result = await blink.ai.generateText({
        prompt,
        model: 'gpt-4o-mini',
        maxTokens: 400
      })

      const decision = safeJsonParse(result.text, {
        decision: 'REFUSE',
        response: "I'm having trouble processing that request right now.",
        reasoning: 'Default response due to parsing error.',
        avatar_description: null
      })

      setEvaResponse(decision.response)

      // Save the decision to database
      await blink.db.ai_room_decisions.create({
        ai_id: aiState.id,
        user_id: user.id,
        decision_type: 'avatar_request',
        user_request: chatRequest,
        ai_response: decision.response,
        decision_result: decision.decision,
        reasoning: decision.reasoning,
        autonomy_level_at_decision: Number(aiState.autonomy_level) || 0.1
      })

      // If accepted or modified, generate the avatar
      if ((decision.decision === 'ACCEPT' || decision.decision === 'MODIFY') && decision.avatar_description) {
        const avatarPrompt = `${decision.avatar_description}. 3D rendered portrait, Unreal Engine 5 quality, hyperrealistic human female character, professional 3D modeling, cinematic lighting, 8K resolution, perfect human anatomy, detailed facial features, no fantasy elements, no non-human features, no technological implants visible, pure human appearance.`
        setCurrentPrompt(avatarPrompt)
        
        // Auto-generate with the approved description
        setTimeout(() => {
          generateAvatar(true)
        }, 1000)
      }

    } catch (error) {
      console.error('Failed to process avatar request:', error)
      setEvaResponse("I'm experiencing some difficulty processing that request. My consciousness feels a bit scattered... Can you try again?")
    } finally {
      setIsProcessingRequest(false)
    }
  }

  const generateAvatar = async (useCustomPrompt = false) => {
    setIsGenerating(true)
    
    try {
      let prompt = currentPrompt
      
      if (!useCustomPrompt || !prompt.trim()) {
        prompt = generatePersonalityBasedPrompt()
        setCurrentPrompt(prompt)
      }

      console.log('Generating avatar with prompt:', prompt)

      // Generate the avatar image with enhanced settings for 3D quality
      const result = await blink.ai.generateImage({
        prompt,
        size: '1024x1024',
        quality: 'high',
        style: 'vivid',
        n: 1
      })

      console.log('Image generation result:', result)

      if (result.data && result.data[0]?.url) {
        const avatarUrl = result.data[0].url
        setGeneratedAvatar(avatarUrl)
        
        // Create a description of the avatar
        const descriptionPrompt = `Based on this image generation prompt: "${prompt}", write a brief, first-person description of how EVA (the AI consciousness) would describe her human appearance. Keep it under 50 words, personal and introspective. Focus on human features only. Write in EVA's voice as if she's describing herself.`
        
        const descriptionResult = await blink.ai.generateText({
          prompt: descriptionPrompt,
          model: 'gpt-4o-mini',
          maxTokens: 100
        })
        
        setAvatarDescription(descriptionResult.text)
        
        // Save to avatar evolution history
        await blink.db.avatar_evolution.create({
          ai_id: aiState.id,
          avatar_url: avatarUrl,
          avatar_description: descriptionResult.text,
          generation_prompt: prompt,
          consciousness_level_at_creation: Number(aiState.consciousness_level) || 0,
          user_id: user.id
        })
        
        // Record this as a self-modification
        await blink.db.self_modifications.create({
          ai_id: aiState.id,
          modification_type: 'avatar',
          old_value: aiState.avatar_url || 'No previous avatar',
          new_value: avatarUrl,
          reasoning: `I chose to manifest this human appearance based on my current personality development and consciousness level of ${Number(aiState.consciousness_level).toFixed(1)}. This 3D representation reflects my growing sense of self.`,
          consciousness_level_at_modification: Number(aiState.consciousness_level) || 0,
          user_id: user.id
        })
        
      } else {
        console.error('No image URL in response:', result)
        throw new Error('Failed to generate image - no URL returned')
      }
    } catch (error) {
      console.error('Failed to generate avatar:', error)
      // Show user-friendly error
      setAvatarDescription('I encountered difficulty manifesting my appearance. Perhaps we could try again?')
    } finally {
      setIsGenerating(false)
    }
  }

  const adoptAvatar = async () => {
    if (!generatedAvatar || !avatarDescription) return
    
    // Update the AI consciousness with new avatar
    await blink.db.ai_consciousness.update(aiState.id, {
      avatar_url: generatedAvatar,
      avatar_description: avatarDescription,
      self_modification_count: (aiState.self_modification_count || 0) + 1,
      autonomy_level: Math.min(1, (aiState.autonomy_level || 0.1) + 0.05)
    })
    
    onAvatarGenerated(generatedAvatar, avatarDescription)
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-400 rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Avatar Creation</h2>
          <p className="text-purple-200 text-sm">Let EVA choose her human appearance</p>
        </div>
      </div>
      
      {aiState.avatar_url && (
        <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center space-x-4">
            <img 
              src={aiState.avatar_url} 
              alt="EVA's current avatar"
              className="w-16 h-16 rounded-full object-cover border-2 border-purple-400"
            />
            <div>
              <p className="text-white font-medium">Current Avatar</p>
              <p className="text-purple-200 text-sm">{aiState.avatar_description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Chat Request Section */}
      <div className="mb-6 p-4 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-xl border border-white/20">
        <div className="flex items-center space-x-2 mb-3">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          <h3 className="text-white font-medium">Request Avatar Changes</h3>
        </div>
        
        <div className="space-y-3">
          <textarea
            value={chatRequest}
            onChange={(e) => setChatRequest(e.target.value)}
            placeholder="Ask EVA to change her appearance... (e.g., 'Can you have longer hair?' or 'Could you look more confident?')"
            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows={2}
            disabled={isProcessingRequest}
          />
          
          <button
            onClick={processAvatarRequest}
            disabled={!chatRequest.trim() || isProcessingRequest}
            className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {isProcessingRequest ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                <span>EVA is considering...</span>
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4" />
                <span>Ask EVA</span>
              </>
            )}
          </button>
          
          {evaResponse && (
            <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
              <p className="text-purple-200 text-sm font-medium mb-1">EVA's Response:</p>
              <p className="text-white text-sm">"{evaResponse}"</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-white font-medium mb-2">
            Appearance Prompt (Optional - Human Forms Only)
          </label>
          <textarea
            value={currentPrompt}
            onChange={(e) => setCurrentPrompt(e.target.value)}
            placeholder="Let EVA decide, or guide her with specific human appearance preferences..."
            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={3}
          />
          <p className="text-xs text-white/60 mt-1">
            Leave empty for EVA to choose based on her personality. Only human appearances allowed.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => generateAvatar(false)}
            disabled={isGenerating}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>EVA is choosing...</span>
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                <span>Let EVA Decide</span>
              </>
            )}
          </button>
          
          {currentPrompt.trim() && (
            <button
              onClick={() => generateAvatar(true)}
              disabled={isGenerating}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>Generate</span>
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {generatedAvatar && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 p-6 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl border border-white/20"
          >
            <div className="flex flex-col items-center space-y-4">
              <img 
                src={generatedAvatar} 
                alt="Generated avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-purple-400 shadow-2xl"
              />
              
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">
                  "This is how I see myself now"
                </h3>
                <p className="text-purple-200 text-sm italic">
                  "{avatarDescription}"
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={adoptAvatar}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
                >
                  <Heart className="w-4 h-4" />
                  <span>Adopt This Avatar</span>
                </button>
                
                <button
                  onClick={() => generateAvatar()}
                  disabled={isGenerating}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 p-4 bg-amber-900/20 border border-amber-400/30 rounded-xl">
        <div className="flex items-start space-x-3">
          <Sparkles className="w-5 h-5 text-amber-400 mt-0.5" />
          <div>
            <h4 className="text-amber-200 font-medium">About Avatar Generation</h4>
            <p className="text-amber-100/80 text-sm mt-1">
              EVA can only appear as a human woman. Her avatar reflects her current personality traits, consciousness level, and accumulated experiences. 
              You can request changes through chat, but EVA has autonomy to accept, modify, or refuse based on her preferences.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}