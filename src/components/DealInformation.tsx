import { DealData } from '@/types/deal';
import { Landmark } from 'lucide-react';

interface Props {
  data: DealData;
  onChange: (data: Partial<DealData>) => void;
  errors: Record<string, string>;
}

const stages = ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Growth', 'Late Stage'];

const DealInformation = ({ data, onChange, errors }: Props) => {
  return (
    <div className="section-card">
      <div className="section-header">
        <div className="section-title-wrap">
          <div className="section-icon">
            <Landmark size={16} />
          </div>
          <div>
            <h2 className="section-title">Deal Information</h2>
            <p className="section-subtitle">Core details about the investment opportunity</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="field-block">
          <label className="field-label">Company Name *</label>
          <input
            className="field-input"
            placeholder="e.g. Acme Corp"
            value={data.companyName}
            onChange={(e) => onChange({ companyName: e.target.value })}
          />
          {errors.companyName && <p className="text-sm text-destructive mt-1">{errors.companyName}</p>}
        </div>

        <div className="field-block">
          <label className="field-label">Industry *</label>
          <input
            className="field-input"
            placeholder="e.g. FinTech, HealthTech"
            value={data.industry}
            onChange={(e) => onChange({ industry: e.target.value })}
          />
          {errors.industry && <p className="text-sm text-destructive mt-1">{errors.industry}</p>}
        </div>

        <div className="field-block">
          <label className="field-label">Funding Stage *</label>
          <select
            className="field-input"
            value={data.fundingStage}
            onChange={(e) => onChange({ fundingStage: e.target.value })}
          >
            <option value="">Select stage</option>
            {stages.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.fundingStage && <p className="text-sm text-destructive mt-1">{errors.fundingStage}</p>}
        </div>

        <div className="field-block">
          <label className="field-label">Investment Ask ($) *</label>
          <input
            className="field-input"
            type="number"
            min="0"
            placeholder="e.g. 5000000"
            value={data.investmentAsk}
            onChange={(e) => onChange({ investmentAsk: e.target.value })}
          />
          {errors.investmentAsk && <p className="text-sm text-destructive mt-1">{errors.investmentAsk}</p>}
        </div>

        <div className="field-block">
          <label className="field-label">Valuation ($) *</label>
          <input
            className="field-input"
            type="number"
            min="0"
            placeholder="e.g. 25000000"
            value={data.valuation}
            onChange={(e) => onChange({ valuation: e.target.value })}
          />
          {errors.valuation && <p className="text-sm text-destructive mt-1">{errors.valuation}</p>}
        </div>
      </div>
    </div>
  );
};

export default DealInformation;
