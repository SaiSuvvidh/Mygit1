import React from 'react';
import { Package } from 'lucide-react';

export default function Home() {
  return (
    <div className="text-center">
      <div className="max-w-2xl mx-auto">
        <Package className="h-16 w-16 mx-auto text-blue-600 mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to E-Bay Clone
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Your one-stop destination for buying and selling items online.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Start Selling</h2>
            <p className="text-gray-600">
              List your items and reach millions of buyers worldwide.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Start Shopping</h2>
            <p className="text-gray-600">
              Find great deals on millions of items.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}