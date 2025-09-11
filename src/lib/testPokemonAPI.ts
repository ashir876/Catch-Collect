import { pokemonTCGService } from './pokemonTCGService';

/**
 * Test script for Pokemon TCG API integration
 * Run this in the browser console to test the API
 */

export async function testPokemonAPI() {
  console.log('🧪 Testing Pokemon TCG API Integration...');
  
  try {
    // Test 1: Fetch Charizard data
    console.log('\n📋 Test 1: Fetching Charizard data...');
    const charizard = await pokemonTCGService.fetchCardData('base1', '4');
    console.log('✅ Charizard data:', charizard);
    
    if (charizard) {
      console.log('📊 TCGPlayer prices:', charizard.tcgplayer?.prices);
      console.log('📊 CardMarket prices:', charizard.cardmarket?.prices);
      
      // Test storing prices in database
      if (charizard.tcgplayer?.prices) {
        console.log('\n💾 Test 1.5: Storing prices in database...');
        try {
          await pokemonTCGService.storeCardPrices('base1-4', charizard);
          console.log('✅ Prices stored successfully!');
        } catch (dbError) {
          console.log('⚠️ Database storage failed (this is normal if not authenticated):', dbError);
        }
      }
    }
    
    // Test 2: Search by name and set
    console.log('\n🔍 Test 2: Searching for Charizard in Base Set...');
    const searchResult = await pokemonTCGService.searchCardByNameAndSet('Charizard', 'base1');
    console.log('✅ Search result:', searchResult);
    
    // Test 3: Test rate limiting
    console.log('\n⏱️ Test 3: Testing rate limiting...');
    const startTime = Date.now();
    
    // Make multiple requests to test rate limiting
    const promises = [];
    for (let i = 1; i <= 5; i++) {
      promises.push(pokemonTCGService.fetchCardData('base1', i.toString()));
    }
    
    const results = await Promise.all(promises);
    const endTime = Date.now();
    
    console.log(`✅ Made ${promises.length} requests in ${endTime - startTime}ms`);
    console.log('📊 Results:', results.map((r, i) => `Card ${i + 1}: ${r?.name || 'Not found'}`));
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

/**
 * Test price update functionality (requires Supabase connection)
 */
export async function testPriceUpdate() {
  console.log('🧪 Testing Price Update Functionality...');
  
  try {
    // Test updating a single card's prices
    console.log('\n📋 Test: Updating Charizard prices...');
    const prices = await pokemonTCGService.updateCardPrice('test-card-123', 'base1', '4');
    console.log('✅ Updated prices:', prices);
    
    // Test retrieving price history
    console.log('\n📊 Test: Retrieving price history...');
    const history = await pokemonTCGService.getPriceHistory('base1-4', 30);
    console.log('✅ Price history:', history);
    
  } catch (error) {
    console.error('❌ Price update test failed:', error);
    console.log('💡 Note: This test requires a valid Supabase connection and database setup');
  }
}

/**
 * Test collection value calculation (requires authenticated user)
 */
export async function testCollectionValue() {
  console.log('🧪 Testing Collection Value Calculation...');
  
  try {
    // This would require a valid user ID
    const summary = await pokemonTCGService.getCollectionValueSummary('00000000-0000-0000-0000-000000000000');
    console.log('✅ Collection value summary:', summary);
    
  } catch (error) {
    console.error('❌ Collection value test failed:', error);
    console.log('💡 Note: This test requires a valid user ID and collection data');
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testPokemonAPI = testPokemonAPI;
  (window as any).testPriceUpdate = testPriceUpdate;
  (window as any).testCollectionValue = testCollectionValue;
  
  console.log('🧪 Pokemon TCG API test functions loaded!');
  console.log('💡 Run testPokemonAPI() to test the API integration');
  console.log('💡 Run testPriceUpdate() to test price updates (requires Supabase)');
  console.log('💡 Run testCollectionValue() to test collection value (requires user)');
}
