type StatsProps = {
  total: number;
  active: number;
  inactive: number;
};

export const ListStats = ({
  total,
  active,
  inactive,
}: StatsProps) => {
  return (
    <div className="flex items-center gap-6 text-sm">
      <div>
        <span className="text-muted-foreground">Всего:</span>{" "}
        <span className="font-medium">{total}</span>
      </div>

      <div>
        <span className="text-muted-foreground">Активных:</span>{" "}
        <span className="font-medium">{active}</span>
      </div>

      <div>
        <span className="text-muted-foreground">Неактивных:</span>{" "}
        <span className="font-medium">{inactive}</span>
      </div>
    </div>
  );
};