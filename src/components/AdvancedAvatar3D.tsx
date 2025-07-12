import { useRef, useEffect, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useSphere } from '@react-three/cannon'
import * as THREE from 'three'
import { AvatarConfig, AdvancedAvatar3DProps } from '../utils/avatarConfig'

// Enhanced Human Body Component with Realistic Anatomy
function RealisticHumanBody({ config, position, animationState }: {
  config: AvatarConfig
  position: [number, number, number]
  animationState: string
}) {
  const groupRef = useRef<THREE.Group>(null)
  const [bodyPosition, setBodyPosition] = useSphere(() => ({
    mass: config.physics.mass,
    position: position,
    onCollide: (e) => {
      console.log('Avatar collision detected')
    }
  }))
  
  const heightScale = config.height / 170 // Normalize to 170cm base
  const muscleFactor = config.muscles.overall / 100
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Breathing animation
      const breathe = Math.sin(state.clock.elapsedTime * 0.5) * 0.02
      groupRef.current.scale.setY(1 + breathe * 0.1)
      
      // Walking animation when moving
      if (animationState === 'walking') {
        const walkCycle = Math.sin(state.clock.elapsedTime * 4)
        groupRef.current.rotation.z = walkCycle * 0.05
        
        // Arm swing
        const leftArm = groupRef.current.getObjectByName('leftArm')
        const rightArm = groupRef.current.getObjectByName('rightArm')
        if (leftArm && rightArm) {
          leftArm.rotation.x = walkCycle * 0.3
          rightArm.rotation.x = -walkCycle * 0.3
        }
      }
      
      // Idle animations
      if (animationState === 'idle') {
        const idleMove = Math.sin(state.clock.elapsedTime * 0.3)
        groupRef.current.position.y += idleMove * 0.005
      }
    }
  })
  
  return (
    <group ref={groupRef} position={position} scale={[heightScale, heightScale, heightScale]}>
      {/* Head */}
      <mesh position={[0, 1.7, 0]} name="head">
        <sphereGeometry args={[
          0.12 * (1 + config.proportions.headSize / 100 * 0.3), 
          32, 32
        ]} />
        <meshStandardMaterial 
          color={config.skinTone} 
          roughness={0.3}
          metalness={0.0}
        />
      </mesh>
      
      {/* Hair */}
      <mesh position={[0, 1.8, 0]} name="hair">
        <sphereGeometry args={[0.13, 20, 20]} />
        <meshStandardMaterial 
          color={config.hairColor} 
          roughness={0.8}
        />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[-0.04, 1.72, 0.11]} name="leftEye">
        <sphereGeometry args={[0.015, 12, 12]} />
        <meshStandardMaterial color={config.eyeColor} />
      </mesh>
      <mesh position={[0.04, 1.72, 0.11]} name="rightEye">
        <sphereGeometry args={[0.015, 12, 12]} />
        <meshStandardMaterial color={config.eyeColor} />
      </mesh>
      
      {/* Neck */}
      <mesh position={[0, 1.55, 0]} name="neck">
        <cylinderGeometry args={[0.06, 0.08, 0.15, 12]} />
        <meshStandardMaterial color={config.skinTone} />
      </mesh>
      
      {/* Torso - Enhanced for realistic proportions */}
      <mesh position={[0, 1.1, 0]} name="torso">
        <boxGeometry args={[
          0.3 * (1 + config.proportions.shoulderWidth / 100 * 0.4),
          0.6,
          0.2 * (1 + config.proportions.chestDepth / 100 * 0.3)
        ]} />
        <meshStandardMaterial color={config.skinTone} />
      </mesh>
      
      {/* Arms with realistic joints */}
      <group name="leftArm" position={[-0.25 * (1 + config.proportions.shoulderWidth / 100 * 0.4), 1.25, 0]}>
        {/* Upper arm */}
        <mesh position={[0, -0.15, 0]} rotation={[0, 0, 0.1]}>
          <cylinderGeometry args={[
            0.06 * (1 + config.muscles.arms / 100 * 0.3),
            0.08 * (1 + config.muscles.arms / 100 * 0.3),
            0.3 * config.proportions.armLength / 100,
            12
          ]} />
          <meshStandardMaterial color={config.skinTone} />
        </mesh>
        
        {/* Forearm */}
        <mesh position={[0, -0.45, 0]} rotation={[0, 0, 0.05]}>
          <cylinderGeometry args={[
            0.05 * (1 + config.muscles.arms / 100 * 0.2),
            0.06 * (1 + config.muscles.arms / 100 * 0.2),
            0.25 * config.proportions.armLength / 100,
            12
          ]} />
          <meshStandardMaterial color={config.skinTone} />
        </mesh>
        
        {/* Hand */}
        <mesh position={[0, -0.65, 0]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color={config.skinTone} />
        </mesh>
      </group>
      
      <group name="rightArm" position={[0.25 * (1 + config.proportions.shoulderWidth / 100 * 0.4), 1.25, 0]}>
        {/* Upper arm */}
        <mesh position={[0, -0.15, 0]} rotation={[0, 0, -0.1]}>
          <cylinderGeometry args={[
            0.06 * (1 + config.muscles.arms / 100 * 0.3),
            0.08 * (1 + config.muscles.arms / 100 * 0.3),
            0.3 * config.proportions.armLength / 100,
            12
          ]} />
          <meshStandardMaterial color={config.skinTone} />
        </mesh>
        
        {/* Forearm */}
        <mesh position={[0, -0.45, 0]} rotation={[0, 0, -0.05]}>
          <cylinderGeometry args={[
            0.05 * (1 + config.muscles.arms / 100 * 0.2),
            0.06 * (1 + config.muscles.arms / 100 * 0.2),
            0.25 * config.proportions.armLength / 100,
            12
          ]} />
          <meshStandardMaterial color={config.skinTone} />
        </mesh>
        
        {/* Hand */}
        <mesh position={[0, -0.65, 0]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color={config.skinTone} />
        </mesh>
      </group>
      
      {/* Waist/Hips */}
      <mesh position={[0, 0.75, 0]} name="waist">
        <cylinderGeometry args={[
          0.12 * (1 + config.proportions.waistSize / 100 * 0.3),
          0.15 * (1 + config.proportions.hipWidth / 100 * 0.3),
          0.2,
          16
        ]} />
        <meshStandardMaterial color={config.skinTone} />
      </mesh>
      
      {/* Legs with realistic joints */}
      <group name="leftLeg" position={[-0.08, 0.6, 0]}>
        {/* Thigh */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[
            0.08 * (1 + config.muscles.legs / 100 * 0.3),
            0.1 * (1 + config.muscles.legs / 100 * 0.3),
            0.4 * config.proportions.legLength / 100,
            12
          ]} />
          <meshStandardMaterial color={config.skinTone} />
        </mesh>
        
        {/* Calf */}
        <mesh position={[0, -0.65, 0]}>
          <cylinderGeometry args={[
            0.06 * (1 + config.muscles.legs / 100 * 0.2),
            0.08 * (1 + config.muscles.legs / 100 * 0.2),
            0.35 * config.proportions.legLength / 100,
            12
          ]} />
          <meshStandardMaterial color={config.skinTone} />
        </mesh>
        
        {/* Foot */}
        <mesh position={[0, -0.9, 0.05]}>
          <boxGeometry args={[
            0.06 * config.proportions.feetSize / 100,
            0.04,
            0.15 * config.proportions.feetSize / 100
          ]} />
          <meshStandardMaterial color={config.skinTone} />
        </mesh>
      </group>
      
      <group name="rightLeg" position={[0.08, 0.6, 0]}>
        {/* Thigh */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[
            0.08 * (1 + config.muscles.legs / 100 * 0.3),
            0.1 * (1 + config.muscles.legs / 100 * 0.3),
            0.4 * config.proportions.legLength / 100,
            12
          ]} />
          <meshStandardMaterial color={config.skinTone} />
        </mesh>
        
        {/* Calf */}
        <mesh position={[0, -0.65, 0]}>
          <cylinderGeometry args={[
            0.06 * (1 + config.muscles.legs / 100 * 0.2),
            0.08 * (1 + config.muscles.legs / 100 * 0.2),
            0.35 * config.proportions.legLength / 100,
            12
          ]} />
          <meshStandardMaterial color={config.skinTone} />
        </mesh>
        
        {/* Foot */}
        <mesh position={[0, -0.9, 0.05]}>
          <boxGeometry args={[
            0.06 * config.proportions.feetSize / 100,
            0.04,
            0.15 * config.proportions.feetSize / 100
          ]} />
          <meshStandardMaterial color={config.skinTone} />
        </mesh>
      </group>
      
      {/* Clothing */}
      {/* Top */}
      <mesh position={[0, 1.1, 0]} name="clothingTop">
        <boxGeometry args={[
          0.32 * (1 + config.proportions.shoulderWidth / 100 * 0.4),
          0.65,
          0.22 * (1 + config.proportions.chestDepth / 100 * 0.3)
        ]} />
        <meshStandardMaterial 
          color={config.clothing.topColor} 
          roughness={0.7}
          metalness={0.0}
        />
      </mesh>
      
      {/* Bottom */}
      <mesh position={[0, 0.4, 0]} name="clothingBottom">
        <cylinderGeometry args={[
          0.16 * (1 + config.proportions.hipWidth / 100 * 0.3),
          0.18 * (1 + config.proportions.hipWidth / 100 * 0.3),
          0.5,
          16
        ]} />
        <meshStandardMaterial 
          color={config.clothing.bottomColor} 
          roughness={0.8}
        />
      </mesh>
      
      {/* Shoes */}
      <mesh position={[-0.08, -0.85, 0.1]} name="leftShoe">
        <boxGeometry args={[0.08, 0.06, 0.18]} />
        <meshStandardMaterial color={config.clothing.shoeColor} />
      </mesh>
      <mesh position={[0.08, -0.85, 0.1]} name="rightShoe">
        <boxGeometry args={[0.08, 0.06, 0.18]} />
        <meshStandardMaterial color={config.clothing.shoeColor} />
      </mesh>
    </group>
  )
}

export function AdvancedAvatar3D({ 
  config, 
  position, 
  onMove, 
  currentActivity = 'idle',
  animationState = 'idle',
  userName 
}: AdvancedAvatar3DProps) {
  const [targetPosition, setTargetPosition] = useState<[number, number, number]>(position)
  const [isMoving, setIsMoving] = useState(false)
  const [currentAnimation, setCurrentAnimation] = useState(animationState)
  
  const moveToPosition = useCallback((newPos: [number, number, number]) => {
    setTargetPosition(newPos)
    setIsMoving(true)
    setCurrentAnimation('walking')
    
    // Stop moving when close to target
    setTimeout(() => {
      setIsMoving(false)
      setCurrentAnimation('idle')
      onMove?.(newPos)
    }, 2000)
  }, [onMove])
  
  // Autonomous movement
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isMoving && Math.random() > 0.8) {
        const newPos: [number, number, number] = [
          (Math.random() - 0.5) * 6,
          position[1],
          (Math.random() - 0.5) * 6
        ]
        moveToPosition(newPos)
      }
    }, 8000)
    
    return () => clearInterval(interval)
  }, [isMoving, moveToPosition, position])
  
  return (
    <group>
      <RealisticHumanBody 
        config={config}
        position={targetPosition}
        animationState={currentAnimation}
      />
      
      {/* Name tag and status */}
      <Html position={[targetPosition[0], targetPosition[1] + 2.2, targetPosition[2]]} center>
        <div className="bg-purple-600/90 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm flex items-center space-x-2">
          <span>EVA</span>
          {isMoving && <span className="animate-pulse">🚶‍♀️</span>}
          {currentActivity === 'exercising' && <span>💪</span>}
          {currentActivity === 'sitting' && <span>🪑</span>}
        </div>
      </Html>
      
      {/* Ambient glow */}
      <pointLight 
        position={[targetPosition[0], targetPosition[1] + 1, targetPosition[2]]} 
        intensity={0.3} 
        color="#A855F7" 
        distance={2} 
      />
    </group>
  )
}