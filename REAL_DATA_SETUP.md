# Real Data Setup Guide

## ✅ Database Migration Applied!
Great! You've successfully applied the database migration. Now let's get real pricing data working.

## Step 1: Get Your API Key (2 minutes)

1. Go to [PokemonTCG.io Developer Portal](https://dev.pokemontcg.io/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Create a `.env` file in your project root with:
   ```env
   VITE_POKEMON_TCG_API_KEY=your_actual_api_key_here
   ```

## Step 2: Restart Your App

After creating the `.env` file, restart your development server:
```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## Step 3: Test the Integration

1. **Open your browser** and go to `http://localhost:8082` (or whatever port it's running on)

2. **Open browser console** (F12) and run these commands:

   ```javascript
   // Test the API connection
   testPokemonAPI()
   
   // Populate database with initial price data
   populatePriceData()
   
   // Check if data was stored
   testDatabaseData()
   ```

3. **Check your Collection page** - go to Collection → Statistics view

## Step 4: What You Should See

### In the Browser Console:
- ✅ API connection test results
- ✅ Price data being fetched and stored
- ✅ Database queries working

### In Your App:
- ✅ Test Chart Component with debug info
- ✅ Collection Value Display (may show "No data" initially)
- ✅ Price Trends chart showing real data (after running `populatePriceData()`)

## Troubleshooting

**If API calls fail:**
- Check your API key is correct
- Make sure the `.env` file is in the project root
- Restart the development server after adding the API key

**If database calls fail:**
- Verify you're authenticated in the app
- Check browser console for Supabase connection errors

**If chart shows "No data available":**
- Run `populatePriceData()` in the browser console
- Check that the database migration was applied correctly

## Quick Commands

Once everything is set up, you can use these commands in the browser console:

```javascript
// Fetch and store prices for popular cards
populatePriceData()

// Test the API connection
testPokemonAPI()

// Check database data
testDatabaseData()

// Update prices for a specific card
pokemonTCGService.updateCardPrice('your-card-id', 'base1', '4')
```

## Expected Results

After completing all steps:
- ✅ Real Pokemon card pricing data from PokemonTCG.io
- ✅ Price history stored in your Supabase database
- ✅ Interactive price trend charts
- ✅ Collection value calculations
- ✅ Multi-language support for all pricing features

The chart will now show real market data instead of mock data!

