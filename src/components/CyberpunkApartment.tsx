import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Plane, Box, Cylinder, Sphere, Html } from '@react-three/drei'
import { Physics, useBox, usePlane } from '@react-three/cannon'
import * as THREE from 'three'

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

interface CyberpunkApartmentProps {
  furniture: FurnitureItem[]
  onObjectInteraction?: (objectId: string, interactionType: string) => void
  roomTheme?: 'modern' | 'cyberpunk' | 'minimalist'
  lighting?: 'warm' | 'cool' | 'neon'
}

// Interactive Furniture Component
function InteractiveFurniture({ item, onInteraction }: { 
  item: FurnitureItem
  onInteraction?: (objectId: string, interactionType: string) => void 
}) {
  const [ref, api] = useBox(() => ({
    mass: item.type === 'decoration' ? 0.1 : 10,
    position: item.position,
    rotation: item.rotation,
    onCollide: () => {
      onInteraction?.(item.id, 'collision')
    }
  }))
  
  const [hovered, setHovered] = useState(false)
  
  const getFurnitureGeometry = () => {
    switch (item.type) {
      case 'sofa':
        return <Box ref={ref} args={[2, 0.8, 0.8]} />
      case 'table':
        return <Box ref={ref} args={[1.5, 0.05, 0.8]} />
      case 'chair':
        return <Box ref={ref} args={[0.5, 0.8, 0.5]} />
      case 'bed':
        return <Box ref={ref} args={[2, 0.4, 1.6]} />
      case 'shelf':
        return <Box ref={ref} args={[0.3, 2, 1]} />
      case 'lamp':
        return (
          <group>
            <Cylinder ref={ref} args={[0.05, 0.05, 1.5]} />
            <Sphere position={[0, 0.8, 0]} args={[0.2]} />
          </group>
        )
      case 'plant':
        return (
          <group>
            <Cylinder args={[0.15, 0.15, 0.3]} position={[0, 0.15, 0]} />
            <Sphere args={[0.3]} position={[0, 0.6, 0]} />
          </group>
        )
      case 'screen':
        return <Box ref={ref} args={[1.8, 0.05, 1]} />
      default:
        return <Box ref={ref} args={[0.5, 0.5, 0.5]} />
    }
  }
  
  const getMaterial = () => {
    const baseColor = hovered ? new THREE.Color(item.color).multiplyScalar(1.2) : item.color
    
    switch (item.materialType) {
      case 'metal':
        return <meshStandardMaterial color={baseColor} metalness={0.8} roughness={0.2} />
      case 'wood':
        return <meshStandardMaterial color={baseColor} metalness={0.0} roughness={0.8} />
      case 'fabric':
        return <meshStandardMaterial color={baseColor} metalness={0.0} roughness={0.9} />
      case 'glass':
        return <meshStandardMaterial color={baseColor} metalness={0.0} roughness={0.0} transparent opacity={0.6} />
      case 'plastic':
        return <meshStandardMaterial color={baseColor} metalness={0.1} roughness={0.4} />
      default:
        return <meshStandardMaterial color={baseColor} />
    }
  }
  
  return (
    <group
      position={item.position}
      rotation={item.rotation}
      scale={item.scale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => onInteraction?.(item.id, 'click')}
    >
      {getFurnitureGeometry()}
      {getMaterial()}
      
      {item.canInteract && hovered && (
        <Html position={[0, 1, 0]} center>
          <div className="bg-cyan-400/90 text-black px-2 py-1 rounded text-xs font-medium">
            Click to interact
          </div>
        </Html>
      )}
    </group>
  )
}

// Main Apartment Environment
export function CyberpunkApartment({ 
  furniture = [], 
  onObjectInteraction,
  roomTheme = 'cyberpunk',
  lighting = 'neon'
}: CyberpunkApartmentProps) {
  const [floorRef] = usePlane(() => ({ 
    rotation: [-Math.PI / 2, 0, 0], 
    position: [0, 0, 0],
    type: 'Static'
  }))
  
  // Color schemes based on theme
  const getColorScheme = () => {
    switch (roomTheme) {
      case 'cyberpunk':
        return {
          floor: '#1a1a2e',
          walls: '#16213e',
          ceiling: '#0f0f23',
          accent: '#00ffff',
          secondary: '#ff0080'
        }
      case 'modern':
        return {
          floor: '#2d3748',
          walls: '#4a5568',
          ceiling: '#1a202c',
          accent: '#a855f7',
          secondary: '#ec4899'
        }
      case 'minimalist':
        return {
          floor: '#f7fafc',
          walls: '#edf2f7',
          ceiling: '#ffffff',
          accent: '#4a5568',
          secondary: '#718096'
        }
      default:
        return {
          floor: '#1a1a2e',
          walls: '#16213e',
          ceiling: '#0f0f23',
          accent: '#00ffff',
          secondary: '#ff0080'
        }
    }
  }
  
  const colors = getColorScheme()
  
  return (
    <Physics gravity={[0, -9.82, 0]}>
      <group>
        {/* Floor - Large apartment floor */}
        <Plane 
          ref={floorRef}
          args={[20, 20]} 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, 0, 0]}
        >
          <meshStandardMaterial 
            color={colors.floor} 
            roughness={0.8}
            metalness={roomTheme === 'cyberpunk' ? 0.3 : 0.0}
          />
        </Plane>
        
        {/* Walls - Apartment style */}
        {/* Back wall */}
        <Plane args={[20, 6]} position={[0, 3, -10]}>
          <meshStandardMaterial 
            color={colors.walls}
            roughness={0.9}
          />
        </Plane>
        
        {/* Left wall */}
        <Plane args={[20, 6]} rotation={[0, Math.PI / 2, 0]} position={[-10, 3, 0]}>
          <meshStandardMaterial color={colors.walls} roughness={0.9} />
        </Plane>
        
        {/* Right wall */}
        <Plane args={[20, 6]} rotation={[0, -Math.PI / 2, 0]} position={[10, 3, 0]}>
          <meshStandardMaterial color={colors.walls} roughness={0.9} />
        </Plane>
        
        {/* Ceiling */}
        <Plane args={[20, 20]} rotation={[Math.PI / 2, 0, 0]} position={[0, 6, 0]}>
          <meshStandardMaterial 
            color={colors.ceiling}
            roughness={0.7}
          />
        </Plane>
        
        {/* Cyberpunk-style window frames (empty windows) */}
        <group position={[0, 3, -9.9]}>
          {/* Large window frame */}
          <Box args={[8, 3, 0.1]} position={[0, 0, 0]}>
            <meshStandardMaterial 
              color={roomTheme === 'cyberpunk' ? '#333366' : '#4a5568'} 
              metalness={0.6}
              roughness={0.3}
            />
          </Box>
          
          {/* Window glass effect */}
          <Plane args={[7.5, 2.5]} position={[0, 0, 0.05]}>
            <meshStandardMaterial 
              color={roomTheme === 'cyberpunk' ? '#001133' : '#2d3748'}
              transparent 
              opacity={0.3}
              metalness={0.1}
              roughness={0.0}
            />
          </Plane>
        </group>
        
        {/* Built-in apartment features */}
        {/* Kitchen counter area */}
        <Box args={[4, 1, 0.8]} position={[-6, 0.5, -8]}>
          <meshStandardMaterial 
            color={roomTheme === 'cyberpunk' ? '#2a2a4a' : '#4a5568'}
            metalness={0.4}
            roughness={0.6}
          />
        </Box>
        
        {/* Closet area */}
        <Box args={[2, 4, 0.3]} position={[8, 2, -8]}>
          <meshStandardMaterial 
            color={colors.walls}
            roughness={0.8}
          />
        </Box>
        
        {/* Bathroom door frame */}
        <Box args={[1, 3, 0.2]} position={[6, 1.5, -9.8]}>
          <meshStandardMaterial 
            color={roomTheme === 'cyberpunk' ? '#4a4a6a' : '#6b7280'}
            metalness={0.3}
            roughness={0.7}
          />
        </Box>
        
        {/* Dynamic Furniture */}
        {furniture.map((item) => (
          <InteractiveFurniture
            key={item.id}
            item={item}
            onInteraction={onObjectInteraction}
          />
        ))}
        
        {/* Lighting based on theme */}
        {lighting === 'neon' && roomTheme === 'cyberpunk' && (
          <group>
            {/* Neon strip lighting */}
            <pointLight position={[-8, 5, -8]} intensity={1} color="#00ffff" distance={8} />
            <pointLight position={[8, 5, -8]} intensity={1} color="#ff0080" distance={8} />
            <pointLight position={[0, 5, 8]} intensity={0.8} color="#9932cc" distance={6} />
            
            {/* Ambient cyberpunk glow */}
            <ambientLight intensity={0.3} color="#001133" />
            
            {/* Main room light */}
            <pointLight position={[0, 5.5, 0]} intensity={0.6} color="#ffffff" distance={15} />
          </group>
        )}
        
        {lighting === 'warm' && (
          <group>
            <ambientLight intensity={0.4} color="#fbbf24" />
            <pointLight position={[0, 5, 0]} intensity={1.2} color="#f59e0b" distance={12} />
            <pointLight position={[-5, 3, -5]} intensity={0.6} color="#fbbf24" distance={8} />
            <pointLight position={[5, 3, 5]} intensity={0.6} color="#fbbf24" distance={8} />
          </group>
        )}
        
        {lighting === 'cool' && (
          <group>
            <ambientLight intensity={0.6} color="#e0e7ff" />
            <pointLight position={[0, 5, 0]} intensity={1} color="#ffffff" distance={15} />
            <pointLight position={[-6, 4, -6]} intensity={0.5} color="#ddd6fe" distance={10} />
            <pointLight position={[6, 4, 6]} intensity={0.5} color="#ddd6fe" distance={10} />
          </group>
        )}
        
        {/* Atmospheric particles for cyberpunk theme */}
        {roomTheme === 'cyberpunk' && (
          <group>
            {Array.from({ length: 12 }).map((_, i) => (
              <Sphere 
                key={i}
                args={[0.01]} 
                position={[
                  (Math.random() - 0.5) * 18,
                  Math.random() * 5 + 1,
                  (Math.random() - 0.5) * 18
                ]}
              >
                <meshBasicMaterial 
                  color={i % 2 === 0 ? colors.accent : colors.secondary}
                  transparent
                  opacity={0.6}
                />
              </Sphere>
            ))}
          </group>
        )}
      </group>
    </Physics>
  )
}