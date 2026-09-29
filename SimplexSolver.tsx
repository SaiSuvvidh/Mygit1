import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Play, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import SimplexTableau from '../components/SimplexTableau';
import { solveSimplexMethod } from '../utils/simplexSolver';

interface Constraint {
  coefficients: number[];
  sign: '<=' | '>=' | '=';
  rhs: number;
}

const SimplexSolver: React.FC = () => {
  const [numVariables, setNumVariables] = useState(2);
  const [objectiveType, setObjectiveType] = useState<'max' | 'min'>('max');
  const [objectiveCoefficients, setObjectiveCoefficients] = useState<number[]>([0, 0]);
  const [constraints, setConstraints] = useState<Constraint[]>([]);
  const [solution, setSolution] = useState<any>(null);
  const [currentIteration, setCurrentIteration] = useState(0);

  const updateObjectiveCoefficient = (index: number, value: number) => {
    const newCoefficients = [...objectiveCoefficients];
    newCoefficients[index] = value;
    setObjectiveCoefficients(newCoefficients);
  };

  const addConstraint = () => {
    setConstraints([
      ...constraints,
      {
        coefficients: Array(numVariables).fill(0),
        sign: '<=',
        rhs: 0
      }
    ]);
  };

  const updateConstraint = (index: number, field: keyof Constraint, value: any) => {
    const newConstraints = [...constraints];
    if (field === 'coefficients') {
      const [coefIndex, coefValue] = value;
      newConstraints[index].coefficients[coefIndex] = coefValue;
    } else {
      newConstraints[index][field] = value;
    }
    setConstraints(newConstraints);
  };

  const removeConstraint = (index: number) => {
    setConstraints(constraints.filter((_, i) => i !== index));
  };

  const handleSolve = () => {
    const solution = solveSimplexMethod(
      { coefficients: objectiveCoefficients, type: objectiveType },
      constraints
    );
    setSolution(solution);
    setCurrentIteration(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Simplex Method Solver</h1>
        
        <div className="space-y-8">
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Objective Function</h2>
            <div className="flex items-center space-x-4">
              <select
                value={objectiveType}
                onChange={(e) => setObjectiveType(e.target.value as 'max' | 'min')}
                className="bg-white border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="max">Maximize</option>
                <option value="min">Minimize</option>
              </select>
              {objectiveCoefficients.map((coef, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={coef}
                    onChange={(e) => updateObjectiveCoefficient(index, parseFloat(e.target.value) || 0)}
                    className="border border-gray-300 rounded-md px-3 py-2 w-20"
                  />
                  <span>x{index + 1}</span>
                  {index < objectiveCoefficients.length - 1 && <span>+</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Constraints</h2>
            <div className="space-y-4">
              {constraints.map((constraint, constraintIndex) => (
                <div key={constraintIndex} className="flex items-center space-x-2">
                  {constraint.coefficients.map((coef, coefIndex) => (
                    <React.Fragment key={coefIndex}>
                      <input
                        type="number"
                        value={coef}
                        onChange={(e) => updateConstraint(
                          constraintIndex,
                          'coefficients',
                          [coefIndex, parseFloat(e.target.value) || 0]
                        )}
                        className="border border-gray-300 rounded-md px-3 py-2 w-20"
                      />
                      <span>x{coefIndex + 1}</span>
                      {coefIndex < constraint.coefficients.length - 1 && <span>+</span>}
                    </React.Fragment>
                  ))}
                  <select
                    value={constraint.sign}
                    onChange={(e) => updateConstraint(
                      constraintIndex,
                      'sign',
                      e.target.value as '<=' | '>=' | '='
                    )}
                    className="border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="<=">&le;</option>
                    <option value=">=">&ge;</option>
                    <option value="=">=</option>
                  </select>
                  <input
                    type="number"
                    value={constraint.rhs}
                    onChange={(e) => updateConstraint(
                      constraintIndex,
                      'rhs',
                      parseFloat(e.target.value) || 0
                    )}
                    className="border border-gray-300 rounded-md px-3 py-2 w-20"
                  />
                  <button
                    onClick={() => removeConstraint(constraintIndex)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-4 space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={addConstraint}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Constraint
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSolve}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Play className="h-5 w-5 mr-2" />
                Solve
              </motion.button>
            </div>
          </div>

          {solution && (
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Solution</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentIteration(Math.max(0, currentIteration - 1))}
                    disabled={currentIteration === 0}
                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentIteration(Math.min(solution.iterations.length - 1, currentIteration + 1))}
                    disabled={currentIteration === solution.iterations.length - 1}
                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {solution.error ? (
                <p className="text-red-600">{solution.error}</p>
              ) : (
                <>
                  <SimplexTableau
                    tableau={solution.iterations[currentIteration]}
                    variables={Array.from({ length: numVariables }, (_, i) => `x${i + 1}`)}
                    iteration={currentIteration}
                  />
                  {solution.optimal && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                      <p className="text-green-800">
                        Optimal Solution Found:
                      </p>
                      <p className="mt-2">
                        Optimal Value: {solution.optimalValue?.toFixed(2)}
                      </p>
                      <p className="mt-1">
                        Solution: {solution.optimalSolution?.map((val: number, i: number) => 
                          `x${i + 1} = ${val.toFixed(2)}`).join(', ')}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimplexSolver;