import React from 'react';
import { CheckCircle } from 'lucide-react';

const CollectionIconTest = () => {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Collection Icon Test</h2>
      
      {/* Test 1: Basic icon */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Basic Icon</h3>
        <div className="relative w-32 h-48 bg-gray-200 border rounded-lg">
          <div className="bg-green-500 text-white rounded-full p-1 shadow-lg absolute top-2 left-2">
            <CheckCircle className="h-4 w-4" />
          </div>
          <div className="absolute bottom-2 left-2 text-xs">Basic Icon</div>
        </div>
      </div>

      {/* Test 2: Icon with inline styles */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Icon with Inline Styles</h3>
        <div className="relative w-32 h-48 bg-gray-200 border rounded-lg">
          <div 
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              backgroundColor: '#059669',
              color: 'white',
              borderRadius: '50%',
              padding: '4px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: '2px solid white'
            }}
          >
            <CheckCircle className="h-4 w-4" />
          </div>
          <div className="absolute bottom-2 left-2 text-xs">Inline Styles</div>
        </div>
      </div>

      {/* Test 3: Icon with high z-index */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Icon with High Z-Index</h3>
        <div className="relative w-32 h-48 bg-gray-200 border rounded-lg">
          <div 
            className="bg-emerald-600 text-white rounded-full p-1 shadow-lg border-2 border-white"
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              zIndex: 9999
            }}
          >
            <CheckCircle className="h-4 w-4" />
          </div>
          <div className="absolute bottom-2 left-2 text-xs">High Z-Index</div>
        </div>
      </div>

      {/* Test 4: Icon with different colors */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Icon with Different Colors</h3>
        <div className="relative w-32 h-48 bg-gray-200 border rounded-lg">
          <div 
            className="bg-red-500 text-white rounded-full p-1 shadow-lg border-2 border-white"
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              zIndex: 9999
            }}
          >
            <CheckCircle className="h-4 w-4" />
          </div>
          <div className="absolute bottom-2 left-2 text-xs">Red Icon</div>
        </div>
      </div>
    </div>
  );
};

export default CollectionIconTest;
