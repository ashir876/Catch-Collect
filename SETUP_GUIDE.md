# Pokemon TCG API Setup Guide

## Current Status ✅
- ✅ All components created and integrated
- ✅ Chart components are now visible (with mock data)
- ✅ Debug logging added throughout the data flow
- ✅ Test components added for easy debugging

## Next Steps to Get Real Data Working

### Step 1: Apply Database Migration

**Option A: Supabase Dashboard (Recommended)**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to "SQL Editor" in the left sidebar
4. Copy the entire content of `supabase/migrations/20250724000000_add_price_history.sql`
5. Paste it into the SQL editor
6. Click "Run" to execute the migration

**Option B: Supabase CLI**
```bash
# First, link your project (you'll need your project ref and access token)
npx supabase link --project-ref YOUR_PROJECT_REF

# Then push the migration
npx supabase db push
```

### Step 2: Get PokemonTCG.io API Key

1. Go to [PokemonTCG.io Developer Portal](https://dev.pokemontcg.io/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Create a `.env` file in your project root:

```env
VITE_POKEMON_TCG_API_KEY=your_api_key_here
```

### Step 3: Test the Integration

1. **Start your development server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Open your browser** and go to `http://localhost:8081`

3. **Open browser console** (F12) and run the test:
   ```javascript
   // Test the API connection
   testPokemonAPI()
   
   // Test price updates (after database migration)
   testPriceUpdate()
   ```

4. **Check the Collection page** - you should now see:
   - Test Chart Component with debug info
   - Collection Value Display
   - Price Trends chart for your first card

### Step 4: Verify Everything is Working

**What you should see:**

1. **In the Collection page "Statistics" view:**
   - Test Chart Component at the top
   - Collection Value Display (may show "No data" initially)
   - Price Trends section with a chart

2. **In the browser console:**
   - Debug logs showing data flow
   - API test results
   - Any errors or warnings

3. **Chart should display:**
   - Either real data (if API key and database are set up)
   - Or mock data (for demonstration purposes)

### Troubleshooting

**If the chart still doesn't show:**
1. Check browser console for errors
2. Verify the debug panel shows the card ID and loading state
3. Make sure all components are properly imported

**If API calls fail:**
1. Verify your API key is correct
2. Check that the `.env` file is in the project root
3. Restart the development server after adding the API key

**If database calls fail:**
1. Verify the migration was applied successfully
2. Check Supabase connection in browser console
3. Ensure you're authenticated in the app

### Files to Check

- `src/components/pricing/PriceTrendChart.tsx` - Main chart component
- `src/hooks/usePokemonPricing.tsx` - Data fetching hook
- `src/lib/pokemonTCGService.ts` - API service
- `src/pages/Collection.tsx` - Where components are integrated

### Expected Results

After completing all steps, you should have:
- ✅ Real-time Pokemon card pricing data
- ✅ Collection value calculations
- ✅ Price trend charts
- ✅ Multi-language support for pricing features

The chart will show either real data from the PokemonTCG.io API or mock data for demonstration purposes.
