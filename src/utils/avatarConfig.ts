export interface AvatarConfig {
  // Basic settings
  gender: 'female' | 'male'
  height: number // 160-210 cm
  
  // Body proportions
  proportions: {
    headSize: number
    shoulderWidth: number
    chestDepth: number
    waistSize: number
    hipWidth: number
    armLength: number
    armThickness: number
    legLength: number
    legThickness: number
    feetSize: number
  }
  
  // Muscle definition
  muscles: {
    overall: number
    arms: number
    core: number
    legs: number
    definition: number
  }
  
  // Appearance
  skinTone: string
  hairStyle: string
  hairColor: string
  eyeColor: string
  
  // Clothing
  clothing: {
    top: string
    bottom: string
    shoes: string
    topColor: string
    bottomColor: string
    shoeColor: string
  }
  
  // Physics
  physics: {
    mass: number
    strength: number
    agility: number
  }
}

export interface AdvancedAvatar3DProps {
  config: AvatarConfig
  position: [number, number, number]
  onMove?: (pos: [number, number, number]) => void
  currentActivity?: string
  animationState?: string
  userName: string
}

// Default realistic avatar configuration
export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  gender: 'female',
  height: 170,
  proportions: {
    headSize: 50,
    shoulderWidth: 50,
    chestDepth: 50,
    waistSize: 50,
    hipWidth: 50,
    armLength: 50,
    armThickness: 50,
    legLength: 50,
    legThickness: 50,
    feetSize: 50
  },
  muscles: {
    overall: 40,
    arms: 35,
    core: 45,
    legs: 40,
    definition: 50
  },
  skinTone: '#FFDBAC',
  hairStyle: 'long_wavy',
  hairColor: '#8B4513',
  eyeColor: '#654321',
  clothing: {
    top: 'sports_bra',
    bottom: 'athletic_shorts',
    shoes: 'sneakers',
    topColor: '#E91E63',
    bottomColor: '#1976D2',
    shoeColor: '#FFFFFF'
  },
  physics: {
    mass: 55,
    strength: 7,
    agility: 8
  }
}