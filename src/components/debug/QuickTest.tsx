import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const QuickTest = () => {
  const [result, setResult] = useState('Testing...');

  useEffect(() => {
    const test = async () => {
      try {

        
        // Test basic query
        const { data, error } = await supabase
          .from('series')
          .select('count(*)')
          .single();
        

        
        if (error) {
          setResult(`❌ Error: ${error.message}`);
        } else {
          setResult(`✅ Success: ${JSON.stringify(data)}`);
        }
      } catch (err) {

        setResult(`❌ Exception: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    test();
  }, []);

  return (
    <div className="p-4 border rounded bg-blue-50">
      <h3 className="font-bold">Quick Database Test</h3>
      <div>{result}</div>
    </div>
  );
};
