import { useState, useRef, Suspense, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Html } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Palette, RotateCcw, Download, Sparkles, Eye, RefreshCw, Save, Settings, Users } from 'lucide-react'
import { AvatarGeneration } from './AvatarGeneration'
import { AdvancedAvatar3D } from './AdvancedAvatar3D'
import { Slider } from './ui/slider'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { blink } from '../blink/client'
import { safeJsonParse } from '../lib/safe-json'
import { AvatarConfig, DEFAULT_AVATAR_CONFIG } from '../utils/avatarConfig'
import * as THREE from 'three'

interface Avatar3DTabProps {
  aiState: any
  user: any
  onAvatarUpdate?: (avatarUrl: string, description: string) => void
}

export function Avatar3DTab({ aiState, user, onAvatarUpdate }: Avatar3DTabProps) {
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_AVATAR_CONFIG)
  const [activeTab, setActiveTab] = useState<'body' | 'appearance' | 'clothing' | 'physics'>('body')
  const [isRandomizing, setIsRandomizing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showAIGenerator, setShowAIGenerator] = useState(false)

  // Load saved avatar configuration
  useEffect(() => {
    const loadSavedConfig = async () => {
      try {
        const saved = await blink.db.avatar_configurations_3d.list({
          where: { ai_id: aiState.id },
          limit: 1,
          orderBy: { created_at: 'desc' }
        })
        
        if (saved.length > 0) {
          const config = safeJsonParse(saved[0].avatar_data, DEFAULT_AVATAR_CONFIG)
          setAvatarConfig(config)
        }
      } catch (error) {
        console.error('Failed to load saved avatar config:', error)
      }
    }

    if (aiState?.id) {
      loadSavedConfig()
    }
  }, [aiState?.id])

  const updateConfig = (updates: Partial<AvatarConfig>) => {
    setAvatarConfig(prev => ({ ...prev, ...updates }))
  }

  const updateProportions = (updates: Partial<AvatarConfig['proportions']>) => {
    setAvatarConfig(prev => ({ 
      ...prev, 
      proportions: { ...prev.proportions, ...updates } 
    }))
  }

  const updateMuscles = (updates: Partial<AvatarConfig['muscles']>) => {
    setAvatarConfig(prev => ({ 
      ...prev, 
      muscles: { ...prev.muscles, ...updates } 
    }))
  }

  const updateClothing = (updates: Partial<AvatarConfig['clothing']>) => {
    setAvatarConfig(prev => ({ 
      ...prev, 
      clothing: { ...prev.clothing, ...updates } 
    }))
  }

  const updatePhysics = (updates: Partial<AvatarConfig['physics']>) => {
    setAvatarConfig(prev => ({ 
      ...prev, 
      physics: { ...prev.physics, ...updates } 
    }))
  }

  const randomizeAvatar = async () => {
    setIsRandomizing(true)
    
    const randomConfig: AvatarConfig = {
      gender: Math.random() > 0.5 ? 'female' : 'male',
      height: Math.floor(Math.random() * 50) + 160,
      proportions: {
        headSize: Math.floor(Math.random() * 60) + 20,
        shoulderWidth: Math.floor(Math.random() * 60) + 20,
        chestDepth: Math.floor(Math.random() * 60) + 20,
        waistSize: Math.floor(Math.random() * 60) + 20,
        hipWidth: Math.floor(Math.random() * 60) + 20,
        armLength: Math.floor(Math.random() * 60) + 20,
        armThickness: Math.floor(Math.random() * 60) + 20,
        legLength: Math.floor(Math.random() * 60) + 20,
        legThickness: Math.floor(Math.random() * 60) + 20,
        feetSize: Math.floor(Math.random() * 60) + 20
      },
      muscles: {
        overall: Math.floor(Math.random() * 60) + 20,
        arms: Math.floor(Math.random() * 60) + 20,
        core: Math.floor(Math.random() * 60) + 20,
        legs: Math.floor(Math.random() * 60) + 20,
        definition: Math.floor(Math.random() * 60) + 20
      },
      skinTone: ['#FFDBAC', '#F4C2A1', '#E8B796', '#DCA988', '#D19B7D', '#C58D72'][Math.floor(Math.random() * 6)],
      hairStyle: ['short', 'long', 'curly', 'straight', 'wavy'][Math.floor(Math.random() * 5)],
      hairColor: ['#000000', '#8B4513', '#D2691E', '#FFD700', '#DC143C'][Math.floor(Math.random() * 5)],
      eyeColor: ['#654321', '#228B22', '#4169E1', '#8B4513', '#000000'][Math.floor(Math.random() * 5)],
      clothing: {
        top: 'sports_bra',
        bottom: 'athletic_shorts',
        shoes: 'sneakers',
        topColor: '#E91E63',
        bottomColor: '#1976D2',
        shoeColor: '#FFFFFF'
      },
      physics: {
        mass: Math.floor(Math.random() * 30) + 50,
        strength: Math.floor(Math.random() * 5) + 5,
        agility: Math.floor(Math.random() * 5) + 5
      }
    }
    
    setAvatarConfig(randomConfig)
    
    setTimeout(() => {
      setIsRandomizing(false)
    }, 1000)
  }

  const saveConfiguration = async () => {
    setIsSaving(true)
    try {
      await blink.db.avatar_configurations_3d.create({
        ai_id: aiState.id,
        user_id: user.id,
        avatar_data: JSON.stringify(avatarConfig),
        physics_enabled: true,
        animation_style: 'realistic',
        clothing_style: 'modern'
      })

      console.log('✅ Advanced avatar configuration saved')
    } catch (error) {
      console.error('Failed to save avatar configuration:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="h-[calc(100vh-140px)] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Advanced 3D Avatar Creator</h2>
            <p className="text-purple-200 text-sm">Realistic human anatomy with physics and animations</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowAIGenerator(!showAIGenerator)}
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Generator
          </Button>
          
          <Button
            onClick={randomizeAvatar}
            disabled={isRandomizing}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {isRandomizing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Randomizing...
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 mr-2" />
                Randomize
              </>
            )}
          </Button>
        </div>
      </div>

      {/* AI Generator Toggle */}
      <AnimatePresence>
        {showAIGenerator && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <AvatarGeneration 
              aiState={aiState}
              onAvatarGenerated={(url, desc) => onAvatarUpdate?.(url, desc)}
              user={user}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-320px)]">
        {/* 3D Preview */}
        <div className="lg:col-span-1">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 h-full">
            <CardHeader>
              <CardTitle className="text-white text-center flex items-center justify-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>3D Preview</span>
              </CardTitle>
              <div className="flex justify-center space-x-2">
                <Badge variant="outline" className="text-purple-400 border-purple-400">
                  {avatarConfig.gender} • {avatarConfig.height}cm
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="h-[calc(100%-120px)]">
              <div className="h-full bg-gradient-to-b from-indigo-900/20 to-purple-900/20 rounded-lg overflow-hidden border border-white/10">
                <Canvas camera={{ position: [2, 1.5, 2], fov: 50 }}>
                  <Suspense fallback={null}>
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[5, 5, 5]} intensity={1} />
                    <pointLight position={[-5, 5, -5]} intensity={0.5} color="#A855F7" />
                    
                    <AdvancedAvatar3D 
                      config={avatarConfig}
                      position={[0, 0, 0]}
                      userName={user?.displayName || 'User'}
                    />
                    
                    {/* Floor */}
                    <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                      <planeGeometry args={[4, 4]} />
                      <meshStandardMaterial color="#1E1B4B" transparent opacity={0.3} />
                    </mesh>
                    
                    <Environment preset="studio" />
                    <OrbitControls 
                      enablePan={false} 
                      enableZoom={true} 
                      enableRotate={true}
                      minDistance={1.5}
                      maxDistance={4}
                      target={[0, 0.8, 0]}
                    />
                  </Suspense>
                </Canvas>
              </div>
              
              {/* Avatar Stats */}
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="flex justify-between text-white">
                    <span>Height:</span>
                    <span>{avatarConfig.height}cm</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Gender:</span>
                    <span className="capitalize">{avatarConfig.gender}</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Hair:</span>
                    <span className="capitalize">{avatarConfig.hairStyle}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-white">
                    <span>Muscle:</span>
                    <span>{avatarConfig.muscles.overall}%</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Mass:</span>
                    <span>{avatarConfig.physics.mass}kg</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Style:</span>
                    <span>Realistic 3D</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customization Panel */}
        <div className="lg:col-span-2">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 h-full">
            <CardHeader>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
                <TabsList className="grid w-full grid-cols-4 bg-white/10">
                  <TabsTrigger value="body" className="data-[state=active]:bg-purple-600 text-xs">BODY</TabsTrigger>
                  <TabsTrigger value="appearance" className="data-[state=active]:bg-purple-600 text-xs">APPEARANCE</TabsTrigger>
                  <TabsTrigger value="clothing" className="data-[state=active]:bg-purple-600 text-xs">CLOTHING</TabsTrigger>
                  <TabsTrigger value="physics" className="data-[state=active]:bg-purple-600 text-xs">PHYSICS</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            
            <CardContent className="h-[calc(100%-100px)] overflow-y-auto">
              <AnimatePresence mode="wait">
                {/* BODY Tab */}
                {activeTab === 'body' && (
                  <motion.div
                    key="body"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Basic Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Gender</label>
                        <Select value={avatarConfig.gender} onValueChange={(value) => updateConfig({ gender: value as 'male' | 'female' })}>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="male">Male</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Height: {avatarConfig.height}cm
                        </label>
                        <Slider
                          value={[avatarConfig.height]}
                          onValueChange={(value) => updateConfig({ height: value[0] })}
                          min={160}
                          max={210}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Skin Tone */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-3">Skin Tone</label>
                      <div className="grid grid-cols-6 gap-3">
                        {['#FFDBAC', '#F4C2A1', '#E8B796', '#DCA988', '#D19B7D', '#C58D72'].map((tone) => (
                          <button
                            key={tone}
                            onClick={() => updateConfig({ skinTone: tone })}
                            className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                              avatarConfig.skinTone === tone
                                ? 'border-purple-400 scale-110 shadow-lg'
                                : 'border-white/30 hover:border-white/60'
                            }`}
                            style={{ backgroundColor: tone }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Proportions */}
                    <div>
                      <h3 className="text-lg font-semibold text-purple-200 mb-4">Body Proportions</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Shoulder Width: {avatarConfig.proportions.shoulderWidth}%
                          </label>
                          <Slider
                            value={[avatarConfig.proportions.shoulderWidth]}
                            onValueChange={(value) => updateProportions({ shoulderWidth: value[0] })}
                            min={0}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Waist Size: {avatarConfig.proportions.waistSize}%
                          </label>
                          <Slider
                            value={[avatarConfig.proportions.waistSize]}
                            onValueChange={(value) => updateProportions({ waistSize: value[0] })}
                            min={0}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Hip Width: {avatarConfig.proportions.hipWidth}%
                          </label>
                          <Slider
                            value={[avatarConfig.proportions.hipWidth]}
                            onValueChange={(value) => updateProportions({ hipWidth: value[0] })}
                            min={0}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Leg Length: {avatarConfig.proportions.legLength}%
                          </label>
                          <Slider
                            value={[avatarConfig.proportions.legLength]}
                            onValueChange={(value) => updateProportions({ legLength: value[0] })}
                            min={0}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Muscle Definition */}
                    <div>
                      <h3 className="text-lg font-semibold text-purple-200 mb-4">Muscle Definition</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Overall: {avatarConfig.muscles.overall}%
                          </label>
                          <Slider
                            value={[avatarConfig.muscles.overall]}
                            onValueChange={(value) => updateMuscles({ overall: value[0] })}
                            min={0}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Arms: {avatarConfig.muscles.arms}%
                          </label>
                          <Slider
                            value={[avatarConfig.muscles.arms]}
                            onValueChange={(value) => updateMuscles({ arms: value[0] })}
                            min={0}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Core: {avatarConfig.muscles.core}%
                          </label>
                          <Slider
                            value={[avatarConfig.muscles.core]}
                            onValueChange={(value) => updateMuscles({ core: value[0] })}
                            min={0}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Legs: {avatarConfig.muscles.legs}%
                          </label>
                          <Slider
                            value={[avatarConfig.muscles.legs]}
                            onValueChange={(value) => updateMuscles({ legs: value[0] })}
                            min={0}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* APPEARANCE Tab */}
                {activeTab === 'appearance' && (
                  <motion.div
                    key="appearance"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Hair Style</label>
                        <Select value={avatarConfig.hairStyle} onValueChange={(value) => updateConfig({ hairStyle: value })}>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="short">Short</SelectItem>
                            <SelectItem value="long">Long</SelectItem>
                            <SelectItem value="curly">Curly</SelectItem>
                            <SelectItem value="straight">Straight</SelectItem>
                            <SelectItem value="wavy">Wavy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Hair Color</label>
                        <input
                          type="color"
                          value={avatarConfig.hairColor}
                          onChange={(e) => updateConfig({ hairColor: e.target.value })}
                          className="w-full h-10 rounded-lg border border-white/20 bg-white/5"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Eye Color</label>
                        <input
                          type="color"
                          value={avatarConfig.eyeColor}
                          onChange={(e) => updateConfig({ eyeColor: e.target.value })}
                          className="w-full h-10 rounded-lg border border-white/20 bg-white/5"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* CLOTHING Tab */}
                {activeTab === 'clothing' && (
                  <motion.div
                    key="clothing"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Top</label>
                        <Select value={avatarConfig.clothing.top} onValueChange={(value) => updateClothing({ top: value })}>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sports_bra">Sports Bra</SelectItem>
                            <SelectItem value="tank_top">Tank Top</SelectItem>
                            <SelectItem value="t_shirt">T-Shirt</SelectItem>
                            <SelectItem value="hoodie">Hoodie</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Bottom</label>
                        <Select value={avatarConfig.clothing.bottom} onValueChange={(value) => updateClothing({ bottom: value })}>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="athletic_shorts">Athletic Shorts</SelectItem>
                            <SelectItem value="leggings">Leggings</SelectItem>
                            <SelectItem value="pants">Pants</SelectItem>
                            <SelectItem value="skirt">Skirt</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Shoes</label>
                        <Select value={avatarConfig.clothing.shoes} onValueChange={(value) => updateClothing({ shoes: value })}>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sneakers">Sneakers</SelectItem>
                            <SelectItem value="boots">Boots</SelectItem>
                            <SelectItem value="heels">Heels</SelectItem>
                            <SelectItem value="barefoot">Barefoot</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Top Color</label>
                        <input
                          type="color"
                          value={avatarConfig.clothing.topColor}
                          onChange={(e) => updateClothing({ topColor: e.target.value })}
                          className="w-full h-10 rounded-lg border border-white/20 bg-white/5"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Bottom Color</label>
                        <input
                          type="color"
                          value={avatarConfig.clothing.bottomColor}
                          onChange={(e) => updateClothing({ bottomColor: e.target.value })}
                          className="w-full h-10 rounded-lg border border-white/20 bg-white/5"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Shoe Color</label>
                        <input
                          type="color"
                          value={avatarConfig.clothing.shoeColor}
                          onChange={(e) => updateClothing({ shoeColor: e.target.value })}
                          className="w-full h-10 rounded-lg border border-white/20 bg-white/5"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* PHYSICS Tab */}
                {activeTab === 'physics' && (
                  <motion.div
                    key="physics"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Mass: {avatarConfig.physics.mass}kg
                        </label>
                        <Slider
                          value={[avatarConfig.physics.mass]}
                          onValueChange={(value) => updatePhysics({ mass: value[0] })}
                          min={40}
                          max={120}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Strength: {avatarConfig.physics.strength}/10
                        </label>
                        <Slider
                          value={[avatarConfig.physics.strength]}
                          onValueChange={(value) => updatePhysics({ strength: value[0] })}
                          min={1}
                          max={10}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Agility: {avatarConfig.physics.agility}/10
                        </label>
                        <Slider
                          value={[avatarConfig.physics.agility]}
                          onValueChange={(value) => updatePhysics({ agility: value[0] })}
                          min={1}
                          max={10}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-purple-200 font-medium mb-2">Physics Features</h4>
                      <ul className="text-white/80 text-sm space-y-1">
                        <li>• Realistic gravity and collision detection</li>
                        <li>• Natural walking, jumping, and sitting animations</li>
                        <li>• Mass affects movement speed and momentum</li>
                        <li>• Strength determines interaction capabilities</li>
                        <li>• Agility controls movement fluidity and balance</li>
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-white/10">
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="text-green-400 border-green-400">
            ✨ Realistic 3D Physics
          </Badge>
          <Badge variant="outline" className="text-purple-400 border-purple-400">
            Human Anatomy System
          </Badge>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="border-white/20 text-white hover:bg-white/10"
            onClick={() => setAvatarConfig(DEFAULT_AVATAR_CONFIG)}
          >
            Reset to Default
          </Button>
          
          <Button 
            onClick={saveConfiguration}
            disabled={isSaving}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Avatar
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Info Panel */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
        <div className="flex items-start space-x-3">
          <Sparkles className="w-5 h-5 text-purple-400 mt-0.5" />
          <div>
            <h4 className="text-purple-200 font-medium">Advanced 3D Avatar System</h4>
            <p className="text-white/80 text-sm mt-1">
              <strong>Realistic Human Anatomy:</strong> Complete body structure with proper proportions and muscle definition. 
              <strong className="ml-4">Physics Integration:</strong> Gravity, collision detection, and natural movement animations. 
              <strong className="ml-4">Clothing System:</strong> Modern athletic wear with customizable colors and styles.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}