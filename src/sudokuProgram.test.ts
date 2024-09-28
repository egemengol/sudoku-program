import { Sudoku } from './sudoku';
import { generateSudoku, solveSudoku } from './sudoku-lib';
import { verify, VerificationKey, ZkProgram } from 'o1js';
import { SudokuProgram } from './sudokuProgram';

describe('sudoku program', () => {
  let verificationKey: VerificationKey;

  beforeAll(async () => {
    // const sudokuProgram = await SudokuProgram.compile({ proofsEnabled: true });
    const sudokuProgram = await SudokuProgram.compile();
    verificationKey = sudokuProgram.verificationKey;
  });

  it('accepts a correct solution', async () => {
    const problem = generateSudoku(0.5);
    const solution = solveSudoku(problem);
    if (solution === undefined) throw Error('cannot solve sudoku');

    const proof = await SudokuProgram.solved(
      Sudoku.from(problem),
      Sudoku.from(solution)
    );

    const isSolution = await verify(proof.toJSON(), verificationKey);
    expect(isSolution).toBe(true);
  });

  it('cannot create proof without solution', async () => {
    const problem = generateSudoku(0.5);
    const solution = solveSudoku(problem);
    if (solution === undefined) throw Error('cannot solve sudoku');
    solution[0][0] = (solution[0][0] % 9) + 1;

    await expect(async () => {
      await SudokuProgram.solved(Sudoku.from(problem), Sudoku.from(solution));
    }).rejects.toThrow(/array contains the numbers 1...9/);
  });

  it('cannot submit proof from different circuit', async () => {
    const SudokuProgramPermissive = ZkProgram({
      name: 'sudoku-program-permissive',
      publicInput: Sudoku,

      methods: {
        solved: {
          privateInputs: [Sudoku],

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          async method(problem: Sudoku, solution: Sudoku) {
            // no checks failed => the sudoku is solved!
          },
        },
      },
    });

    // await SudokuProgramPermissive.compile({ proofsEnabled: true});
    await SudokuProgramPermissive.compile();
    const problem = generateSudoku(0.5);
    const solution = generateSudoku(0.5);

    const proof = await SudokuProgramPermissive.solved(
      Sudoku.from(problem),
      Sudoku.from(solution)
    );

    const isSolution = await verify(proof.toJSON(), verificationKey);
    expect(isSolution).toBe(false);
  });
});
