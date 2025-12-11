import { useState } from 'react';
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

  const handleRetry = resetState;
  const handleClearCache = () => {
    cache.clear();
    resetState();
  };
  const handleLogoClick = resetState;
  const currentYear = new Date().getFullYear();

  return (
    <div className="app-container">
      <Header
        onLogoClick={handleLogoClick}
        onClearCache={handleClearCache}
        hasCachedData={cache.data !== null}
      />

      <main className="app-main">
        {state.error && <ErrorDisplay error={state.error} onRetry={handleRetry} />}

        {loading && <Loading />}

        {!loading && !state.error && state.engagement ? (
          <UnifiedDashboard
            data={state.engagement}
            demographics={state.demographics}
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
