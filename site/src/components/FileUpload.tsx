import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import type { ParsedExcelData } from '../utils/excel/types';
import '../styles/FileUpload.css';

interface FileUploadProps {
  onFileProcessed: (data: ParsedExcelData, error?: string) => void;
  isLoading?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed, isLoading = false }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setIsProcessing(true);
      try {
        const { processExcelFile } = await import('../utils/excel/excelProcessor');
        const data = await processExcelFile(acceptedFiles[0]);
        onFileProcessed(data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to process file';
        console.error('Error processing file:', error);
        onFileProcessed({}, errorMessage);
      } finally {
        setIsProcessing(false);
      }
    }
  }, [onFileProcessed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
    },
    disabled: isProcessing || isLoading,
  });

  return (
    <div className="file-upload-container">
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''} ${isProcessing || isLoading ? 'disabled' : ''}`}>
        <input {...getInputProps()} />
        <div className="dropzone-content">
          <div className="upload-icon">📤</div>
          {isDragActive ? (
            <p className="dropzone-text">Drop your file here</p>
          ) : (
            <>
              <p className="dropzone-text">Drag and drop your LinkedIn analytics file here</p>
              <p className="dropzone-subtext">or click to select a file</p>
              <p className="dropzone-formats">Excel (.xlsx) files only</p>
            </>
          )}
        </div>
      </div>
      <div className="instructions">
        <h3>Export your LinkedIn data</h3>
        <ol>
          <li>Navigate to <a href="https://www.linkedin.com/analytics/creator" target="_blank" rel="noreferrer">LinkedIn Analytics</a></li>
          <li>Click on <b>Past 7 days</b> at the top to open the dropdown date range menu</li>
          <li>Change the date range to <b>Past 365 days</b></li>
          <li>Click on <b>Impressions</b> to open the dropdown menu</li>
          <li>Select <b>Engagements</b> from the dropdown to switch modes</li>
          <li>Click <b>Export</b> in the top right</li>
          <li>Upload the file here!</li>
        </ol>
      </div>
    </div>
  );
};
