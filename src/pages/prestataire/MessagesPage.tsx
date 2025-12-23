/**
 * MessagesPage (Prestataire)
 * 
 * Page de messagerie pour les prestataires.
 * Permet de communiquer avec les clients.
 */

import { useState, useEffect, useRef } from 'react';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  MessageSquare,
  Search,
  Send,
  User,
  Clock,
  Check,
  CheckCheck,
  Loader2,
  Phone,
  Video,
  MoreVertical,
  Archive,
  Trash2,
  Bell,
  BellOff,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

// ==========================================
// TYPES
// ==========================================

interface Conversation {
  id: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    isFromMe: boolean;
    read: boolean;
  };
  unreadCount: number;
  appointmentInfo?: {
    serviceName: string;
    date: string;
  };
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  read: boolean;
}

// ==========================================
// MOCK DATA
// ==========================================

const mockConversations: Conversation[] = [
  {
    id: '1',
    client: { id: '1', firstName: 'Sophie', lastName: 'Martin' },
    lastMessage: {
      content: 'Parfait, à demain alors !',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      isFromMe: false,
      read: false,
    },
    unreadCount: 2,
    appointmentInfo: { serviceName: 'Coupe femme', date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() },
  },
  {
    id: '2',
    client: { id: '2', firstName: 'Pierre', lastName: 'Durand' },
    lastMessage: {
      content: 'D\'accord, je vous confirme le créneau',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isFromMe: true,
      read: true,
    },
    unreadCount: 0,
  },
  {
    id: '3',
    client: { id: '3', firstName: 'Julie', lastName: 'Petit' },
    lastMessage: {
      content: 'Merci beaucoup pour la coupe, je suis ravie !',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      isFromMe: false,
      read: true,
    },
    unreadCount: 0,
  },
  {
    id: '4',
    client: { id: '4', firstName: 'Marc', lastName: 'Bernard' },
    lastMessage: {
      content: 'Est-ce que vous auriez un créneau cette semaine ?',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      isFromMe: false,
      read: true,
    },
    unreadCount: 0,
  },
];

const mockMessages: Record<string, Message[]> = {
  '1': [
    { id: '1', content: 'Bonjour, j\'aimerais confirmer mon rendez-vous pour demain', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), senderId: '1', read: true },
    { id: '2', content: 'Bonjour Sophie ! Oui, votre rendez-vous est bien confirmé pour demain à 14h.', createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(), senderId: 'me', read: true },
    { id: '3', content: 'Super merci ! J\'aurais aussi une question sur la coloration', createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), senderId: '1', read: true },
    { id: '4', content: 'Bien sûr, je vous écoute !', createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), senderId: 'me', read: true },
    { id: '5', content: 'Parfait, à demain alors !', createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), senderId: '1', read: false },
  ],
  '2': [
    { id: '1', content: 'Bonjour, est-ce que vous avez des disponibilités cette semaine ?', createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), senderId: '2', read: true },
    { id: '2', content: 'Bonjour Pierre ! Oui, j\'ai un créneau mercredi à 10h ou jeudi à 15h.', createdAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(), senderId: 'me', read: true },
    { id: '3', content: 'Jeudi 15h me conviendrait parfaitement', createdAt: new Date(Date.now() - 2.2 * 60 * 60 * 1000).toISOString(), senderId: '2', read: true },
    { id: '4', content: 'D\'accord, je vous confirme le créneau', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), senderId: 'me', read: true },
  ],
};

// ==========================================
// HELPERS
// ==========================================

const formatMessageTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (isToday(date)) {
    return format(date, 'HH:mm');
  }
  if (isYesterday(date)) {
    return 'Hier';
  }
  return format(date, 'd MMM', { locale: fr });
};

const formatMessageDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (isToday(date)) {
    return "Aujourd'hui";
  }
  if (isYesterday(date)) {
    return 'Hier';
  }
  return format(date, 'EEEE d MMMM', { locale: fr });
};

// ==========================================
// CONVERSATION LIST ITEM
// ==========================================

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  const clientName = `${conversation.client.firstName} ${conversation.client.lastName}`;
  const initials = `${conversation.client.firstName[0]}${conversation.client.lastName[0]}`;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-3 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left',
        isActive && 'bg-muted'
      )}
    >
      <div className="relative">
        <Avatar>
          <AvatarImage src={conversation.client.avatar} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        {conversation.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
            {conversation.unreadCount}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={cn('font-medium truncate', conversation.unreadCount > 0 && 'font-semibold')}>
            {clientName}
          </span>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatMessageTime(conversation.lastMessage.createdAt)}
          </span>
        </div>
        
        {conversation.appointmentInfo && (
          <Badge variant="secondary" className="text-xs mt-1">
            📅 {conversation.appointmentInfo.serviceName}
          </Badge>
        )}
        
        <p className={cn(
          'text-sm truncate mt-1',
          conversation.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
        )}>
          {conversation.lastMessage.isFromMe && (
            <span className="text-muted-foreground">Vous: </span>
          )}
          {conversation.lastMessage.content}
        </p>
      </div>
    </button>
  );
}

// ==========================================
// MESSAGE BUBBLE
// ==========================================

interface MessageBubbleProps {
  message: Message;
  isFromMe: boolean;
  showDate: boolean;
  dateLabel: string;
}

function MessageBubble({ message, isFromMe, showDate, dateLabel }: MessageBubbleProps) {
  return (
    <>
      {showDate && (
        <div className="flex justify-center my-4">
          <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {dateLabel}
          </span>
        </div>
      )}
      <div className={cn('flex', isFromMe ? 'justify-end' : 'justify-start')}>
        <div
          className={cn(
            'max-w-[70%] rounded-2xl px-4 py-2',
            isFromMe
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-muted rounded-bl-md'
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          <div className={cn(
            'flex items-center justify-end gap-1 mt-1',
            isFromMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}>
            <span className="text-xs">
              {format(new Date(message.createdAt), 'HH:mm')}
            </span>
            {isFromMe && (
              message.read ? (
                <CheckCheck className="h-3 w-3" />
              ) : (
                <Check className="h-3 w-3" />
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function MessagesPage() {
  const { user } = useAuthStore();
  const [conversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      const conversationMessages = mockMessages[selectedConversation.id] || [];
      setMessages(conversationMessages);
    }
  }, [selectedConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    const name = `${conv.client.firstName} ${conv.client.lastName}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setIsSending(true);
    
    const newMsg: Message = {
      id: Date.now().toString(),
      content: newMessage,
      createdAt: new Date().toISOString(),
      senderId: 'me',
      read: false,
    };

    setMessages((prev) => [...prev, newMsg]);
    setNewMessage('');

    // Simulate API call
    await new Promise((r) => setTimeout(r, 500));
    setIsSending(false);
    inputRef.current?.focus();
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Unread count
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground">
          {totalUnread > 0 
            ? `${totalUnread} message${totalUnread > 1 ? 's' : ''} non lu${totalUnread > 1 ? 's' : ''}`
            : 'Communiquez avec vos clients'
          }
        </p>
      </div>

      {/* Main Content */}
      <Card className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-80 border-r flex flex-col">
          {/* Search */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Conversation List */}
          <ScrollArea className="flex-1">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Aucune conversation
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={selectedConversation?.id === conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                />
              ))
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedConversation.client.avatar} />
                    <AvatarFallback>
                      {selectedConversation.client.firstName[0]}
                      {selectedConversation.client.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {selectedConversation.client.firstName} {selectedConversation.client.lastName}
                    </h3>
                    {selectedConversation.appointmentInfo && (
                      <p className="text-sm text-muted-foreground">
                        RDV: {selectedConversation.appointmentInfo.serviceName}
                      </p>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <User className="h-4 w-4 mr-2" />
                      Voir le profil
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <BellOff className="h-4 w-4 mr-2" />
                      Désactiver les notifications
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Archive className="h-4 w-4 mr-2" />
                      Archiver
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {messages.map((message, index) => {
                    const isFromMe = message.senderId === 'me';
                    const currentDate = formatMessageDate(message.createdAt);
                    const previousDate = index > 0 ? formatMessageDate(messages[index - 1].createdAt) : null;
                    const showDate = currentDate !== previousDate;

                    return (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isFromMe={isFromMe}
                        showDate={showDate}
                        dateLabel={currentDate}
                      />
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex items-center gap-2">
                  <Input
                    ref={inputRef}
                    placeholder="Écrivez votre message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isSending}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isSending}
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={<MessageSquare className="h-12 w-12" />}
                title="Sélectionnez une conversation"
                description="Choisissez une conversation dans la liste pour commencer à discuter."
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
