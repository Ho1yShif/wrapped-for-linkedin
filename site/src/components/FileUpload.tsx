import React, { useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import type { ParsedExcelData } from '@utils/excel/types';
import { useCache } from '@/hooks/useCache';
import { useSampleData } from '@/hooks/useSampleData';
import { CacheIndicator } from '@components/CacheIndicator';
import { SampleDataButton } from '@components/SampleDataButton';
import '../styles/FileUpload.css';

interface FileUploadProps {
  onFileProcessed: (data: ParsedExcelData, error?: string, uploadDate?: number, isFromCache?: boolean) => void;
  isLoading?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed, isLoading = false }) => {
  const cache = useCache((data, uploadDate) => {
    onFileProcessed(data, undefined, uploadDate, true);
  });

  const sampleData = useSampleData(
    (data) => onFileProcessed(data, undefined, Date.now(), false),
    (error) => onFileProcessed({}, error.message)
  );

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    try {
      const { processExcelFile } = await import('../utils/excel/excelProcessor');
      const data = await processExcelFile(acceptedFiles[0]);
      cache.save(data);
      onFileProcessed(data, undefined, Date.now(), false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process file';
      console.error('Error processing file:', error);
      onFileProcessed({}, errorMessage);
    }
  }, [cache, onFileProcessed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    disabled: isLoading || sampleData.isLoading,
  });

  useEffect(() => {
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'prefetch';
    preloadLink.href = '/demo-data/linkedin-demo.xlsx';
    document.head.appendChild(preloadLink);
  }, []);

  return (
    <div className="file-upload-container">
      {cache.isLoaded && cache.uploadDate && (
        <CacheIndicator
          uploadDate={cache.uploadDate}
          onClear={cache.clear}
        />
      )}
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''} ${isLoading || sampleData.isLoading ? 'disabled' : ''}`}>
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

      <div className="demo-section">
        <div className="divider"><span>or</span></div>
        <SampleDataButton
          onClick={sampleData.loadSampleData}
          isLoading={sampleData.isLoading}
        />
      </div>

      <div className="instructions">
        <h3>Export your LinkedIn data</h3>
        <ol>
          <li>Navigate to <a href="https://www.linkedin.com/analytics/creator" target="_blank" rel="noreferrer">LinkedIn Analytics</a></li>
          <li>Click on <b>Past 7 days</b> at the top to open the dropdown menu</li>
          <li>Select <b>Past 365 days</b> from the dropdown</li>
          <li>Click on <b>Impressions</b> to open the dropdown menu</li>
          <li>Select <b>Engagements</b> from the dropdown</li>
          <li>Click <b>Export</b> in the top right</li>
          <li>Upload the exported file here!</li>
        </ol>
      </div>

      <div className="privacy-disclaimer">
        <p>
          🔒 <strong>Your data never leaves your device</strong>
          <br /> <br />
          All processing happens locally in your browser.
          We don't store, transmit, or use your LinkedIn data for anything else.{' '}
          <br /> <br />
          <a 
            href="https://github.com/Ho1yShif/linkedin-wrapped/blob/main/site/src/utils/excel/excelProcessor.ts" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            View source code
          </a>
        </p>
      </div>
    </div>
  );
};
