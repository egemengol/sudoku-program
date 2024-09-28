import { Bool, Field, ZkProgram } from 'o1js';
import { Sudoku } from './sudoku';

export const SudokuProgram = ZkProgram({
  name: 'sudoku-program',
  publicInput: Sudoku,

  methods: {
    solved: {
      privateInputs: [Sudoku],

      async method(problem: Sudoku, solution: Sudoku) {
        let problemArr = problem.value;
        let solutionArr = solution.value;

        // first, we check that the passed solution is a valid sudoku

        // define helpers
        let range9 = Array.from({ length: 9 }, (_, i) => i);
        let oneTo9 = range9.map((i) => Field(i + 1));

        function assertHas1To9(array: Field[]) {
          oneTo9
            .map((k) => range9.map((i) => array[i].equals(k)).reduce(Bool.or))
            .reduce(Bool.and)
            .assertTrue('array contains the numbers 1...9');
        }

        // check all rows
        for (let i = 0; i < 9; i++) {
          let row = solutionArr[i];
          assertHas1To9(row);
        }
        // check all columns
        for (let j = 0; j < 9; j++) {
          let column = solutionArr.map((row) => row[j]);
          assertHas1To9(column);
        }
        // check 3x3 squares
        for (let k = 0; k < 9; k++) {
          let [i0, j0] = divmod(k, 3);
          let square = range9.map((m) => {
            let [i1, j1] = divmod(m, 3);
            return solutionArr[3 * i0 + i1][3 * j0 + j1];
          });
          assertHas1To9(square);
        }

        // next, we check that the solution extends the initial sudoku
        for (let i = 0; i < 9; i++) {
          for (let j = 0; j < 9; j++) {
            let cell = problemArr[i][j];
            let solutionCell = solutionArr[i][j];
            // either the sudoku has nothing in it (indicated by a cell value of 0),
            // or it is equal to the solution
            Bool.or(cell.equals(0), cell.equals(solutionCell)).assertTrue(
              `solution cell (${i + 1},${j + 1}) matches the original sudoku`
            );
          }
        }

        // all checks passed => the sudoku is solved!
      },
    },
  },
});

function divmod(k: number, n: number) {
  let q = Math.floor(k / n);
  return [q, k - q * n];
}
