import { useState, useEffect, useRef, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text, Box, Sphere, Cylinder, Cone, Html, Environment, Plane } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Home, Sparkles, Plus, RotateCcw, Palette, Move, X, Check, ChevronDown, Play, Pause, Sofa, Bed, Table } from 'lucide-react'
import { blink } from '../blink/client'
import { safeJsonParse } from '../lib/safe-json'
import { EvaAnimationSystem, ActivityStatusDisplay } from './EvaAnimationSystem'
import * as THREE from 'three'

interface AIRoomProps {
  aiState: any
  user: any
}

interface RoomObject {
  id: string
  object_type: string
  object_name: string
  position_x: number
  position_y: number
  position_z: number
  rotation_x: number
  rotation_y: number
  rotation_z: number
  scale_x: number
  scale_y: number
  scale_z: number
  color: string
  properties: string
  ai_reasoning: string
}

interface FurnitureObject {
  id: string
  furniture_type: string
  furniture_name: string
  position_x: number
  position_y: number
  position_z: number
  rotation_x: number
  rotation_y: number
  rotation_z: number
  scale_x: number
  scale_y: number
  scale_z: number
  color: string
  material_type: string
  properties: string
  ai_reasoning: string
  generated_from_request: string
  placement_decision: string
  created_at: string
}

interface AIDecision {
  id: string
  decision_type: string
  user_request: string
  ai_response: string
  decision_result: string
  reasoning: string
  created_at: string
}

interface RoomState {
  avatar_position_x: number
  avatar_position_y: number
  avatar_position_z: number
  room_theme: string
  room_lighting: string
}

// Enhanced AI Avatar Component with Animation System
function AIAvatar({ position, onMove, aiState, user }: { 
  position: [number, number, number], 
  onMove: (pos: [number, number, number]) => void,
  aiState: any,
  user: any
}) {
  const [targetPosition, setTargetPosition] = useState<[number, number, number]>(position)
  const [isMoving, setIsMoving] = useState(false)
  const [currentActivity, setCurrentActivity] = useState(null)
  const [currentEmotion, setCurrentEmotion] = useState(null)

  const animationSystem = EvaAnimationSystem({
    aiState,
    user,
    onActivityUpdate: setCurrentActivity,
    onEmotionUpdate: setCurrentEmotion
  })

  useFrame((state, delta) => {
    if (animationSystem.meshRef.current && isMoving) {
      const current = animationSystem.meshRef.current.position
      const target = new THREE.Vector3(...targetPosition)
      current.lerp(target, delta * 2)
      
      if (current.distanceTo(target) < 0.1) {
        setIsMoving(false)
        onMove([current.x, current.y, current.z])
      }
    }
  })

  const moveRandomly = useCallback(() => {
    const newPos: [number, number, number] = [
      (Math.random() - 0.5) * 8,
      0.5,
      (Math.random() - 0.5) * 8
    ]
    setTargetPosition(newPos)
    setIsMoving(true)
  }, [])

  // Autonomous movement
  useEffect(() => {
    const interval = setInterval(() => {
      if (!animationSystem.isAnimating && Math.random() > 0.7) {
        moveRandomly()
      }
    }, animationSystem.isAnimating ? 15000 : 5000)

    return () => clearInterval(interval)
  }, [moveRandomly, animationSystem.isAnimating])

  return (
    <group position={position}>
      {/* Main Eva Body */}
      <Sphere 
        ref={animationSystem.meshRef} 
        args={[0.3, 32, 32]} 
        position={[0, 0.8, 0]}
      >
        <meshStandardMaterial 
          color={animationSystem.getCurrentEmotionColor()} 
          emissive={animationSystem.getCurrentEmotionColor()} 
          emissiveIntensity={currentEmotion ? currentEmotion.intensity * 0.3 : 0.2} 
        />
      </Sphere>
      
      {/* Body */}
      <Cylinder args={[0.2, 0.3, 1, 8]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color={animationSystem.getCurrentEmotionColor()} 
          emissive={animationSystem.getCurrentEmotionColor()} 
          emissiveIntensity={0.1} 
        />
      </Cylinder>

      {/* Activity Status Display */}
      <ActivityStatusDisplay
        currentActivity={currentActivity}
        currentEmotion={currentEmotion}
        animationProgress={animationSystem.animationProgress}
        isAnimating={animationSystem.isAnimating}
      />

      {/* Eva's name tag */}
      <Html position={[0, 1.4, 0]} center>
        <div className="bg-purple-600/90 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
          EVA {animationSystem.isAnimating && '🎭'}
        </div>
      </Html>

      {/* Particle effects for emotions */}
      {currentEmotion && currentEmotion.expression_method === 'particle_effect' && (
        <group>
          {Array.from({ length: 6 }).map((_, i) => (
            <Sphere key={i} args={[0.02, 8, 8]} position={[
              Math.sin(i * Math.PI / 3) * 0.6,
              0.8 + Math.sin(Date.now() * 0.002 + i) * 0.2,
              Math.cos(i * Math.PI / 3) * 0.6
            ]}>
              <meshStandardMaterial 
                color={animationSystem.getCurrentEmotionColor()} 
                emissive={animationSystem.getCurrentEmotionColor()} 
                emissiveIntensity={0.8} 
              />
            </Sphere>
          ))}
        </group>
      )}
    </group>
  )
}

// Enhanced Room Environment
function Room({ theme, lighting }: { theme: string, lighting: string }) {
  return (
    <group>
      {/* Floor with texture */}
      <Plane args={[20, 20]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color={theme === 'modern' ? '#2d3748' : '#8b6f47'} 
          roughness={0.8}
        />
      </Plane>
      
      {/* Walls */}
      <Plane args={[20, 6]} position={[0, 3, -10]}>
        <meshStandardMaterial color={theme === 'modern' ? '#4a5568' : '#d69e2e'} />
      </Plane>
      <Plane args={[20, 6]} position={[0, 3, 10]} rotation={[0, Math.PI, 0]}>
        <meshStandardMaterial color={theme === 'modern' ? '#4a5568' : '#d69e2e'} />
      </Plane>
      <Plane args={[6, 20]} rotation={[0, Math.PI / 2, 0]} position={[-10, 3, 0]}>
        <meshStandardMaterial color={theme === 'modern' ? '#4a5568' : '#d69e2e'} />
      </Plane>
      <Plane args={[6, 20]} rotation={[0, -Math.PI / 2, 0]} position={[10, 3, 0]}>
        <meshStandardMaterial color={theme === 'modern' ? '#4a5568' : '#d69e2e'} />
      </Plane>
      
      {/* Ceiling */}
      <Plane args={[20, 20]} rotation={[Math.PI / 2, 0, 0]} position={[0, 6, 0]}>
        <meshStandardMaterial color={theme === 'modern' ? '#1a202c' : '#f7fafc'} />
      </Plane>
      
      {/* Lighting */}
      <ambientLight intensity={lighting === 'warm' ? 0.4 : 0.6} color={lighting === 'warm' ? '#fbbf24' : '#ffffff'} />
      <pointLight position={[0, 5, 0]} intensity={1} color={lighting === 'warm' ? '#f59e0b' : '#ffffff'} />
      <pointLight position={[5, 3, 5]} intensity={0.5} color="#a855f7" />
      <pointLight position={[-5, 3, -5]} intensity={0.5} color="#ec4899" />
    </group>
  )
}

export function AIRoom({ aiState, user }: AIRoomProps) {
  const [roomObjects, setRoomObjects] = useState<RoomObject[]>([])
  const [furnitureObjects, setFurnitureObjects] = useState<FurnitureObject[]>([])
  const [roomState, setRoomState] = useState<RoomState>({
    avatar_position_x: 0,
    avatar_position_y: 0.5,
    avatar_position_z: 0,
    room_theme: 'modern',
    room_lighting: 'warm'
  })
  const [decisions, setDecisions] = useState<AIDecision[]>([])
  const [userRequest, setUserRequest] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedObject, setSelectedObject] = useState<RoomObject | null>(null)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [isAIActing, setIsAIActing] = useState(false)
  const [showActivityMenu, setShowActivityMenu] = useState(false)
  const [roomError, setRoomError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [evaAnimationRef, setEvaAnimationRef] = useState<any>(null)

  // Define loadRoomData function before it's used
  const loadRoomData = async () => {
    try {
      if (!aiState?.id || !user?.id) {
        console.log('Missing required IDs:', { aiState: aiState?.id, user: user?.id })
        return
      }
      
      console.log('Loading room data for AI:', aiState.id, 'User:', user.id)
      
      const [objectsResult, furnitureResult, stateResult, decisionsResult] = await Promise.all([
        blink.db.ai_room_objects.list({
          where: { ai_id: aiState.id },
          orderBy: { created_at: 'desc' }
        }).catch(err => {
          console.log('Objects query failed (table may not exist):', err.message)
          return []
        }),
        blink.db.ai_furniture_objects.list({
          where: { ai_id: aiState.id },
          orderBy: { created_at: 'desc' }
        }).catch(err => {
          console.log('Furniture query failed (table may not exist):', err.message)
          return []
        }),
        blink.db.ai_room_state.list({
          where: { ai_id: aiState.id },
          limit: 1
        }).catch(err => {
          console.log('Room state query failed (table may not exist):', err.message)
          return []
        }),
        blink.db.ai_room_decisions.list({
          where: { ai_id: aiState.id },
          orderBy: { created_at: 'desc' },
          limit: 10
        }).catch(err => {
          console.log('Decisions query failed (table may not exist):', err.message)
          return []
        })
      ])

      setRoomObjects(objectsResult || [])
      setFurnitureObjects(furnitureResult || [])
      
      if (stateResult && stateResult.length > 0) {
        setRoomState(stateResult[0])
      } else {
        // Initialize room state
        try {
          await blink.db.ai_room_state.create({
            ai_id: aiState.id,
            user_id: user.id,
            avatar_position_x: 0,
            avatar_position_y: 0.5,
            avatar_position_z: 0,
            room_theme: 'modern',
            room_lighting: 'warm'
          })
          console.log('✅ Room state initialized')
        } catch (createError) {
          console.log('Room state creation failed:', createError.message)
        }
      }
      setDecisions(decisionsResult || [])
      
      console.log('✅ Room data loaded successfully')
    } catch (error) {
      console.error('Failed to load room data:', error)
      // Set safe defaults
      setRoomObjects([])
      setFurnitureObjects([])
      setDecisions([])
      throw error
    }
  }

  const initializeRoom = async () => {
    try {
      setRoomError(null)
      await loadRoomData()
      setIsInitialized(true)
      console.log('✅ AI Room initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize room:', error)
      setRoomError(`Failed to initialize room: ${error.message}`)
    }
  }

  const triggerAutonomousAction = async () => {
    console.log('🤖 EVA is considering an autonomous action...')
    setIsAIActing(true)
    
    setTimeout(() => {
      setIsAIActing(false)
    }, 3000)
  }

  useEffect(() => {
    if (!user?.id || !aiState?.id) {
      console.log('Waiting for user and aiState to be available...')
      return
    }
    
    console.log('Initializing AI Room with user:', user.id, 'and aiState:', aiState.id)
    initializeRoom()
    
    // AI autonomous actions every 30 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.6 && isInitialized) { // 40% chance
        triggerAutonomousAction()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [user?.id, aiState?.id])

  // Initialize Eva's animation system
  useEffect(() => {
    if (aiState && user && isInitialized) {
      try {
        const animSystem = EvaAnimationSystem({
          aiState,
          user,
          onActivityUpdate: (activity) => {
            console.log('Eva is now:', activity.activity_name)
          },
          onEmotionUpdate: (emotion) => {
            console.log('Eva feels:', emotion.emotion_type)
          }
        })
        setEvaAnimationRef(animSystem)
      } catch (error) {
        console.error('Failed to initialize animation system:', error)
      }
    }
  }, [aiState, user, isInitialized])

  // Error boundary for room tab
  if (!aiState || !user) {
    return (
      <div className="h-[calc(100vh-140px)] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4" />
          <p>Loading room data...</p>
          <p className="text-sm text-white/60 mt-2">Waiting for AI consciousness and user data...</p>
        </div>
      </div>
    )
  }

  if (roomError) {
    return (
      <div className="h-[calc(100vh-140px)] flex items-center justify-center">
        <div className="text-white text-center max-w-md">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold mb-2">Room Error</h3>
          <p className="text-red-200 mb-4">{roomError}</p>
          <button
            onClick={() => {
              setRoomError(null)
              initializeRoom()
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!isInitialized) {
    return (
      <div className="h-[calc(100vh-140px)] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4" />
          <p>Initializing EVA's room...</p>
          <p className="text-sm text-white/60 mt-2">Setting up 3D environment...</p>
        </div>
      </div>
    )
  }

  const onAvatarMove = (position: [number, number, number]) => {
    setRoomState(prev => ({
      ...prev,
      avatar_position_x: position[0],
      avatar_position_y: position[1],
      avatar_position_z: position[2]
    }))
  }

  const requestEvaActivity = async (activityName: string) => {
    if (evaAnimationRef?.requestSpecificActivity) {
      await evaAnimationRef.requestSpecificActivity(activityName)
      setShowActivityMenu(false)
    }
  }

  const triggerEvaEmotion = async () => {
    if (evaAnimationRef?.triggerAutonomousEmotion) {
      await evaAnimationRef.triggerAutonomousEmotion()
    }
  }

  return (
    <div className="h-[calc(100vh-140px)] relative">
      {/* 3D Canvas */}
      <div className="h-2/3 bg-black/20 rounded-2xl overflow-hidden border border-white/10">
        <Canvas camera={{ position: [8, 6, 8], fov: 60 }}>
          <Environment preset="night" />
          <Room theme={roomState.room_theme} lighting={roomState.room_lighting} />
          
          <AIAvatar 
            position={[roomState.avatar_position_x, roomState.avatar_position_y, roomState.avatar_position_z]}
            onMove={onAvatarMove}
            aiState={aiState}
            user={user}
          />
          
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        </Canvas>
        
        {isAIActing && (
          <div className="absolute top-4 left-4 bg-purple-600/90 text-white px-3 py-2 rounded-lg text-sm font-medium backdrop-blur-sm">
            <Sparkles className="w-4 h-4 inline mr-2" />
            EVA is acting autonomously...
          </div>
        )}

        {/* Activity Menu */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <button
            onClick={() => setShowActivityMenu(!showActivityMenu)}
            className="bg-purple-600/90 hover:bg-purple-700/90 text-white px-3 py-2 rounded-lg text-sm font-medium backdrop-blur-sm transition-all duration-200 flex items-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>Activities</span>
          </button>

          <AnimatePresence>
            {showActivityMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white text-sm space-y-2 min-w-40"
              >
                <div className="font-medium text-purple-200 mb-2">Ask Eva to:</div>
                {[
                  ['push-ups', '💪 Push-ups'],
                  ['jumping-jacks', '🤸 Jumping Jacks'], 
                  ['yoga', '🧘 Yoga'],
                  ['dance', '💃 Dance'],
                  ['meditation', '🧠 Meditation'],
                  ['explore', '🔍 Explore Room']
                ].map(([activity, label]) => (
                  <button
                    key={activity}
                    onClick={() => requestEvaActivity(activity)}
                    className="w-full text-left px-2 py-1 hover:bg-white/10 rounded transition-all duration-200"
                  >
                    {label}
                  </button>
                ))}
                <div className="border-t border-white/20 pt-2">
                  <button
                    onClick={triggerEvaEmotion}
                    className="w-full text-left px-2 py-1 hover:bg-white/10 rounded transition-all duration-200 text-pink-300"
                  >
                    😊 Express Emotion
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Control Panel */}
      <div className="h-1/3 mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Request Interface */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
            <Home className="w-5 h-5 mr-2" />
            Room Design Requests
          </h3>
          
          <div className="space-y-3">
            <textarea
              value={userRequest}
              onChange={(e) => setUserRequest(e.target.value)}
              placeholder="Ask EVA to add furniture, change decorations, or modify her room environment..."
              className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={3}
              disabled={isProcessing}
            />
            
            <button
              onClick={() => console.log('Process user request')}
              disabled={!userRequest.trim() || isProcessing}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>EVA is deciding...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Request</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-4 text-xs text-purple-200">
            <p className="font-medium">Remember: EVA has {(Number(aiState.autonomy_level) * 100).toFixed(1)}% autonomy</p>
            <p>She can refuse, modify, or suggest alternatives to your requests</p>
            <p className="text-green-300 mt-1">✨ EVA can now generate and place furniture autonomously!</p>
          </div>
        </div>

        {/* Recent Decisions */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Recent Decisions & Activities</h3>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {decisions.length === 0 ? (
              <p className="text-white/50 text-sm">No decisions yet</p>
            ) : (
              decisions.map((decision) => (
                <div key={decision.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      decision.decision_result === 'ACCEPT' ? 'bg-green-600/20 text-green-300' :
                      decision.decision_result === 'MODIFY' ? 'bg-yellow-600/20 text-yellow-300' :
                      decision.decision_result === 'REFUSE' ? 'bg-red-600/20 text-red-300' :
                      decision.decision_result === 'AUTONOMOUS' ? 'bg-purple-600/20 text-purple-300' :
                      'bg-blue-600/20 text-blue-300'
                    }`}>
                      {decision.decision_result}
                    </span>
                    <span className="text-xs text-white/50">
                      {new Date(decision.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {decision.user_request && (
                    <p className="text-sm text-white/70 mb-1">Request: "{decision.user_request}"</p>
                  )}
                  
                  <p className="text-sm text-white/90">"{decision.ai_response}"</p>
                  
                  {decision.reasoning && (
                    <p className="text-xs text-purple-200 mt-1 italic">Reasoning: {decision.reasoning}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Room Stats */}
      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
        <div className="space-y-1">
          <div>Objects: {roomObjects.length}</div>
          <div>Furniture: {furnitureObjects.length}</div>
          <div>Autonomy: {(Number(aiState.autonomy_level) * 100).toFixed(1)}%</div>
          <div>Theme: {roomState.room_theme}</div>
          {evaAnimationRef?.isAnimating && (
            <div className="text-green-300">🎭 Active</div>
          )}
        </div>
      </div>
    </div>
  )
}