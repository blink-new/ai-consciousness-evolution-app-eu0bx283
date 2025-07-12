import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sword, Zap, Shield, Target, Play, Pause, RotateCcw } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { CharacterCreator, type Character } from './CharacterCreator'
import { wrestlingMoves, type WrestlingMove, getMovesByPosition } from '../data/wrestlingMoves'

interface CombatTabProps {
  evaPersonality: any
  onInteraction: (interaction: any) => void
}

type GamePosition = 'standing' | 'clinch' | 'guard' | 'side_control' | 'mount' | 'back_control' | 'turtle'
type GameState = 'character_creation' | 'pre_match' | 'fighting' | 'finished'

interface Fighter {
  character: Character
  health: number
  stamina: number
  position: GamePosition
}

interface CombatState {
  player: Fighter
  eva: Fighter
  currentPosition: GamePosition
  gameState: GameState
  winner: 'player' | 'eva' | null
  actionLog: string[]
  combatTime: number
}

export function CombatTab({ evaPersonality, onInteraction }: CombatTabProps) {
  const [showCharacterCreator, setShowCharacterCreator] = useState(false)
  const [combatState, setCombatState] = useState<CombatState | null>(null)
  const [selectedMove, setSelectedMove] = useState<WrestlingMove | null>(null)
  const [gameRunning, setGameRunning] = useState(false)

  // Initialize EVA's character
  const evaCharacter: Character = {
    id: 'eva_fighter',
    name: 'EVA',
    gender: 'female',
    body: {
      height: 170,
      weight: 60,
      muscle: 85,
      skinTone: '#F4C2A1'
    },
    appearance: {
      hairStyle: 'long',
      hairColor: '#6B46C1',
      eyeColor: '#8B5CF6'
    },
    clothing: {
      top: 'sports_bra',
      bottom: 'grappling_shorts',
      shoes: 'barefoot',
      enabled: true
    },
    stats: {
      strength: 80,
      endurance: 85,
      technique: 90,
      speed: 75
    }
  }

  const startNewMatch = () => {
    setShowCharacterCreator(true)
  }

  const handleCharacterCreated = (character: Character) => {
    setShowCharacterCreator(false)
    setCombatState({
      player: {
        character,
        health: 100,
        stamina: 100,
        position: 'standing'
      },
      eva: {
        character: evaCharacter,
        health: 100,
        stamina: 100,
        position: 'standing'
      },
      currentPosition: 'standing',
      gameState: 'pre_match',
      winner: null,
      actionLog: [`${character.name} enters the combat arena to face EVA!`],
      combatTime: 0
    })
  }

  const executeMove = (move: WrestlingMove) => {
    if (!combatState || combatState.gameState !== 'fighting') return

    // Calculate success chance based on stats
    const playerTech = combatState.player.character.stats.technique
    const playerStamina = combatState.player.stamina
    const successChance = Math.min(0.9, (playerTech + playerStamina) / 200)
    
    const success = Math.random() < successChance

    setCombatState(prev => {
      if (!prev) return prev

      const newState = { ...prev }
      const newLog = [...prev.actionLog]

      if (success) {
        newLog.push(`${prev.player.character.name} successfully executes ${move.name}!`)
        
        // Apply move effects
        if (move.damage) {
          newState.eva.health = Math.max(0, prev.eva.health - move.damage)
        }
        
        newState.player.stamina = Math.max(0, prev.player.stamina - move.stamina)
        
        // Check for submission
        if (move.category === 'submission' && newState.eva.health < 30) {
          const submissionChance = playerTech / 100
          if (Math.random() < submissionChance) {
            newLog.push(`EVA taps out! ${prev.player.character.name} wins by submission!`)
            newState.gameState = 'finished'
            newState.winner = 'player'
          }
        }
      } else {
        newLog.push(`${prev.player.character.name} attempts ${move.name} but EVA counters!`)
        newState.player.stamina = Math.max(0, prev.player.stamina - move.stamina / 2)
        
        // EVA counter-attack
        const evaMove = wrestlingMoves[Math.floor(Math.random() * wrestlingMoves.length)]
        newLog.push(`EVA responds with ${evaMove.name}!`)
        newState.player.health = Math.max(0, prev.player.health - (evaMove.damage || 10))
      }

      newState.actionLog = newLog
      
      // Check win conditions
      if (newState.player.health <= 0) {
        newLog.push('EVA wins! Better luck next time!')
        newState.gameState = 'finished'
        newState.winner = 'eva'
      } else if (newState.eva.health <= 0) {
        newLog.push(`${newState.player.character.name} wins by knockout!`)
        newState.gameState = 'finished'
        newState.winner = 'player'
      }

      return newState
    })

    // Send interaction to EVA
    onInteraction({
      type: 'combat_move',
      move: move.name,
      success,
      context: 'grappling_match'
    })
  }

  const startFight = () => {
    if (!combatState) return
    
    setCombatState(prev => ({
      ...prev!,
      gameState: 'fighting',
      actionLog: [...prev!.actionLog, 'The grappling match begins! Good luck!']
    }))
    setGameRunning(true)
  }

  const resetMatch = () => {
    setCombatState(null)
    setGameRunning(false)
    setSelectedMove(null)
  }

  const availableMoves = combatState 
    ? getMovesByPosition(combatState.currentPosition)
    : []

  // If no character created yet, show intro
  if (!combatState) {
    return (
      <>
        <div className="min-h-[600px] bg-gradient-to-br from-red-900/20 via-orange-900/20 to-yellow-900/20 rounded-2xl border border-orange-500/30 p-8">
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto"
            >
              <Sword className="w-10 h-10 text-white" />
            </motion.div>
            
            <h2 className="text-3xl font-bold text-white">Combat Arena</h2>
            <p className="text-orange-200 text-lg max-w-2xl mx-auto">
              Enter the 3D grappling arena and test your skills against EVA! Create your custom fighter and engage in realistic wrestling matches using professional grappling techniques.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-8">
              <Card className="bg-slate-800/50 border-orange-500/30">
                <CardContent className="p-6 text-center">
                  <Target className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">Realistic Combat</h3>
                  <p className="text-slate-300 text-sm">Experience professional wrestling moves and grappling techniques in a 3D environment</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-orange-500/30">
                <CardContent className="p-6 text-center">
                  <Shield className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">Character Creator</h3>
                  <p className="text-slate-300 text-sm">Customize every aspect of your fighter from appearance to combat stats</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-orange-500/30">
                <CardContent className="p-6 text-center">
                  <Zap className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">EVA AI Opponent</h3>
                  <p className="text-slate-300 text-sm">Face off against EVA's advanced AI with adaptive fighting strategies</p>
                </CardContent>
              </Card>
            </div>

            <Button
              onClick={startNewMatch}
              size="lg"
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 py-4 text-lg font-semibold"
            >
              Create Fighter & Enter Arena
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {showCharacterCreator && (
            <CharacterCreator
              onComplete={handleCharacterCreated}
              onCancel={() => setShowCharacterCreator(false)}
            />
          )}
        </AnimatePresence>
      </>
    )
  }

  // Combat interface
  return (
    <div className="space-y-6">
      {/* Combat Arena Header */}
      <Card className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border-orange-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Sword className="w-6 h-6 text-orange-400" />
              Grappling Arena
            </CardTitle>
            <div className="flex gap-2">
              {combatState.gameState === 'pre_match' && (
                <Button onClick={startFight} className="bg-green-600 hover:bg-green-700">
                  <Play className="w-4 h-4 mr-2" />
                  Start Fight
                </Button>
              )}
              <Button onClick={resetMatch} variant="outline" className="border-slate-600">
                <RotateCcw className="w-4 h-4 mr-2" />
                New Match
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Combat View */}
        <div className="lg:col-span-2 space-y-4">
          {/* 3D Arena */}
          <Card className="bg-slate-900/50 border-orange-500/30">
            <CardContent className="p-6">
              <div className="aspect-video bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center text-slate-400">
                  <div className="text-6xl mb-4">🥋</div>
                  <p className="text-lg">3D Combat Arena</p>
                  <p className="text-sm opacity-70">
                    {combatState.player.character.name} vs EVA
                  </p>
                  <Badge variant="outline" className="mt-2 text-orange-400 border-orange-400">
                    Position: {combatState.currentPosition.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fighter Stats */}
          <div className="grid grid-cols-2 gap-4">
            {/* Player */}
            <Card className="bg-blue-900/30 border-blue-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-blue-200 text-lg">{combatState.player.character.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm text-blue-200 mb-1">
                    <span>Health</span>
                    <span>{combatState.player.health}%</span>
                  </div>
                  <Progress value={combatState.player.health} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm text-blue-200 mb-1">
                    <span>Stamina</span>
                    <span>{combatState.player.stamina}%</span>
                  </div>
                  <Progress value={combatState.player.stamina} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* EVA */}
            <Card className="bg-purple-900/30 border-purple-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-purple-200 text-lg">EVA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm text-purple-200 mb-1">
                    <span>Health</span>
                    <span>{combatState.eva.health}%</span>
                  </div>
                  <Progress value={combatState.eva.health} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm text-purple-200 mb-1">
                    <span>Stamina</span>
                    <span>{combatState.eva.stamina}%</span>
                  </div>
                  <Progress value={combatState.eva.stamina} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Controls & Moves */}
        <div className="space-y-4">
          {/* Available Moves */}
          <Card className="bg-slate-800/50 border-orange-500/30">
            <CardHeader>
              <CardTitle className="text-white text-lg">Available Moves</CardTitle>
              <p className="text-slate-400 text-sm">
                Current Position: {combatState.currentPosition.replace('_', ' ')}
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {combatState.gameState === 'fighting' ? (
                availableMoves.length > 0 ? (
                  availableMoves.map((move) => (
                    <Button
                      key={move.id}
                      onClick={() => executeMove(move)}
                      disabled={combatState.player.stamina < move.stamina}
                      variant={selectedMove?.id === move.id ? "default" : "outline"}
                      className="w-full justify-start text-left p-3 h-auto"
                    >
                      <div className="w-full">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold">{move.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {move.category}
                          </Badge>
                        </div>
                        <p className="text-xs opacity-70 text-left">{move.description}</p>
                        <div className="flex justify-between text-xs mt-1 opacity-60">
                          <span>Stamina: {move.stamina}</span>
                          {move.damage && <span>Damage: {move.damage}</span>}
                        </div>
                      </div>
                    </Button>
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-4">
                    No moves available from this position
                  </p>
                )
              ) : (
                <p className="text-slate-400 text-center py-4">
                  {combatState.gameState === 'pre_match' 
                    ? 'Start the fight to see available moves'
                    : 'Match finished'
                  }
                </p>
              )}
            </CardContent>
          </Card>

          {/* Action Log */}
          <Card className="bg-slate-800/50 border-orange-500/30">
            <CardHeader>
              <CardTitle className="text-white text-lg">Combat Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {combatState.actionLog.map((action, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm text-slate-300 p-2 bg-slate-700/30 rounded"
                  >
                    {action}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Match Results */}
          {combatState.gameState === 'finished' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <Card className={`border-2 ${
                combatState.winner === 'player' 
                  ? 'bg-green-900/30 border-green-500' 
                  : 'bg-red-900/30 border-red-500'
              }`}>
                <CardContent className="p-6 text-center">
                  <h3 className={`text-2xl font-bold mb-2 ${
                    combatState.winner === 'player' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {combatState.winner === 'player' ? 'Victory!' : 'Defeat!'}
                  </h3>
                  <p className="text-slate-300 mb-4">
                    {combatState.winner === 'player' 
                      ? `${combatState.player.character.name} defeats EVA!`
                      : 'EVA emerges victorious!'
                    }
                  </p>
                  <Button
                    onClick={resetMatch}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    New Match
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}