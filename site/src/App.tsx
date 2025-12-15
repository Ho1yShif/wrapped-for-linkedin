import { useState, useEffect } from 'react';
import { FileUpload } from '@components/FileUpload';
import { UnifiedDashboard } from '@components/UnifiedDashboard';
import { Loading } from '@components/Loading';
import { Error as ErrorDisplay } from '@components/Error';
import { Header } from '@components/Header';
import { useCache } from '@/hooks/useCache';
import type { DemographicInsights, EngagementMetrics } from '@types';
import type { ParsedExcelData } from '@utils/excel/types';
import './App.css';

interface DataState {
  engagement: EngagementMetrics | null;
  demographics: DemographicInsights | undefined;
  uploadDate: number | null;
  isFromCache: boolean;
  error: string | null;
}

function App() {
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<DataState>({
    engagement: null,
    demographics: undefined,
    uploadDate: null,
    isFromCache: false,
    error: null,
  });
  const cache = useCache();
  const { clear: clearCache } = cache;

  // Detect hard refresh and clear cache
  useEffect(() => {
    // Check if this is a hard refresh by looking at sessionStorage
    // sessionStorage is cleared on hard refresh but persists on soft refresh
    const sessionKey = 'wrapped-session-active';
    const wasSessionActive = sessionStorage.getItem(sessionKey);
    
    if (!wasSessionActive) {
      // This is either first visit or hard refresh
      // Hard refresh clears sessionStorage, so we clear localStorage too
      clearCache();
      sessionStorage.setItem(sessionKey, 'true');
    }
    
    // Set up beforeunload to persist session flag on soft refresh
    const handleBeforeUnload = () => {
      sessionStorage.setItem(sessionKey, 'true');
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [clearCache]);

  const handleFileProcessed = (excelData: ParsedExcelData, fileError?: string, date?: number, fromCache?: boolean) => {
    setLoading(false);

    if (fileError) {
      setState(prev => ({ ...prev, error: fileError }));
      return;
    }

    try {
      const engagementMetrics: EngagementMetrics = {
        discovery_data: excelData.discovery_data,
        top_posts: excelData.top_posts,
        engagementByDay: excelData.engagement_by_day,
      };

      setState({
        engagement: engagementMetrics,
        demographics: excelData.demographics,
        uploadDate: date ?? Date.now(),
        isFromCache: fromCache ?? false,
        error: null,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to process Excel data'
      }));
    }
  };

  const resetState = () => {
    setState({
      engagement: null,
      demographics: undefined,
      uploadDate: null,
      isFromCache: false,
      error: null,
    });
  };

  const handleClearCache = () => {
    cache.clear();
    resetState();
  };
  const handleLogoClick = resetState;
  const currentYear = new Date().getFullYear();

  // Add keyboard shortcuts to return to homepage
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key - return to homepage
      if (event.key === 'Escape' && state.engagement) {
        handleClearCache();
        return;
      }
      
      // Ctrl+Shift+R or Cmd+Shift+R - intercept hard refresh and return to homepage
      if (
        event.key === 'R' &&
        event.shiftKey &&
        (event.ctrlKey || event.metaKey)
      ) {
        event.preventDefault();
        clearCache();
        resetState();
        // Clear session storage to simulate hard refresh
        sessionStorage.clear();
        sessionStorage.setItem('wrapped-session-active', 'true');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [state.engagement, clearCache]);

  return (
    <div className="app-container">
      {state.engagement && <div className="background-overlay" />}
      
      <Header
        onLogoClick={handleLogoClick}
        onClearCache={handleClearCache}
        hasCachedData={cache.data !== null}
      />

      <main className="app-main">
        {state.engagement && (
          <button
            className="upload-new-data-btn desktop-only"
            onClick={handleClearCache}
            aria-label="Upload new data"
            title="Upload new data"
          >
            Upload new data
          </button>
        )}
        
        {state.error && <ErrorDisplay error={state.error} onRetry={resetState} />}

        {loading && <Loading />}

        {!loading && !state.error && state.engagement ? (
          <UnifiedDashboard
            data={state.engagement}
            demographics={state.demographics}
            onUploadNewData={handleClearCache}
          />
        ) : !loading && !state.error && !state.engagement ? (
          <FileUpload onFileProcessed={handleFileProcessed} isLoading={loading} />
        ) : null}
      </main>

      <footer className="app-footer">
        <div className="footer-disclaimer-row">
          <p className="footer-disclaimer">
            This site is not affiliated with LinkedIn or Microsoft.
          </p>
        </div>
        <div className="footer-bottom-row">
          <p className="footer-links">
            <a 
              href="https://x.com/render" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
            >
              X
            </a>
            &nbsp; &nbsp; &nbsp; &nbsp;
            <a 
              href="https://x.com/render" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
            >
              LinkedIn
            </a>
            &nbsp; &nbsp; &nbsp; &nbsp;
            <a 
              href="https://github.com/Ho1yShif/wrapped-for-linkedin" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
            >
              GitHub
            </a>
          </p>
          <p className="footer-copyright">
            © Render {currentYear}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
