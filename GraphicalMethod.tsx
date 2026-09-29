import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, ArrowRight } from 'lucide-react';
import LPGraph from '../components/LPGraph';

const GraphicalMethod: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8">
          <div className="flex items-center space-x-4">
            <LineChart className="h-8 w-8 text-white" />
            <h1 className="text-3xl font-bold text-white">Graphical Method</h1>
          </div>
          <p className="mt-4 text-blue-100 text-lg">
            Solve two-variable linear programming problems visually by plotting constraints
            and finding the optimal point in the feasible region.
          </p>
        </div>
        
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">How It Works</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                    1
                  </div>
                  <p className="text-gray-600">Plot the constraints as lines on a coordinate system</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                    2
                  </div>
                  <p className="text-gray-600">Identify the feasible region where all constraints are satisfied</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                    3
                  </div>
                  <p className="text-gray-600">Find the optimal point by evaluating the objective function at corner points</p>
                </div>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-8"
              >
                <Link
                  to="/graphical-solver"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Solver Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </motion.div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Example Problem</h3>
              <LPGraph
                points={[
                  { x: 0, y: 4 },
                  { x: 4, y: 0 },
                  { x: 0, y: 0 }
                ]}
                feasiblePoints={[
                  { x: 0, y: 0 },
                  { x: 0, y: 4 },
                  { x: 4, y: 0 }
                ]}
                optimalPoint={{ x: 4, y: 0 }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphicalMethod;