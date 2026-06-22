import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Minimal hook for sending direct messages. This is a lightweight shim
// so UI components can call sendDirectMessage(recipientId, content).
export const useDirectMessages = (_folder: 'inbox' | 'sent' = 'sent') => {
  const { user } = useAuth();

  const sendDirectMessage = useCallback(async (recipientId: string, content: string, metadata: any = {}) => {
    if (!user) {
      console.warn('No authenticated user - cannot send direct message');
      return false;
    }

    try {
      const payload = {
        sender_id: user.id,
        recipient_id: recipientId,
        content,
        metadata,
        is_read: false,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('direct_messages')
        .insert([payload]);

      if (error) {
        console.error('Error inserting direct message:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('sendDirectMessage error:', err);
      return false;
    }
  }, [user]);

  return { sendDirectMessage };
};
