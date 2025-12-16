# Wrapped for LinkedIn architecture

This document describes how the Wrapped for LinkedIn application is structured and how data flows through the system. The entire application runs client-side in the browser with no backend required.

The app is powered by and deployed on [Render](https://render.com/).

**Tech Stack:** React 18 + TypeScript + Vite

## 📋 Table of contents

- [Architecture overview](#architecture-overview)
- [Directory structure](#directory-structure)
- [Data flow](#data-flow)
- [Key components](#key-components)
- [Data processing pipeline](#data-processing-pipeline)
- [State management](#state-management)
- [Utilities & helpers](#utilities--helpers)
- [Types & interfaces](#types--interfaces)
- [Styling](#styling)
- [Development guide](#development-guide)

## 🏗️ Architecture overview

The application follows a **component-driven architecture** with:
- **Separation of concerns**: UI components, data processing, state management
- **Type safety**: Full TypeScript with strict mode
- **Client-side only**: All data stays in the user's browser
- **Responsive design**: Mobile-friendly with CSS media queries
- **Instagram-inspired UX**: Autoplay carousel with pause, swipe navigation, and keyboard controls
- **Render deployment**: Hosted on [Render](https://render.com/) for reliable, fast global delivery

## 📁 Directory structure

```
src/
├── components/          # React UI components
│   ├── WrappedStories/  # Shareable story cards (Instagram Stories-style)
│   ├── Header.tsx       # App header with navigation
│   ├── FileUpload.tsx   # File input interface
│   ├── UnifiedDashboard.tsx  # Main dashboard container
│   ├── SpotifyDashboard.tsx  # Summary metrics display
│   ├── TopPostsDisplay.tsx   # Top posts analytics
│   ├── DemographicsView.tsx  # Audience demographics
│   ├── FinalMessage.tsx      # End of wrapped message
│   ├── SampleDataButton.tsx  # Demo data loader
│   ├── Loading.tsx      # Loading state
│   └── Error.tsx        # Error display
├── hooks/               # Custom React hooks
│   ├── useCache.ts      # Browser cache management
│   └── useSampleData.ts # Demo data functionality
├── styles/              # CSS module files
│   ├── App.css
│   ├── Components*.css  # Component-specific styles
│   └── WrappedStories.css
├── types/               # TypeScript type definitions
│   ├── index.ts         # Main types
│   └── wrappedStories.ts # Card generation types
├── utils/               # Helper functions
│   ├── excel/           # Excel file parsing
│   │   ├── excelProcessor.ts     # Main orchestrator
│   │   ├── discoveryParser.ts    # Parse summary metrics
│   │   ├── topPostsParser.ts     # Parse top posts
│   │   ├── demographicsParser.ts # Parse audience data
│   │   ├── followersParser.ts    # Parse follower counts
│   │   ├── engagementParser.ts   # Parse engagement metrics
│   │   └── types.ts              # Parser types
│   ├── api.ts           # Mock API helpers
│   ├── cardDataMapper.ts # Map data for story cards
│   ├── dateFormatter.ts # Date formatting helpers
│   ├── imageExport.ts   # Export cards as images
│   ├── linkedinShareLink.ts # Generate LinkedIn share URLs
│   ├── pdfExport.ts     # Export dashboard as PDF
│   ├── profileExtractor.ts # Extract profile info
│   ├── shareTextTemplates.ts # Share message templates
│   └── storageManager.ts # Local storage wrapper
├── App.tsx              # Root component
├── main.tsx             # Entry point
├── index.css            # Global styles
└── README.md            # This file
```

## 🔄 Data flow

### 1. **File upload flow**

```
User selects Excel file
        ↓
FileUpload component triggers
        ↓
excelProcessor.processFile()
        ↓
XLSX library reads file
        ↓
Route to specific parsers
├── discoveryParser → Summary metrics
├── topPostsParser → Top posts data
├── demographicsParser → Audience info
├── followersParser → Follower counts
└── engagementParser → Engagement stats
        ↓
Aggregate into ParsedExcelData
        ↓
Store in local storage + state
        ↓
Render UnifiedDashboard
```

### 2. **Component render flow**

```
App.tsx (root)
    ↓
Header (navigation + cache management)
    ↓
UnifiedDashboard (main container)
    ├── WrappedStoriesContainer (shareable cards)
    ├── SpotifyDashboard (summary stats)
    ├── TopPostsDisplay (engagement rankings)
    └── DemographicsView (audience insights)
```

### 3. **Export flow**

```
User clicks Share/Export
    ↓
cardDataMapper transforms data
    ↓
Choose export format:
├── PDF → pdfExport.ts → jsPDF library
├── Image → imageExport.ts → html2canvas library
└── LinkedIn → linkedinShareLink.ts → Pre-filled share URL
```

## 🎨 Key components

### **App.tsx** (Main app container)
- Root component that manages application state
- Handles file upload and demo data loading
- Routes between FileUpload and UnifiedDashboard views
- Manages error states and loading indicators
- Integrates with browser cache for data persistence

### **FileUpload.tsx** (Data input)
- Accepts Excel files via file input or drag-and-drop
- Includes demo data button for trying the app without uploading
- Validates file format
- Triggers processing pipeline
- Shows loading state during processing

### **UnifiedDashboard.tsx** (Main view)
- Container component for all dashboard sections
- Conditionally renders sub-components based on data availability
- Orchestrates data aggregation for exports

### **SpotifyDashboard.tsx** (Summary card)
- Spotify Wrapped-style summary card
- Displays key metrics (views, engagements, impressions)
- Shows wrapped year from extracted date
- Animated statistics with formatting

### **TopPostsDisplay.tsx** (Post analytics)
- Rankings by impressions, engagement rate, comments
- Interactive sorting and filtering
- Individual post statistics and preview

### **DemographicsView.tsx** (Audience insights)
- Top industries, locations, job titles
- Seniority level distribution
- Company size analysis
- Visual percentage bars

### **WrappedStories/** (Shareable cards)
- **WrappedStoriesContainer.tsx**: Main container with Instagram Stories-style carousel including autoplay, pause-on-hold, and keyboard/swipe navigation
- **StoryCard.tsx**: Individual story card component with responsive design
- **StoryProgress.tsx**: Progress indicators and card navigation
- **ShareButton.tsx**: Export cards as images/PDFs and pre-filled LinkedIn share functionality
- **DownloadInstructions.tsx**: Guide for saving cards

### **WrappedStoriesContainer.tsx** (Wrapped Stories)
- Instagram Stories-inspired carousel with autoplay (5s per card by default)
- **Press-and-hold to pause**: Long-press on any card to pause autoplay (mobile)
- **Swipe/Tap navigation**: Tap left/right or swipe on mobile to navigate
- **Keyboard controls**: Arrow keys to navigate, Escape to pause autoplay
- **Progress indicators**: Visual progress bars at top of each card
- Cycles through cards with wrapping (loops back to start)

## 🔧 Data processing pipeline

### **Excel processing** (`utils/excel/`)

The excel processor is the gateway for converting raw Excel exports to structured data:

```
excelProcessor.processFile(file)
    ↓
Read file with FileReader API
    ↓
Parse with XLSX.read()
    ↓
Extract sheet names
    ↓
For each sheet, delegate to specific parser:
```

**Parsers by sheet type:**

1. **discoveryParser.ts**
   - Extracts summary metrics (views, engagements, impressions)
   - Calculates engagement rate
   - Identifies peak engagement times
   - Formats engagement by day/time

2. **topPostsParser.ts**
   - Processes post-level data
   - Calculates post metrics and engagement
   - Ranks by impressions/comments
   - Extracts post content preview

3. **demographicsParser.ts**
   - Parses follower demographics
   - Groups by industry, location, job title, seniority
   - Calculates percentage distributions
   - Filters and sorts for top items

4. **engagementParser.ts**
   - Aggregates engagement totals
   - Calculates median daily impressions
   - Derives peak engagement time
   - Generates engagement stats

5. **followersParser.ts**
   - Extracts total follower counts
   - Tracks follower growth
   - Calculates growth metrics

### **Data aggregation** (`cardDataMapper.ts`)

Maps parsed Excel data into the specific format needed for story card generation:

```typescript
generateShareableCards(excelData)
    ├── Extract top posts
    ├── Extract demographics
    ├── Calculate engagement metrics
    ├── Format for each card type
    └── Return array of card data
```

## 🎯 State management

### **React State** (`App.tsx`)

The app uses React's built-in `useState` hook for state management:

```typescript
interface DataState {
  engagement: EngagementMetrics | null;
  demographics: DemographicInsights | undefined;
  uploadDate: number | null;
  isFromCache: boolean;
  error: string | null;
}

// In App.tsx
const [loading, setLoading] = useState(false);
const [state, setState] = useState<DataState>({
  engagement: null,
  demographics: undefined,
  uploadDate: null,
  isFromCache: false,
  error: null,
});
```

State is managed at the root `App` component level and passed down to child components via props.

### **Cache hook** (`hooks/useCache.ts`)

Manages browser localStorage for caching:
- Stores parsed Excel data with timestamp
- Reuses data on return visits without re-uploading
- Shows cache indicator
- Allows manual cache clearing
- Improves user experience for returning visitors

### **Sample data hook** (`hooks/useSampleData.ts`)

Manages demo data functionality:
- Provides sample analytics data for testing
- Loads demo data on button click
- Allows users to explore features without uploading

## 🛠️ Utilities & helpers

### **File I/O**
- `storageManager.ts`: Wrapper for localStorage API
- `imageExport.ts`: Convert components to PNG using html2canvas with batch optimization
- `pdfExport.ts`: Export dashboard as PDF with batch rendering for performance
- `batchImageExporter.ts`: Batch export multiple cards as images efficiently

### **Formatting**
- `dateFormatter.ts`: Format dates, times, and extract years from LinkedIn data
- `shareTextTemplates.ts`: Pre-written share messages

### **Interaction**
- `linkedinShareLink.ts`: Generate LinkedIn share URLs with pre-filled text and wrapped link

### **Data processing**
- `profileExtractor.ts`: Extract user info from data
- `cardDataMapper.ts`: Transform data for card generation
- `api.ts`: Mock API for future backend integration

### **Deployment**

The app is automatically deployed to [Render](https://render.com/) when changes are pushed to the main branch. Render:
- Builds the app using `npm run build`
- Serves the static files from the `dist/` directory
- Provides automatic SSL certificates
- Offers global CDN distribution for fast loading times

## 📚 Additional resources
- [Render website](https://render.com)
- [Render docs](https://render.com/docs) 
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/)
- [XLSX Documentation](https://docs.sheetjs.com/)