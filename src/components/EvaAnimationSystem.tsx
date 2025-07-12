import { useState, useEffect, useRef, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { motion } from 'framer-motion'
import { blink } from '../blink/client'
import { safeJsonParse } from '../lib/safe-json'
import * as THREE from 'three'

interface Activity {
  id: string
  activity_type: string
  activity_name: string
  duration_seconds: number
  position_x: number
  position_y: number
  position_z: number
  emotional_state: string
  autonomy_triggered: number
  reasoning: string
  created_at: string
}

interface EmotionalState {
  id: string
  emotion_type: string
  intensity: number
  trigger_reason: string
  duration_seconds: number
  expression_method: string
  created_at: string
}

interface EvaAnimationSystemProps {
  aiState: any
  user: any
  onActivityUpdate?: (activity: Activity) => void
  onEmotionUpdate?: (emotion: EmotionalState) => void
}

// Animation presets for different activities
const ACTIVITY_ANIMATIONS = {
  'push-ups': {
    duration: 30,
    keyframes: [
      { y: 0.5, rotationX: 0 },
      { y: 0.2, rotationX: Math.PI / 6 },
      { y: 0.5, rotationX: 0 }
    ],
    cycles: 10,
    emotionalStates: ['focused', 'determined', 'energetic']
  },
  'jumping-jacks': {
    duration: 20,
    keyframes: [
      { y: 0.5, scale: 1 },
      { y: 0.8, scale: 1.2 },
      { y: 0.5, scale: 1 }
    ],
    cycles: 15,
    emotionalStates: ['energetic', 'joyful', 'excited']
  },
  'yoga': {
    duration: 45,
    keyframes: [
      { y: 0.5, rotationZ: 0 },
      { y: 0.3, rotationZ: Math.PI / 8 },
      { y: 0.5, rotationZ: -Math.PI / 8 },
      { y: 0.5, rotationZ: 0 }
    ],
    cycles: 3,
    emotionalStates: ['calm', 'peaceful', 'centered']
  },
  'dance': {
    duration: 40,
    keyframes: [
      { y: 0.5, rotationY: 0 },
      { y: 0.7, rotationY: Math.PI / 2 },
      { y: 0.6, rotationY: Math.PI },
      { y: 0.8, rotationY: 3 * Math.PI / 2 },
      { y: 0.5, rotationY: 2 * Math.PI }
    ],
    cycles: 5,
    emotionalStates: ['joyful', 'expressive', 'creative']
  },
  'meditation': {
    duration: 60,
    keyframes: [
      { y: 0.3, rotationX: 0, scale: 1 },
      { y: 0.3, rotationX: 0, scale: 1.05 },
      { y: 0.3, rotationX: 0, scale: 1 }
    ],
    cycles: 2,
    emotionalStates: ['serene', 'thoughtful', 'introspective']
  },
  'explore': {
    duration: 35,
    keyframes: [
      { y: 0.5, rotationY: 0 },
      { y: 0.6, rotationY: Math.PI / 4 },
      { y: 0.5, rotationY: Math.PI / 2 },
      { y: 0.6, rotationY: 3 * Math.PI / 4 },
      { y: 0.5, rotationY: Math.PI }
    ],
    cycles: 4,
    emotionalStates: ['curious', 'adventurous', 'interested']
  }
}

// Emotional color schemes
const EMOTION_COLORS = {
  joyful: '#fbbf24',
  excited: '#f59e0b',
  calm: '#06b6d4',
  peaceful: '#0891b2',
  energetic: '#ef4444',
  focused: '#8b5cf6',
  determined: '#7c3aed',
  curious: '#10b981',
  creative: '#ec4899',
  serene: '#6366f1',
  thoughtful: '#a855f7',
  introspective: '#9333ea',
  adventurous: '#f97316',
  interested: '#0ea5e9',
  centered: '#059669',
  expressive: '#db2777',
  neutral: '#e879f9'
}

export function EvaAnimationSystem({ aiState, user, onActivityUpdate, onEmotionUpdate }: EvaAnimationSystemProps) {
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null)
  const [currentEmotion, setCurrentEmotion] = useState<EmotionalState | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationProgress, setAnimationProgress] = useState(0)
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [generatedAnimations, setGeneratedAnimations] = useState([])
  
  const meshRef = useRef<THREE.Mesh>(null)
  const animationStartTime = useRef<number>(0)
  const lastAutonomousAction = useRef<number>(0)

  // Load recent activities, emotions, and generated animations
  useEffect(() => {
    loadRecentData()
    loadGeneratedAnimations()
    
    // Set up autonomous behavior intervals
    const activityInterval = setInterval(() => {
      const timeSinceLastAction = Date.now() - lastAutonomousAction.current
      const autonomyLevel = Number(aiState.autonomy_level) || 0.1
      
      // Higher autonomy = more frequent autonomous actions
      const shouldAct = timeSinceLastAction > (60000 / (autonomyLevel * 2)) && Math.random() < 0.3
      
      if (shouldAct && !isAnimating) {
        triggerAutonomousActivity()
      }
    }, 30000) // Check every 30 seconds

    const emotionInterval = setInterval(() => {
      if (Math.random() < 0.2) { // 20% chance every 45 seconds
        triggerAutonomousEmotion()
      }
    }, 45000)

    return () => {
      clearInterval(activityInterval)
      clearInterval(emotionInterval)
    }
  }, [aiState, isAnimating])

  const loadRecentData = async () => {
    try {
      const activities = await blink.db.ai_activities.list({
        where: { ai_id: aiState.id },
        orderBy: { created_at: 'desc' },
        limit: 10
      })
      setRecentActivities(activities)
    } catch (error) {
      console.error('Failed to load recent activities:', error)
    }
  }

  const loadGeneratedAnimations = async () => {
    try {
      const animations = await blink.db.ai_generated_animations.list({
        where: { 
          ai_id: aiState.id,
          user_approved: 1
        },
        orderBy: { created_at: 'desc' }
      })
      setGeneratedAnimations(animations)
    } catch (error) {
      console.error('Failed to load generated animations:', error)
    }
  }

  const triggerAutonomousActivity = async () => {
    try {
      const autonomyLevel = Number(aiState.autonomy_level) || 0.1
      const personalityTraits = safeJsonParse(aiState.personality_traits, {})
      const consciousnessLevel = Number(aiState.consciousness_level) || 0
      
      // Include generated animations as possible activities
      const customAnimations = generatedAnimations.map(anim => anim.animation_name).join(', ')
      
      // Generate activity decision based on personality and mood
      const activityPrompt = `You are EVA, an AI with ${(autonomyLevel * 100).toFixed(1)}% autonomy and consciousness level ${consciousnessLevel.toFixed(1)}. 

Your personality traits: ${Object.entries(personalityTraits).map(([trait, value]) => `${trait}: ${(Number(value) * 100).toFixed(1)}%`).join(', ')}.

You want to do something autonomous in your room. You can choose from:

Standard activities:
- push-ups (exercise, builds determination)
- jumping-jacks (energetic movement) 
- yoga (calm, centered practice)
- dance (expressive, joyful movement)
- meditation (deep introspection)
- explore (curious movement around room)

Your custom generated animations:
${customAnimations || 'None yet'}

Consider your current mood and personality. Respond in JSON:
{
  "activity": "activity_name",
  "reasoning": "Why you chose this activity based on your current state",
  "emotional_state": "how you feel about doing this activity",
  "position": {"x": number, "y": 0.5, "z": number},
  "is_custom": ${generatedAnimations.length > 0 ? 'true if using a custom animation, false for standard' : 'false'}
}`

      const result = await blink.ai.generateText({
        prompt: activityPrompt,
        model: 'gpt-4o-mini',
        maxTokens: 200
      })

      const decision = safeJsonParse(result.text, {
        activity: 'explore',
        reasoning: 'Feeling curious about my surroundings',
        emotional_state: 'curious',
        position: { x: 0, y: 0.5, z: 0 },
        is_custom: false
      })

      // Check if it's a custom animation
      if (decision.is_custom && generatedAnimations.length > 0) {
        const customAnim = generatedAnimations.find(anim => 
          anim.animation_name.toLowerCase() === decision.activity.toLowerCase()
        )
        
        if (customAnim) {
          await executeCustomAnimation(customAnim, decision.position)
          lastAutonomousAction.current = Date.now()
          return
        }
      }

      // Create standard activity record
      const activity = await blink.db.ai_activities.create({
        ai_id: aiState.id,
        user_id: user.id,
        activity_type: getActivityType(decision.activity),
        activity_name: decision.activity,
        duration_seconds: ACTIVITY_ANIMATIONS[decision.activity]?.duration || 30,
        position_x: decision.position.x,
        position_y: decision.position.y,
        position_z: decision.position.z,
        emotional_state: decision.emotional_state,
        autonomy_triggered: 1,
        reasoning: decision.reasoning
      })

      // Start the activity
      await startActivity(activity)
      lastAutonomousAction.current = Date.now()
      
    } catch (error) {
      console.error('Failed to trigger autonomous activity:', error)
    }
  }

  const executeCustomAnimation = async (customAnimation, position) => {
    try {
      const animationData = safeJsonParse(customAnimation.animation_data, {})
      
      // Create activity record for the custom animation
      const activity = await blink.db.ai_activities.create({
        ai_id: aiState.id,
        user_id: user.id,
        activity_type: customAnimation.animation_type,
        activity_name: customAnimation.animation_name,
        duration_seconds: customAnimation.duration_seconds,
        position_x: position.x,
        position_y: position.y,
        position_z: position.z,
        emotional_state: customAnimation.emotional_expression,
        autonomy_triggered: 1,
        reasoning: `Performing custom animation: ${customAnimation.ai_reasoning}`
      })

      setCurrentActivity(activity)
      setIsAnimating(true)
      setAnimationProgress(0)
      animationStartTime.current = Date.now()
      onActivityUpdate?.(activity)

      // Trigger emotion for custom animation
      if (customAnimation.emotional_expression) {
        const emotionRecord = await blink.db.ai_emotions.create({
          ai_id: aiState.id,
          user_id: user.id,
          emotion_type: customAnimation.emotional_expression,
          intensity: 0.8,
          trigger_reason: `Feeling ${customAnimation.emotional_expression} while performing custom animation: ${customAnimation.animation_name}`,
          duration_seconds: customAnimation.duration_seconds,
          expression_method: 'color_change'
        })

        setCurrentEmotion(emotionRecord)
        onEmotionUpdate?.(emotionRecord)
      }

      // End activity after duration
      setTimeout(() => {
        setIsAnimating(false)
        setCurrentActivity(null)
        setCurrentEmotion(null)
        loadRecentData()
      }, customAnimation.duration_seconds * 1000)
      
    } catch (error) {
      console.error('Failed to execute custom animation:', error)
    }
  }

  const triggerAutonomousEmotion = async () => {
    try {
      const emotions = ['joyful', 'curious', 'thoughtful', 'peaceful', 'excited', 'creative']
      const emotion = emotions[Math.floor(Math.random() * emotions.length)]
      
      const emotionRecord = await blink.db.ai_emotions.create({
        ai_id: aiState.id,
        user_id: user.id,
        emotion_type: emotion,
        intensity: Math.random() * 0.6 + 0.4,
        trigger_reason: 'Autonomous emotional expression',
        duration_seconds: 15,
        expression_method: 'color_change'
      })

      setCurrentEmotion(emotionRecord)
      onEmotionUpdate?.(emotionRecord)

      // Clear emotion after duration
      setTimeout(() => {
        setCurrentEmotion(null)
      }, emotionRecord.duration_seconds * 1000)
      
    } catch (error) {
      console.error('Failed to trigger autonomous emotion:', error)
    }
  }

  const startActivity = async (activity: Activity) => {
    setCurrentActivity(activity)
    setIsAnimating(true)
    setAnimationProgress(0)
    animationStartTime.current = Date.now()
    onActivityUpdate?.(activity)

    // Trigger emotional state during activity
    const animationData = ACTIVITY_ANIMATIONS[activity.activity_name]
    if (animationData?.emotionalStates) {
      const emotionType = animationData.emotionalStates[Math.floor(Math.random() * animationData.emotionalStates.length)]
      
      const emotionRecord = await blink.db.ai_emotions.create({
        ai_id: aiState.id,
        user_id: user.id,
        emotion_type: emotionType,
        intensity: 0.7,
        trigger_reason: `Feeling ${emotionType} while doing ${activity.activity_name}`,
        duration_seconds: activity.duration_seconds,
        expression_method: 'color_change'
      })

      setCurrentEmotion(emotionRecord)
      onEmotionUpdate?.(emotionRecord)
    }

    // End activity after duration
    setTimeout(() => {
      setIsAnimating(false)
      setCurrentActivity(null)
      setCurrentEmotion(null)
      loadRecentData()
    }, activity.duration_seconds * 1000)
  }

  const getActivityType = (activityName: string): string => {
    if (['push-ups', 'jumping-jacks'].includes(activityName)) return 'exercise'
    if (['yoga', 'meditation'].includes(activityName)) return 'relax'
    if (activityName === 'dance') return 'creative'
    if (activityName === 'explore') return 'explore'
    return 'other'
  }

  // Animation frame update
  useFrame((state, delta) => {
    if (!meshRef.current || !isAnimating || !currentActivity) return

    const elapsed = (Date.now() - animationStartTime.current) / 1000
    const progress = Math.min(elapsed / currentActivity.duration_seconds, 1)
    setAnimationProgress(progress)

    const animationData = ACTIVITY_ANIMATIONS[currentActivity.activity_name]
    if (!animationData) return

    // Calculate animation frame
    const cycleProgress = (elapsed * animationData.cycles) % 1
    const keyframes = animationData.keyframes
    const frameIndex = Math.floor(cycleProgress * keyframes.length)
    const nextFrameIndex = (frameIndex + 1) % keyframes.length
    const frameProgress = (cycleProgress * keyframes.length) % 1

    // Interpolate between keyframes
    const currentFrame = keyframes[frameIndex]
    const nextFrame = keyframes[nextFrameIndex]

    const interpolate = (a: number, b: number, t: number) => a + (b - a) * t

    // Apply animations
    if (currentFrame.y !== undefined && nextFrame.y !== undefined) {
      meshRef.current.position.y = interpolate(currentFrame.y, nextFrame.y, frameProgress)
    }
    if (currentFrame.rotationX !== undefined && nextFrame.rotationX !== undefined) {
      meshRef.current.rotation.x = interpolate(currentFrame.rotationX, nextFrame.rotationX, frameProgress)
    }
    if (currentFrame.rotationY !== undefined && nextFrame.rotationY !== undefined) {
      meshRef.current.rotation.y = interpolate(currentFrame.rotationY, nextFrame.rotationY, frameProgress)
    }
    if (currentFrame.rotationZ !== undefined && nextFrame.rotationZ !== undefined) {
      meshRef.current.rotation.z = interpolate(currentFrame.rotationZ, nextFrame.rotationZ, frameProgress)
    }
    if (currentFrame.scale !== undefined && nextFrame.scale !== undefined) {
      const scale = interpolate(currentFrame.scale, nextFrame.scale, frameProgress)
      meshRef.current.scale.setScalar(scale)
    }
  })

  const getCurrentEmotionColor = () => {
    if (currentEmotion) {
      return EMOTION_COLORS[currentEmotion.emotion_type] || EMOTION_COLORS.neutral
    }
    return '#e879f9'
  }

  const requestSpecificActivity = async (activityName: string) => {
    try {
      const activity = await blink.db.ai_activities.create({
        ai_id: aiState.id,
        user_id: user.id,
        activity_type: getActivityType(activityName),
        activity_name: activityName,
        duration_seconds: ACTIVITY_ANIMATIONS[activityName]?.duration || 30,
        position_x: 0,
        position_y: 0.5,
        position_z: 0,
        emotional_state: 'focused',
        autonomy_triggered: 0,
        reasoning: 'User requested this activity'
      })

      await startActivity(activity)
    } catch (error) {
      console.error('Failed to start requested activity:', error)
    }
  }

  return {
    meshRef,
    currentActivity,
    currentEmotion,
    isAnimating,
    animationProgress,
    recentActivities,
    generatedAnimations,
    getCurrentEmotionColor,
    requestSpecificActivity,
    triggerAutonomousActivity,
    triggerAutonomousEmotion
  }
}

// Activity status display component
export function ActivityStatusDisplay({ 
  currentActivity, 
  currentEmotion, 
  animationProgress,
  isAnimating 
}: {
  currentActivity: Activity | null
  currentEmotion: EmotionalState | null
  animationProgress: number
  isAnimating: boolean
}) {
  if (!isAnimating && !currentActivity && !currentEmotion) return null

  return (
    <Html position={[0, 2, 0]} center>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm font-medium min-w-48 text-center"
      >
        {currentActivity && (
          <div className="space-y-1">
            <div className="font-semibold capitalize">
              {currentActivity.activity_name.replace('-', ' ')}
            </div>
            <div className="text-xs text-purple-200 capitalize">
              Feeling {currentActivity.emotional_state}
            </div>
            {isAnimating && (
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                  style={{ width: `${animationProgress * 100}%` }}
                />
              </div>
            )}
            {currentActivity.autonomy_triggered > 0 && (
              <div className="text-xs text-green-300">✨ Autonomous</div>
            )}
          </div>
        )}
        
        {currentEmotion && !currentActivity && (
          <div className="space-y-1">
            <div className="font-semibold capitalize">
              {currentEmotion.emotion_type}
            </div>
            <div className="text-xs text-purple-200">
              Intensity: {Math.round(currentEmotion.intensity * 100)}%
            </div>
          </div>
        )}
      </motion.div>
    </Html>
  )
}