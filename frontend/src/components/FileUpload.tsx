import React from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { uploadLogFile } from '../services/api';

interface FileUploadProps {
  onUploadSuccess: (uploadedFileName: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    try {
      const file = acceptedFiles[0];
      const uploadResponse = await uploadLogFile(file);
      // Assume backend returns { filename: ... }
      onUploadSuccess(uploadResponse.filename);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload file');
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.log']
    },
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      aria-label="Upload log file"
      className={`card flex flex-col items-center justify-center border-2 border-dashed transition-all duration-300 cursor-pointer select-none
        ${isDragActive ? 'border-primary bg-primary/10 shadow-lg scale-105' : 'border-gray-300 hover:border-primary-400'}
        focus:outline-none focus:ring-2 focus:ring-primary-400`}
      tabIndex={0}
    >
      <input {...getInputProps()} aria-label="File input" />
      <CloudUploadIcon className={`w-16 h-16 mb-4 text-primary transition-transform ${isDragActive ? 'animate-bounce' : ''}`} />
      <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
        {isDragActive
          ? 'Drop the log file here...'
          : 'Drag & drop a log file here, or click to select'}
      </p>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Only .log files are accepted</p>
    </div>
  );
};
