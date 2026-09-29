import React from 'react';
import FloatingTabs from '../components/FloatingTabs';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Linear Programming Solver
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose a method below to start solving your linear programming problems efficiently and accurately.
          </p>
        </div>
        <FloatingTabs />
      </div>
    </div>
  );
};

export default Home;