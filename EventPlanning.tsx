import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Play, Trash2, Download, HelpCircle } from 'lucide-react';
import { solveSimplexMethod } from '../utils/simplexSolver';

interface Activity {
  name: string;
  minBudget: number;
  maxBudget: number;
  impactScore: number;
}

interface Contribution {
  name: string;
  amount: number;
}

const EventPlanning: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [initialBudget, setInitialBudget] = useState<number>(0);
  const [solution, setSolution] = useState<number[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalBudget = initialBudget + contributions.reduce((sum, c) => sum + c.amount, 0);

  const addActivity = () => {
    setActivities([
      ...activities,
      {
        name: `Activity ${activities.length + 1}`,
        minBudget: 0,
        maxBudget: 0,
        impactScore: 0
      }
    ]);
  };

  const addContribution = () => {
    setContributions([
      ...contributions,
      {
        name: `Sponsor ${contributions.length + 1}`,
        amount: 0
      }
    ]);
  };

  const updateActivity = (index: number, field: keyof Activity, value: string | number) => {
    const newActivities = [...activities];
    newActivities[index] = {
      ...newActivities[index],
      [field]: typeof value === 'string' ? value : Number(value)
    };
    setActivities(newActivities);
  };

  const updateContribution = (index: number, field: keyof Contribution, value: string | number) => {
    const newContributions = [...contributions];
    newContributions[index] = {
      ...newContributions[index],
      [field]: typeof value === 'string' ? value : Number(value)
    };
    setContributions(newContributions);
  };

  const removeActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const removeContribution = (index: number) => {
    setContributions(contributions.filter((_, i) => i !== index));
  };

  const validateInputs = () => {
    if (activities.length === 0) {
      setError('Add at least one activity');
      return false;
    }

    for (const activity of activities) {
      if (activity.minBudget < 0 || activity.maxBudget < 0 || activity.impactScore < 0) {
        setError('All values must be non-negative');
        return false;
      }
      if (activity.minBudget > activity.maxBudget) {
        setError('Minimum budget cannot exceed maximum budget');
        return false;
      }
      if (activity.maxBudget > totalBudget) {
        setError('Maximum budget cannot exceed total available budget');
        return false;
      }
    }

    setError(null);
    return true;
  };

  const optimizeBudget = () => {
    if (!validateInputs()) return;

    // Prepare LP problem
    const objectiveCoefficients = activities.map(a => a.impactScore);
    const constraints = [
      // Budget constraint
      {
        coefficients: activities.map(() => 1),
        sign: '<=' as const,
        rhs: totalBudget
      },
      // Min budget constraints
      ...activities.map((activity, i) => ({
        coefficients: activities.map((_, j) => i === j ? 1 : 0),
        sign: '>=' as const,
        rhs: activity.minBudget
      })),
      // Max budget constraints
      ...activities.map((activity, i) => ({
        coefficients: activities.map((_, j) => i === j ? 1 : 0),
        sign: '<=' as const,
        rhs: activity.maxBudget
      }))
    ];

    const result = solveSimplexMethod(
      { coefficients: objectiveCoefficients, type: 'max' },
      constraints
    );

    if (result.optimal && result.optimalSolution) {
      setSolution(result.optimalSolution);
    } else {
      setError(result.error || 'Failed to find optimal solution');
    }
  };

  const downloadCSV = () => {
    if (!solution) return;

    const rows = [
      ['Activity', 'Allocated Budget', 'Impact Score'],
      ...activities.map((activity, i) => [
        activity.name,
        solution[i].toFixed(2),
        activity.impactScore
      ])
    ];

    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'budget_allocation.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Event Planning Budget Optimization</h1>
        
        <div className="space-y-8">
          {/* Initial Budget Input */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Initial Budget</h2>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                value={initialBudget}
                onChange={(e) => setInitialBudget(Math.max(0, Number(e.target.value)))}
                className="border border-gray-300 rounded-md px-3 py-2 w-40"
                placeholder="Enter budget"
                min="0"
              />
              <div className="text-sm text-gray-500">
                Total Available: ${totalBudget.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Contributions Section */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Contributions</h2>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={addContribution}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Contribution
              </motion.button>
            </div>
            <div className="space-y-4">
              {contributions.map((contribution, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={contribution.name}
                    onChange={(e) => updateContribution(index, 'name', e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 flex-1"
                    placeholder="Sponsor name"
                  />
                  <input
                    type="number"
                    value={contribution.amount}
                    onChange={(e) => updateContribution(index, 'amount', Math.max(0, Number(e.target.value)))}
                    className="border border-gray-300 rounded-md px-3 py-2 w-40"
                    placeholder="Amount"
                    min="0"
                  />
                  <button
                    onClick={() => removeContribution(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Activities Section */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Activities</h2>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={addActivity}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Activity
              </motion.button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Min Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Max Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Impact Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activities.map((activity, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={activity.name}
                          onChange={(e) => updateActivity(index, 'name', e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-2 w-full"
                          placeholder="Activity name"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          value={activity.minBudget}
                          onChange={(e) => updateActivity(index, 'minBudget', Math.max(0, Number(e.target.value)))}
                          className="border border-gray-300 rounded-md px-3 py-2 w-32"
                          placeholder="Min budget"
                          min="0"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          value={activity.maxBudget}
                          onChange={(e) => updateActivity(index, 'maxBudget', Math.max(0, Number(e.target.value)))}
                          className="border border-gray-300 rounded-md px-3 py-2 w-32"
                          placeholder="Max budget"
                          min="0"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          value={activity.impactScore}
                          onChange={(e) => updateActivity(index, 'impactScore', Math.max(0, Number(e.target.value)))}
                          className="border border-gray-300 rounded-md px-3 py-2 w-32"
                          placeholder="Impact score"
                          min="0"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => removeActivity(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <div className="space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={optimizeBudget}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                <Play className="h-5 w-5 mr-2" />
                Optimize Budget
              </motion.button>
              {solution && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={downloadCSV}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download CSV
                </motion.button>
              )}
            </div>
            {error && (
              <p className="text-red-600">{error}</p>
            )}
          </div>

          {/* Results */}
          {solution && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Optimized Budget Allocation</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Activity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Allocated Budget
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Impact Score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activities.map((activity, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {activity.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${solution[index].toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {activity.impactScore}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Total
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${solution.reduce((sum, val) => sum + val, 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {activities.reduce((sum, activity, i) => sum + activity.impactScore * solution[i], 0).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventPlanning;