import { useEffect, useRef, useState } from 'react';

interface NumberPickerProps
{
	value: number | null;
	disallowed: Set<number>;
	onPick: (value: number | null) => void;
	label: string;
	alignRight?: boolean;
	disabled?: boolean;
}

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function NumberPicker(
	{
		value,
		disallowed,
		onPick,
		label,
		alignRight,
		disabled,
	}: NumberPickerProps,
)
{
	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);

	useEffect(
		() =>
		{
			if (!open)
			{
				return;
			}

			const handleOutside = (e: MouseEvent) =>
			{
				if (rootRef.current && !rootRef.current.contains(e.target as Node))
				{
					setOpen(false);
				}
			};

			const handleKey = (e: KeyboardEvent) =>
			{
				if (e.key === 'Escape')
				{
					setOpen(false);
				}
			};

			document.addEventListener('mousedown', handleOutside);
			document.addEventListener('keydown', handleKey);

			return () =>
			{
				document.removeEventListener('mousedown', handleOutside);
				document.removeEventListener('keydown', handleKey);
			};
		},
		[open],
	);

	const choose = (n: number | null) =>
	{
		onPick(n);
		setOpen(false);
	};

	return (
		<div className="picker" ref={rootRef}>
			<button
				type="button"
				className="picker__trigger"
				onClick={() => setOpen((o) => !o)}
				disabled={disabled}
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-label={label}
			>
				{value ?? ''}
			</button>

			{open && (
				<div
					className={`picker__popover${alignRight ? ' picker__popover--right' : ''}`}
					role="listbox"
				>
					<button
						type="button"
						className="picker__clear"
						onClick={() => choose(null)}
					>
						Clear
					</button>
					<div className="picker__grid">
						{DIGITS.map((n) => (
							<button
								key={n}
								type="button"
								className="picker__digit"
								disabled={disallowed.has(n)}
								aria-selected={value === n}
								onClick={() => choose(n)}
							>
								{n}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
