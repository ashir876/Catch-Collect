import { supabase } from '@/integrations/supabase/client';

export async function testPriceData() {
  console.log('🔍 Testing price data in database...');
  
  // Check if price_history table has any data
  const { data: priceHistory, error: priceError } = await supabase
    .from('price_history')
    .select('*')
    .limit(5);
  
  console.log('Price History Data:', priceHistory);
  console.log('Price History Error:', priceError);
  
  // Check current_prices view
  const { data: currentPrices, error: currentError } = await supabase
    .from('current_prices')
    .select('*')
    .limit(5);
  
  console.log('Current Prices Data:', currentPrices);
  console.log('Current Prices Error:', currentError);
  
  // Test the collection value summary function with a valid UUID format
  const { data: collectionValue, error: collectionError } = await supabase
    .rpc('get_collection_value_summary', {
      p_user_id: '00000000-0000-0000-0000-000000000000', // Use a valid UUID format for testing
      p_language: 'DE'
    });
  
  console.log('Collection Value Summary:', collectionValue);
  console.log('Collection Value Error:', collectionError);
}

// Run the test if this file is executed directly
if (typeof window !== 'undefined') {
  // Make it available globally for testing
  (window as any).testPriceData = testPriceData;
}
