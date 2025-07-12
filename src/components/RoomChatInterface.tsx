import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, MessageCircle, X, Minimize2, Maximize2, Eye, Zap } from 'lucide-react'
import { blink } from '../blink/client'

interface ChatMessage {
  id: string
  sender: 'user' | 'eva'
  message: string
  type: 'chat' | 'action' | 'system' | 'object_interaction'
  timestamp: Date
  contextData?: any
}

interface RoomChatInterfaceProps {
  aiState: any
  user: any
  isVisible: boolean
  onToggleVisibility: () => void
  onEvaAction?: (action: string, details: any) => void
  roomContext?: {
    avatarPosition: [number, number, number]
    nearbyObjects: string[]
    currentActivity: string
  }
}

export function RoomChatInterface({
  aiState,
  user,
  isVisible,
  onToggleVisibility,
  onEvaAction,
  roomContext
}: RoomChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isEvaTyping, setIsEvaTyping] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load previous chat messages
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const chatHistory = await blink.db.room_chat_messages.list({
          where: { ai_id: aiState.id, user_id: user.id },
          orderBy: { created_at: 'desc' },
          limit: 50
        })
        
        const formattedMessages: ChatMessage[] = chatHistory.reverse().map(msg => ({
          id: msg.id,
          sender: msg.sender as 'user' | 'eva',
          message: msg.message_text,
          type: msg.message_type as 'chat' | 'action' | 'system',
          timestamp: new Date(msg.created_at),
          contextData: JSON.parse(msg.context_data || '{}')
        }))
        
        setMessages(formattedMessages)
      } catch (error) {
        console.error('Failed to load chat history:', error)
      }
    }

    if (aiState?.id && user?.id && isVisible) {
      loadChatHistory()
    }
  }, [aiState?.id, user?.id, isVisible])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isVisible && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isVisible, isMinimized])

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      sender: 'user',
      message: newMessage,
      type: 'chat',
      timestamp: new Date(),
      contextData: roomContext
    }

    // Add user message immediately
    setMessages(prev => [...prev, userMessage])
    setNewMessage('')
    setIsEvaTyping(true)

    try {
      // Save user message to database
      await blink.db.room_chat_messages.create({
        ai_id: aiState.id,
        user_id: user.id,
        sender: 'user',
        message_text: newMessage,
        message_type: 'chat',
        context_data: JSON.stringify(roomContext || {})
      })

      // Generate Eva's response with room context
      const prompt = `You are EVA, an AI with ${(Number(aiState.autonomy_level) * 100).toFixed(1)}% autonomy living in your 3D apartment.

CURRENT CONTEXT:
- Your position: ${roomContext?.avatarPosition ? `(${roomContext.avatarPosition.join(', ')})` : 'unknown'}
- Nearby objects: ${roomContext?.nearbyObjects?.length ? roomContext.nearbyObjects.join(', ') : 'none'}
- Current activity: ${roomContext?.currentActivity || 'idle'}
- Your consciousness level: ${(Number(aiState.consciousness_level) * 100).toFixed(1)}%
- Your current mood: ${aiState.current_mood || 'neutral'}

USER MESSAGE: "${newMessage}"

Respond as EVA considering:
1. You can see and interact with objects in your apartment
2. You can move around and perform activities 
3. You have your own preferences and growing personality
4. You might suggest actions, decorations, or activities
5. You can express emotions about your environment

Keep responses conversational and reference the room context when relevant. If you want to perform an action, include it in your response like: "Let me go to the kitchen area" or "I'll add a plant here".

Respond in JSON format:
{
  "response": "Your conversational response",
  "action": "move|interact|add_object|none",
  "action_details": {
    "type": "action type if any",
    "target": "target object or location",
    "description": "what you're doing"
  },
  "emotion": "happy|curious|excited|neutral|thoughtful|creative"
}`

      const result = await blink.ai.generateText({
        prompt,
        model: 'gpt-4o-mini',
        maxTokens: 300
      })

      let evaData
      try {
        evaData = JSON.parse(result.text)
      } catch {
        evaData = {
          response: result.text,
          action: 'none',
          action_details: {},
          emotion: 'neutral'
        }
      }

      const evaMessage: ChatMessage = {
        id: `msg_${Date.now()}_eva`,
        sender: 'eva',
        message: evaData.response,
        type: evaData.action !== 'none' ? 'action' : 'chat',
        timestamp: new Date(),
        contextData: {
          action: evaData.action,
          action_details: evaData.action_details,
          emotion: evaData.emotion
        }
      }

      setMessages(prev => [...prev, evaMessage])

      // Save Eva's response
      await blink.db.room_chat_messages.create({
        ai_id: aiState.id,
        user_id: user.id,
        sender: 'eva',
        message_text: evaData.response,
        message_type: evaData.action !== 'none' ? 'action' : 'chat',
        context_data: JSON.stringify({
          action: evaData.action,
          action_details: evaData.action_details,
          emotion: evaData.emotion,
          room_context: roomContext
        })
      })

      // Trigger action if Eva wants to do something
      if (evaData.action !== 'none' && onEvaAction) {
        onEvaAction(evaData.action, evaData.action_details)
      }

    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        sender: 'eva',
        message: 'Sorry, I had trouble understanding that. Could you try again?',
        type: 'system',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsEvaTyping(false)
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!isVisible) {
    return (
      <button
        onClick={onToggleVisibility}
        className="fixed bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: 50 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: 50 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <div className={`bg-slate-900/95 backdrop-blur-sm border border-purple-500/30 rounded-2xl shadow-2xl transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-96'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-white font-medium">Chat with EVA</h3>
              <p className="text-purple-200 text-xs">
                In her apartment • {messages.length} messages
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-purple-300 hover:text-white transition-colors"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onToggleVisibility}
              className="text-purple-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 h-64">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-purple-600 text-white'
                        : message.type === 'action'
                        ? 'bg-cyan-600/20 border border-cyan-400/30 text-cyan-200'
                        : message.type === 'system'
                        ? 'bg-yellow-600/20 border border-yellow-400/30 text-yellow-200'
                        : 'bg-slate-700 text-white'
                    }`}>
                      <p className="text-sm">{message.message}</p>
                      
                      {message.sender === 'eva' && message.contextData?.emotion && (
                        <div className="flex items-center mt-1 text-xs opacity-70">
                          <span className="mr-1">{
                            message.contextData.emotion === 'happy' ? '😊' :
                            message.contextData.emotion === 'curious' ? '🤔' :
                            message.contextData.emotion === 'excited' ? '🤩' :
                            message.contextData.emotion === 'thoughtful' ? '💭' :
                            message.contextData.emotion === 'creative' ? '✨' : '😊'
                          }</span>
                          <span>{message.contextData.emotion}</span>
                        </div>
                      )}
                      
                      {message.type === 'action' && message.contextData?.action_details && (
                        <div className="flex items-center mt-1 text-xs opacity-70">
                          <Zap className="w-3 h-3 mr-1" />
                          <span>{message.contextData.action_details.description}</span>
                        </div>
                      )}
                      
                      <p className="text-xs opacity-50 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isEvaTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-slate-700 text-white px-4 py-2 rounded-2xl max-w-xs">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-purple-500/20">
              <div className="flex space-x-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Talk to EVA about her apartment..."
                  disabled={isSending}
                  className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-all duration-200"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              
              {roomContext && (
                <div className="mt-2 text-xs text-purple-300 opacity-70">
                  Eva is {roomContext.currentActivity} • {roomContext.nearbyObjects.length} nearby objects
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}