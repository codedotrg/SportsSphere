import { z } from "zod";

/*
 Messaging service with adapter pattern.
 - Exposes: sendMessage, fetchMessages, subscribeToMessages
 - Uses runtime validation via Zod
 - Adapter preference: Socket.IO (if SOCKET_IO_URL set) -> Supabase (if SUPABASE_URL/KEY set) -> InMemory fallback
 - Uses dynamic requires so adapters are optional (won't crash if packages not installed)
*/

export const MessageSchema = z.object({
  id: z.string().optional(),
  authorId: z.string(),
  content: z.string().min(1),
  createdAt: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type Message = z.infer<typeof MessageSchema>;

export type FetchOptions = {
  limit?: number;
  cursor?: string | null;
};

export interface FetchResult {
  messages: Message[];
  cursor?: string | null;
}

export interface MessagingAdapter {
  send(message: Message): Promise<Message>;
  fetch(opts?: FetchOptions): Promise<FetchResult>;
  subscribe(cb: (message: Message) => void): () => void;
}

/* In-memory fallback adapter (useful for local dev and as a reference). */
class InMemoryAdapter implements MessagingAdapter {
  private messages: Message[] = [];
  private subs: Array<(m: Message) => void> = [];

  async send(message: Message) {
    const m: Message = {
      ...message,
      id: message.id || cryptoRandomId(),
      createdAt: new Date().toISOString(),
    };
    this.messages.push(m);
    this.subs.forEach((s) => s(m));
    return m;
  }

  async fetch(opts: FetchOptions = {}) {
    const limit = opts.limit ?? 50;
    let list = [...this.messages];
    if (opts.cursor) {
      list = list.filter((m) => (m.createdAt || "") > opts.cursor!);
    }
    const sliced = list.slice(-limit);
    const cursor = sliced.length ? sliced[sliced.length - 1].createdAt || null : null;
    return { messages: sliced, cursor };
  }

  subscribe(cb: (m: Message) => void) {
    this.subs.push(cb);
    return () => {
      this.subs = this.subs.filter((s) => s !== cb);
    };
  }
}

/* Utilities */
function cryptoRandomId() {
  if (typeof (globalThis as any).crypto?.randomUUID === "function")
    return (globalThis as any).crypto.randomUUID();
  return `id_${Math.random().toString(36).slice(2, 9)}`;
}

/* Messages cache used by some adapters */
let messagesCache: Message[] = [];
let adapter: MessagingAdapter | null = null;

function initSocketIOAdapter(url: string): MessagingAdapter | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { io } = require("socket.io-client");
    const socket = io(url, { autoConnect: true });

    // keep local cache updated from socket events
    socket.on("connect", () => {
      // optionally request initial history if server supports
      try {
        socket.emit("messages:fetch", { limit: 100 }, (resp: any) => {
          if (Array.isArray(resp)) {
            messagesCache = resp.map((r: any) => ({
              id: r.id,
              authorId: r.authorId || r.author_id || r.sender_id,
              content: r.content,
              createdAt: r.createdAt || r.created_at,
              metadata: r.metadata || r.meta,
            }));
          }
        });
      } catch (e) {
        // server might not support fetch via socket
      }
    });

    socket.on("message:new", (payload: any) => {
      const m: Message = {
        id: payload.id,
        authorId: payload.authorId || payload.author_id || payload.sender_id,
        content: payload.content,
        createdAt: payload.createdAt || payload.created_at || new Date().toISOString(),
        metadata: payload.metadata || payload.meta,
      };
      messagesCache.push(m);
      // No direct subscribers stored here; adapter.subscribe will register listeners on socket
    });

    const socketAdapter: MessagingAdapter = {
      async send(message: Message) {
        const validated = MessageSchema.parse(message);
        return new Promise<Message>((resolve, reject) => {
          socket.timeout(5000).emit("message:send", validated, (err: any, ack: any) => {
            if (err) return reject(err);
            const rec: any = ack || {};
            const m: Message = {
              id: rec.id || cryptoRandomId(),
              authorId: rec.authorId || rec.author_id || validated.authorId,
              content: rec.content || validated.content,
              createdAt: rec.createdAt || rec.created_at || new Date().toISOString(),
              metadata: rec.metadata || validated.metadata,
            };
            messagesCache.push(m);
            resolve(m);
          });
        });
      },

      async fetch(opts: FetchOptions = {}) {
        // prefer to fetch via socket if supported
        try {
          return new Promise<FetchResult>((resolve) => {
            socket.timeout(5000).emit("messages:fetch", opts, (resp: any) => {
              if (!resp) return resolve({ messages: [...messagesCache].slice(- (opts.limit ?? 50)), cursor: null });
              const messages: Message[] = resp.map((r: any) => ({
                id: r.id,
                authorId: r.authorId || r.author_id || r.sender_id,
                content: r.content,
                createdAt: r.createdAt || r.created_at,
                metadata: r.metadata || r.meta,
              }));
              const cursor = messages.length ? messages[messages.length - 1].createdAt || null : null;
              // merge into cache
              messagesCache = Array.from(new Set([...messagesCache, ...messages] as any)) as Message[];
              resolve({ messages, cursor });
            });
          });
        } catch (e) {
          // fallback to cache
          const msgs = [...messagesCache].slice(- (opts.limit ?? 50));
          const cursor = msgs.length ? msgs[msgs.length - 1].createdAt || null : null;
          return { messages: msgs, cursor };
        }
      },

      subscribe(cb: (m: Message) => void) {
        const listener = (payload: any) => {
          const m: Message = {
            id: payload.id,
            authorId: payload.authorId || payload.author_id || payload.sender_id,
            content: payload.content,
            createdAt: payload.createdAt || payload.created_at || new Date().toISOString(),
            metadata: payload.metadata || payload.meta,
          };
          messagesCache.push(m);
          cb(m);
        };
        socket.on("message:new", listener);
        return () => socket.off("message:new", listener);
      },
    };

    return socketAdapter;
  } catch (e) {
    // socket.io-client not installed or failed
    // eslint-disable-next-line no-console
    console.warn("Socket.IO adapter unavailable:", e);
    return null;
  }
}

function getDefaultAdapter(): MessagingAdapter {
  if (adapter) return adapter;

  const SOCKET_IO_URL = process.env.SOCKET_IO_URL || (globalThis as any).__SOCKET_IO_URL;
  const SUPABASE_URL = process.env.SUPABASE_URL || (globalThis as any).__SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY || (globalThis as any).__SUPABASE_KEY;

  // Prefer Socket.IO when configured
  if (SOCKET_IO_URL) {
    const socketAdapter = initSocketIOAdapter(SOCKET_IO_URL);
    if (socketAdapter) {
      adapter = socketAdapter;
      return adapter;
    }
  }

  // Next prefer Supabase when configured
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { createClient } = require("@supabase/supabase-js");
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

      const supabaseAdapter: MessagingAdapter = {
        async send(message: Message) {
          const validated = MessageSchema.parse(message);
          const payload = { author_id: validated.authorId, content: validated.content, metadata: validated.metadata };
          const { data, error } = await supabase.from("messages").insert(payload).select("*").single();
          if (error) throw error;
          const m: Message = {
            id: data.id,
            authorId: data.author_id,
            content: data.content,
            createdAt: data.created_at,
            metadata: data.metadata,
          };
          messagesCache.push(m);
          return m;
        },
        async fetch(opts = {}) {
          const limit = opts.limit ?? 50;
          const { data, error } = await supabase
            .from("messages")
            .select("id,author_id,content,metadata,created_at")
            .order("created_at", { ascending: true })
            .limit(limit);
          if (error) throw error;
          const messages: Message[] = data.map((r: any) => ({
            id: r.id,
            authorId: r.author_id,
            content: r.content,
            createdAt: r.created_at,
            metadata: r.metadata,
          }));
          messagesCache = Array.from(new Set([...messagesCache, ...messages] as any)) as Message[];
          const cursor = messages.length ? messages[messages.length - 1].createdAt || null : null;
          return { messages, cursor };
        },
        subscribe(cb) {
          const channel = supabase.channel("public:messages").on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload: any) => {
            const record = payload.new;
            const m: Message = { id: record.id, authorId: record.author_id, content: record.content, createdAt: record.created_at, metadata: record.metadata };
            messagesCache.push(m);
            cb(m);
          }).subscribe();

          return () => {
            channel.unsubscribe();
          };
        },
      };

      adapter = supabaseAdapter;
      return adapter;
    } catch (e) {
      console.warn("Supabase adapter unavailable, falling back to InMemoryAdapter", e);
    }
  }

  adapter = new InMemoryAdapter();
  return adapter;
}

/* Exported stable API */
export async function sendMessage(message: Message) {
  const a = getDefaultAdapter();
  const validated = MessageSchema.parse(message);
  return a.send(validated);
}

export async function fetchMessages(opts?: FetchOptions) {
  const a = getDefaultAdapter();
  return a.fetch(opts);
}

export function subscribeToMessages(cb: (m: Message) => void) {
  const a = getDefaultAdapter();
  return a.subscribe(cb);
}
