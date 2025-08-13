import { pokemonTCGService } from './pokemonTCGService';

/**
 * Script to populate the database with initial price data
 * Run this in the browser console after setting up your API key
 */

export async function populatePriceData() {
  console.log('🌱 Populating database with initial price data...');
  
  try {
    // Popular cards to fetch prices for
    const popularCards = [
      { setId: 'base1', cardNumber: '4', name: 'Charizard' },
      { setId: 'base1', cardNumber: '2', name: 'Blastoise' },
      { setId: 'base1', cardNumber: '3', name: 'Venusaur' },
      { setId: 'base1', cardNumber: '15', name: 'Alakazam' },
      { setId: 'base1', cardNumber: '1', name: 'Alakazam' },
    ];

    console.log(`📋 Fetching prices for ${popularCards.length} popular cards...`);

    for (const card of popularCards) {
      try {
        console.log(`\n🔄 Fetching ${card.name} (${card.setId}-${card.cardNumber})...`);
        
        // Fetch card data from API
        const cardData = await pokemonTCGService.fetchCardData(card.setId, card.cardNumber);
        
        if (cardData) {
          console.log(`✅ Found ${card.name}:`, cardData.name);
          
          // Store prices in database
          const cardId = `${card.setId}-${card.cardNumber}`;
          await pokemonTCGService.storeCardPrices(cardId, cardData);
          console.log(`💾 Stored prices for ${card.name}`);
          
          // Add some delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          console.log(`⚠️ No data found for ${card.name}`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${card.name}:`, error);
      }
    }

    console.log('\n🎉 Price data population completed!');
    console.log('💡 You can now view real price data in your charts');
    
  } catch (error) {
    console.error('❌ Failed to populate price data:', error);
  }
}

/**
 * Quick test to verify the database has data
 */
export async function testDatabaseData() {
  console.log('🧪 Testing database data...');
  
  try {
    // Test getting price history for Charizard
    const history = await pokemonTCGService.getPriceHistory('base1-4', 30);
    console.log('📊 Charizard price history:', history);
    
    if (history && history.length > 0) {
      console.log('✅ Database has price data!');
      console.log(`📈 Found ${history.length} price records`);
    } else {
      console.log('⚠️ No price data found in database');
      console.log('💡 Run populatePriceData() to add some data');
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).populatePriceData = populatePriceData;
  (window as any).testDatabaseData = testDatabaseData;
  
  console.log('🌱 Price data population functions loaded!');
  console.log('💡 Run populatePriceData() to add initial price data');
  console.log('💡 Run testDatabaseData() to check existing data');
}

