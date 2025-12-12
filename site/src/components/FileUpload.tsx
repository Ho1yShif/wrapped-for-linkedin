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

      <div className="instructions">
        <h3>Export your LinkedIn analytics</h3>
        <ol>
          <li>Head to your  <a href="https://www.linkedin.com/analytics/creator/content/?metricType=ENGAGEMENTS&timeRange=past_365_days" target="_blank" rel="noreferrer">LinkedIn analytics</a> dashboard ↗</li>
          <li>Click <b>Export</b> in the top right</li>
          <li>Upload the exported file below ↓</li>
        </ol>
      </div>

      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''} ${isLoading || sampleData.isLoading ? 'disabled' : ''}`}>
        <input {...getInputProps()} />
        <div className="dropzone-content">
          <>
          <p className="dropzone-text">Upload your LinkedIn analytics file here</p>
          </>
          <img src="/icon-upload.svg" alt="Upload" className="upload-icon" />
          {isDragActive ? (
            <p className="dropzone-text">Drop your file here</p>
          ) : (
            <>
              <p className="dropzone-subtext">Drag and drop or click to select a file</p>
              <p className="dropzone-formats">Excel (.xlsx) files only</p>
            </>
          )}
        </div>
      </div>

      <div className="or-divider">or</div>
      
      <SampleDataButton
        onClick={sampleData.loadSampleData}
        isLoading={sampleData.isLoading}
      />

      <div className="privacy-disclaimer">
        <p>
          <img src="/icon-shield.svg" alt="Shield" className="shield-icon"/>
          <br/>
          <strong>Your data never leaves your device</strong>
          <br /> <br />
          <span className="privacy-disclaimer-text">
            All processing happens locally in your browser.
            We don't store, transmit, or use your LinkedIn data for anything else.
          </span>
          <br /> <br />
          <a 
            href="https://github.com/Ho1yShif/wrapped-for-linkedin/blob/main/site/src/utils/excel/excelProcessor.ts" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            View source code on GitHub ↗
          </a>
        </p>
      </div>
    </div>
  );
};
