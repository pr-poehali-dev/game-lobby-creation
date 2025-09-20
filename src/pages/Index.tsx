import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import Icon from '@/components/ui/icon'

interface Player {
  id: string
  username: string
  status: 'online' | 'ingame' | 'away'
  level: number
  avatar: string
  joinedAt: Date
}

interface ChatMessage {
  id: string
  username: string
  message: string
  timestamp: Date
}

const mockPlayers: Player[] = [
  { id: '1', username: 'CyberNinja', status: 'online', level: 25, avatar: '🎮', joinedAt: new Date() },
  { id: '2', username: 'NeonHunter', status: 'ingame', level: 42, avatar: '⚡', joinedAt: new Date() },
  { id: '3', username: 'QuantumGamer', status: 'online', level: 18, avatar: '🚀', joinedAt: new Date() },
  { id: '4', username: 'ElectroMage', status: 'away', level: 33, avatar: '💫', joinedAt: new Date() },
  { id: '5', username: 'TechWarrior', status: 'online', level: 29, avatar: '⭐', joinedAt: new Date() },
  { id: '6', username: 'PixelMaster', status: 'ingame', level: 51, avatar: '🔥', joinedAt: new Date() },
]

const mockMessages: ChatMessage[] = [
  { id: '1', username: 'CyberNinja', message: 'Готов к новой игре!', timestamp: new Date() },
  { id: '2', username: 'NeonHunter', message: 'Кто-то хочет команду?', timestamp: new Date() },
  { id: '3', username: 'QuantumGamer', message: 'Отличная игра была!', timestamp: new Date() },
]

const Index = () => {
  const [players, setPlayers] = useState<Player[]>(mockPlayers)
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages)
  const [newMessage, setNewMessage] = useState('')
  const [currentUser] = useState('GamerPro')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-neon-cyan'
      case 'ingame': return 'bg-neon-pink'
      case 'away': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Онлайн'
      case 'ingame': return 'В игре'
      case 'away': return 'Отошел'
      default: return 'Офлайн'
    }
  }

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        username: currentUser,
        message: newMessage,
        timestamp: new Date()
      }
      setMessages([...messages, message])
      setNewMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage()
    }
  }

  useEffect(() => {
    document.body.classList.add('dark')
  }, [])

  return (
    <div className="min-h-screen bg-gaming-bg text-foreground p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-lg flex items-center justify-center">
            <Icon name="Gamepad2" size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-cyan to-neon-pink bg-clip-text text-transparent">
              CYBER LOBBY
            </h1>
            <p className="text-muted-foreground">Игровое лобби нового поколения</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan">
            <Icon name="Users" size={16} className="mr-1" />
            {players.filter(p => p.status === 'online').length} онлайн
          </Badge>
          <Button className="bg-gradient-to-r from-neon-cyan to-neon-pink hover:from-neon-cyan/80 hover:to-neon-pink/80 text-white">
            <Icon name="Settings" size={16} className="mr-2" />
            Настройки
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Players List */}
        <div className="lg:col-span-2">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icon name="Users" size={20} className="text-neon-cyan" />
                <span>Участники лобби</span>
                <Badge variant="secondary" className="ml-auto bg-neon-pink/20 text-neon-pink">
                  {players.length} игроков
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="p-4 rounded-lg bg-gaming-dark/50 border border-border/30 hover:border-neon-cyan/50 transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/20"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gaming-secondary to-gaming-dark rounded-full flex items-center justify-center text-lg">
                          {player.avatar}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{player.username}</h3>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(player.status)}`}></div>
                            <span className="text-sm text-muted-foreground">{getStatusText(player.status)}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-neon-cyan/30 text-neon-cyan">
                        LVL {player.level}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Присоединился недавно
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-7 text-xs border-neon-pink/30 text-neon-pink hover:bg-neon-pink/10"
                      >
                        <Icon name="MessageCircle" size={12} className="mr-1" />
                        Написать
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat */}
        <div className="lg:col-span-1">
          <Card className="h-[600px] bg-card/50 backdrop-blur-sm border-border/50 flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center space-x-2">
                <Icon name="MessageSquare" size={20} className="text-neon-pink" />
                <span>Общий чат</span>
                <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse ml-auto"></div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 px-6">
                <div className="space-y-3 py-4">
                  {messages.map((message) => (
                    <div key={message.id} className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-neon-cyan">
                          {message.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground bg-gaming-dark/30 rounded-lg px-3 py-2">
                        {message.message}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-4 border-t border-border/30">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Написать сообщение..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 bg-gaming-dark/50 border-border/30 focus:border-neon-cyan/50"
                  />
                  <Button 
                    onClick={sendMessage}
                    size="sm"
                    className="bg-gradient-to-r from-neon-cyan to-neon-pink hover:from-neon-cyan/80 hover:to-neon-pink/80 text-white"
                  >
                    <Icon name="Send" size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 flex flex-wrap gap-4">
        <Button className="bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30">
          <Icon name="Play" size={16} className="mr-2" />
          Быстрая игра
        </Button>
        <Button className="bg-neon-pink/20 text-neon-pink border border-neon-pink/30 hover:bg-neon-pink/30">
          <Icon name="Users" size={16} className="mr-2" />
          Создать команду
        </Button>
        <Button className="bg-gaming-secondary/50 text-foreground border border-border/30 hover:bg-gaming-secondary">
          <Icon name="Trophy" size={16} className="mr-2" />
          Турниры
        </Button>
        <Button className="bg-gaming-secondary/50 text-foreground border border-border/30 hover:bg-gaming-secondary">
          <Icon name="BarChart3" size={16} className="mr-2" />
          Статистика
        </Button>
      </div>
    </div>
  )
}

export default Index