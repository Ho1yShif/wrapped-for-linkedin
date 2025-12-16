# Wrapped for LinkedIn

Wrapped for LinkedIn transforms your LinkedIn activity into an engaging, visual story inspired by Spotify Wrapped. Discover your most impactful posts, understand who's engaging with your content, and check out your year in review.

Wrapped for LinkedIn is a fully client-side application. Your data is processed entirely in your browser and never leaves your device. The app is powered by and deployed on [Render](https://render.com/).

Created by [Shifra Williams](https://www.linkedin.com/in/shifra-williams/) and [Venkata Naga Sai Kumar Bysani](https://www.linkedin.com/in/saibysani18/).

> [!NOTE]  
> This project is not affiliated with, endorsed by, or connected to LinkedIn or Microsoft.

🫶 _Made with love for the developer community_

## ✨ Features

- **🎨 Shareable cards** - Beautiful graphics that are ready to share on LinkedIn
- **📊 Top posts analytics** - See your highest-performing posts ranked by impressions, engagement rate, and comments
- **👥 Audience demographics** - Visualize your followers and engagers by industry, seniority, location, and company size
- **📱 Instagram-inspired UX** - Swipe through cards like Instagram stories with autoplay, press-and-hold to pause, and mobile tap navigation
- **📈 Demo data** - Try the app with sample analytics data without uploading your own file
- **💾 Local caching** - Your data stays in your browser and is cached for quick access on return visits

## 🚀 Quickstart

### Prerequisites

- LinkedIn account
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js 20.19+ or 22.12+ or 23.x+ (with npm)

### Run Wrapped for LinkedIn locally

**Option 1: Using the preview script (recommended)**

```bash
git clone https://github.com/Ho1yShif/wrapped-for-linkedin.git
cd site
npm install # Install dependencies in site/
cd ..  # Navigate back to project root
bin/preview.sh
```

Open your browser to `http://localhost:5173`

**Option 2: Manual setup**

```bash
git clone https://github.com/Ho1yShif/wrapped-for-linkedin.git
cd site
npm install
npm run dev
```

### Get your Wrapped for LinkedIn

1. Visit the live app at [linkedin-wrapped.onrender.com](https://linkedin-wrapped.onrender.com) (powered by Render)
1. Export your [LinkedIn analytics](https://www.linkedin.com/analytics/creator/content/?metricType=ENGAGEMENTS&timeRange=past_365_days) as an Excel file.
   - See detailed instructions on the [Wrapped for LinkedIn landing page](https://linkedin-wrapped.onrender.com)
1. Upload the file to Wrapped for LinkedIn in the browser.
1. Explore and share your Wrapped for LinkedIn dashboard!

## 🤝 Contribute

Contributions are welcome! Please follow these steps:

1. Fork the repository
1. Create your feature branch
1. Commit your changes
1. Push to the branch
1. Open a pull request