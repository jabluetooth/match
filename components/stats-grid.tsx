type TileVariant = 'peach' | 'sky' | 'mint';

interface StatTileProps {
  variant: TileVariant;
  label: string;
  value: number | string;
  sub: string;
  icon?: React.ReactNode;
  placement: 'g-stat-a' | 'g-stat-b';
}

export function StatTile({ variant, label, value, sub, icon, placement }: StatTileProps) {
  return (
    <div className={`tile tile-${variant} ${placement}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <p className="tile-lbl">{label}</p>
        {icon && <div className="tile-ico">{icon}</div>}
      </div>
      <div>
        <p className="tile-num">{value}</p>
        <p className="tile-sub">{sub}</p>
      </div>
    </div>
  );
}
