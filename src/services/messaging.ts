import { supabase } from '@/integrations/supabase/client';

interface SendTextMessageParams {
  senderId: string;
  recipientId: string;
  content: string;
  metadata?: Record<string, any> | null;
}

export const sendTextMessage = async ({ senderId, recipientId, content, metadata = null }: SendTextMessageParams) => {
  try {
    const now = new Date().toISOString();

    // Try unified messages table first
    const { data: unifiedData, error: unifiedError } = await supabase
      .from('messages')
      .insert([
        {
          sender_id: senderId,
          recipient_id: recipientId,
          content,
          metadata,
          is_read: false,
          created_at: now
        }
      ]);

    if (!unifiedError) {
      return { success: true, table: 'messages', data: unifiedData };
    }

    // Fallback to legacy direct_messages table
    const { data: dmData, error: dmError } = await supabase
      .from('direct_messages')
      .insert([
        {
          sender_id: senderId,
          recipient_id: recipientId,
          content,
          metadata,
          is_read: false,
          created_at: now
        }
      ]);

    if (dmError) {
      console.error('sendTextMessage: both inserts failed', { unifiedError, dmError });
      return { success: false, error: { unifiedError, dmError } };
    }

    return { success: true, table: 'direct_messages', data: dmData };
  } catch (err) {
    console.error('sendTextMessage error:', err);
    return { success: false, error: err };
  }
};
