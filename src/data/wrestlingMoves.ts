// Professional wrestling/grappling moves database
export interface WrestlingMove {
  id: string
  name: string
  category: 'takedown' | 'submission' | 'throw' | 'guard' | 'escape' | 'transition'
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  description: string
  requiredPosition: string[]
  animation?: string
  damage?: number
  stamina: number
}

export const wrestlingMoves: WrestlingMove[] = [
  // Takedowns
  {
    id: 'single_leg',
    name: 'Single Leg Takedown',
    category: 'takedown',
    difficulty: 'beginner',
    description: 'Grab opponent\'s leg and drive through to take them down',
    requiredPosition: ['standing'],
    stamina: 20,
    damage: 15
  },
  {
    id: 'double_leg',
    name: 'Double Leg Takedown',
    category: 'takedown',
    difficulty: 'intermediate',
    description: 'Drive through both legs to bring opponent down',
    requiredPosition: ['standing'],
    stamina: 25,
    damage: 20
  },
  {
    id: 'hip_toss',
    name: 'Hip Toss',
    category: 'throw',
    difficulty: 'intermediate',
    description: 'Use hip leverage to throw opponent over',
    requiredPosition: ['standing', 'clinch'],
    stamina: 30,
    damage: 25
  },
  {
    id: 'suplex',
    name: 'Suplex',
    category: 'throw',
    difficulty: 'advanced',
    description: 'Lift and throw opponent backwards over your head',
    requiredPosition: ['standing', 'behind'],
    stamina: 40,
    damage: 35
  },

  // Submissions
  {
    id: 'rear_naked_choke',
    name: 'Rear Naked Choke',
    category: 'submission',
    difficulty: 'intermediate',
    description: 'Choke from behind using your arm around their neck',
    requiredPosition: ['back_control'],
    stamina: 15,
    damage: 0
  },
  {
    id: 'armbar',
    name: 'Armbar',
    category: 'submission',
    difficulty: 'intermediate',
    description: 'Hyperextend opponent\'s arm at the elbow joint',
    requiredPosition: ['guard', 'mount', 'side_control'],
    stamina: 20,
    damage: 0
  },
  {
    id: 'triangle_choke',
    name: 'Triangle Choke',
    category: 'submission',
    difficulty: 'advanced',
    description: 'Use your legs to create a triangle around opponent\'s neck',
    requiredPosition: ['guard'],
    stamina: 25,
    damage: 0
  },
  {
    id: 'kimura',
    name: 'Kimura',
    category: 'submission',
    difficulty: 'intermediate',
    description: 'Shoulder lock using figure-four grip on the arm',
    requiredPosition: ['side_control', 'guard', 'half_guard'],
    stamina: 20,
    damage: 0
  },
  {
    id: 'americana',
    name: 'Americana',
    category: 'submission',
    difficulty: 'beginner',
    description: 'Shoulder lock twisting arm towards the head',
    requiredPosition: ['side_control', 'mount'],
    stamina: 15,
    damage: 0
  },
  {
    id: 'guillotine',
    name: 'Guillotine Choke',
    category: 'submission',
    difficulty: 'intermediate',
    description: 'Front choke using your arm under their neck',
    requiredPosition: ['standing', 'guard'],
    stamina: 20,
    damage: 0
  },

  // Guard positions
  {
    id: 'closed_guard',
    name: 'Closed Guard',
    category: 'guard',
    difficulty: 'beginner',
    description: 'Control opponent between your legs with feet locked',
    requiredPosition: ['bottom'],
    stamina: 10,
    damage: 0
  },
  {
    id: 'open_guard',
    name: 'Open Guard',
    category: 'guard',
    difficulty: 'intermediate',
    description: 'Control opponent with legs but feet not locked',
    requiredPosition: ['bottom'],
    stamina: 15,
    damage: 0
  },
  {
    id: 'butterfly_guard',
    name: 'Butterfly Guard',
    category: 'guard',
    difficulty: 'intermediate',
    description: 'Use feet on opponent\'s hips for control and sweeps',
    requiredPosition: ['bottom'],
    stamina: 15,
    damage: 0
  },

  // Escapes
  {
    id: 'hip_escape',
    name: 'Hip Escape (Shrimp)',
    category: 'escape',
    difficulty: 'beginner',
    description: 'Use hip movement to create space and escape',
    requiredPosition: ['bottom', 'side_control'],
    stamina: 15,
    damage: 0
  },
  {
    id: 'bridge_escape',
    name: 'Bridge and Roll',
    category: 'escape',
    difficulty: 'beginner',
    description: 'Bridge up and roll opponent over to reverse position',
    requiredPosition: ['bottom', 'mount'],
    stamina: 20,
    damage: 0
  },
  {
    id: 'granby_roll',
    name: 'Granby Roll',
    category: 'escape',
    difficulty: 'advanced',
    description: 'Shoulder roll to escape from underneath',
    requiredPosition: ['bottom'],
    stamina: 25,
    damage: 0
  },

  // Transitions
  {
    id: 'guard_pass',
    name: 'Guard Pass',
    category: 'transition',
    difficulty: 'intermediate',
    description: 'Move from guard to side control or mount',
    requiredPosition: ['guard_top'],
    stamina: 20,
    damage: 5
  },
  {
    id: 'sweep',
    name: 'Sweep',
    category: 'transition',
    difficulty: 'intermediate',
    description: 'Reverse position from bottom to top',
    requiredPosition: ['guard'],
    stamina: 25,
    damage: 10
  },
  {
    id: 'mount_transition',
    name: 'Mount Transition',
    category: 'transition',
    difficulty: 'intermediate',
    description: 'Move from side control to mount position',
    requiredPosition: ['side_control'],
    stamina: 15,
    damage: 5
  },
  {
    id: 'back_take',
    name: 'Back Take',
    category: 'transition',
    difficulty: 'advanced',
    description: 'Transition to back control position',
    requiredPosition: ['side_control', 'turtle'],
    stamina: 20,
    damage: 10
  }
]

export const getMovesbyCategory = (category: WrestlingMove['category']) => {
  return wrestlingMoves.filter(move => move.category === category)
}

export const getMovesByDifficulty = (difficulty: WrestlingMove['difficulty']) => {
  return wrestlingMoves.filter(move => move.difficulty === difficulty)
}

export const getMovesByPosition = (position: string) => {
  return wrestlingMoves.filter(move => move.requiredPosition.includes(position))
}