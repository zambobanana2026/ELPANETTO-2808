interface SummaryTile {
  label: string;
  value: string;
  color: string;
  highlight?: boolean;
}

interface SummaryTilesProps {
  tiles: SummaryTile[];
}

export function SummaryTiles({ tiles }: SummaryTilesProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className={`rounded-xl border p-4 ${
            tile.highlight ? "border-indigo-200 bg-indigo-50" : "border-stone-200 bg-white"
          }`}
        >
          <p
            className={`text-xs font-medium uppercase tracking-wide ${
              tile.highlight ? "text-indigo-500" : "text-stone-500"
            }`}
          >
            {tile.label}
          </p>
          <p className={`mt-1 text-xl font-semibold tabular-nums ${tile.color}`}>{tile.value}</p>
        </div>
      ))}
    </div>
  );
}
