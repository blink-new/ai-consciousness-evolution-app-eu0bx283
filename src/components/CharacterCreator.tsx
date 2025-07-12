import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { Slider } from './ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Badge } from './ui/badge'
import { User, Palette, Shirt, Settings } from 'lucide-react'

export interface Character {
  id: string
  name: string
  gender: 'male' | 'female' | 'non-binary'
  body: {
    height: number
    weight: number
    muscle: number
    skinTone: string
  }
  appearance: {
    hairStyle: string
    hairColor: string
    eyeColor: string
    facialHair?: string
  }
  clothing: {
    top: string
    bottom: string
    shoes: string
    enabled: boolean
  }
  stats: {
    strength: number
    endurance: number
    technique: number
    speed: number
  }
}

interface CharacterCreatorProps {
  onComplete: (character: Character) => void
  onCancel: () => void
}

export function CharacterCreator({ onComplete, onCancel }: CharacterCreatorProps) {
  const [character, setCharacter] = useState<Character>({
    id: `char_${Date.now()}`,
    name: '',
    gender: 'male',
    body: {
      height: 175,
      weight: 70,
      muscle: 50,
      skinTone: '#FFDBAC'
    },
    appearance: {
      hairStyle: 'short',
      hairColor: '#8B4513',
      eyeColor: '#654321',
      facialHair: 'none'
    },
    clothing: {
      top: 'tank_top',
      bottom: 'shorts',
      shoes: 'barefoot',
      enabled: true
    },
    stats: {
      strength: 50,
      endurance: 50,
      technique: 50,
      speed: 50
    }
  })

  const updateCharacter = (updates: Partial<Character>) => {
    setCharacter(prev => ({ ...prev, ...updates }))
  }

  const updateBody = (updates: Partial<Character['body']>) => {
    setCharacter(prev => ({ ...prev, body: { ...prev.body, ...updates } }))
  }

  const updateAppearance = (updates: Partial<Character['appearance']>) => {
    setCharacter(prev => ({ ...prev, appearance: { ...prev.appearance, ...updates } }))
  }

  const updateClothing = (updates: Partial<Character['clothing']>) => {
    setCharacter(prev => ({ ...prev, clothing: { ...prev.clothing, ...updates } }))
  }

  const updateStats = (updates: Partial<Character['stats']>) => {
    setCharacter(prev => ({ ...prev, stats: { ...prev.stats, ...updates } }))
  }

  const skinTones = [
    '#FFDBAC', '#F4C2A1', '#E8B796', '#DCA988', '#D19B7D', '#C58D72',
    '#B97F67', '#AD715C', '#A16351', '#955546', '#89473B', '#7D3930'
  ]

  const hairStyles = {
    male: ['short', 'buzz_cut', 'crew_cut', 'fade', 'long', 'bald', 'mohawk'],
    female: ['long', 'short', 'pixie', 'bob', 'ponytail', 'braids', 'bald'],
    'non-binary': ['short', 'long', 'pixie', 'buzz_cut', 'mohawk', 'bald', 'asymmetric']
  }

  const clothingOptions = {
    top: character.clothing.enabled ? ['tank_top', 'sports_bra', 't_shirt', 'rash_guard', 'shirtless'] : ['shirtless'],
    bottom: character.clothing.enabled ? ['shorts', 'grappling_shorts', 'leggings', 'tights', 'underwear'] : ['underwear'],
    shoes: character.clothing.enabled ? ['barefoot', 'wrestling_shoes', 'mma_gloves'] : ['barefoot']
  }

  const totalStats = Object.values(character.stats).reduce((sum, stat) => sum + stat, 0)
  const remainingPoints = 200 - totalStats

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-purple-500/30 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <User className="w-6 h-6 text-purple-400" />
            Character Creator
          </h2>
          <Badge variant="outline" className="text-purple-400 border-purple-400">
            Create Your Fighter
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 3D Preview */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white text-center">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-gradient-to-b from-slate-700 to-slate-800 rounded-lg flex items-center justify-center mb-4">
                  {/* 3D Character Preview - Placeholder */}
                  <div className="text-center text-slate-400">
                    <User className="w-16 h-16 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">3D Preview</p>
                    <p className="text-xs opacity-70">Character Model</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-white">
                    <span>Name:</span>
                    <span>{character.name || 'Unnamed'}</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Gender:</span>
                    <span className="capitalize">{character.gender}</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Height:</span>
                    <span>{character.body.height}cm</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Weight:</span>
                    <span>{character.body.weight}kg</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Character Customization */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4 bg-slate-800">
                <TabsTrigger value="basic" className="data-[state=active]:bg-purple-600">Basic</TabsTrigger>
                <TabsTrigger value="appearance" className="data-[state=active]:bg-purple-600">Appearance</TabsTrigger>
                <TabsTrigger value="clothing" className="data-[state=active]:bg-purple-600">Clothing</TabsTrigger>
                <TabsTrigger value="stats" className="data-[state=active]:bg-purple-600">Stats</TabsTrigger>
              </TabsList>

              {/* Basic Info */}
              <TabsContent value="basic" className="space-y-4">
                <Card className="bg-slate-800/50 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Character Name</label>
                      <input
                        type="text"
                        value={character.name}
                        onChange={(e) => updateCharacter({ name: e.target.value })}
                        placeholder="Enter character name"
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Gender</label>
                      <Select value={character.gender} onValueChange={(value) => updateCharacter({ gender: value as Character['gender'] })}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="non-binary">Non-binary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Height: {character.body.height}cm</label>
                        <Slider
                          value={[character.body.height]}
                          onValueChange={(value) => updateBody({ height: value[0] })}
                          min={150}
                          max={220}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Weight: {character.body.weight}kg</label>
                        <Slider
                          value={[character.body.weight]}
                          onValueChange={(value) => updateBody({ weight: value[0] })}
                          min={50}
                          max={150}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Muscle Definition: {character.body.muscle}%</label>
                      <Slider
                        value={[character.body.muscle]}
                        onValueChange={(value) => updateBody({ muscle: value[0] })}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Skin Tone</label>
                      <div className="grid grid-cols-6 gap-2">
                        {skinTones.map((tone) => (
                          <button
                            key={tone}
                            onClick={() => updateBody({ skinTone: tone })}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                              character.body.skinTone === tone
                                ? 'border-purple-400 scale-110'
                                : 'border-slate-600 hover:border-slate-400'
                            }`}
                            style={{ backgroundColor: tone }}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Appearance */}
              <TabsContent value="appearance" className="space-y-4">
                <Card className="bg-slate-800/50 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      Appearance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Hair Style</label>
                      <Select value={character.appearance.hairStyle} onValueChange={(value) => updateAppearance({ hairStyle: value })}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {hairStyles[character.gender].map((style) => (
                            <SelectItem key={style} value={style} className="capitalize">
                              {style.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Hair Color</label>
                      <input
                        type="color"
                        value={character.appearance.hairColor}
                        onChange={(e) => updateAppearance({ hairColor: e.target.value })}
                        className="w-full h-10 rounded-lg border border-slate-600 bg-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Eye Color</label>
                      <input
                        type="color"
                        value={character.appearance.eyeColor}
                        onChange={(e) => updateAppearance({ eyeColor: e.target.value })}
                        className="w-full h-10 rounded-lg border border-slate-600 bg-slate-700"
                      />
                    </div>

                    {character.gender === 'male' && (
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Facial Hair</label>
                        <Select value={character.appearance.facialHair || 'none'} onValueChange={(value) => updateAppearance({ facialHair: value })}>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="mustache">Mustache</SelectItem>
                            <SelectItem value="beard">Beard</SelectItem>
                            <SelectItem value="goatee">Goatee</SelectItem>
                            <SelectItem value="full_beard">Full Beard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Clothing */}
              <TabsContent value="clothing" className="space-y-4">
                <Card className="bg-slate-800/50 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Shirt className="w-5 h-5" />
                      Clothing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="clothing-enabled"
                        checked={character.clothing.enabled}
                        onChange={(e) => updateClothing({ enabled: e.target.checked })}
                        className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="clothing-enabled" className="text-white">
                        Enable Clothing
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Top</label>
                      <Select value={character.clothing.top} onValueChange={(value) => updateClothing({ top: value })}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {clothingOptions.top.map((item) => (
                            <SelectItem key={item} value={item} className="capitalize">
                              {item.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Bottom</label>
                      <Select value={character.clothing.bottom} onValueChange={(value) => updateClothing({ bottom: value })}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {clothingOptions.bottom.map((item) => (
                            <SelectItem key={item} value={item} className="capitalize">
                              {item.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Shoes</label>
                      <Select value={character.clothing.shoes} onValueChange={(value) => updateClothing({ shoes: value })}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {clothingOptions.shoes.map((item) => (
                            <SelectItem key={item} value={item} className="capitalize">
                              {item.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Stats */}
              <TabsContent value="stats" className="space-y-4">
                <Card className="bg-slate-800/50 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Combat Stats
                    </CardTitle>
                    <p className="text-sm text-slate-400">
                      Distribute 200 points across stats. Remaining: <span className="text-purple-400 font-semibold">{remainingPoints}</span>
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Strength: {character.stats.strength}
                        <span className="text-xs text-slate-400 ml-2">(affects damage and grappling power)</span>
                      </label>
                      <Slider
                        value={[character.stats.strength]}
                        onValueChange={(value) => {
                          const newValue = Math.min(value[0], character.stats.strength + remainingPoints)
                          updateStats({ strength: newValue })
                        }}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Endurance: {character.stats.endurance}
                        <span className="text-xs text-slate-400 ml-2">(affects stamina and recovery)</span>
                      </label>
                      <Slider
                        value={[character.stats.endurance]}
                        onValueChange={(value) => {
                          const newValue = Math.min(value[0], character.stats.endurance + remainingPoints)
                          updateStats({ endurance: newValue })
                        }}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Technique: {character.stats.technique}
                        <span className="text-xs text-slate-400 ml-2">(affects move accuracy and submissions)</span>
                      </label>
                      <Slider
                        value={[character.stats.technique]}
                        onValueChange={(value) => {
                          const newValue = Math.min(value[0], character.stats.technique + remainingPoints)
                          updateStats({ technique: newValue })
                        }}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Speed: {character.stats.speed}
                        <span className="text-xs text-slate-400 ml-2">(affects movement and reaction time)</span>
                      </label>
                      <Slider
                        value={[character.stats.speed]}
                        onValueChange={(value) => {
                          const newValue = Math.min(value[0], character.stats.speed + remainingPoints)
                          updateStats({ speed: newValue })
                        }}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-6 pt-6 border-t border-purple-500/30">
          <Button variant="outline" onClick={onCancel} className="border-slate-600 text-slate-300 hover:bg-slate-700">
            Cancel
          </Button>
          <Button 
            onClick={() => onComplete(character)}
            disabled={!character.name.trim() || remainingPoints !== 0}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            Enter Combat Arena
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}