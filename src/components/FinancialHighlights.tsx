import { DealData } from '@/types/deal';
import { TrendingUp, BarChart3 } from 'lucide-react';

interface Props {
  data: DealData;
  onChange: (data: Partial<DealData>) => void;
  errors: Record<string, string>;
}

const FinancialHighlights = ({ data, onChange, errors }: Props) => {
  const burnRate = parseFloat(data.monthlyBurnRate) || 0;
  const cash = parseFloat(data.availableCash) || 0;
  const runway = burnRate > 0 ? (cash / burnRate) : null;

  return (
    <div className="section-card">
      <div className="section-header">
        <div className="section-title-wrap">
          <div className="section-icon">
            <BarChart3 size={16} />
          </div>
          <div>
            <h2 className="section-title">Financial Highlights</h2>
            <p className="section-subtitle">Key financial metrics and calculated runway</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="field-block">
          <label className="field-label">Revenue ($) *</label>
          <input
            className="field-input"
            type="number"
            min="0"
            placeholder="Annual or monthly revenue"
            value={data.revenue}
            onChange={(e) => onChange({ revenue: e.target.value })}
          />
          {errors.revenue && <p className="text-sm text-destructive mt-1">{errors.revenue}</p>}
        </div>

        <div className="field-block">
          <label className="field-label">Monthly Burn Rate ($) *</label>
          <input
            className="field-input"
            type="number"
            min="0"
            placeholder="Monthly expenses"
            value={data.monthlyBurnRate}
            onChange={(e) => onChange({ monthlyBurnRate: e.target.value })}
          />
          {errors.monthlyBurnRate && <p className="text-sm text-destructive mt-1">{errors.monthlyBurnRate}</p>}
        </div>

        <div className="field-block">
          <label className="field-label">Growth Percentage (%) *</label>
          <input
            className="field-input"
            type="number"
            placeholder="e.g. 25"
            value={data.growthPercentage}
            onChange={(e) => onChange({ growthPercentage: e.target.value })}
          />
          {errors.growthPercentage && <p className="text-sm text-destructive mt-1">{errors.growthPercentage}</p>}
        </div>

        <div className="field-block">
          <label className="field-label">Available Cash ($) *</label>
          <input
            className="field-input"
            type="number"
            min="0"
            placeholder="Cash on hand"
            value={data.availableCash}
            onChange={(e) => onChange({ availableCash: e.target.value })}
          />
          {errors.availableCash && <p className="text-sm text-destructive mt-1">{errors.availableCash}</p>}
        </div>
      </div>

      {/* Runway Display */}
      <div className="mt-6 rounded-xl border border-border bg-secondary/40 p-5">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={18} className="text-accent" />
          <span className="text-sm font-semibold text-foreground">Calculated Runway</span>
        </div>
        {runway !== null ? (
          <p className="text-3xl font-bold text-foreground">
            {runway.toFixed(1)} <span className="text-base font-normal text-muted-foreground">months</span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">Enter burn rate and available cash to calculate</p>
        )}
        {burnRate === 0 && data.monthlyBurnRate !== '' && (
          <p className="text-sm text-destructive mt-1">Burn rate cannot be zero</p>
        )}
      </div>
    </div>
  );
};

export default FinancialHighlights;
