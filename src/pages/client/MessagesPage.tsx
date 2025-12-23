/**
 * Page Messages (Client)
 * 
 * Interface de messagerie avec les prestataires.
 * Liste des conversations et fil de discussion.
 */

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Send, Search, ArrowLeft, MessageSquare } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useMessageSocket } from '@/hooks/useSocket';
import { messagesService } from '@/services';
import type { Message, Appointment } from '@/types';
import {
  Card,
  CardContent,
  Button,
  Input,
  Avatar,
  Badge,
  Separator,
} from '@/components/ui';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/shared';

// ==========================================
// TYPES
// ==========================================

// Socket message type for new messages
interface SocketMessage {
  id: string;
  appointmentId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface Conversation {
  appointmentId: string;
  appointment: Appointment;
  lastMessage: Message | null;
  unreadCount: number;
}

// ==========================================
// HELPERS
// ==========================================

function formatMessageDate(dateString: string): string {
  const date = new Date(dateString);
  if (isToday(date)) {
    return format(date, 'HH:mm');
  }
  if (isYesterday(date)) {
    return 'Hier';
  }
  return format(date, 'dd/MM/yy');
}

function formatMessageTime(dateString: string): string {
  return format(new Date(dateString), 'HH:mm');
}

// ==========================================
// CONVERSATION LIST
// ==========================================

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isLoading: boolean;
}

function ConversationList({
  conversations,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
  isLoading,
}: ConversationListProps) {
  const filtered = conversations.filter((conv) => {
    const name = conv.appointment.prestataire?.businessName ||
      `${conv.appointment.prestataire?.firstName} ${conv.appointment.prestataire?.lastName}`;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {searchQuery ? 'Aucun résultat' : 'Aucune conversation'}
          </div>
        ) : (
          filtered.map((conv) => {
            const prestataire = conv.appointment.prestataire;
            const name = prestataire?.businessName ||
              `${prestataire?.firstName} ${prestataire?.lastName}`;
            const isSelected = selectedId === conv.appointmentId;

            return (
              <button
                key={conv.appointmentId}
                onClick={() => onSelect(conv.appointmentId)}
                className={cn(
                  'w-full p-4 flex items-start gap-3 hover:bg-accent transition-colors text-left',
                  isSelected && 'bg-accent'
                )}
              >
                <Avatar
                  src={prestataire?.avatar}
                  firstName={prestataire?.firstName}
                  lastName={prestataire?.lastName}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{name}</p>
                    {conv.lastMessage && (
                      <span className="text-xs text-muted-foreground">
                        {formatMessageDate(conv.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {conv.appointment.service?.name}
                  </p>
                  {conv.lastMessage && (
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {conv.lastMessage.content}
                    </p>
                  )}
                </div>
                {conv.unreadCount > 0 && (
                  <Badge className="shrink-0">{conv.unreadCount}</Badge>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ==========================================
// MESSAGE THREAD
// ==========================================

interface MessageThreadProps {
  appointmentId: string;
  messages: Message[];
  onSend: (content: string) => void;
  onBack: () => void;
  isSending: boolean;
  appointment: Appointment | null;
}

function MessageThread({
  appointmentId,
  messages,
  onSend,
  onBack,
  isSending,
  appointment,
}: MessageThreadProps) {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && !isSending) {
      onSend(newMessage.trim());
      setNewMessage('');
    }
  };

  const prestataire = appointment?.prestataire;
  const name = prestataire?.businessName ||
    `${prestataire?.firstName} ${prestataire?.lastName}`;

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  messages.forEach((msg) => {
    const date = format(new Date(msg.createdAt), 'yyyy-MM-dd');
    const group = groupedMessages.find((g) => g.date === date);
    if (group) {
      group.messages.push(msg);
    } else {
      groupedMessages.push({ date, messages: [msg] });
    }
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar
          src={prestataire?.avatar}
          firstName={prestataire?.firstName}
          lastName={prestataire?.lastName}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {appointment?.service?.name}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {groupedMessages.map((group) => (
          <div key={group.date}>
            {/* Date separator */}
            <div className="flex items-center gap-4 my-4">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">
                {isToday(new Date(group.date))
                  ? "Aujourd'hui"
                  : isYesterday(new Date(group.date))
                  ? 'Hier'
                  : format(new Date(group.date), 'd MMMM yyyy', { locale: fr })}
              </span>
              <Separator className="flex-1" />
            </div>

            {/* Messages */}
            {group.messages.map((msg) => {
              const isOwn = msg.senderId === user?.id;
              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex',
                    isOwn ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[70%] rounded-2xl px-4 py-2',
                      isOwn
                        ? 'bg-cyan-500 text-white rounded-br-sm'
                        : 'bg-muted rounded-bl-sm'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p
                      className={cn(
                        'text-[10px] mt-1',
                        isOwn ? 'text-cyan-100' : 'text-muted-foreground'
                      )}
                    >
                      {formatMessageTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Écrivez votre message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending}
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim() || isSending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================

export function ClientMessagesPage() {
  const [searchParams] = useSearchParams();
  const initialAppointmentId = searchParams.get('appointmentId');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(initialAppointmentId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const data = await messagesService.getConversations();
        setConversations(data);
      } catch (error) {
        console.error('Failed to load conversations:', error);
      } finally {
        setIsLoadingConversations(false);
      }
    };
    loadConversations();
  }, []);

  // Load messages when conversation selected
  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const response = await messagesService.getMessagesByAppointment(selectedId);
        setMessages(response.data || []);
        // Mark as read
        await messagesService.markAsRead(selectedId);
        // Update unread count in conversations
        setConversations((prev) =>
          prev.map((conv) =>
            conv.appointmentId === selectedId ? { ...conv, unreadCount: 0 } : conv
          )
        );
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setIsLoadingMessages(false);
      }
    };
    loadMessages();
  }, [selectedId]);

  // WebSocket for real-time messages
  useMessageSocket<SocketMessage>((socketMessage) => {
    // Convert socket message to full Message type
    const newMessage: Message = {
      id: socketMessage.id,
      appointmentId: socketMessage.appointmentId,
      senderId: socketMessage.senderId,
      content: socketMessage.content,
      read: false,
      readAt: null,
      flagged: false,
      flagReason: null,
      createdAt: socketMessage.createdAt,
    };

    if (newMessage.appointmentId === selectedId) {
      setMessages((prev) => [...prev, newMessage]);
    }
    // Update conversation list
    setConversations((prev) =>
      prev.map((conv) =>
        conv.appointmentId === newMessage.appointmentId
          ? {
              ...conv,
              lastMessage: newMessage,
              unreadCount: conv.appointmentId === selectedId ? 0 : conv.unreadCount + 1,
            }
          : conv
      )
    );
  });

  // Send message
  const handleSend = async (content: string) => {
    if (!selectedId) return;

    setIsSending(true);
    try {
      const newMessage = await messagesService.sendMessage({
        appointmentId: selectedId,
        content,
      });
      setMessages((prev) => [...prev, newMessage]);
      // Update last message in conversation
      setConversations((prev) =>
        prev.map((conv) =>
          conv.appointmentId === selectedId
            ? { ...conv, lastMessage: newMessage }
            : conv
        )
      );
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const selectedConversation = conversations.find((c) => c.appointmentId === selectedId);

  return (
    <div className="h-[calc(100vh-8rem)]">
      <Card className="h-full overflow-hidden">
        <CardContent className="p-0 h-full">
          <div className="flex h-full">
            {/* Conversation list */}
            <div
              className={cn(
                'w-full md:w-80 lg:w-96 border-r flex-shrink-0',
                selectedId && 'hidden md:block'
              )}
            >
              <ConversationList
                conversations={conversations}
                selectedId={selectedId}
                onSelect={setSelectedId}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                isLoading={isLoadingConversations}
              />
            </div>

            {/* Message thread */}
            <div className={cn('flex-1', !selectedId && 'hidden md:flex')}>
              {selectedId ? (
                isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Spinner size="lg" />
                  </div>
                ) : (
                  <MessageThread
                    appointmentId={selectedId}
                    messages={messages}
                    onSend={handleSend}
                    onBack={() => setSelectedId(null)}
                    isSending={isSending}
                    appointment={selectedConversation?.appointment ?? null}
                  />
                )
              ) : (
                <div className="flex items-center justify-center h-full">
                  <EmptyState
                    icon={MessageSquare}
                    title="Sélectionnez une conversation"
                    description="Choisissez une conversation pour voir les messages"
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ClientMessagesPage;
