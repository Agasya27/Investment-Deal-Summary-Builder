import { DealData } from '@/types/deal';
import { Shield, ShieldAlert } from 'lucide-react';

interface Props {
  data: DealData;
  onChange: (data: Partial<DealData>) => void;
  errors: Record<string, string>;
}

const riskLabels = ['Not Set', 'Low', 'Medium', 'High'] as const;

const RiskButton = ({
  level,
  selected,
  onClick,
}: {
  level: number;
  selected: boolean;
  onClick: () => void;
}) => {
  const styles = [
    '',
    'border-success/40 bg-success/10 text-success',
    'border-warning/40 bg-warning/10 text-warning',
    'border-destructive/40 bg-destructive/10 text-destructive',
  ];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
        selected ? styles[level] + ' ring-2 ring-offset-1 ring-current' : 'border-border bg-background text-muted-foreground hover:bg-secondary'
      }`}
    >
      {riskLabels[level]}
    </button>
  );
};

const RiskAssessment = ({ data, onChange, errors }: Props) => {
  const risks = [
    { key: 'marketRisk' as const, label: 'Market Risk' },
    { key: 'productRisk' as const, label: 'Product Risk' },
    { key: 'teamRisk' as const, label: 'Team Risk' },
  ];

  const allSet = data.marketRisk > 0 && data.productRisk > 0 && data.teamRisk > 0;
  const avgScore = allSet ? (data.marketRisk + data.productRisk + data.teamRisk) / 3 : null;

  const getCategory = (score: number) => {
    if (score <= 1.5) return { label: 'Low', className: 'risk-low' };
    if (score <= 2.5) return { label: 'Moderate', className: 'risk-medium' };
    return { label: 'High', className: 'risk-high' };
  };

  return (
    <div className="section-card">
      <div className="section-header">
        <div className="section-title-wrap">
          <div className="section-icon">
            <ShieldAlert size={16} />
          </div>
          <div>
            <h2 className="section-title">Risk Assessment</h2>
            <p className="section-subtitle">Evaluate key risk factors for this deal</p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {risks.map(({ key, label }) => (
          <div key={key}>
            <label className="field-label">{label}</label>
            <div className="flex gap-2">
              {[1, 2, 3].map((level) => (
                <RiskButton
                  key={level}
                  level={level}
                  selected={data[key] === level}
                  onClick={() => onChange({ [key]: level })}
                />
              ))}
            </div>
            {errors[key] && <p className="text-sm text-destructive mt-1">{errors[key]}</p>}
          </div>
        ))}
      </div>

      {avgScore !== null && (
        <div className="mt-6 rounded-xl border-2 p-5 flex items-center gap-4" style={{
          borderColor: avgScore <= 1.5 ? 'hsl(var(--success) / 0.3)' : avgScore <= 2.5 ? 'hsl(var(--warning) / 0.3)' : 'hsl(var(--destructive) / 0.3)',
          backgroundColor: avgScore <= 1.5 ? 'hsl(var(--success) / 0.05)' : avgScore <= 2.5 ? 'hsl(var(--warning) / 0.05)' : 'hsl(var(--destructive) / 0.05)',
        }}>
          <Shield size={28} className={avgScore <= 1.5 ? 'text-success' : avgScore <= 2.5 ? 'text-warning' : 'text-destructive'} />
          <div>
            <p className="text-sm text-muted-foreground">Overall Risk Score</p>
            <p className="text-2xl font-bold text-foreground">
              {avgScore.toFixed(1)} / 3.0
            </p>
            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategory(avgScore).className}`}>
              {getCategory(avgScore).label} Risk
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskAssessment;
