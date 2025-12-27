/**
 * Page Messages (Client)
 * CORRIGÉ - Validation des dates + useEffect
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { format, isToday, isYesterday, isValid, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Send,
  Search,
  ArrowLeft,
  MessageSquare,
  RefreshCw,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  useMessageSocket,
  useMessageNotifications,
  type SocketMessage,
} from "@/hooks/useSocket";
import { messagesService } from "@/services";
import type { Message, Appointment } from "@/types";
import {
  Card,
  CardContent,
  Button,
  Input,
  Avatar,
  Badge,
  Separator,
} from "@/components/ui";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/shared";
import { showError } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/api";

// ==========================================
// TYPES
// ==========================================

interface Conversation {
  appointment: Appointment;
  lastMessage: Message | null;
  unreadCount: number;
}

// ==========================================
// HELPERS - avec validation de date
// ==========================================

/**
 * Parse une date de manière sécurisée
 */
function safeParseDate(dateValue: string | Date | null | undefined): Date | null {
  if (!dateValue) return null;

  try {
    // Si c'est déjà un objet Date valide
    if (dateValue instanceof Date) {
      return isValid(dateValue) ? dateValue : null;
    }

    // Si c'est une chaîne
    if (typeof dateValue === "string") {
      // Essayer parseISO d'abord (format ISO 8601)
      const parsed = parseISO(dateValue);
      if (isValid(parsed)) return parsed;

      // Essayer new Date en fallback
      const fallback = new Date(dateValue);
      if (isValid(fallback)) return fallback;
    }

    return null;
  } catch {
    return null;
  }
}

function formatMessageDate(dateValue: string | Date | null | undefined): string {
  const date = safeParseDate(dateValue);
  if (!date) return "";

  try {
    if (isToday(date)) {
      return format(date, "HH:mm");
    }
    if (isYesterday(date)) {
      return "Hier";
    }
    return format(date, "dd/MM/yy");
  } catch {
    return "";
  }
}

function formatMessageTime(dateValue: string | Date | null | undefined): string {
  const date = safeParseDate(dateValue);
  if (!date) return "";

  try {
    return format(date, "HH:mm");
  } catch {
    return "";
  }
}

function formatDateSeparator(dateValue: string | Date | null | undefined): string {
  const date = safeParseDate(dateValue);
  if (!date) return "";

  try {
    if (isToday(date)) {
      return "Aujourd'hui";
    }
    if (isYesterday(date)) {
      return "Hier";
    }
    return format(date, "d MMMM yyyy", { locale: fr });
  } catch {
    return "";
  }
}

function getDateKey(dateValue: string | Date | null | undefined): string {
  const date = safeParseDate(dateValue);
  if (!date) return "unknown";

  try {
    return format(date, "yyyy-MM-dd");
  } catch {
    return "unknown";
  }
}

/**
 * Normalise une date en string ISO
 */
function normalizeDateToISO(dateValue: string | Date | null | undefined): string {
  if (!dateValue) return new Date().toISOString();

  if (typeof dateValue === "string") {
    return dateValue;
  }

  if (dateValue instanceof Date && isValid(dateValue)) {
    return dateValue.toISOString();
  }

  return new Date().toISOString();
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
    const prestataire = conv.appointment?.prestataire;
    const name =
      prestataire?.businessName ||
      `${prestataire?.firstName || ""} ${prestataire?.lastName || ""}`;
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
            {searchQuery ? "Aucun résultat" : "Aucune conversation"}
          </div>
        ) : (
          filtered.map((conv, index) => {
            const prestataire = conv.appointment?.prestataire;
            const name =
              prestataire?.businessName ||
              `${prestataire?.firstName || ""} ${prestataire?.lastName || ""}`;
            const appointmentId = conv.appointment?.id;
            const isSelected = selectedId === appointmentId;

            return (
              <button
                key={appointmentId || `conv-${index}`}
                onClick={() => appointmentId && onSelect(appointmentId)}
                className={cn(
                  "w-full p-4 flex items-start gap-3 hover:bg-accent transition-colors text-left",
                  isSelected && "bg-accent"
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
                    <p
                      className={cn(
                        "font-medium truncate",
                        conv.unreadCount > 0 && "font-semibold"
                      )}
                    >
                      {name || "Prestataire"}
                    </p>
                    {conv.lastMessage?.createdAt && (
                      <span className="text-xs text-muted-foreground">
                        {formatMessageDate(conv.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {conv.appointment?.service?.name || "Service"}
                  </p>
                  {conv.lastMessage && (
                    <p
                      className={cn(
                        "text-sm truncate mt-1",
                        conv.unreadCount > 0
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      )}
                    >
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
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && !isSending) {
      onSend(newMessage.trim());
      setNewMessage("");
    }
  };

  const prestataire = appointment?.prestataire;
  const name =
    prestataire?.businessName ||
    `${prestataire?.firstName || ""} ${prestataire?.lastName || ""}`;

  // Group messages by date - avec validation
  const groupedMessages: { date: string; label: string; messages: Message[] }[] = [];
  messages.forEach((msg) => {
    const dateKey = getDateKey(msg.createdAt);
    const dateLabel = formatDateSeparator(msg.createdAt);
    const group = groupedMessages.find((g) => g.date === dateKey);
    if (group) {
      group.messages.push(msg);
    } else {
      groupedMessages.push({ date: dateKey, label: dateLabel, messages: [msg] });
    }
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="md:hidden"
        >
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
            {group.label && (
              <div className="flex items-center gap-4 my-4">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">
                  {group.label}
                </span>
                <Separator className="flex-1" />
              </div>
            )}

            {/* Messages */}
            {group.messages.map((msg) => {
              const isOwn = msg.senderId === user?.id;
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex mb-2",
                    isOwn ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[70%] rounded-2xl px-4 py-2",
                      isOwn
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted rounded-bl-sm"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p
                      className={cn(
                        "text-[10px] mt-1",
                        isOwn
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
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
            {isSending ? <Spinner size="sm" /> : <Send className="h-4 w-4" />}
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
  const initialAppointmentId = searchParams.get("appointmentId");
  const { user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialAppointmentId
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // WebSocket handlers
  const handleNewMessage = useCallback(
    (socketMessage: SocketMessage) => {
      // Normaliser la date
      const normalizedCreatedAt = normalizeDateToISO(socketMessage.createdAt);

      if (socketMessage.appointmentId === selectedId) {
        const newMessage: Message = {
          id: socketMessage.id,
          appointmentId: socketMessage.appointmentId,
          senderId: socketMessage.senderId,
          content: socketMessage.content,
          read: socketMessage.senderId === user?.id,
          readAt: null,
          flagged: false,
          flagReason: null,
          createdAt: normalizedCreatedAt,
        };

        setMessages((prev) => {
          if (prev.some((m) => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      }

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.appointment.id === socketMessage.appointmentId) {
            const isCurrentConv = socketMessage.appointmentId === selectedId;
            return {
              ...conv,
              lastMessage: {
                id: socketMessage.id,
                appointmentId: socketMessage.appointmentId,
                senderId: socketMessage.senderId,
                content: socketMessage.content,
                read: isCurrentConv || socketMessage.senderId === user?.id,
                readAt: null,
                flagged: false,
                flagReason: null,
                createdAt: normalizedCreatedAt,
              },
              unreadCount: isCurrentConv
                ? 0
                : conv.unreadCount +
                  (socketMessage.senderId !== user?.id ? 1 : 0),
            };
          }
          return conv;
        })
      );
    },
    [selectedId, user?.id]
  );

  useMessageSocket(selectedId, {
    onNewMessage: handleNewMessage,
    onMessagesRead: (event) => {
      if (event.appointmentId === selectedId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId === user?.id
              ? { ...m, read: true, readAt: new Date().toISOString() }
              : m
          )
        );
      }
    },
  });

  useMessageNotifications((notification) => {
    if (notification.appointmentId !== selectedId) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.appointment.id === notification.appointmentId
            ? { ...conv, unreadCount: conv.unreadCount + 1 }
            : conv
        )
      );
    }
  });

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const response = await messagesService.getConversations();
      setConversations(response.data || []);
    } catch (error) {
      console.error("Failed to load conversations:", error);
      showError(getErrorMessage(error));
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  // useEffect pour charger les conversations
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages
  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const response = await messagesService.getMessagesByAppointment(
          selectedId
        );
        setMessages(response.data || []);
        await messagesService.markAsRead(selectedId);
        setConversations((prev) =>
          prev.map((conv) =>
            conv.appointment.id === selectedId
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        );
      } catch (error) {
        console.error("Failed to load messages:", error);
        showError(getErrorMessage(error));
      } finally {
        setIsLoadingMessages(false);
      }
    };
    loadMessages();
  }, [selectedId]);

  // Send message - avec normalisation de la date
  const handleSend = async (content: string) => {
    if (!selectedId) return;

    setIsSending(true);
    try {
      const newMessage = await messagesService.sendMessage({
        appointmentId: selectedId,
        content,
      });

      // Normaliser createdAt en string ISO
      const normalizedMessage: Message = {
        ...newMessage,
        createdAt: normalizeDateToISO(newMessage.createdAt),
      };

      setMessages((prev) => {
        if (prev.some((m) => m.id === normalizedMessage.id)) return prev;
        return [...prev, normalizedMessage];
      });

      setConversations((prev) =>
        prev.map((conv) =>
          conv.appointment.id === selectedId
            ? { ...conv, lastMessage: normalizedMessage }
            : conv
        )
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      showError(getErrorMessage(error));
    } finally {
      setIsSending(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadConversations();
    setIsRefreshing(false);
  };

  const selectedConversation = conversations.find(
    (c) => c.appointment.id === selectedId
  );

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Messages</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")}
          />
          Actualiser
        </Button>
      </div>

      <Card className="h-[calc(100%-3rem)] overflow-hidden">
        <CardContent className="p-0 h-full">
          <div className="flex h-full">
            {/* Conversation list */}
            <div
              className={cn(
                "w-full md:w-80 lg:w-96 border-r flex-shrink-0",
                selectedId && "hidden md:block"
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
            <div className={cn("flex-1", !selectedId && "hidden md:flex")}>
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
                    icon={<MessageSquare className="h-12 w-12" />}
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