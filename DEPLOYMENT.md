# Deployment Guide for Catch & Collect Emporium

## Vercel Deployment

This project is configured for seamless deployment on Vercel with proper SPA (Single Page Application) routing support.

### Prerequisites

1. A Vercel account
2. GitHub repository connected to Vercel
3. Node.js 18+ installed locally

### Configuration Files

The following files have been configured for optimal Vercel deployment:

#### `vercel.json`
- Configures SPA routing with catch-all rewrites to `index.html`
- Sets up optimal caching headers for static assets
- Defines build settings and output directory

#### `vite.config.ts`
- Optimized build configuration with code splitting
- Proper base path configuration
- Source maps for development mode only

### Environment Variables

Set up these environment variables in your Vercel dashboard:

```bash
VITE_SUPABASE_URL=https://gezhdauazitnymbtmlat.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_TITLE=Catch & Collect Emporium
VITE_APP_ENV=production
```

### Deployment Steps

1. **Connect Repository to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository

2. **Configure Build Settings:**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables:**
   - In Vercel dashboard, go to Project Settings > Environment Variables
   - Add the required environment variables listed above

4. **Deploy:**
   - Click "Deploy" to trigger the first deployment
   - Subsequent deployments will happen automatically on git push

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Build Commands

- `npm run build` - Production build
- `npm run build:prod` - Explicit production build
- `npm run build:dev` - Development build with source maps
- `npm run clean` - Clean dist directory

### Routing

The application uses React Router with the following key configurations:

- **BrowserRouter**: Enables client-side routing
- **Catch-all Route**: `*` route handles 404s with custom NotFound component
- **Dynamic Routes**: `/card/:id` for individual card details

### Common Issues and Solutions

1. **404 on Direct URL Access:**
   - Fixed by `vercel.json` rewrite rules
   - All routes redirect to `index.html` for client-side handling

2. **Environment Variables Not Loading:**
   - Ensure variables are prefixed with `VITE_`
   - Set in Vercel dashboard under Environment Variables

3. **Build Failures:**
   - Check that all dependencies are in `package.json`
   - Verify TypeScript types are correctly defined

4. **Static Asset Loading Issues:**
   - Assets in `public/` directory are served from root
   - Images and other assets use relative paths

### Performance Optimizations

- **Code Splitting**: Vendor, router, and UI components are split into separate chunks
- **Caching**: Static assets cached for 1 year with immutable headers
- **Compression**: Vercel automatically compresses assets

### Monitoring and Analytics

Consider setting up:
- Vercel Analytics for performance monitoring
- Error tracking (Sentry, etc.)
- User analytics (if required)

### Support

For deployment issues:
1. Check Vercel deployment logs
2. Verify environment variables are set correctly
3. Test build locally with `npm run build`
4. Check browser console for runtime errors
