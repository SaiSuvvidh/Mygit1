interface Point {
  x: number;
  y: number;
}

interface Line {
  start: Point;
  end: Point;
}

interface Solution {
  optimalPoint: Point | null;
  optimalValue: number | null;
  feasiblePoints: Point[];
  constraintLines: Line[];
  error?: string;
}

export function solveGraphicalMethod(
  objectiveFunction: { a: number; b: number; type: 'max' | 'min' },
  constraints: { a: number; b: number; sign: '<=' | '>=' | '='; c: number }[]
): Solution {
  try {
    // Find the bounds of our coordinate system
    const maxCoordinate = Math.max(
      ...constraints.map(c => Math.abs(c.c)),
      20 // minimum range
    );

    // Generate points for each constraint line
    const constraintLines = constraints.map(constraint => {
      if (constraint.b === 0) {
        return {
          start: { x: constraint.c / constraint.a, y: 0 },
          end: { x: constraint.c / constraint.a, y: maxCoordinate }
        };
      }
      if (constraint.a === 0) {
        return {
          start: { x: 0, y: constraint.c / constraint.b },
          end: { x: maxCoordinate, y: constraint.c / constraint.b }
        };
      }
      const y1 = constraint.c / constraint.b;
      const x1 = constraint.c / constraint.a;
      return {
        start: { x: 0, y: y1 },
        end: { x: x1, y: 0 }
      };
    });

    // Find intersection points between all lines
    const intersectionPoints: Point[] = [];
    intersectionPoints.push({ x: 0, y: 0 });

    constraints.forEach(constraint => {
      if (constraint.b !== 0) {
        const y = constraint.c / constraint.b;
        intersectionPoints.push({ x: 0, y });
      }
      if (constraint.a !== 0) {
        const x = constraint.c / constraint.a;
        intersectionPoints.push({ x, y: 0 });
      }
    });

    for (let i = 0; i < constraints.length; i++) {
      for (let j = i + 1; j < constraints.length; j++) {
        const c1 = constraints[i];
        const c2 = constraints[j];
        const det = c1.a * c2.b - c2.a * c1.b;
        if (det === 0) continue;
        const x = (c1.c * c2.b - c2.c * c1.b) / det;
        const y = (c1.a * c2.c - c2.a * c1.c) / det;
        if (x >= 0 && y >= 0) {
          intersectionPoints.push({ x, y });
        }
      }
    }

    const feasiblePoints = intersectionPoints.filter(point =>
      constraints.every(constraint => {
        const value = constraint.a * point.x + constraint.b * point.y;
        switch (constraint.sign) {
          case '<=': return value <= constraint.c + 1e-10;
          case '>=': return value >= constraint.c - 1e-10;
          case '=': return Math.abs(value - constraint.c) < 1e-10;
          default: return false;
        }
      })
    );

    if (feasiblePoints.length === 0) {
      return {
        optimalPoint: null,
        optimalValue: null,
        feasiblePoints: [],
        constraintLines,
        error: 'No feasible solution exists'
      };
    }

    const objectiveValues = feasiblePoints.map(point => ({
      point,
      value: objectiveFunction.a * point.x + objectiveFunction.b * point.y
    }));

    let optimalPoint: Point | null = null;
    let optimalValue: number | null = null;

    if (objectiveFunction.type === 'max') {
      optimalValue = Math.max(...objectiveValues.map(v => v.value));
    } else {
      optimalValue = Math.min(...objectiveValues.map(v => v.value));
    }

    optimalPoint = objectiveValues.find(v => v.value === optimalValue)?.point || null;

    return {
      optimalPoint,
      optimalValue,
      feasiblePoints,
      constraintLines
    };
  } catch (error) {
    return {
      optimalPoint: null,
      optimalValue: null,
      feasiblePoints: [],
      constraintLines: [],
      error: 'Error solving LP problem'
    };
  }
}