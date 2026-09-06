interface PlaceholderTabProps {
  title: string;
}

export function PlaceholderTab({ title }: PlaceholderTabProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center text-stone-400">
      <div className="text-4xl">🚧</div>
      <h2 className="text-lg font-medium text-stone-600">{title}</h2>
      <p className="text-sm">Dieser Tab kommt als Nächstes.</p>
    </div>
  );
}
