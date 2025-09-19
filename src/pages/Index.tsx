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
  avatar_emoji: string
  team_id?: number
  team_name?: string
  team_color?: string
  joined_at: string
  is_admin?: boolean
}

interface ChatMessage {
  id: string
  username: string
  message: string
  created_at: string
}

interface LobbyState {
  game_started: boolean
  max_players: number
}

const LOBBY_API = 'https://functions.poehali.dev/d177a704-fb7c-4813-81a3-81d57d92cbf2'

const Index = () => {
  const [players, setPlayers] = useState<Player[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [lobbyState, setLobbyState] = useState<LobbyState>({ game_started: false, max_players: 10 })
  const [newMessage, setNewMessage] = useState('')
  const [currentUser, setCurrentUser] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [isJoined, setIsJoined] = useState(false)
  const [userLevel, setUserLevel] = useState(1)
  const [userAvatar, setUserAvatar] = useState('🎮')
  const [showAvatarGallery, setShowAvatarGallery] = useState(false)

  const avatars = ['🎮', '⚡', '🚀', '💫', '⭐', '🔥', '👾', '🎯', '⚔️', '🛡️', '🤖', '👽', '💀', '🎭', '🐲', '🦾', '👹', '🤡', '🦸', '🧙']
  const avatarImages = [
    '/img/9b80cde4-6702-47fc-8c0f-edceee1edb3a.jpg'
  ]

  // Загрузка состояния лобби
  const loadLobbyState = async () => {
    try {
      const response = await fetch(LOBBY_API)
      const data = await response.json()
      
      if (data.players) setPlayers(data.players)
      if (data.messages) setMessages(data.messages)
      if (data.lobby) setLobbyState(data.lobby)
    } catch (error) {
      console.error('Ошибка загрузки лобби:', error)
    }
  }

  // Присоединение к лобби
  const joinLobby = async () => {
    if (!currentUser.trim()) return

    try {
      const response = await fetch(LOBBY_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          username: currentUser,
          level: userLevel,
          avatar: userAvatar
        })
      })

      const data = await response.json()
      if (data.success) {
        setSessionId(data.session_id)
        setIsJoined(true)
        localStorage.setItem('lobbySessionId', data.session_id)
        localStorage.setItem('lobbyUsername', currentUser)
        loadLobbyState()
      }
    } catch (error) {
      console.error('Ошибка присоединения:', error)
    }
  }

  // Отправка сообщения
  const sendMessage = async () => {
    if (!newMessage.trim() || !isJoined) return

    try {
      const response = await fetch(LOBBY_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_message',
          username: currentUser,
          message: newMessage
        })
      })

      if (response.ok) {
        setNewMessage('')
        loadLobbyState()
      }
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error)
    }
  }

  // Назначение в команду
  const assignToTeam = async (playerId: string, teamId: number) => {
    try {
      await fetch(LOBBY_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign_team',
          player_id: playerId,
          team_id: teamId
        })
      })
      loadLobbyState()
    } catch (error) {
      console.error('Ошибка назначения команды:', error)
    }
  }

  // Выгнать игрока (только для админа)
  const kickPlayer = async (playerId: string) => {
    if (currentUser !== 'neflixxx666') return
    
    try {
      await fetch(LOBBY_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'kick_player',
          admin_username: currentUser,
          target_player_id: playerId
        })
      })
      loadLobbyState()
    } catch (error) {
      console.error('Ошибка выгона игрока:', error)
    }
  }

  // Проверка прав админа
  const isCurrentUserAdmin = currentUser === 'neflixxx666'

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (!isJoined) {
        joinLobby()
      } else {
        sendMessage()
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-acid-green'
      case 'ingame': return 'bg-acid-purple'
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

  // Разделение игроков по командам
  const teamAPlayers = players.filter(p => p.team_id === 1)
  const teamBPlayers = players.filter(p => p.team_id === 2)
  const unassignedPlayers = players.filter(p => !p.team_id)

  useEffect(() => {
    document.body.classList.add('dark')
    
    // Восстановление сессии
    const savedSessionId = localStorage.getItem('lobbySessionId')
    const savedUsername = localStorage.getItem('lobbyUsername')
    
    if (savedSessionId && savedUsername) {
      setSessionId(savedSessionId)
      setCurrentUser(savedUsername)
      setIsJoined(true)
    }
    
    loadLobbyState()
    
    // Автообновление каждые 3 секунды
    const interval = setInterval(loadLobbyState, 3000)
    return () => clearInterval(interval)
  }, [])

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-gaming-bg flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-acid-green to-acid-purple rounded-full mx-auto mb-4 flex items-center justify-center">
              <Icon name="Gamepad2" size={32} className="text-black" />
            </div>
            <CardTitle className="text-2xl text-acid-green">
              OrkeN Lobby 5 vs 5
            </CardTitle>
            <p className="text-muted-foreground">Присоединяйся к игре</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-acid-green mb-2 block">Никнейм</label>
              <Input
                placeholder="Введи свой никнейм..."
                value={currentUser}
                onChange={(e) => setCurrentUser(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-gaming-dark/50 border-border/30 focus:border-acid-green/50 text-foreground"
              />
            </div>
            
            <div>
              <label className="text-sm text-acid-green mb-2 block">Уровень (1-100)</label>
              <Input
                type="number"
                min="1"
                max="100"
                value={userLevel}
                onChange={(e) => setUserLevel(Number(e.target.value))}
                className="bg-gaming-dark/50 border-border/30 focus:border-acid-green/50 text-foreground"
              />
            </div>
            
            <div>
              <label className="text-sm text-acid-green mb-2 block">Аватар</label>
              <div className="space-y-3">
                <div className="grid grid-cols-5 gap-2">
                  {avatars.slice(0, 10).map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setUserAvatar(emoji)}
                      className={`p-2 rounded border-2 text-xl hover:bg-gaming-dark/50 transition ${
                        userAvatar === emoji ? 'border-acid-green' : 'border-border/30'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                
                <Button
                  type="button"
                  onClick={() => setShowAvatarGallery(!showAvatarGallery)}
                  className="w-full bg-acid-purple/20 text-acid-purple border border-acid-purple/30 hover:bg-acid-purple/30"
                >
                  <Icon name="Image" size={16} className="mr-2" />
                  {showAvatarGallery ? 'Скрыть галерею' : 'Показать больше аватаров'}
                </Button>
                
                {showAvatarGallery && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-5 gap-2">
                      {avatars.slice(10).map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => setUserAvatar(emoji)}
                          className={`p-2 rounded border-2 text-xl hover:bg-gaming-dark/50 transition ${
                            userAvatar === emoji ? 'border-acid-green' : 'border-border/30'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    
                    <div className="border-t border-border/30 pt-3">
                      <p className="text-xs text-acid-green mb-2">Кибер-аватары</p>
                      <div className="relative">
                        <img 
                          src={avatarImages[0]} 
                          alt="Gaming avatars"
                          className="w-full h-32 object-cover rounded-lg border border-acid-green/30"
                        />
                        <div className="absolute inset-0 bg-gaming-bg/80 rounded-lg flex items-center justify-center">
                          <p className="text-acid-green text-sm font-medium">Скоро доступно</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <Button 
              onClick={joinLobby}
              disabled={!currentUser.trim()}
              className="w-full bg-gradient-to-r from-acid-green to-acid-purple hover:from-acid-green/80 hover:to-acid-purple/80 text-black font-bold"
            >
              <Icon name="Play" size={16} className="mr-2" />
              ВОЙТИ В ЛОББИ
            </Button>
            
            <div className="text-center text-xs text-muted-foreground">
              Игроков в лобби: {players.length}/10
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gaming-bg text-foreground p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 from-acid-green to-acid-purple rounded-lg flex items-center justify-center bg-[#05ff0000]">
            <Icon name="Gamepad2" size={24} className="text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-acid-green">
              OrkeN Lobby 5 vs 5
            </h1>
            <p className="text-[#1cff00]">Кислотное игровое лобби</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Badge className="bg-acid-green/20 text-acid-green border-acid-green">
            <Icon name="Users" size={16} className="mr-1" />
            {players.filter(p => p.status === 'online').length} онлайн
          </Badge>
          <Badge className="bg-toxic-yellow/20 text-toxic-yellow border-toxic-yellow">
            {currentUser}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Команда А */}
        <div>
          <Card className="bg-card/50 backdrop-blur-sm border-acid-green/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-acid-green">
                <Icon name="Shield" size={20} />
                <span>КОМАНДА А</span>
                <Badge variant="outline" className="ml-auto border-acid-green text-acid-green">
                  {teamAPlayers.length}/5
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {teamAPlayers.map((player) => (
                <div key={player.id} className="p-3 rounded-lg bg-gaming-dark/50 border border-acid-green/20">
                  <div className="flex items-center space-x-3">
                    <div className="text-lg">{player.avatar_emoji}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-acid-green">{player.username}</h3>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(player.status)}`}></div>
                        <span className="text-xs text-muted-foreground">LVL {player.level}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {teamAPlayers.length < 5 && (
                <div className="p-3 rounded-lg border-2 border-dashed border-acid-green/30 text-center">
                  <p className="text-xs text-muted-foreground">Ждем игроков...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Команда Б */}
        <div>
          <Card className="bg-card/50 backdrop-blur-sm border-acid-purple/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-acid-purple">
                <Icon name="Sword" size={20} />
                <span>КОМАНДА Б</span>
                <Badge variant="outline" className="ml-auto border-acid-purple text-acid-purple">
                  {teamBPlayers.length}/5
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {teamBPlayers.map((player) => (
                <div key={player.id} className="p-3 rounded-lg bg-gaming-dark/50 border border-acid-purple/20">
                  <div className="flex items-center space-x-3">
                    <div className="text-lg">{player.avatar_emoji}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-acid-purple">{player.username}</h3>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(player.status)}`}></div>
                        <span className="text-xs text-muted-foreground">LVL {player.level}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {teamBPlayers.length < 5 && (
                <div className="p-3 rounded-lg border-2 border-dashed border-acid-purple/30 text-center">
                  <p className="text-xs text-muted-foreground">Ждем игроков...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Неназначенные игроки */}
        <div>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icon name="Users" size={20} className="text-toxic-yellow" />
                <span>ЛОББИ</span>
                <Badge variant="secondary" className="ml-auto bg-toxic-yellow/20 text-toxic-yellow">
                  {unassignedPlayers.length} игроков
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {unassignedPlayers.map((player) => (
                <div key={player.id} className="p-3 rounded-lg bg-gaming-dark/50 border border-border/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg">{player.avatar_emoji}</div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-foreground">{player.username}</h3>
                          {player.is_admin && (
                            <Badge className="text-xs bg-toxic-yellow/20 text-toxic-yellow border-toxic-yellow px-1 py-0">
                              ADMIN
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(player.status)}`}></div>
                          <span className="text-xs text-muted-foreground">LVL {player.level}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => assignToTeam(player.id, 1)}
                      className="flex-1 h-7 text-xs bg-acid-green/20 text-acid-green border border-acid-green/30 hover:bg-acid-green/30"
                    >
                      А
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => assignToTeam(player.id, 2)}
                      className="flex-1 h-7 text-xs bg-acid-purple/20 text-acid-purple border border-acid-purple/30 hover:bg-acid-purple/30"
                    >
                      Б
                    </Button>
                    {isCurrentUserAdmin && player.username !== 'neflixxx666' && (
                      <Button 
                        size="sm" 
                        onClick={() => kickPlayer(player.id)}
                        className="h-7 text-xs bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                        title="Выгнать игрока"
                      >
                        <Icon name="X" size={12} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Чат */}
        <div>
          <Card className="h-[600px] bg-card/50 backdrop-blur-sm border-border/50 flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center space-x-2">
                <Icon name="MessageSquare" size={20} className="text-toxic-yellow" />
                <span>ЧАТ</span>
                <div className="w-2 h-2 bg-acid-green rounded-full animate-pulse ml-auto"></div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 px-6">
                <div className="space-y-3 py-4">
                  {messages.map((message) => (
                    <div key={message.id} className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-toxic-yellow">
                          {message.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.created_at).toLocaleTimeString()}
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
                    placeholder="Написать в чат..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 bg-gaming-dark/50 border-border/30 focus:border-toxic-yellow/50"
                  />
                  <Button 
                    onClick={sendMessage}
                    size="sm"
                    className="bg-gradient-to-r from-acid-green to-acid-purple hover:from-acid-green/80 hover:to-acid-purple/80 text-black"
                  >
                    <Icon name="Send" size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Статус игры */}
      {teamAPlayers.length === 5 && teamBPlayers.length === 5 && (
        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-acid-green to-acid-purple p-1 rounded-lg inline-block">
            <div className="bg-gaming-bg px-6 py-3 rounded-lg">
              <p className="text-xl font-bold bg-gradient-to-r from-acid-green to-acid-purple bg-clip-text text-transparent">
                🔥 ЛОББИ ЗАПОЛНЕНО! ГОТОВЫ К БОЮ! 🔥
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Index