import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';
import { Paperclip, X, File, Image } from 'lucide-react';

interface FileAttachmentProps {
  onFilesUploaded: (filePaths: string[]) => void;
  maxFiles?: number;
  allowedTypes?: string[];
}

export const FileAttachment: React.FC<FileAttachmentProps> = ({
  onFilesUploaded,
  maxFiles = 5,
  allowedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt']
}) => {
  const { uploadFiles, uploading } = useFileUpload();
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload up to ${maxFiles} files at once`,
        variant: "destructive"
      });
      return;
    }

    const validFiles = files.filter(file => {
      const isValidType = allowedTypes.some(type => {
        if (type.includes('*')) {
          return file.type.startsWith(type.replace('*', ''));
        }
        return file.type === type || file.name.endsWith(type);
      });

      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type`,
          variant: "destructive"
        });
        return false;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB`,
          variant: "destructive"
        });
        return false;
      }

      return true;
    });

    setSelectedFiles(validFiles);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    const result = await uploadFiles(selectedFiles);
    if (result.success) {
      onFilesUploaded(result.filePaths);
      setSelectedFiles([]);
      toast({
        title: "Files uploaded",
        description: `${selectedFiles.length} file(s) uploaded successfully`
      });
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Input
          type="file"
          multiple
          onChange={handleFileSelect}
          accept={allowedTypes.join(',')}
          className="hidden"
          id="file-upload"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('file-upload')?.click()}
          disabled={uploading}
        >
          <Paperclip className="mr-2 h-4 w-4" />
          Attach Files
        </Button>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Selected Files:</div>
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                {getFileIcon(file)}
                <span className="text-sm truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            onClick={handleUpload}
            disabled={uploading}
            size="sm"
            className="w-full"
          >
            {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} file(s)`}
          </Button>
        </div>
      )}
    </div>
  );
};
