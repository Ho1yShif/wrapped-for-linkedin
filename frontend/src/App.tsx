import { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { AnalyticsView } from './components/AnalyticsView';
import { DemographicsView } from './components/DemographicsView';
import { Loading } from './components/Loading';
import { ErrorDisplay } from './components/Error';
import { uploadFile, getEngagementMetrics, getDemographicInsights } from './utils/api';
import './App.css';

function App() {
  const [fileId, setFileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [engagement, setEngagement] = useState(null);
  const [demographics, setDemographics] = useState(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'engagement' | 'demographics'>('upload');

  useEffect(() => {
    if (fileId) {
      loadData();
    }
  }, [fileId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [engagementData, demographicsData] = await Promise.all([
        getEngagementMetrics(fileId!),
        getDemographicInsights(fileId!),
      ]);
      setEngagement(engagementData);
      setDemographics(demographicsData);
      setActiveTab('engagement');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelected = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      const response = await uploadFile(file);
      if (response.success) {
        setFileId(response.fileId);
      } else {
        setError('Upload failed: ' + response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setFileId(null);
    setEngagement(null);
    setDemographics(null);
    setActiveTab('upload');
    setError(null);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">LinkedIn Wrapped</h1>
          <p className="app-subtitle">Your Professional Year in Review</p>
        </div>
      </header>

      <main className="app-main">
        {error && <ErrorDisplay error={error} onRetry={handleRetry} />}

        {loading && <Loading />}

        {!loading && !error && fileId && engagement && demographics ? (
          <>
            <nav className="tab-navigation">
              <button
                className={`tab-button ${activeTab === 'engagement' ? 'active' : ''}`}
                onClick={() => setActiveTab('engagement')}
              >
                📊 Engagement
              </button>
              <button
                className={`tab-button ${activeTab === 'demographics' ? 'active' : ''}`}
                onClick={() => setActiveTab('demographics')}
              >
                👥 Demographics
              </button>
            </nav>

            <div className="tab-content">
              {activeTab === 'engagement' && <AnalyticsView data={engagement} />}
              {activeTab === 'demographics' && <DemographicsView data={demographics} />}
            </div>
          </>
        ) : !loading && !error && !fileId ? (
          <FileUpload onFileSelected={handleFileSelected} isLoading={loading} />
        ) : null}
      </main>

      <footer className="app-footer">
        <p>LinkedIn Wrapped 2025 • Your professional insights, visualized</p>
      </footer>
    </div>
  );
}

export default App;
