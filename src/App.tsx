import { useEffect, useMemo, useRef, useState } from 'react';
import
{
	type Board,
	type Level,
	LEVEL_LABELS,
	conflictingNumbers,
	generatePuzzle,
} from './sudoku';
import NumberPicker from './NumberPicker';

const COL_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
const LEVELS: Level[] = [1, 2, 3, 4, 5];

function emptyUserGrid(): Board
{
	return Array.from(
		{ length: 9 },
		() => Array<null>(9).fill(null),
	);
}

function cellKey(row: number, col: number): string
{
	return `${row}-${col}`;
}

function formatTime(totalSeconds: number): string
{
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;

	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function App()
{
	const [level, setLevel] = useState<Level>(2);
	const [puzzle, setPuzzle] = useState<Board>(emptyUserGrid());
	const [solution, setSolution] = useState<Board>(emptyUserGrid());
	const [userGrid, setUserGrid] = useState<Board>(emptyUserGrid());
	const [generating, setGenerating] = useState(true);
	const [incorrectCells, setIncorrectCells] = useState<Set<string>>(new Set());
	const [status, setStatus] = useState<{ text: string; tone: 'ok' | 'warn' | '' }>(
		{
			text: '',
			tone: '',
		},
	);

	const [seconds, setSeconds] = useState(0);
	const [timerRunning, setTimerRunning] = useState(false);
	const intervalRef = useRef<number | null>(null);

	const newGame = (lvl: Level) =>
	{
		setGenerating(true);
		setTimerRunning(false);
		setIncorrectCells(new Set());
		setStatus(
			{
				text: '',
				tone: '',
			},
		);

		// let the "generating" state paint before the (blocking) generation runs
		window.setTimeout(
			() =>
			{
				const { puzzle: p, solution: s } = generatePuzzle(lvl);
				setPuzzle(p);
				setSolution(s);
				setUserGrid(emptyUserGrid());
				setSeconds(0);
				setGenerating(false);
				setTimerRunning(true);
			},
			20,
		);
	};

	useEffect(
		() =>
		{
			newGame(level);
			// eslint-disable-next-line react-hooks/exhaustive-deps
		},
		[],
	);

	useEffect(
		() =>
		{
			if (!timerRunning)
			{
				return;
			}

			intervalRef.current = window.setInterval(
				() =>
				{
					setSeconds((s) => s + 1);
				},
				1000,
			);

			return () =>
			{
				if (intervalRef.current !== null)
				{
					window.clearInterval(intervalRef.current);
				}
			};
		},
		[timerRunning],
	);

	const combined: Board = useMemo(
		() => puzzle.map((row, r) => row.map((v, c) => v ?? userGrid[r][c])),
		[puzzle, userGrid],
	);

	const filledCount = useMemo(
		() => combined.reduce((sum, row) => sum + row.filter((v) => v !== null).length, 0),
		[combined],
	);

	const handlePick = (row: number, col: number, value: number | null) =>
	{
		setUserGrid((prev) => prev.map((r, ri) => (ri === row ? r.map((c, ci) => (ci === col ? value : c)) : r)));

		setIncorrectCells((prev) =>
		{
			const key = cellKey(row, col);

			if (!prev.has(key))
			{
				return prev;
			}

			const next = new Set(prev);
			next.delete(key);

			return next;
		});

		setStatus(
			{
				text: '',
				tone: '',
			},
		);
	};

	const handleLevelChange = (lvl: Level) =>
	{
		setLevel(lvl);
		newGame(lvl);
	};

	const handleReset = () =>
	{
		setUserGrid(emptyUserGrid());
		setIncorrectCells(new Set());
		setStatus(
			{
				text: '',
				tone: '',
			},
		);
	};

	const handleCheck = () =>
	{
		const incorrect = new Set<string>();
		let filledOpenCount = 0;

		combined.forEach((row, r) =>
		{
			row.forEach((v, c) =>
			{
				if (puzzle[r][c] !== null || v === null)
				{
					return;
				}

				filledOpenCount++;

				if (v !== solution[r][c])
				{
					incorrect.add(cellKey(r, c));
				}
			});
		});

		setIncorrectCells(incorrect);

		if (filledOpenCount === 0)
		{
			setStatus(
				{
					text: 'No numbers entered yet.',
					tone: 'warn',
				},
			);

			return;
		}

		if (incorrect.size > 0)
		{
			setStatus(
				{
					text: `${incorrect.size} of ${filledOpenCount} entered number${filledOpenCount === 1 ? '' : 's'} ${incorrect.size === 1 ? "doesn't" : "don't"} match the solution.`,
					tone: 'warn',
				},
			);

			return;
		}

		const complete = combined.every((row) => row.every((v) => v !== null));

		if (!complete)
		{
			setStatus(
				{
					text: `Correct so far — ${81 - filledCount} cells still open.`,
					tone: 'ok',
				},
			);

			return;
		}

		setStatus(
			{
				text: 'Sheet checks out — solved correctly.',
				tone: 'ok',
			},
		);
		setTimerRunning(false);
	};

	return (
		<div className="sheet">
			<header className="sheet__header">
				<div className="stamp">
					<span className="stamp__index">No. 01</span>
					<h1>Sudoku Field Sheet</h1>
					<p>logic grid — nine by nine</p>
				</div>

				<div className="header-right">
					<div className="timer" aria-label="Elapsed time">
						<span className="timer__label">Time</span>
						<span className="timer__value">{formatTime(seconds)}</span>
					</div>

					<div className="gauge" role="group" aria-label="Difficulty level">
						<span className="gauge__label">Level</span>
						<div className="gauge__ticks">
							{LEVELS.map((lvl) => (
								<button
									key={lvl}
									className={`gauge__tick${lvl === level ? ' gauge__tick--active' : ''}`}
									onClick={() => handleLevelChange(lvl)}
									aria-pressed={lvl === level}
									title={LEVEL_LABELS[lvl]}
								>
									{lvl}
								</button>
							))}
						</div>
						<span className="gauge__caption">{LEVEL_LABELS[level]}</span>
					</div>
				</div>
			</header>

			<main className="board-wrap">
				<div className={`board-frame${generating ? ' board-frame--busy' : ''}`}>
					<span className="crosshair crosshair--tl" />
					<span className="crosshair crosshair--tr" />
					<span className="crosshair crosshair--bl" />
					<span className="crosshair crosshair--br" />

					<div className="board-grid">
						<div className="col-ruler">
							<div className="ruler-corner" />
							{COL_LABELS.map((c) => (
								<div key={c} className="ruler-cell">
									{c}
								</div>
							))}
						</div>

						{Array.from({ length: 9 }, (_, row) => (
							<div className="board-row" key={row}>
								<div className="row-ruler">{row + 1}</div>
								{Array.from({ length: 9 }, (_, col) =>
								{
									const fixed = puzzle[row][col] !== null;
									const value = combined[row][col];
									const disallowed = fixed ? null : conflictingNumbers(combined, row, col);
									const incorrect = incorrectCells.has(cellKey(row, col));

									return (
										<div
											key={col}
											className={[
												'cell',
												fixed ? 'cell--fixed' : 'cell--open',
												incorrect ? 'cell--incorrect' : '',
												col % 3 === 2 && col !== 8 ? 'cell--block-right' : '',
												row % 3 === 2 && row !== 8 ? 'cell--block-bottom' : '',
											]
												.filter(Boolean)
												.join(' ')}
										>
											{fixed ? (
												<span className="cell__value">{value}</span>
											) : (
												<NumberPicker
													value={value}
													disallowed={disallowed ?? new Set()}
													onPick={(v) => handlePick(row, col, v)}
													label={`${COL_LABELS[col]}${row + 1}`}
													alignRight={col >= 6}
													disabled={generating}
												/>
											)}
										</div>
									);
								})}
							</div>
						))}
					</div>

					{generating && <div className="board-frame__overlay">plotting grid…</div>}
				</div>

				<div className="controls">
					<button className="btn btn--primary" onClick={() => newGame(level)} disabled={generating}>
						New Puzzle
					</button>
					<button className="btn" onClick={handleCheck} disabled={generating}>
						Check Solution
					</button>
					<button className="btn btn--ghost" onClick={handleReset} disabled={generating}>
						Reset
					</button>
				</div>

				<div className="status-row">
					<span className="progress">
						{filledCount} / 81 filled
					</span>
					{status.text && <span className={`status status--${status.tone}`}>{status.text}</span>}
				</div>
			</main>
		</div>
	);
}
