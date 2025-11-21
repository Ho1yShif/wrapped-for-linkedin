import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { UnifiedDashboard } from './components/UnifiedDashboard';
import { Loading } from './components/Loading';
import { ErrorDisplay } from './components/Error';
import { Header } from './components/Header';
import type { DemographicInsights, EngagementMetrics } from './types';
import type { ParsedExcelData } from './utils/excel/types';
import './App.css';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [engagement, setEngagement] = useState<EngagementMetrics | null>(null);
  const [demographics, setDemographics] = useState<DemographicInsights | undefined>(undefined);

  const handleFileProcessed = (excelData: ParsedExcelData, fileError?: string) => {
    setLoading(false);

    if (fileError) {
      setError(fileError);
      return;
    }

    try {
      setError(null);

      // Convert parsed Excel data to analytics format
      const engagementMetrics: EngagementMetrics = {
        discovery_data: excelData.discovery_data,
        top_posts: excelData.top_posts,
        engagementByDay: excelData.engagement_by_day,
      };

      setEngagement(engagementMetrics);
      setDemographics(excelData.demographics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process Excel data');
    }
  };

  const handleRetry = () => {
    setEngagement(null);
    setDemographics(undefined);
    setError(null);
  };

  const handleLogoClick = () => {
    handleRetry();
  };

  return (
    <div className="app-container">
      <Header onLogoClick={handleLogoClick} />

      <main className="app-main">
        {error && <ErrorDisplay error={error} onRetry={handleRetry} />}

        {loading && <Loading />}

        {!loading && !error && engagement ? (
          <UnifiedDashboard data={engagement} demographics={demographics} />
        ) : !loading && !error && !engagement ? (
          <FileUpload onFileProcessed={handleFileProcessed} isLoading={loading} />
        ) : null}
      </main>

      <footer className="app-footer">
        <p>LinkedIn Wrapped &nbsp; | &nbsp; © 2025 Shifra Williams </p>
      </footer>
    </div>
  );
}

export default App;
