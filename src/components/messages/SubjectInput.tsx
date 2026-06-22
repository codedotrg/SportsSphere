import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SubjectInputProps {
  subject: string;
  setSubject: (subject: string) => void;
}

export const SubjectInput: React.FC<SubjectInputProps> = ({
  subject,
  setSubject
}) => {
  return (
    <div>
      <Label htmlFor="subject">Subject (optional)</Label>
      <Input
        id="subject"
        placeholder="Message subject..."
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
    </div>
  );
};
