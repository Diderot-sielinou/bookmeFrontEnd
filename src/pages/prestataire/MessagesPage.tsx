/**
 * MessagesPage (Provider)
 * CORRECTED - Date validation
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { format, isToday, isYesterday, isValid, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";
import {
  MessageSquare,
  Search,
  Send,
  User,
  Check,
  CheckCheck,
  Loader2,
  MoreVertical,
  Archive,
  BellOff,
  RefreshCw,
  Flag,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { showSuccess, showError } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

import { useAuth } from "@/hooks/useAuth";
import {
  useMessageSocket,
  useMessageNotifications,
  type SocketMessage,
} from "@/hooks/useSocket";
import {
  messagesService,
  type Conversation,
} from "@/services/messages.service";
import type { Message } from "@/types";

// ==========================================
// HELPERS - with date validation
// ==========================================

/**
 * Parse a date safely
 */
function safeParseDate(
  dateValue: string | Date | null | undefined
): Date | null {
  if (!dateValue) return null;

  try {
    if (dateValue instanceof Date) {
      return isValid(dateValue) ? dateValue : null;
    }

    if (typeof dateValue === "string") {
      const parsed = parseISO(dateValue);
      if (isValid(parsed)) return parsed;

      const fallback = new Date(dateValue);
      if (isValid(fallback)) return fallback;
    }

    return null;
  } catch {
    return null;
  }
}

function formatMessageTime(
  dateValue: string | Date | null | undefined
): string {
  const date = safeParseDate(dateValue);
  if (!date) return "";

  try {
    if (isToday(date)) {
      return format(date, "HH:mm");
    }
    if (isYesterday(date)) {
      return "Yesterday";
    }
    return format(date, "MMM d", { locale: enUS });
  } catch {
    return "";
  }
}

function formatMessageDate(
  dateValue: string | Date | null | undefined
): string {
  const date = safeParseDate(dateValue);
  if (!date) return "";

  try {
    if (isToday(date)) {
      return "Today";
    }
    if (isYesterday(date)) {
      return "Yesterday";
    }
    return format(date, "EEEE, MMMM d", { locale: enUS });
  } catch {
    return "";
  }
}

function formatBubbleTime(dateValue: string | Date | null | undefined): string {
  const date = safeParseDate(dateValue);
  if (!date) return "";

  try {
    return format(date, "HH:mm");
  } catch {
    return "";
  }
}

/**
 * Normalize a date to ISO string
 */
function normalizeDateToISO(
  dateValue: string | Date | null | undefined
): string {
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
// CONVERSATION LIST ITEM
// ==========================================

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  currentUserId: string;
  onClick: () => void;
}

function ConversationItem({
  conversation,
  isActive,
  currentUserId,
  onClick,
}: ConversationItemProps) {
  const client = conversation.appointment.client;
  const isFromMe = conversation.lastMessage?.senderId === currentUserId;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-3 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left",
        isActive && "bg-muted"
      )}
    >
      <div className="relative">
        <Avatar
          src={client?.avatar}
          firstName={client?.firstName}
          lastName={client?.lastName}
          size="md"
        />
        {conversation.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
            {conversation.unreadCount}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "font-medium truncate",
              conversation.unreadCount > 0 && "font-semibold"
            )}
          >
            {client?.firstName} {client?.lastName}
          </span>
          {conversation.lastMessage?.createdAt && (
            <span className="text-xs text-muted-foreground shrink-0">
              {formatMessageTime(conversation.lastMessage.createdAt)}
            </span>
          )}
        </div>

        {conversation.appointment.service && (
          <Badge variant="secondary" className="text-xs mt-1">
            📅 {conversation.appointment.service.name}
          </Badge>
        )}

        {conversation.lastMessage && (
          <p
            className={cn(
              "text-sm truncate mt-1",
              conversation.unreadCount > 0
                ? "text-foreground font-medium"
                : "text-muted-foreground"
            )}
          >
            {isFromMe && (
              <span className="text-muted-foreground">You: </span>
            )}
            {conversation.lastMessage.content}
          </p>
        )}
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
  onFlag?: (message: Message) => void;
}

function MessageBubble({
  message,
  isFromMe,
  showDate,
  dateLabel,
  onFlag,
}: MessageBubbleProps) {
  return (
    <>
      {showDate && dateLabel && (
        <div className="flex justify-center my-4">
          <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {dateLabel}
          </span>
        </div>
      )}
      <div
        className={cn("flex group", isFromMe ? "justify-end" : "justify-start")}
      >
        <div
          className={cn(
            "max-w-[70%] rounded-2xl px-4 py-2 relative",
            isFromMe
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted rounded-bl-md"
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          <div
            className={cn(
              "flex items-center justify-end gap-1 mt-1",
              isFromMe ? "text-primary-foreground/70" : "text-muted-foreground"
            )}
          >
            <span className="text-xs">
              {formatBubbleTime(message.createdAt)}
            </span>
            {isFromMe &&
              (message.read ? (
                <CheckCheck className="h-3 w-3" />
              ) : (
                <Check className="h-3 w-3" />
              ))}
          </div>
        </div>

        {/* Flag button */}
        {!isFromMe && onFlag && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
            onClick={() => onFlag(message)}
          >
            <Flag className="h-3 w-3" />
          </Button>
        )}
      </div>
    </>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function MessagesPage() {
  const { user } = useAuth();
  const currentUserId = user?.id || "";

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Flag dialog
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [messageToFlag, setMessageToFlag] = useState<Message | null>(null);
  const [flagReason, setFlagReason] = useState("");
  const [isFlagging, setIsFlagging] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedAppointmentId = selectedConversation?.appointment.id || null;

  // WebSocket handlers
  const handleNewMessage = useCallback(
    (socketMessage: SocketMessage) => {
      const normalizedCreatedAt = normalizeDateToISO(socketMessage.createdAt);

      if (socketMessage.appointmentId === selectedAppointmentId) {
        const newMsg: Message = {
          id: socketMessage.id,
          appointmentId: socketMessage.appointmentId,
          senderId: socketMessage.senderId,
          content: socketMessage.content,
          read: socketMessage.senderId === currentUserId,
          readAt: null,
          flagged: false,
          flagReason: null,
          createdAt: normalizedCreatedAt,
        };

        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.appointment.id === socketMessage.appointmentId) {
            const isCurrentConv =
              socketMessage.appointmentId === selectedAppointmentId;
            return {
              ...conv,
              lastMessage: {
                id: socketMessage.id,
                appointmentId: socketMessage.appointmentId,
                senderId: socketMessage.senderId,
                content: socketMessage.content,
                read: isCurrentConv || socketMessage.senderId === currentUserId,
                readAt: null,
                flagged: false,
                flagReason: null,
                createdAt: normalizedCreatedAt,
              },
              unreadCount: isCurrentConv
                ? 0
                : conv.unreadCount +
                  (socketMessage.senderId !== currentUserId ? 1 : 0),
            };
          }
          return conv;
        })
      );
    },
    [selectedAppointmentId, currentUserId]
  );

  useMessageSocket(selectedAppointmentId, {
    onNewMessage: handleNewMessage,
    onMessagesRead: (event) => {
      if (event.appointmentId === selectedAppointmentId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId === currentUserId
              ? { ...m, read: true, readAt: new Date().toISOString() }
              : m
          )
        );
      }
    },
  });

  useMessageNotifications((notification) => {
    if (notification.appointmentId !== selectedAppointmentId) {
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
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const response = await messagesService.getMessagesByAppointment(
          selectedConversation.appointment.id
        );
        setMessages(response.data || []);
        await messagesService.markAsRead(selectedConversation.appointment.id);
        setConversations((prev) =>
          prev.map((conv) =>
            conv.appointment.id === selectedConversation.appointment.id
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
  }, [selectedConversation]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    const client = conv.appointment.client;
    const name = client
      ? `${client.firstName} ${client.lastName}`.toLowerCase()
      : "";
    return name.includes(searchQuery.toLowerCase());
  });

  // Send message - with date normalization
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setIsSending(true);
    try {
      const sentMessage = await messagesService.sendMessage({
        appointmentId: selectedConversation.appointment.id,
        content: newMessage,
      });

      // Normalize createdAt
      const normalizedMessage: Message = {
        ...sentMessage,
        createdAt: normalizeDateToISO(sentMessage.createdAt),
      };

      setMessages((prev) => {
        if (prev.some((m) => m.id === normalizedMessage.id)) return prev;
        return [...prev, normalizedMessage];
      });

      setConversations((prev) =>
        prev.map((conv) =>
          conv.appointment.id === selectedConversation.appointment.id
            ? { ...conv, lastMessage: normalizedMessage }
            : conv
        )
      );

      setNewMessage("");
      inputRef.current?.focus();
    } catch (error) {
      console.error("Failed to send message:", error);
      showError(getErrorMessage(error));
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Flag message
  const handleFlagMessage = (message: Message) => {
    setMessageToFlag(message);
    setFlagReason("");
    setFlagDialogOpen(true);
  };

  const submitFlag = async () => {
    if (!messageToFlag || !flagReason.trim()) return;

    setIsFlagging(true);
    try {
      await messagesService.flagMessage(messageToFlag.id, flagReason);
      showSuccess("Message reported");
      setFlagDialogOpen(false);
      setMessageToFlag(null);
      setFlagReason("");
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setIsFlagging(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadConversations();
    setIsRefreshing(false);
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            {totalUnread > 0
              ? `${totalUnread} unread message${totalUnread > 1 ? "s" : ""}`
              : "Communicate with your clients"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")}
          />
          Refresh
        </Button>
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
                placeholder="Search..."
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
                No conversations
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.appointment.id}
                  conversation={conversation}
                  isActive={
                    selectedConversation?.appointment.id ===
                    conversation.appointment.id
                  }
                  currentUserId={currentUserId}
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
                  <Avatar
                    src={selectedConversation.appointment.client?.avatar}
                    firstName={
                      selectedConversation.appointment.client?.firstName
                    }
                    lastName={selectedConversation.appointment.client?.lastName}
                    size="md"
                  />
                  <div>
                    <h3 className="font-semibold">
                      {selectedConversation.appointment.client?.firstName}{" "}
                      {selectedConversation.appointment.client?.lastName}
                    </h3>
                    {selectedConversation.appointment.service && (
                      <p className="text-sm text-muted-foreground">
                        Appointment: {selectedConversation.appointment.service.name}
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
                      View profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <BellOff className="h-4 w-4 mr-2" />
                      Disable notifications
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Messages */}
              {isLoadingMessages ? (
                <div className="flex-1 flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : (
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {messages.map((message, index) => {
                      const isFromMe = message.senderId === currentUserId;
                      const currentDate = formatMessageDate(message.createdAt);
                      const previousDate =
                        index > 0
                          ? formatMessageDate(messages[index - 1].createdAt)
                          : null;
                      const showDate = currentDate !== previousDate;

                      return (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          isFromMe={isFromMe}
                          showDate={showDate}
                          dateLabel={currentDate}
                          onFlag={!isFromMe ? handleFlagMessage : undefined}
                        />
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              )}

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex items-center gap-2">
                  <Input
                    ref={inputRef}
                    placeholder="Write your message..."
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
                title="Select a conversation"
                description="Choose a conversation from the list to start chatting."
              />
            </div>
          )}
        </div>
      </Card>

      {/* Flag Dialog */}
      <Dialog open={flagDialogOpen} onOpenChange={setFlagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report message</DialogTitle>
            <DialogDescription>
              Explain why this message should be examined by our team.
            </DialogDescription>
          </DialogHeader>

          {messageToFlag && (
            <div className="bg-muted/50 p-3 rounded-lg text-sm">
              <p className="text-muted-foreground">{messageToFlag.content}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Report reason</Label>
            <Textarea
              id="reason"
              placeholder="Describe the problem..."
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFlagDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitFlag}
              disabled={!flagReason.trim() || isFlagging}
              variant="destructive"
            >
              {isFlagging ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Report"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}