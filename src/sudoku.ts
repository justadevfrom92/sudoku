export type Cell = number | null;
export type Board = Cell[][];
export type Level = 1 | 2 | 3 | 4 | 5;

/** Number of starting clues (filled cells) kept for each difficulty level.
 *  Lower level = more clues = easier. Higher level = fewer clues = harder. */
const CLUES_BY_LEVEL: Record<Level, number> =
{
	1: 46,
	2: 40,
	3: 34,
	4: 28,
	5: 24,
};

export const LEVEL_LABELS: Record<Level, string> =
{
	1: 'Easy',
	2: 'Light',
	3: 'Moderate',
	4: 'Hard',
	5: 'Expert',
};

function emptyBoard(): Board
{
	return Array.from(
		{ length: 9 },
		() => Array<Cell>(9).fill(null),
	);
}

function shuffled<T>(arr: T[]): T[]
{
	const copy = arr.slice();

	for (let i = copy.length - 1; i > 0; i--)
	{
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}

	return copy;
}

/** Is `num` legal at (row, col), ignoring whatever is currently sitting at (row, col) itself. */
export function isValidPlacement(board: Board, row: number, col: number, num: number): boolean
{
	for (let i = 0; i < 9; i++)
	{
		if (i !== col && board[row][i] === num)
		{
			return false;
		}

		if (i !== row && board[i][col] === num)
		{
			return false;
		}
	}

	const boxRow = row - (row % 3);
	const boxCol = col - (col % 3);

	for (let r = boxRow; r < boxRow + 3; r++)
	{
		for (let c = boxCol; c < boxCol + 3; c++)
		{
			if ((r !== row || c !== col) && board[r][c] === num)
			{
				return false;
			}
		}
	}

	return true;
}

/** Fills the board completely with a randomized backtracking solver. Mutates in place. */
function fillBoard(board: Board): boolean
{
	for (let row = 0; row < 9; row++)
	{
		for (let col = 0; col < 9; col++)
		{
			if (board[row][col] === null)
			{
				for (const num of shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9]))
				{
					if (isValidPlacement(board, row, col, num))
					{
						board[row][col] = num;

						if (fillBoard(board))
						{
							return true;
						}

						board[row][col] = null;
					}
				}

				return false;
			}
		}
	}

	return true;
}

/** Counts solutions up to `cap` (stops early once the cap is reached). Mutates then restores `board`. */
function countSolutions(board: Board, cap: number): number
{
	let solutions = 0;

	function backtrack(): void
	{
		if (solutions >= cap)
		{
			return;
		}

		for (let row = 0; row < 9; row++)
		{
			for (let col = 0; col < 9; col++)
			{
				if (board[row][col] === null)
				{
					for (let num = 1; num <= 9; num++)
					{
						if (isValidPlacement(board, row, col, num))
						{
							board[row][col] = num;
							backtrack();
							board[row][col] = null;

							if (solutions >= cap)
							{
								return;
							}
						}
					}

					return;
				}
			}
		}

		solutions++;
	}

	backtrack();

	return solutions;
}

function cloneBoard(board: Board): Board
{
	return board.map((row) => row.slice());
}

export function generateSolvedBoard(): Board
{
	const board = emptyBoard();
	fillBoard(board);

	return board;
}

/** Removes cells from a solved board while keeping the puzzle uniquely solvable. */
function carvePuzzle(solution: Board, clues: number): Board
{
	const puzzle = cloneBoard(solution);
	const positions = shuffled(Array.from({ length: 81 }, (_, i) => i));
	const target = 81 - clues;
	let removed = 0;

	for (const pos of positions)
	{
		if (removed >= target)
		{
			break;
		}

		const row = Math.floor(pos / 9);
		const col = pos % 9;
		const backup = puzzle[row][col];
		puzzle[row][col] = null;

		const solutionCount = countSolutions(cloneBoard(puzzle), 2);

		if (solutionCount === 1)
		{
			removed++;
		}
		else
		{
			puzzle[row][col] = backup;
		}
	}

	return puzzle;
}

export function generatePuzzle(level: Level): { puzzle: Board; solution: Board }
{
	const solution = generateSolvedBoard();
	const puzzle = carvePuzzle(solution, CLUES_BY_LEVEL[level]);

	return { puzzle, solution };
}

/** All numbers already used in the same row, column or 3x3 block as (row, col), excluding that cell. */
export function conflictingNumbers(board: Board, row: number, col: number): Set<number>
{
	const used = new Set<number>();

	for (let i = 0; i < 9; i++)
	{
		if (i !== col && board[row][i] !== null)
		{
			used.add(board[row][i] as number);
		}

		if (i !== row && board[i][col] !== null)
		{
			used.add(board[i][col] as number);
		}
	}

	const boxRow = row - (row % 3);
	const boxCol = col - (col % 3);

	for (let r = boxRow; r < boxRow + 3; r++)
	{
		for (let c = boxCol; c < boxCol + 3; c++)
		{
			if ((r !== row || c !== col) && board[r][c] !== null)
			{
				used.add(board[r][c] as number);
			}
		}
	}

	return used;
}
