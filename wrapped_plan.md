# LinkedIn Wrapped: Spotify Wrapped-Style Shareable Cards Implementation Plan

## 🎯 Overview
Transform LinkedIn Wrapped into a viral, shareable experience by adding a Spotify Wrapped-style story section at the top of the page. Users will view stats one card at a time (some cards have one state, some can have multiple stats though) and share them on LinkedIn with pre-written posts, all with one click.

---

## 📋 Table of Contents
1. [Core Features](#core-features)
2. [Technical Architecture](#technical-architecture)
3. [Implementation Phases](#implementation-phases)
4. [Card Design Specifications](#card-design-specifications)
5. [Shareable Card Types](#shareable-card-types)
6. [LinkedIn Sharing Integration](#linkedin-sharing-integration)
7. [Code Style Guidelines](#code-style-guidelines)
8. [File Structure](#file-structure)

---

## 🎨 Core Features

### 1. Story-Style Card Flow
- **Sequential Display**: Show one card at a time, similar to Instagram/Spotify Stories
- **Navigation**: Click/tap to advance, keyboard arrows for desktop, swipe for mobile
- **Progress Indicators**: Horizontal progress bars at top showing which card is active
- **Auto-advance Option**: Optional timer to auto-progress (3-5 seconds per card)
- **Skip Navigation**: Allow users to jump to specific cards via progress indicators

### 2. One-Click LinkedIn Sharing
- **Share Button**: Prominent "Share on LinkedIn" button on each card
- **Pre-written Posts**: Automatically generated, engaging post text for each card
- **Image Generation**: Export card as high-quality PNG/JPEG (1200x1200px or 1200x628px)
- **Native LinkedIn Share**: Use LinkedIn Share API or download + manual upload flow
- **Copy Post Text**: Easy copy-to-clipboard for post text

### 3. Card Customization
- **Professional Design**: Match existing gradient/color scheme
- **Personal Branding**: Include user's name/profile (if available from data)
- **LinkedIn Wrapped Branding**: Consistent footer with "LinkedIn Wrapped 2025" branding
- **Responsive**: Cards look good on mobile and desktop

---

## 🏗️ Technical Architecture

### Component Structure
```
WrappedStories/
├── WrappedStoriesContainer.tsx    # Main container managing state
├── StoryCard.tsx                   # Individual card component
├── StoryProgress.tsx               # Progress indicator bar
├── ShareButton.tsx                 # LinkedIn share button component
├── CardCanvas.tsx                  # HTML-to-image card generator
└── shareUtils.ts                   # LinkedIn API & text generation utilities
```

### Data Flow
```
ParsedExcelData
    ↓
WrappedStoriesContainer (creates card data objects)
    ↓
StoryCard (renders current card with data)
    ↓
ShareButton (exports card as image + generates post text)
    ↓
LinkedIn Share API / Download
```

### State Management
```typescript
interface WrappedStoriesState {
  currentCardIndex: number;
  totalCards: number;
  isAutoPlaying: boolean;
  cards: ShareableCard[];
}

interface ShareableCard {
  id: string;
  type: CardType;
  title: string;
  data: CardData;
  shareText: string; // Pre-written LinkedIn post
  backgroundColor: string;
  gradient: string;
}

type CardType =
  | 'total-impressions'
  | 'members-reached'
  | 'engagement-rate'
  | 'top-post'
  | 'audience-industry'
  | 'audience-location'
  | 'new-followers'
  | 'best-posting-time'
  | 'year-summary';
```

---

## 📦 Implementation Phases

### Phase 1: Core Story Component (Days 1-2)
**Goal**: Build the story-style card navigation and display

#### Tasks:
1. **Create WrappedStoriesContainer component**
   - State management for current card index
   - Navigation handlers (next, previous, jump to card)
   - Keyboard event listeners (arrow keys, escape)
   - Touch/swipe event listeners for mobile
   - Auto-play timer with pause/resume

2. **Create StoryProgress component**
   - Horizontal progress bars (one per card)
   - Active card highlighting
   - Click to jump functionality
   - Auto-progress animation

3. **Create StoryCard component**
   - Full-screen card layout (or large centered card)
   - Props-based rendering for different card types
   - Smooth transitions between cards
   - Background gradients matching existing theme

4. **Integration with App.tsx**
   - Add WrappedStories as first section in UnifiedDashboard
   - Pass ParsedExcelData to generate cards
   - Conditional rendering (only show if data exists)

#### Files to Create:
- `site/src/components/WrappedStories/WrappedStoriesContainer.tsx`
- `site/src/components/WrappedStories/StoryProgress.tsx`
- `site/src/components/WrappedStories/StoryCard.tsx`
- `site/src/styles/WrappedStories.css`

#### Files to Modify:
- `site/src/components/UnifiedDashboard.tsx` - Add WrappedStories at top

---

### Phase 2: Card Design & Data Mapping (Days 2-3)
**Goal**: Design beautiful, shareable cards for each metric

#### Tasks:
1. **Define card types and data structure**
   - Map ParsedExcelData to ShareableCard objects
   - Create card type definitions
   - Prioritize most shareable/viral metrics

2. **Design card layouts**
   - Large metric value with label
   - Supporting visual (icon, emoji, mini-chart)
   - Background gradient from existing palette
   - Consistent typography and spacing
   - "LinkedIn Wrapped 2025" footer branding

3. **Implement card renderers**
   - Create type-specific card components
   - Use existing CSS variables for consistency
   - Responsive sizing and scaling
   - High-quality fonts and rendering

#### Card Types (Priority Order):
1. **Top post** - "Your most engaging post" (with excerpt/metrics)
2. **Total impressions** - "Your posts were seen X times in 2025" & **Members reached** - "You reached X professionals"
4. **New followers** - "X new followers in 2025"
5. **Your community** - "Your top audience job titles: "
6. **EOY summary** - "Your 2025 LinkedIn impact" (multi-stat card)

#### Come up with some 10-15 alliterative fun titles to give people in their cards
i.e. for New followers card, do `Popular professional` or similar

#### Files to Create:
- `site/src/components/WrappedStories/cards/TotalImpressionsCard.tsx`
- `site/src/components/WrappedStories/cards/TopPostCard.tsx`
- `site/src/components/WrappedStories/cards/MembersReachedCard.tsx`
- `site/src/components/WrappedStories/cards/TopIndustryCard.tsx`
- `site/src/components/WrappedStories/cards/EngagementRateCard.tsx`
- `site/src/components/WrappedStories/cards/NewFollowersCard.tsx`
- `site/src/components/WrappedStories/cards/TopLocationCard.tsx`
- `site/src/components/WrappedStories/cards/YearSummaryCard.tsx`
- `site/src/utils/cardDataMapper.ts` - Maps Excel data to card data

#### Files to Modify:
- `site/src/components/WrappedStories/StoryCard.tsx` - Render appropriate card type

---

### Phase 3: Image Export & Generation (Days 3-4)
**Goal**: Convert HTML cards to high-quality shareable images

#### Tasks:
1. **Install dependencies**
   ```bash
   npm install html2canvas
   ```

2. **Create CardCanvas component**
   - Render card in hidden canvas for export
   - Optimize for LinkedIn dimensions (1200x1200px or 1200x628px)
   - High DPI rendering (2x scale for crisp images)
   - Handle fonts, gradients, and emojis properly

3. **Create image export utility**
   - Convert HTML to canvas using html2canvas
   - Export canvas to PNG/JPEG blob
   - Optimize file size (< 5MB for LinkedIn)
   - Handle errors gracefully

4. **Add download functionality**
   - Trigger download on share button click
   - Name files descriptively (e.g., "linkedin-wrapped-2025-impressions.png")
   - Show loading state during generation
   - Success/error notifications

#### Files to Create:
- `site/src/components/WrappedStories/CardCanvas.tsx`
- `site/src/utils/imageExport.ts`

#### Files to Modify:
- `site/package.json` - Add html2canvas dependency

---

### Phase 4: LinkedIn Sharing Integration (Days 4-5)
**Goal**: One-click sharing to LinkedIn with pre-written posts

#### Tasks:
1. **Generate share text for each card type**
   - Engaging, personal, professional tone
   - Include relevant hashtags (#LinkedInWrapped #LinkedInStats)
   - Emoji usage (sparingly, professionally)
   - Call-to-action to try LinkedIn Wrapped
   - Character count optimization (LinkedIn limit: 3000 chars, ideal: 150-300)

2. **Implement share flow options**

   **Option A: LinkedIn Share Dialog (Recommended)**
   - Use LinkedIn Share URL API
   - Pre-fill post text via URL params
   - Open in new window/tab
   - User manually uploads downloaded image

   **Option B: LinkedIn API Integration**
   - Require LinkedIn OAuth (complex, not recommended for MVP)
   - Programmatic post creation
   - Automatic image upload

   **Option C: Hybrid Approach (Best UX)**
   - Auto-download image
   - Copy post text to clipboard
   - Open LinkedIn share page
   - Show instructions: "Image downloaded! Paste copied text and upload image"

3. **Create ShareButton component**
   - Prominent button on each card
   - Loading states during image generation
   - Success feedback
   - Copy-to-clipboard for post text
   - Track share attempts (optional analytics)

4. **Write share text templates**
   - Template per card type
   - Personalization with user data
   - A/B test variations (optional)

#### Share Text Examples:

**Total Impressions Card:**
```
🚀 My 2025 LinkedIn Impact

My posts reached [X] impressions this year! Grateful to connect with so many amazing professionals.

Want to see your own LinkedIn Wrapped? Check out [link] 📊

#LinkedInWrapped #LinkedInStats #ProfessionalGrowth
```

**Top Post Card:**
```
🏆 My Top LinkedIn Post of 2025

This post resonated with [X] people! Here's what worked:
• [Quick insight about the post]

Curious about your top-performing content? Try LinkedIn Wrapped: [link]

#ContentStrategy #LinkedInTips
```

**Top Industry Card:**
```
👥 My 2025 LinkedIn Audience

[X]% of my audience works in [Industry]! Love connecting with [industry] professionals.

Discover who's engaging with your content: [link]

#Networking #LinkedIn #[Industry]
```

#### Files to Create:
- `site/src/components/WrappedStories/ShareButton.tsx`
- `site/src/utils/shareUtils.ts` - Share text generation and LinkedIn API
- `site/src/utils/shareTextTemplates.ts` - Pre-written post templates

---

### Phase 5: Polish & UX Enhancements (Days 5-6)
**Goal**: Perfect the user experience and viral mechanics

#### Tasks:
1. **Animation & Transitions**
   - Smooth card transitions (slide, fade, scale)
   - Micro-interactions on buttons
   - Loading animations during image export
   - Success animations after sharing

2. **Mobile Optimization**
   - Touch-friendly navigation
   - Swipe gestures (left/right)
   - Responsive card sizing
   - Bottom-sheet share menu (mobile)

3. **Accessibility**
   - Keyboard navigation (arrow keys, Tab, Enter)
   - Screen reader support (ARIA labels)
   - Focus management
   - Skip to end option

4. **Performance**
   - Lazy load card components
   - Optimize image export (reduce canvas size if needed)
   - Debounce rapid navigation
   - Memory cleanup on unmount

5. **Error Handling**
   - Handle missing data gracefully
   - Fallback cards if data incomplete
   - Export errors (browser compatibility)
   - User-friendly error messages

6. **Onboarding**
   - First-time user tutorial (optional tooltip)
   - Instructions for LinkedIn sharing
   - "Tap to continue" hint on first card

#### Files to Modify:
- All WrappedStories components - Add animations, error handling
- `site/src/styles/WrappedStories.css` - Polish styles, animations

---

### Phase 6: Testing & Deployment (Day 6-7)
**Goal**: Ensure quality and launch

#### Tasks:
1. **Manual Testing**
   - Test all card types with real data
   - Test navigation (click, keyboard, swipe)
   - Test image export on multiple browsers
   - Test LinkedIn sharing flow end-to-end
   - Mobile device testing (iOS Safari, Android Chrome)

2. **Cross-browser Testing**
   - Chrome, Firefox, Safari, Edge
   - Mobile browsers
   - html2canvas compatibility checks

3. **Performance Testing**
   - Image export speed
   - Memory usage during card navigation
   - Verify no memory leaks

4. **LinkedIn Image Quality Check**
   - Upload exported images to LinkedIn
   - Verify resolution and quality
   - Check for cropping issues
   - Test on mobile LinkedIn app

5. **User Acceptance**
   - Internal team review
   - Collect feedback on share text
   - A/B test different card orders

6. **Deploy**
   - Merge to main branch
   - Build production version
   - Deploy to hosting (Vercel/Netlify)
   - Monitor for errors

---

## 🎨 Card Design Specifications

### Visual Guidelines

#### Dimensions
- **Desktop**: 600px × 800px (card container)
- **Export Image**: 1200px × 1200px (LinkedIn-optimized, 2x scale)
- **Alternative Export**: 1200px × 628px (LinkedIn link preview format)

#### Typography
```css
/* Card Title */
font-family: var(--font-title);
font-size: 2rem;
font-weight: 700;
text-transform: uppercase;
letter-spacing: 0.5px;
color: var(--text-primary);

/* Main Metric Value */
font-family: var(--font-title);
font-size: 5rem;
font-weight: 700;
line-height: 1;
background: var(--gradient-primary);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;

/* Supporting Text */
font-family: var(--font-body);
font-size: 1.2rem;
font-weight: 400;
color: var(--text-secondary);

/* Footer Branding */
font-family: var(--font-body);
font-size: 0.9rem;
font-weight: 600;
color: var(--text-tertiary);
```

#### Color Palette
Use existing CSS variables from `App.css`:
- **Primary Gradient**: `var(--gradient-primary)` - LinkedIn blue gradient
- **Background**: Dark gradient (`var(--bg-primary)` to `var(--bg-secondary)`)
- **Accent Colors**: Use sparingly for variety
  - Green: `var(--accent-green)`
  - Pink: `var(--accent-pink)`
  - Purple: `var(--accent-purple)`
  - Cyan: `var(--accent-cyan)`

#### Layout Structure
```
┌─────────────────────────────────────┐
│  [Progress Indicators: ●●●○○○○○]   │
├─────────────────────────────────────┤
│                                     │
│         [Large Metric Value]        │
│                                     │
│         [Descriptive Label]         │
│                                     │
│      [Supporting Visual/Icon]       │
│                                     │
│         [Context Text]              │
│                                     │
├─────────────────────────────────────┤
│  LinkedIn Wrapped 2025              │
│  [Share Button]                     │
└─────────────────────────────────────┘
```

#### Card-Specific Designs

**1. Total Impressions Card**
```
Background: Dark gradient with subtle pattern
Icon: ✨ (large, centered)
Metric: "1.2M" (huge, gradient text)
Label: "Total Impressions"
Context: "Your posts reached this many people in 2025"
Gradient: var(--gradient-primary)
```

**2. Top Post Card**
```
Background: Dark with blue accent glow
Icon: 🏆
Metric: "[Post excerpt]" (truncated, max 100 chars)
Stats: "X engagements • Y impressions"
Label: "Your Top Post of 2025"
Context: Date published
Gradient: var(--gradient-primary)
```

**3. Members Reached Card**
```
Background: Dark with cyan accent
Icon: 👥 (large)
Metric: "45.2K"
Label: "Unique Members Reached"
Context: "Professionals you connected with in 2025"
Gradient: Cyan-blue gradient
```

**4. Top Industry Card**
```
Background: Dark with purple accent
Icon: 💼
Metric: "[Industry Name]"
Secondary: "X% of your audience"
Label: "Your Top Audience Industry"
Context: "You're resonating with [industry] professionals"
Gradient: Purple gradient
```

**5. Engagement Rate Card**
```
Background: Dark with green accent
Icon: ❤️
Metric: "5.2%"
Label: "Average Engagement Rate"
Context: "Higher than [X]% of LinkedIn creators"
Gradient: Green gradient
```

**6. New Followers Card**
```
Background: Dark with pink accent
Icon: 🎉
Metric: "+1,234"
Label: "New Followers in 2025"
Context: "Your community is growing!"
Gradient: Pink gradient
```

**7. Top Location Card**
```
Background: Dark with blue accent
Icon: 📍
Metric: "[Location]"
Secondary: "X% of your audience"
Label: "Your Top Audience Location"
Context: "Most of your reach is in [location]"
Gradient: Blue gradient
```

**8. Year Summary Card (Final Card)**
```
Background: Dark with multi-color gradient
Layout: Grid of mini-stats
- Total Impressions: X
- Members Reached: Y
- Engagements: Z
- Top Post: [Truncated]
- New Followers: N
Label: "Your 2025 LinkedIn Year"
CTA: "Share Your Wrapped"
Gradient: Multi-color gradient
```

---

## 📝 Shareable Card Types

### Card Priority & Order
1. **Total Impressions** - Most impressive, shareable number
2. **Top Post** - Personal, relatable content
3. **Members Reached** - Network growth
4. **Top Industry** - Audience insights
5. **Engagement Rate** - Performance metric
6. **New Followers** - Growth metric
7. **Top Location** - Geographic reach
8. **Year Summary** - Complete overview with CTA

### Dynamic Card Generation
```typescript
// site/src/utils/cardDataMapper.ts

export function generateShareableCards(data: ParsedExcelData): ShareableCard[] {
  const cards: ShareableCard[] = [];

  // Card 1: Total Impressions
  if (data.discovery_data?.total_impressions) {
    cards.push({
      id: 'total-impressions',
      type: 'total-impressions',
      title: 'Total Impressions',
      data: {
        value: data.discovery_data.total_impressions,
        label: 'Your posts were seen this many times in 2025',
        icon: '✨',
      },
      shareText: generateShareText('total-impressions', data),
      backgroundColor: 'var(--bg-primary)',
      gradient: 'var(--gradient-primary)',
    });
  }

  // Card 2: Top Post
  if (data.top_posts && data.top_posts.length > 0) {
    const topPost = data.top_posts[0];
    cards.push({
      id: 'top-post',
      type: 'top-post',
      title: 'Your Top Post',
      data: {
        url: topPost.url,
        engagements: topPost.engagements,
        impressions: topPost.impressions,
        date: topPost.publish_date,
        icon: '🏆',
      },
      shareText: generateShareText('top-post', data),
      backgroundColor: 'var(--bg-primary)',
      gradient: 'var(--gradient-primary)',
    });
  }

  // Card 3: Members Reached
  if (data.discovery_data?.members_reached) {
    cards.push({
      id: 'members-reached',
      type: 'members-reached',
      title: 'Members Reached',
      data: {
        value: data.discovery_data.members_reached,
        label: 'Unique professionals you connected with',
        icon: '👥',
      },
      shareText: generateShareText('members-reached', data),
      backgroundColor: 'var(--bg-primary)',
      gradient: 'linear-gradient(135deg, #00D9FF 0%, #0A8FFF 100%)',
    });
  }

  // Card 4: Top Industry
  if (data.demographics?.industries && data.demographics.industries.length > 0) {
    const topIndustry = data.demographics.industries[0];
    cards.push({
      id: 'top-industry',
      type: 'top-industry',
      title: 'Your Top Audience',
      data: {
        industry: topIndustry.name,
        percentage: topIndustry.percentage,
        label: 'of your audience',
        icon: '💼',
      },
      shareText: generateShareText('top-industry', data),
      backgroundColor: 'var(--bg-primary)',
      gradient: 'linear-gradient(135deg, #9945FF 0%, #0A8FFF 100%)',
    });
  }

  // Card 5: Engagement Rate
  if (data.discovery_data?.total_engagements && data.discovery_data?.total_impressions) {
    const engagementRate = (data.discovery_data.total_engagements / data.discovery_data.total_impressions) * 100;
    cards.push({
      id: 'engagement-rate',
      type: 'engagement-rate',
      title: 'Engagement Rate',
      data: {
        value: engagementRate.toFixed(1),
        label: 'Average engagement rate',
        icon: '❤️',
      },
      shareText: generateShareText('engagement-rate', data),
      backgroundColor: 'var(--bg-primary)',
      gradient: 'var(--gradient-accent)',
    });
  }

  // Card 6: New Followers
  if (data.discovery_data?.new_followers) {
    cards.push({
      id: 'new-followers',
      type: 'new-followers',
      title: 'New Followers',
      data: {
        value: data.discovery_data.new_followers,
        label: 'joined your community in 2025',
        icon: '🎉',
      },
      shareText: generateShareText('new-followers', data),
      backgroundColor: 'var(--bg-primary)',
      gradient: 'var(--gradient-warm)',
    });
  }

  // Card 7: Top Location
  if (data.demographics?.locations && data.demographics.locations.length > 0) {
    const topLocation = data.demographics.locations[0];
    cards.push({
      id: 'top-location',
      type: 'top-location',
      title: 'Your Top Location',
      data: {
        location: topLocation.name,
        percentage: topLocation.percentage,
        label: 'of your audience',
        icon: '📍',
      },
      shareText: generateShareText('top-location', data),
      backgroundColor: 'var(--bg-primary)',
      gradient: 'var(--gradient-primary)',
    });
  }

  // Card 8: Year Summary (Always include as final card)
  cards.push({
    id: 'year-summary',
    type: 'year-summary',
    title: 'Your 2025 LinkedIn Year',
    data: {
      impressions: data.discovery_data?.total_impressions || 0,
      membersReached: data.discovery_data?.members_reached || 0,
      engagements: data.discovery_data?.total_engagements || 0,
      newFollowers: data.discovery_data?.new_followers || 0,
      topPosts: data.top_posts?.length || 0,
      icon: '🎊',
    },
    shareText: generateShareText('year-summary', data),
    backgroundColor: 'var(--bg-primary)',
    gradient: 'linear-gradient(135deg, #FF006E 0%, #9945FF 50%, #0A66C2 100%)',
  });

  return cards;
}
```

---

## 🔗 LinkedIn Sharing Integration

### Implementation Approach: Hybrid (Best UX)

**Flow:**
1. User clicks "Share on LinkedIn" button
2. Generate high-quality PNG of card (1200x1200px)
3. Auto-download image to user's device
4. Copy pre-written post text to clipboard
5. Open LinkedIn share page in new tab
6. Show toast notification: "Image downloaded & text copied! Paste and upload to LinkedIn."

### LinkedIn Share URL
```typescript
const linkedInShareUrl = 'https://www.linkedin.com/sharing/share-offsite/';

// Note: LinkedIn's share URL API doesn't support pre-filled text or image uploads
// Users must manually paste text and upload image
```

### Alternative: Direct LinkedIn Post (Requires OAuth)
**Not recommended for MVP** due to complexity, but possible for future:
- Implement LinkedIn OAuth 2.0 flow
- Request `w_member_social` permission
- Use LinkedIn Share API to create post with image
- Requires backend or serverless function to handle OAuth

### Share Button Implementation
```typescript
// site/src/components/WrappedStories/ShareButton.tsx

import React, { useState } from 'react';
import { exportCardAsImage } from '../../utils/imageExport';
import { copyToClipboard } from '../../utils/clipboard';

interface ShareButtonProps {
  cardId: string;
  shareText: string;
  cardRef: React.RefObject<HTMLDivElement>;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  cardId,
  shareText,
  cardRef
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleShare = async () => {
    try {
      setIsExporting(true);

      // Step 1: Export card as image
      const imageBlob = await exportCardAsImage(cardRef.current);

      // Step 2: Download image
      const url = URL.createObjectURL(imageBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `linkedin-wrapped-2025-${cardId}.png`;
      link.click();
      URL.revokeObjectURL(url);

      // Step 3: Copy text to clipboard
      await copyToClipboard(shareText);

      // Step 4: Open LinkedIn share page
      const linkedInUrl = 'https://www.linkedin.com/sharing/share-offsite/';
      window.open(linkedInUrl, '_blank');

      // Step 5: Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);

    } catch (error) {
      console.error('Share failed:', error);
      alert('Failed to generate shareable image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="share-button-container">
      <button
        className="share-button"
        onClick={handleShare}
        disabled={isExporting}
      >
        {isExporting ? (
          <>
            <span className="spinner"></span>
            Preparing...
          </>
        ) : (
          <>
            <span className="linkedin-icon">in</span>
            Share on LinkedIn
          </>
        )}
      </button>

      {showSuccess && (
        <div className="share-success-toast">
          ✅ Image downloaded & text copied! Paste into LinkedIn.
        </div>
      )}
    </div>
  );
};
```

### Share Text Generation
```typescript
// site/src/utils/shareTextTemplates.ts

export function generateShareText(cardType: string, data: ParsedExcelData): string {
  const templates: Record<string, (data: ParsedExcelData) => string> = {
    'total-impressions': (data) => {
      const impressions = formatNumber(data.discovery_data?.total_impressions || 0);
      return `🚀 My 2025 LinkedIn Impact\n\nMy posts reached ${impressions} impressions this year! Grateful to connect with so many amazing professionals.\n\nWant to see your own LinkedIn Wrapped? Check it out: [Your URL]\n\n#LinkedInWrapped #LinkedInStats #ProfessionalGrowth`;
    },

    'top-post': (data) => {
      const topPost = data.top_posts?.[0];
      const engagements = formatNumber(topPost?.engagements || 0);
      return `🏆 My Top LinkedIn Post of 2025\n\nThis post resonated with ${engagements} people! Sometimes the posts you least expect make the biggest impact.\n\nCurious about your top-performing content? Try LinkedIn Wrapped: [Your URL]\n\n#ContentStrategy #LinkedInTips`;
    },

    'members-reached': (data) => {
      const reached = formatNumber(data.discovery_data?.members_reached || 0);
      return `👥 My 2025 LinkedIn Reach\n\nI reached ${reached} unique professionals this year! Each connection and conversation has been valuable.\n\nDiscover who's engaging with your content: [Your URL]\n\n#Networking #LinkedIn #ProfessionalGrowth`;
    },

    'top-industry': (data) => {
      const industry = data.demographics?.industries?.[0]?.name || 'Unknown';
      const percentage = Math.round((data.demographics?.industries?.[0]?.percentage || 0) * 100);
      return `💼 My 2025 LinkedIn Audience\n\n${percentage}% of my audience works in ${industry}! Love connecting with fellow ${industry} professionals.\n\nDiscover your audience demographics: [Your URL]\n\n#Networking #${industry.replace(/\s/g, '')}`;
    },

    'engagement-rate': (data) => {
      const rate = ((data.discovery_data?.total_engagements || 0) / (data.discovery_data?.total_impressions || 1) * 100).toFixed(1);
      return `❤️ My 2025 Engagement Rate\n\n${rate}% average engagement rate! Quality over quantity always wins on LinkedIn.\n\nWhat's your engagement rate? Check: [Your URL]\n\n#LinkedInEngagement #ContentMarketing`;
    },

    'new-followers': (data) => {
      const followers = formatNumber(data.discovery_data?.new_followers || 0);
      return `🎉 My 2025 Growth\n\n+${followers} new followers this year! So grateful for this growing community.\n\nSee your LinkedIn growth: [Your URL]\n\n#LinkedInGrowth #Community #Networking`;
    },

    'top-location': (data) => {
      const location = data.demographics?.locations?.[0]?.name || 'Unknown';
      const percentage = Math.round((data.demographics?.locations?.[0]?.percentage || 0) * 100);
      return `📍 My 2025 Audience Location\n\n${percentage}% of my reach is in ${location}! Love the global nature of LinkedIn.\n\nWhere is your audience? Check: [Your URL]\n\n#GlobalNetwork #LinkedIn`;
    },

    'year-summary': (data) => {
      const impressions = formatNumber(data.discovery_data?.total_impressions || 0);
      const reached = formatNumber(data.discovery_data?.members_reached || 0);
      return `🎊 My 2025 LinkedIn Wrapped\n\nWhat a year!\n• ${impressions} impressions\n• ${reached} members reached\n• Countless meaningful connections\n\nThank you to everyone who engaged with my content!\n\nGet your own LinkedIn Wrapped: [Your URL]\n\n#LinkedInWrapped #2025Wrapped #YearInReview`;
    },
  };

  return templates[cardType]?.(data) || '';
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}
```

---

## 📐 Code Style Guidelines

### General Principles
1. **Simplicity**: Write clear, straightforward code. Avoid over-engineering.
2. **Readability**: Code should be self-documenting. Use descriptive names.
3. **Maintainability**: Keep components small and focused. Extract reusable logic.
4. **Consistency**: Follow existing patterns in the codebase.
5. **Performance**: Optimize where it matters, but don't prematurely optimize.

### TypeScript Best Practices
```typescript
// ✅ Good: Clear type definitions
interface CardData {
  value: number | string;
  label: string;
  icon: string;
  context?: string;
}

// ✅ Good: Explicit return types
function formatMetric(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}

// ✅ Good: Type-safe props
interface StoryCardProps {
  card: ShareableCard;
  onNext: () => void;
  onPrevious: () => void;
  isActive: boolean;
}

// ❌ Avoid: Any types
// function processData(data: any): any { ... }

// ✅ Good: Proper typing
function processData(data: ParsedExcelData): ShareableCard[] { ... }
```

### React Component Style
```typescript
// ✅ Good: Functional components with clear structure
export const StoryCard: React.FC<StoryCardProps> = ({
  card,
  onNext,
  onPrevious,
  isActive
}) => {
  // 1. Hooks at the top
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 2. Derived state / computations
  const formattedValue = useMemo(
    () => formatMetric(card.data.value),
    [card.data.value]
  );

  // 3. Event handlers
  const handleShare = useCallback(async () => {
    setIsExporting(true);
    // ... export logic
    setIsExporting(false);
  }, [card]);

  // 4. Render
  return (
    <div className="story-card" ref={cardRef}>
      <div className="card-content">
        <span className="card-icon">{card.data.icon}</span>
        <h2 className="card-value">{formattedValue}</h2>
        <p className="card-label">{card.data.label}</p>
      </div>
      <ShareButton
        cardId={card.id}
        shareText={card.shareText}
        cardRef={cardRef}
        isExporting={isExporting}
      />
    </div>
  );
};
```

### CSS Organization
```css
/* ✅ Good: Organized, consistent naming */

/* 1. Component container */
.wrapped-stories-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

/* 2. Child elements (alphabetical) */
.story-card {
  background: linear-gradient(135deg, var(--bg-primary), var(--bg-secondary));
  border-radius: 16px;
  padding: 3rem 2rem;
  box-shadow: var(--shadow-lg);
}

.story-progress {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

/* 3. States */
.story-card.active {
  opacity: 1;
  transform: scale(1);
}

.story-card.exiting {
  opacity: 0;
  transform: scale(0.95);
}

/* 4. Responsive (mobile-first or desktop-first, be consistent) */
@media (max-width: 768px) {
  .wrapped-stories-container {
    padding: 1rem;
  }
}
```

### Naming Conventions
```typescript
// Components: PascalCase
WrappedStoriesContainer
StoryCard
ShareButton

// Files: Match component name
WrappedStoriesContainer.tsx
StoryCard.tsx
ShareButton.tsx

// Utilities: camelCase
cardDataMapper.ts
imageExport.ts
shareUtils.ts

// CSS Classes: kebab-case (BEM optional)
.wrapped-stories-container
.story-card
.story-card__icon
.story-card--active

// Constants: UPPER_SNAKE_CASE
const MAX_CARDS = 8;
const DEFAULT_CARD_DURATION = 5000;

// Functions: camelCase, descriptive verbs
generateShareableCards()
exportCardAsImage()
formatMetric()
```

### Error Handling
```typescript
// ✅ Good: Graceful error handling
async function exportCardAsImage(element: HTMLElement): Promise<Blob> {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#0F0F0F',
      logging: false,
    });

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate image'));
        }
      }, 'image/png');
    });
  } catch (error) {
    console.error('Image export failed:', error);
    throw new Error('Failed to export card as image');
  }
}

// Component error boundaries
<ErrorBoundary fallback={<ErrorFallback />}>
  <WrappedStories data={data} />
</ErrorBoundary>
```

### Comments
```typescript
// ✅ Good: Comments explain WHY, not WHAT
// Use html2canvas instead of native APIs for better browser compatibility
const canvas = await html2canvas(element);

// ✅ Good: Document complex logic
/**
 * Generates shareable cards from parsed Excel data.
 * Cards are ordered by virality potential:
 * 1. Total impressions (most impressive number)
 * 2. Top post (personal, relatable)
 * 3. Members reached (network validation)
 * ...
 */
export function generateShareableCards(data: ParsedExcelData): ShareableCard[] {
  // ...
}

// ❌ Avoid: Obvious comments
// Set loading to true
setLoading(true);

// ❌ Avoid: Commented-out code (use git history)
// const oldFunction = () => { ... }
```

---

## 📁 File Structure

```
site/
├── src/
│   ├── components/
│   │   ├── WrappedStories/
│   │   │   ├── WrappedStoriesContainer.tsx      # Main container component
│   │   │   ├── StoryCard.tsx                    # Individual card renderer
│   │   │   ├── StoryProgress.tsx                # Progress indicator bar
│   │   │   ├── ShareButton.tsx                  # LinkedIn share button
│   │   │   ├── CardCanvas.tsx                   # Hidden canvas for image export
│   │   │   └── cards/                           # Type-specific card components
│   │   │       ├── TotalImpressionsCard.tsx
│   │   │       ├── TopPostCard.tsx
│   │   │       ├── MembersReachedCard.tsx
│   │   │       ├── TopIndustryCard.tsx
│   │   │       ├── EngagementRateCard.tsx
│   │   │       ├── NewFollowersCard.tsx
│   │   │       ├── TopLocationCard.tsx
│   │   │       └── YearSummaryCard.tsx
│   │   ├── UnifiedDashboard.tsx                 # [MODIFIED] Add WrappedStories
│   │   └── ...
│   ├── styles/
│   │   ├── WrappedStories.css                   # Story navigation styles
│   │   ├── ShareButton.css                      # Share button styles
│   │   └── Cards.css                            # Individual card styles
│   ├── utils/
│   │   ├── cardDataMapper.ts                    # Excel data → Card data
│   │   ├── imageExport.ts                       # HTML → PNG export
│   │   ├── shareUtils.ts                        # LinkedIn share logic
│   │   ├── shareTextTemplates.ts                # Pre-written post text
│   │   └── clipboard.ts                         # Clipboard utilities
│   └── types/
│       └── wrappedStories.ts                    # TypeScript interfaces
└── package.json                                  # [MODIFIED] Add html2canvas
```

---

## 🚀 Quick Start Implementation Checklist

### Week 1: MVP Launch

#### Day 1-2: Core Structure
- [ ] Create `WrappedStories/` component directory
- [ ] Build `WrappedStoriesContainer` with navigation
- [ ] Implement `StoryProgress` indicator
- [ ] Create `StoryCard` base component
- [ ] Add keyboard navigation (arrow keys)
- [ ] Add click/touch navigation
- [ ] Integrate into `UnifiedDashboard`

#### Day 3-4: Card Design & Data
- [ ] Create `cardDataMapper.ts` utility
- [ ] Implement 8 card type components
- [ ] Style cards with gradients and layouts
- [ ] Test with real LinkedIn data
- [ ] Ensure responsive design (mobile/desktop)

#### Day 5: Image Export
- [ ] Install and configure html2canvas
- [ ] Create `imageExport.ts` utility
- [ ] Test image export across browsers
- [ ] Optimize export quality and file size
- [ ] Add loading states during export

#### Day 6: LinkedIn Sharing
- [ ] Create `ShareButton` component
- [ ] Implement hybrid share flow (download + clipboard + LinkedIn)
- [ ] Write share text templates for all 8 cards
- [ ] Test end-to-end share flow
- [ ] Add success/error notifications

#### Day 7: Polish & Launch
- [ ] Add animations and transitions
- [ ] Mobile optimization and testing
- [ ] Cross-browser testing
- [ ] Performance optimization
- [ ] Deploy to production

---

## 🎯 Success Metrics

### User Engagement
- **Story Completion Rate**: % of users who view all cards
- **Average Cards Viewed**: Mean number of cards viewed per session
- **Share Rate**: % of users who click "Share on LinkedIn"
- **Time on Story**: Average time spent viewing cards

### Viral Metrics
- **LinkedIn Shares**: Track downloads of shareable images
- **External Traffic**: Monitor referrals from LinkedIn posts
- **Social Mentions**: Track #LinkedInWrapped hashtag usage

### Technical Metrics
- **Image Export Success Rate**: % of successful image exports
- **Export Speed**: Time to generate shareable image (target: < 2s)
- **Browser Compatibility**: Success rate across browsers
- **Mobile vs Desktop**: Usage and share rates by platform

---

## 🔮 Future Enhancements (Post-MVP)

### Phase 2 Features
1. **Video Export**: Generate animated MP4 for Instagram/Twitter sharing
2. **Custom Branding**: Let users add their logo/colors
3. **Multi-Year Comparison**: "Your LinkedIn Growth: 2024 vs 2025"
4. **Team Wrapped**: For company pages (aggregate team stats)
5. **OAuth Integration**: Direct posting to LinkedIn (no manual upload)
6. **A/B Testing**: Test different card orders and designs
7. **Analytics Dashboard**: Track viral performance of shared cards
8. **Personalization**: ML-powered card generation based on data quality
9. **Storytelling**: Add narrative text between cards
10. **Gamification**: Badges, achievements, percentile rankings

### Technical Improvements
1. **WebGL Rendering**: Faster, higher-quality card rendering
2. **Progressive Web App**: Install as app, offline support
3. **Server-Side Rendering**: Pre-render cards for SEO
4. **CDN Caching**: Cache generated images for repeat shares
5. **Internationalization**: Support multiple languages
6. **Accessibility**: Enhanced screen reader support, high contrast mode

---

## 📚 Resources & References

### Libraries
- **html2canvas**: [https://html2canvas.hertzen.com/](https://html2canvas.hertzen.com/)
- **React**: [https://react.dev/](https://react.dev/)
- **TypeScript**: [https://www.typescriptlang.org/](https://www.typescriptlang.org/)

### LinkedIn APIs
- **LinkedIn Share API**: [https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin)
- **Image Specs**: 1200x1200px or 1200x628px, < 5MB, PNG/JPEG

### Design Inspiration
- **Spotify Wrapped**: Annual user summary with shareable cards
- **Instagram Stories**: Story-style navigation and UX patterns
- **Duolingo Year in Review**: Gamified annual summary
- **GitHub Skyline**: 3D visualization of contributions (inspiration for future)

### Similar Projects
- **Spotify Wrapped**: The gold standard for viral annual summaries
- **Reddit Recap**: User activity summary with shareable cards
- **Apple Music Replay**: Year-end music listening summary

---

## ✅ Definition of Done

### Feature Complete When:
1. ✅ All 8 card types render correctly with real data
2. ✅ Story navigation works (click, keyboard, swipe)
3. ✅ Image export generates high-quality 1200x1200px PNGs
4. ✅ LinkedIn share flow works end-to-end
5. ✅ Pre-written post text copies to clipboard
6. ✅ Responsive design works on mobile and desktop
7. ✅ Tested in Chrome, Firefox, Safari, Edge
8. ✅ No console errors or warnings
9. ✅ Loading states and error handling in place
10. ✅ Code is clean, documented, and maintainable

### Ready for Launch When:
1. ✅ All "Definition of Done" criteria met
2. ✅ Internal team review complete
3. ✅ Test users successfully share cards to LinkedIn
4. ✅ Performance metrics acceptable (< 2s export time)
5. ✅ Deployed to production
6. ✅ Monitoring and error tracking configured

---

## 🎉 Let's Build Something Viral!

This plan provides a clear roadmap to create a Spotify Wrapped-style experience that will make LinkedIn Wrapped shareable, viral, and memorable. Follow the phases, stick to the code style guidelines, and focus on creating a delightful user experience.

**Remember**: The goal is to make users WANT to share their stats. Every design decision should optimize for shareability and virality.

Good luck! 🚀
