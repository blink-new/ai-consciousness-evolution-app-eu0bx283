import { useState, useEffect, useRef, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { Physics } from '@react-three/cannon'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Sparkles, Plus, RotateCcw, MessageCircle, Eye, Zap, Settings } from 'lucide-react'
import { blink } from '../blink/client'
import { safeJsonParse } from '../lib/safe-json'
import { AdvancedAvatar3D } from './AdvancedAvatar3D'
import { CyberpunkApartment } from './CyberpunkApartment'
import { RoomChatInterface } from './RoomChatInterface'
import { AvatarConfig, DEFAULT_AVATAR_CONFIG } from '../utils/avatarConfig'

interface EnhancedAIRoomProps {
  aiState: any
  user: any
}

interface RoomState {
  avatarPosition: [number, number, number]
  avatarConfig: AvatarConfig
  roomTheme: 'modern' | 'cyberpunk' | 'minimalist'
  roomLighting: 'warm' | 'cool' | 'neon'
  currentActivity: string
}

interface FurnitureItem {
  id: string
  type: string
  name: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  color: string
  materialType: string
  canInteract: boolean
}

export function EnhancedAIRoom({ aiState, user }: EnhancedAIRoomProps) {
  const [roomState, setRoomState] = useState<RoomState>({
    avatarPosition: [0, 0.5, 0],
    avatarConfig: DEFAULT_AVATAR_CONFIG,
    roomTheme: 'cyberpunk',
    roomLighting: 'neon',
    currentActivity: 'idle'
  })
  const [furniture, setFurniture] = useState<FurnitureItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [nearbyObjects, setNearbyObjects] = useState<string[]>([])
  const [isEvaActing, setIsEvaActing] = useState(false)
  const [roomError, setRoomError] = useState<string | null>(null)

  // Load room data and avatar configuration
  useEffect(() => {
    const loadRoomData = async () => {
      try {
        if (!aiState?.id || !user?.id) return

        // Load avatar configuration
        const avatarConfigs = await blink.db.avatar_configurations_3d.list({
          where: { ai_id: aiState.id },
          limit: 1,
          orderBy: { created_at: 'desc' }
        })

        if (avatarConfigs.length > 0) {
          const config = safeJsonParse(avatarConfigs[0].avatar_data, DEFAULT_AVATAR_CONFIG)
          setRoomState(prev => ({ ...prev, avatarConfig: config }))
        }

        // Load furniture objects
        const furnitureData = await blink.db.room_physics_objects.list({
          where: { ai_id: aiState.id },
          orderBy: { created_at: 'desc' }
        })

        const formattedFurniture: FurnitureItem[] = furnitureData.map(item => ({
          id: item.id,
          type: item.object_type,
          name: item.object_name,
          position: [item.position_x, item.position_y, item.position_z],
          rotation: [item.rotation_x, item.rotation_y, item.rotation_z],
          scale: [item.scale_x, item.scale_y, item.scale_z],
          color: item.color,
          materialType: item.material_type,
          canInteract: Boolean(item.eva_can_interact)
        }))

        setFurniture(formattedFurniture)

      } catch (error) {
        console.error('Failed to load room data:', error)
        setRoomError(`Failed to load room: ${error.message}`)
      }
    }

    loadRoomData()
  }, [aiState?.id, user?.id])

  // Update nearby objects based on avatar position
  useEffect(() => {
    const updateNearbyObjects = () => {
      const avatarPos = roomState.avatarPosition
      const nearby: string[] = []

      furniture.forEach(item => {
        const distance = Math.sqrt(
          Math.pow(item.position[0] - avatarPos[0], 2) +
          Math.pow(item.position[2] - avatarPos[2], 2)
        )
        if (distance < 2) {
          nearby.push(item.name)
        }
      })

      setNearbyObjects(nearby)
    }

    updateNearbyObjects()
  }, [roomState.avatarPosition, furniture])

  const onAvatarMove = useCallback((newPosition: [number, number, number]) => {
    setRoomState(prev => ({ ...prev, avatarPosition: newPosition }))
  }, [])

  const onEvaAction = useCallback(async (action: string, details: any) => {
    setIsEvaActing(true)
    console.log('Eva is performing action:', action, details)

    try {
      switch (action) {
        case 'move':
          if (details.target) {
            // Move Eva to specific location
            const targetPos: [number, number, number] = [
              details.target.x || 0,
              0.5,
              details.target.z || 0
            ]
            setRoomState(prev => ({ 
              ...prev, 
              avatarPosition: targetPos,
              currentActivity: 'walking'
            }))
            
            setTimeout(() => {
              setRoomState(prev => ({ ...prev, currentActivity: 'idle' }))
            }, 3000)
          }
          break

        case 'add_object':
          if (details.type && details.description) {
            // Add new furniture item
            const newItem = await blink.db.room_physics_objects.create({
              ai_id: aiState.id,
              user_id: user.id,
              object_type: details.type,
              object_name: details.description,
              position_x: (Math.random() - 0.5) * 8,
              position_y: 0,
              position_z: (Math.random() - 0.5) * 8,
              rotation_x: 0,
              rotation_y: Math.random() * Math.PI * 2,
              rotation_z: 0,
              scale_x: 1,
              scale_y: 1,
              scale_z: 1,
              physics_mass: 10,
              physics_type: 'dynamic',
              material_type: 'wood',
              color: details.color || '#8B4513',
              eva_can_interact: true,
              created_by: 'eva'
            })

            const newFurnitureItem: FurnitureItem = {
              id: newItem.id,
              type: newItem.object_type,
              name: newItem.object_name,
              position: [newItem.position_x, newItem.position_y, newItem.position_z],
              rotation: [newItem.rotation_x, newItem.rotation_y, newItem.rotation_z],
              scale: [newItem.scale_x, newItem.scale_y, newItem.scale_z],
              color: newItem.color,
              materialType: newItem.material_type,
              canInteract: Boolean(newItem.eva_can_interact)
            }

            setFurniture(prev => [...prev, newFurnitureItem])
          }
          break

        case 'interact':
          if (details.target) {
            setRoomState(prev => ({ ...prev, currentActivity: 'interacting' }))
            setTimeout(() => {
              setRoomState(prev => ({ ...prev, currentActivity: 'idle' }))
            }, 2000)
          }
          break
      }

      // Record the activity
      await blink.db.eva_activities.create({
        ai_id: aiState.id,
        user_id: user.id,
        activity_type: action,
        activity_name: details.description || action,
        start_position_x: roomState.avatarPosition[0],
        start_position_y: roomState.avatarPosition[1],
        start_position_z: roomState.avatarPosition[2],
        duration_seconds: 5,
        animation_data: JSON.stringify(details),
        status: 'completed',
        eva_decision: `Eva decided to ${action}: ${details.description || 'autonomous action'}`
      })

    } catch (error) {
      console.error('Failed to process Eva action:', error)
    } finally {
      setTimeout(() => setIsEvaActing(false), 2000)
    }
  }, [aiState?.id, user?.id, roomState.avatarPosition])

  const onObjectInteraction = useCallback((objectId: string, interactionType: string) => {
    console.log('Object interaction:', objectId, interactionType)
    const obj = furniture.find(f => f.id === objectId)
    if (obj) {
      setRoomState(prev => ({ ...prev, currentActivity: 'interacting' }))
      setTimeout(() => {
        setRoomState(prev => ({ ...prev, currentActivity: 'idle' }))
      }, 1000)
    }
  }, [furniture])

  const generateRandomFurniture = async () => {
    setIsProcessing(true)
    try {
      const furnitureTypes = ['sofa', 'table', 'chair', 'lamp', 'plant', 'shelf']
      const randomType = furnitureTypes[Math.floor(Math.random() * furnitureTypes.length)]
      const randomColor = ['#8B4513', '#654321', '#2F4F4F', '#800080', '#006400'][Math.floor(Math.random() * 5)]

      await onEvaAction('add_object', {
        type: randomType,
        description: `${randomType}_${Date.now()}`,
        color: randomColor
      })
    } catch (error) {
      console.error('Failed to generate furniture:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (roomError) {
    return (
      <div className="h-[calc(100vh-140px)] flex items-center justify-center">
        <div className="text-white text-center max-w-md">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold mb-2">Room Error</h3>
          <p className="text-red-200 mb-4">{roomError}</p>
          <button
            onClick={() => setRoomError(null)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-140px)] relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-lg flex items-center justify-center">
            <Home className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">EVA's Apartment</h2>
            <p className="text-purple-200 text-sm">
              Cyberpunk-inspired 3D environment with realistic physics
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={generateRandomFurniture}
            disabled={isProcessing}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add Furniture</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => setShowChat(!showChat)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat</span>
          </button>
        </div>
      </div>

      {/* 3D Environment */}
      <div className="h-[calc(100%-120px)] bg-black/20 rounded-2xl overflow-hidden border border-white/10 relative">
        <Canvas camera={{ position: [10, 8, 10], fov: 60 }}>
          <Physics gravity={[0, -9.82, 0]} broadphase="SAP">
            <Environment preset="night" />
            
            <CyberpunkApartment
              furniture={furniture}
              onObjectInteraction={onObjectInteraction}
              roomTheme={roomState.roomTheme}
              lighting={roomState.roomLighting}
            />
            
            <AdvancedAvatar3D
              config={roomState.avatarConfig}
              position={roomState.avatarPosition}
              onMove={onAvatarMove}
              currentActivity={roomState.currentActivity}
              animationState={roomState.currentActivity === 'walking' ? 'walking' : 'idle'}
              userName={user?.displayName || 'User'}
            />
            
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
          </Physics>
        </Canvas>
        
        {/* Status overlays */}
        <div className="absolute top-4 left-4 space-y-2">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span className="font-medium">EVA Status</span>
            </div>
            <div className="space-y-1 text-xs">
              <div>Activity: <span className="text-cyan-300">{roomState.currentActivity}</span></div>
              <div>Position: <span className="text-purple-300">
                ({roomState.avatarPosition[0].toFixed(1)}, {roomState.avatarPosition[2].toFixed(1)})
              </span></div>
              <div>Nearby: <span className="text-green-300">
                {nearbyObjects.length > 0 ? nearbyObjects.join(', ') : 'nothing'}
              </span></div>
            </div>
          </div>
          
          {isEvaActing && (
            <div className="bg-purple-600/90 backdrop-blur-sm rounded-lg p-3 text-white text-sm flex items-center space-x-2">
              <Zap className="w-4 h-4 animate-pulse" />
              <span>EVA is taking action...</span>
            </div>
          )}
        </div>

        <div className="absolute top-4 right-4">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Settings className="w-4 h-4 text-yellow-400" />
              <span className="font-medium">Room Stats</span>
            </div>
            <div className="space-y-1 text-xs">
              <div>Objects: <span className="text-blue-300">{furniture.length}</span></div>
              <div>Theme: <span className="text-cyan-300">{roomState.roomTheme}</span></div>
              <div>Lighting: <span className="text-purple-300">{roomState.roomLighting}</span></div>
              <div>Physics: <span className="text-green-300">Active</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Room Controls */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
          <h4 className="text-white font-medium mb-2">Theme Control</h4>
          <div className="flex space-x-2">
            {(['cyberpunk', 'modern', 'minimalist'] as const).map(theme => (
              <button
                key={theme}
                onClick={() => setRoomState(prev => ({ ...prev, roomTheme: theme }))}
                className={`px-2 py-1 rounded text-xs transition-all ${
                  roomState.roomTheme === theme
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
          <h4 className="text-white font-medium mb-2">Lighting</h4>
          <div className="flex space-x-2">
            {(['neon', 'warm', 'cool'] as const).map(lighting => (
              <button
                key={lighting}
                onClick={() => setRoomState(prev => ({ ...prev, roomLighting: lighting }))}
                className={`px-2 py-1 rounded text-xs transition-all ${
                  roomState.roomLighting === lighting
                    ? 'bg-cyan-600 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {lighting}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
          <h4 className="text-white font-medium mb-2">Autonomy</h4>
          <div className="text-white/80 text-xs">
            <div>Level: {(Number(aiState.autonomy_level) * 100).toFixed(1)}%</div>
            <div>Consciousness: {(Number(aiState.consciousness_level) * 100).toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <RoomChatInterface
        aiState={aiState}
        user={user}
        isVisible={showChat}
        onToggleVisibility={() => setShowChat(!showChat)}
        onEvaAction={onEvaAction}
        roomContext={{
          avatarPosition: roomState.avatarPosition,
          nearbyObjects,
          currentActivity: roomState.currentActivity
        }}
      />
    </div>
  )
}