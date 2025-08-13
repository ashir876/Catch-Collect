# Chart Debug Guide

## Problem
The `PriceTrendChart` component was not showing because:

1. **Database not set up**: The pricing database tables and functions don't exist yet
2. **Component not integrated**: The pricing components were created but not added to the actual application
3. **No fallback data**: The component would show nothing when no data was available

## Solutions Applied

### 1. Added Debug Logging
- Added console.log statements throughout the data flow to help identify issues
- Added debug info panel in the chart component showing current state

### 2. Added Mock Data Fallback
- When no database data is available, the chart now shows mock price data
- This ensures the chart always renders something for demonstration purposes
- Mock data shows a realistic price trend over 7 days

### 3. Integrated Components into Collection Page
- Added `CollectionValueDisplay` to replace the static total value card
- Added `PriceTrendChart` to the stats view with a sample card
- Added `TestChart` component for easy debugging

### 4. Fixed Import Issues
- Fixed `useTranslation` import from `@/i18n` to `react-i18next`

## Current Status

The chart should now be visible in the Collection page under the "Statistics" view. You should see:

1. **Test Chart Component** at the top with debug information
2. **Collection Value Display** showing pricing information (may show "No data" if database not set up)
3. **Price Trends** section showing chart for the first card in your collection

## Next Steps

To get real pricing data working:

1. **Apply Database Migration**: Run the migration file `supabase/migrations/20250724000000_add_price_history.sql` in your Supabase database
2. **Set up API Key**: Get a free API key from [PokemonTCG.io](https://dev.pokemontcg.io/) and add it to your environment variables
3. **Test API Integration**: Use the test script `src/lib/testPokemonAPI.ts` to verify the API connection

## Debug Information

The chart now includes a debug panel showing:
- Card ID being queried
- Loading state
- Any errors
- Number of data points received

Check the browser console for detailed logging of the data flow.

## Files Modified

- `src/components/pricing/PriceTrendChart.tsx` - Added debug logging and mock data fallback
- `src/components/pricing/CollectionValueDisplay.tsx` - Fixed import
- `src/components/pricing/CardPriceDisplay.tsx` - Fixed import
- `src/pages/Collection.tsx` - Integrated pricing components
- `src/hooks/usePokemonPricing.tsx` - Added debug logging
- `src/lib/pokemonTCGService.ts` - Added debug logging
- `src/components/pricing/TestChart.tsx` - Created test component
