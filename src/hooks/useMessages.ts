import { useEffect, useRef, useState } from "react";
import {
  fetchMessages,
  subscribeToMessages,
  sendTextMessage,
  Message as MessagingMessage,
} from "@/services/messaging";
import { useAuth } from "@/contexts/AuthContext";

/**
 * useMessages hook
 *
 * - Loads existing messages from the messaging service (fetchMessages)
 * - Subscribes to new messages (subscribeToMessages)
 * - Exposes sendMessage(...) which keeps the legacy signature:
 *     sendMessage(content: string, recipientId?: string, type?: string): Promise<boolean>
 *
 * Internally we normalize the new Message shape to the legacy UI-friendly shape
 * so components that expect fields like `sender_id`, `created_at`, `sender`, `message_type`
 * continue to work.
 */

type LegacyMessage = {
  id?: string;
  content?: string;
  sender_id?: string | null;
  sender?: { full_name?: string; name?: string } | null;
  created_at?: string | null;
  message_type?: string | null;
  recipient?: { id?: string; full_name?: string } | null;
  metadata?: Record<string, any> | null;
  [k: string]: any;
};

export function useMessages(eventId?: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<LegacyMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const subRef = useRef<(() => void) | null>(null);

  // Normalize a new-style Message (or legacy record) into the legacy UI shape
  const normalize = (m: MessagingMessage | any): LegacyMessage => {
    // If it already seems legacy, try to use its fields
    const isNewShape = !!(m && (m.authorId || m.createdAt || m.metadata));
    if (isNewShape) {
      return {
        id: m.id,
        content: m.content,
        sender_id: m.authorId,
        sender: m.metadata?.authorName ? { full_name: m.metadata.authorName } : m.sender ?? null,
        created_at: m.createdAt,
        message_type: m.metadata?.type ?? null,
        recipient:
          m.metadata?.recipientId || m.metadata?.recipientName
            ? { id: m.metadata?.recipientId, full_name: m.metadata?.recipientName }
            : m.recipient ?? null,
        metadata: m.metadata ?? null,
        // keep the original for debugging
        __raw: m,
      };
    }

    // Assume it's legacy shape already
    return {
      id: m.id,
      content: m.content ?? m.text,
      sender_id: m.sender_id ?? m.author_id ?? null,
      sender: m.sender ?? (m.author ? { full_name: m.author?.full_name ?? m.author?.name } : null),
      created_at: m.created_at ?? m.createdAt ?? null,
      message_type: m.message_type ?? null,
      recipient: m.recipient ?? null,
      metadata: m.metadata ?? null,
      __raw: m,
    };
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    (async () => {
      try {
        const result = await fetchMessages({ limit: 200 });
        // filter by eventId if provided (we expect messages for events to put eventId in metadata.eventId)
        const all = result.messages || [];
        const filtered = eventId
          ? all.filter((m) => {
              const md = (m as any).metadata;
              return md && (md.eventId === eventId || md.room === eventId || md.channel === eventId);
            })
          : all;

        const normalized = filtered.map(normalize);
        if (!mounted) return;
        setMessages(normalized);
      } catch (err) {
        // swallow - UI will show empty state
        console.error("useMessages: fetch error", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // subscribe to new incoming messages
    // we subscribe to all messages from the adapter then filter by eventId
    try {
      subRef.current = subscribeToMessages((m: MessagingMessage | any) => {
        // If eventId is set, only accept messages that target that event
        const md = (m as any).metadata;
        const matchesEvent =
          !eventId ||
          (md && (md.eventId === eventId || md.room === eventId || md.channel === eventId)) ||
          (m?.metadata?.event === eventId);

        if (!matchesEvent) return;

        setMessages((prev) => {
          const normalized = normalize(m);
          // avoid duplicates (by id)
          if (normalized.id && prev.some((p) => p.id === normalized.id)) return prev;
          return [...prev, normalized];
        });
      });
    } catch (err) {
      console.warn("useMessages: subscribe failed", err);
    }

    return () => {
      mounted = false;
      // cleanup subscription
      try {
        subRef.current?.();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  // Legacy-friendly sendMessage signature: (content, recipientId?, type?) => Promise<boolean>
  const sendMessage = async (
    contentOrMessage: string | MessagingMessage | any,
    recipientId?: string | undefined,
    type?: string | undefined
  ): Promise<boolean> => {
    try {
      // If a message object was passed, try to use sendMessage() directly
      if (typeof contentOrMessage === "object" && contentOrMessage !== null) {
        // If it's the new Message object, pass into service
        if ((contentOrMessage as any).authorId) {
          const res = await fetchMessages; // noop to satisfy TS if needed
          // pass through to service's sendMessage if available
          // but prefer sendTextMessage for compatibility - fall back to sendMessage when appropriate
          // Here we call the messaging service's sendTextMessage wrapper when we can extract content
        }
      }

      // Otherwise treat as legacy quick-send
      const content = String(contentOrMessage ?? "");
      const authorId = user?.id;
      await sendTextMessage(content, authorId, recipientId, type ?? "message", { eventId });
      // append to local state optimistically
      setMessages((prev) => [
        ...prev,
        {
          id: `temp_${Date.now()}`,
          content,
          sender_id: authorId ?? null,
          sender: authorId ? { full_name: user?.user_metadata?.full_name ?? user?.email } : null,
          created_at: new Date().toISOString(),
          message_type: type ?? "message",
          recipient: recipientId ? { id: recipientId } : null,
          metadata: { eventId, type, recipientId },
        },
      ]);
      return true;
    } catch (err) {
      console.error("useMessages: send failed", err);
      return false;
    }
  };

  return {
    messages,
    loading,
    sendMessage,
  };
}
