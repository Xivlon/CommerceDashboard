# Commerce Dashboard - Static Deployment Guide

This AI-Powered E-commerce Analytics Dashboard is now ready to be deployed as a static website on any web hosting platform.

## Quick Start

1. **Build the static assets:**
   ```bash
   npm install
   npm run build
   ```

2. **Deploy the `dist/public` folder:**
   - Upload the entire `dist/public` folder to your web hosting service
   - The `index.html` file should be at the root of your web directory
   - All assets use relative paths, so it works from any domain/subdirectory

## Deployment Options

### Static Hosting Services
- **Netlify**: Drag and drop the `dist/public` folder
- **Vercel**: Deploy the `dist/public` folder
- **GitHub Pages**: Upload contents to your repository
- **AWS S3**: Upload to an S3 bucket with static website hosting
- **Any Web Server**: Upload to your web server's public directory

### Local Testing
```bash
cd dist/public
python3 -m http.server 8080
# Visit http://localhost:8080
```

## Features Available in Static Mode

The dashboard includes:
- ✅ Responsive design that works on all devices
- ✅ Multiple analytics tabs (Overview, Customer CLV, Churn Analysis, etc.)
- ✅ Theme toggle (light/dark mode)
- ✅ Interactive UI components
- ✅ Modern design with smooth animations

## Technical Details

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom theme support
- **Build Tool**: Vite with optimized production builds
- **Assets**: All assets use relative paths (`./assets/...`)
- **Bundle Size**: ~839KB JavaScript, ~76KB CSS (gzipped: ~240KB JS, ~13KB CSS)

## Notes

- The dashboard UI is fully functional in static mode
- Some advanced features (like live data) would require connecting to backend APIs
- The dashboard gracefully shows placeholder states when no data is available
- All modern browsers are supported (ES2015+)