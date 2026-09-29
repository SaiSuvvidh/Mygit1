// Core implementation of the Simplex Method algorithm
interface TableauRow {
  coefficients: number[];
  rhs: number;
  isObjective?: boolean;
}

interface SimplexSolution {
  optimal: boolean;
  iterations: TableauRow[][];
  optimalValue: number | null;
  optimalSolution: number[] | null;
  error?: string;
}

export function solveSimplexMethod(
  objectiveFunction: { coefficients: number[]; type: 'max' | 'min' },
  constraints: { coefficients: number[]; sign: '<=' | '>=' | '='; rhs: number }[]
): SimplexSolution {
  try {
    // Convert minimization to maximization by negating objective coefficients
    const isMinimization = objectiveFunction.type === 'min';
    const standardObjective = isMinimization
      ? objectiveFunction.coefficients.map(c => -c)
      : [...objectiveFunction.coefficients];

    // Get dimensions
    const numVariables = objectiveFunction.coefficients.length;
    const numConstraints = constraints.length;

    // Initialize tableau
    let tableau: TableauRow[] = [];

    // Process constraints and add slack variables
    constraints.forEach((constraint, i) => {
      // Convert ">=" to "<=" by multiplying by -1
      let coeffs = [...constraint.coefficients];
      let rhs = constraint.rhs;
      let sign = constraint.sign;
      
      if (sign === '>=') {
        coeffs = coeffs.map(c => -c);
        rhs = -rhs;
        sign = '<=';
      }

      // Add slack variables (one per constraint)
      const slackVars = Array(numConstraints).fill(0);
      slackVars[i] = 1;
      
      tableau.push({
        coefficients: [...coeffs, ...slackVars],
        rhs: rhs
      });
    });

    // Add objective function row (negated for maximization standard form)
    const objectiveRow = standardObjective.map(c => -c);
    for (let i = 0; i < numConstraints; i++) {
      objectiveRow.push(0);
    }
    tableau.push({ 
      coefficients: objectiveRow, 
      rhs: 0, 
      isObjective: true 
    });

    // Store iterations for visualization
    const iterations: TableauRow[][] = [JSON.parse(JSON.stringify(tableau))];
    const maxIterations = 100;
    let iteration = 0;

    while (iteration < maxIterations) {
      const objRow = tableau[tableau.length - 1];
      
      // Find pivot column (most negative coefficient)
      let pivotColumn = -1;
      let mostNegative = -1e-10;
      for (let j = 0; j < objRow.coefficients.length; j++) {
        if (objRow.coefficients[j] < mostNegative) {
          mostNegative = objRow.coefficients[j];
          pivotColumn = j;
        }
      }

      // Check if optimal
      if (pivotColumn === -1) {
        // Extract solution from final tableau
        const solution = Array(numVariables).fill(0);
        for (let j = 0; j < numVariables; j++) {
          let basicRow = -1;
          let isBasic = true;
          
          // Check if column is basic
          for (let i = 0; i < tableau.length - 1; i++) {
            const value = tableau[i].coefficients[j];
            if (Math.abs(value - 1) < 1e-10) {
              if (basicRow === -1) basicRow = i;
              else {
                isBasic = false;
                break;
              }
            } else if (Math.abs(value) > 1e-10) {
              isBasic = false;
              break;
            }
          }
          
          if (isBasic && basicRow !== -1) {
            solution[j] = tableau[basicRow].rhs;
          }
        }

        const optimalValue = isMinimization ? -objRow.rhs : objRow.rhs;
        return {
          optimal: true,
          iterations,
          optimalValue,
          optimalSolution: solution
        };
      }

      // Find pivot row using minimum ratio test
      let pivotRow = -1;
      let minRatio = Infinity;
      for (let i = 0; i < tableau.length - 1; i++) {
        const row = tableau[i];
        const colValue = row.coefficients[pivotColumn];
        if (colValue > 1e-10) {
          const ratio = row.rhs / colValue;
          if (ratio < minRatio) {
            minRatio = ratio;
            pivotRow = i;
          }
        }
      }

      // Check if unbounded
      if (pivotRow === -1) {
        return {
          optimal: false,
          iterations,
          optimalValue: null,
          optimalSolution: null,
          error: 'Problem is unbounded'
        };
      }

      // Perform pivot operation
      const pivotElement = tableau[pivotRow].coefficients[pivotColumn];
      const normalizedPivotRow: TableauRow = {
        coefficients: tableau[pivotRow].coefficients.map(c => c / pivotElement),
        rhs: tableau[pivotRow].rhs / pivotElement
      };

      // Update tableau
      const newTableau: TableauRow[] = [];
      for (let i = 0; i < tableau.length; i++) {
        if (i === pivotRow) {
          newTableau.push(normalizedPivotRow);
        } else {
          const factor = tableau[i].coefficients[pivotColumn];
          const updatedRow: TableauRow = {
            coefficients: tableau[i].coefficients.map(
              (c, j) => c - factor * normalizedPivotRow.coefficients[j]
            ),
            rhs: tableau[i].rhs - factor * normalizedPivotRow.rhs,
            isObjective: tableau[i].isObjective
          };
          newTableau.push(updatedRow);
        }
      }

      tableau = newTableau;
      iterations.push(JSON.parse(JSON.stringify(tableau)));
      iteration++;
    }

    return {
      optimal: false,
      iterations,
      optimalValue: null,
      optimalSolution: null,
      error: 'Maximum iterations reached'
    };
  } catch (error) {
    return {
      optimal: false,
      iterations: [],
      optimalValue: null,
      optimalSolution: null,
      error: 'Error solving LP problem'
    };
  }
}