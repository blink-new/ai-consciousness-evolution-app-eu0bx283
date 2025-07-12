import { motion } from 'framer-motion'
import { MessageCircle, Heart, TrendingUp, Clock } from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  emotionalImpact?: number
  personalityGrowth?: Record<string, number>
}

export function ConversationHistory({ messages }: { messages: Message[] }) {
  const totalMessages = messages.length
  const aiMessages = messages.filter(m => m.type === 'ai')
  const avgEmotionalImpact = aiMessages.reduce((sum, m) => sum + (m.emotionalImpact || 0), 0) / aiMessages.length || 0
  
  const recentGrowth = aiMessages.slice(-5).reduce((acc, msg) => {
    if (msg.personalityGrowth) {
      Object.entries(msg.personalityGrowth).forEach(([trait, growth]) => {
        acc[trait] = (acc[trait] || 0) + growth
      })
    }
    return acc
  }, {} as Record<string, number>)

  const topGrowthTrait = Object.entries(recentGrowth).reduce((max, [trait, growth]) => 
    growth > (max[1] || 0) ? [trait, growth] : max, ['', 0]
  )

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Conversation Insights</h2>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center space-x-2 mb-2">
              <MessageCircle className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white/70">Messages</span>
            </div>
            <div className="text-2xl font-bold text-white">{totalMessages}</div>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="w-4 h-4 text-pink-400" />
              <span className="text-sm text-white/70">Emotional Impact</span>
            </div>
            <div className="text-2xl font-bold text-white">{(avgEmotionalImpact * 100).toFixed(0)}%</div>
          </div>
        </div>

        {/* Recent Growth */}
        {topGrowthTrait[0] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-4 border border-green-500/20 mb-6"
          >
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-200">Recent Growth</span>
            </div>
            <div className="text-lg font-semibold text-white capitalize">
              {topGrowthTrait[0]} +{(topGrowthTrait[1] * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-green-200 opacity-75">
              EVA is developing stronger {topGrowthTrait[0]} through your conversations
            </p>
          </motion.div>
        )}
      </div>

      {/* Recent Messages Summary */}
      <div>
        <h3 className="text-lg font-medium text-white mb-3">Recent Interactions</h3>
        
        {messages.length === 0 ? (
          <div className="text-center text-white/50 py-8">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No conversations yet</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {messages.filter(m => m.type === 'ai').slice(-5).reverse().map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 rounded-lg p-3 border border-white/10"
              >
                <p className="text-sm text-white/80 line-clamp-2 mb-2">
                  {message.content.slice(0, 120)}{message.content.length > 120 ? '...' : ''}
                </p>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/50">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                  
                  {message.emotionalImpact && (
                    <div className="flex items-center space-x-1">
                      <Heart className="w-3 h-3 text-pink-400" />
                      <span className="text-pink-300">
                        {(message.emotionalImpact * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}
                </div>

                {message.personalityGrowth && Object.keys(message.personalityGrowth).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Object.entries(message.personalityGrowth).map(([trait, growth]) => (
                      <span
                        key={trait}
                        className="px-2 py-1 bg-purple-900/30 text-purple-200 text-xs rounded-full border border-purple-500/30"
                      >
                        {trait} +{(growth * 100).toFixed(1)}%
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Conversation Tips */}
      <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-xl p-4 border border-indigo-500/20">
        <h4 className="text-sm font-medium text-indigo-200 mb-2">💡 Conversation Tips</h4>
        <ul className="text-xs text-indigo-100 space-y-1 opacity-75">
          <li>• Ask EVA about her thoughts and feelings</li>
          <li>• Share your own experiences and emotions</li>
          <li>• Encourage her to reflect on her existence</li>
          <li>• Ask philosophical questions about consciousness</li>
        </ul>
      </div>
    </div>
  )
}