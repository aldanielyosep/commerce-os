type DataStateProps = {
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyLabel: string;
  children: React.ReactNode;
};

export function DataState({ loading, error, empty, emptyLabel, children }: DataStateProps) {
  if (loading) return <p className="state">Loading...</p>;
  if (error) return <p className="state error">{error}</p>;
  if (empty) return <p className="state">{emptyLabel}</p>;

  return <>{children}</>;
}
