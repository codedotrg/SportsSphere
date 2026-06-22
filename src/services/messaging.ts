import { z } from "zod";

/*
 Messaging service with adapter pattern.
 - Exposes: sendMessage, fetchMessages, subscribeToMessages
 - Uses runtime validation via Zod
 - Default adapters: Supabase (if env present) or in-memory fallback
*/

export const MessageSchema = z.object({
  id: z.string().uuid().optional(),
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
    // simple cursor = ISO timestamp, return messages after cursor
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
  // lightweight uuid fallback when crypto.randomUUID is not available
  if (typeof (globalThis as any).crypto?.randomUUID === "function")
    return (globalThis as any).crypto.randomUUID();
  return `id_${Math.random().toString(36).slice(2, 9)}`;
}

/* Adapter detection */
let adapter: MessagingAdapter | null = null;

function getDefaultAdapter(): MessagingAdapter {
  if (adapter) return adapter;

  // Prefer Supabase if ENV variables are set. We avoid importing @supabase/supabase-js at top-level
  // so the package is optional and the code won't crash if not installed.
  const SUPABASE_URL = process.env.SUPABASE_URL || (globalThis as any).__SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY || (globalThis as any).__SUPABASE_KEY;

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      // Dynamically require to avoid hard dependency at runtime in environments without the package
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { createClient } = require("@supabase/supabase-js");
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

      const supabaseAdapter: MessagingAdapter = {
        async send(message: Message) {
          const validated = MessageSchema.parse(message);
          const payload = { author_id: validated.authorId, content: validated.content, metadata: validated.metadata };
          const { data, error } = await supabase.from("messages").insert(payload).select("*").single();
          if (error) throw error;
          // map record to Message
          return {
            id: data.id,
            authorId: data.author_id,
            content: data.content,
            createdAt: data.created_at,
            metadata: data.metadata,
          } as Message;
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
          const cursor = messages.length ? messages[messages.length - 1].createdAt || null : null;
          return { messages, cursor };
        },
        subscribe(cb) {
          const channel = supabase.channel("public:messages").on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload: any) => {
            const record = payload.new;
            cb({ id: record.id, authorId: record.author_id, content: record.content, createdAt: record.created_at, metadata: record.metadata });
          }).subscribe();

          return () => {
            // unsubscribe
            channel.unsubscribe();
          };
        },
      };

      adapter = supabaseAdapter;
      return adapter;
    } catch (e) {
      // supabase not installed or failed to initialize — fallback to in-memory
      /* eslint-disable no-console */
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
