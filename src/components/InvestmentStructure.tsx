import { DealData, FundAllocation } from '@/types/deal';
import { Plus, Trash2, AlertCircle, CheckCircle2, PieChart } from 'lucide-react';

interface Props {
  data: DealData;
  onChange: (data: Partial<DealData>) => void;
  errors: Record<string, string>;
}

const InvestmentStructure = ({ data, onChange, errors }: Props) => {
  const totalAllocation = data.fundAllocations.reduce((sum, a) => sum + (a.percentage || 0), 0);
  const allocationValid = totalAllocation === 100;

  const updateAllocation = (id: string, field: keyof FundAllocation, value: string | number) => {
    onChange({
      fundAllocations: data.fundAllocations.map((a) =>
        a.id === id ? { ...a, [field]: field === 'percentage' ? Math.max(0, Math.min(100, Number(value))) : value } : a
      ),
    });
  };

  const addAllocation = () => {
    onChange({
      fundAllocations: [
        ...data.fundAllocations,
        { id: crypto.randomUUID(), category: '', percentage: 0 },
      ],
    });
  };

  const removeAllocation = (id: string) => {
    if (data.fundAllocations.length <= 1) return;
    onChange({ fundAllocations: data.fundAllocations.filter((a) => a.id !== id) });
  };

  return (
    <div className="section-card">
      <div className="section-header">
        <div className="section-title-wrap">
          <div className="section-icon">
            <PieChart size={16} />
          </div>
          <div>
            <h2 className="section-title">Investment Structure</h2>
            <p className="section-subtitle">Equity terms and fund allocation breakdown</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="field-block">
          <label className="field-label">Equity Offered (%) *</label>
          <input
            className="field-input"
            type="number"
            min="0"
            max="100"
            placeholder="e.g. 15"
            value={data.equityOffered}
            onChange={(e) => onChange({ equityOffered: e.target.value })}
          />
          {errors.equityOffered && <p className="text-sm text-destructive mt-1">{errors.equityOffered}</p>}
        </div>
        <div className="field-block">
          <label className="field-label">Ticket Size ($) *</label>
          <input
            className="field-input"
            type="number"
            min="0"
            placeholder="Per-investor amount"
            value={data.ticketSize}
            onChange={(e) => onChange({ ticketSize: e.target.value })}
          />
          {errors.ticketSize && <p className="text-sm text-destructive mt-1">{errors.ticketSize}</p>}
        </div>
        <div className="field-block">
          <label className="field-label">Minimum Investment ($) *</label>
          <input
            className="field-input"
            type="number"
            min="0"
            placeholder="Minimum check"
            value={data.minimumInvestment}
            onChange={(e) => onChange({ minimumInvestment: e.target.value })}
          />
          {errors.minimumInvestment && <p className="text-sm text-destructive mt-1">{errors.minimumInvestment}</p>}
        </div>
      </div>

      {/* Fund Allocation */}
      <div className="border-t border-border/70 pt-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Fund Allocation</h3>
          <button type="button" onClick={addAllocation} className="gold-button text-xs gap-1.5">
            <Plus size={14} /> Add Category
          </button>
        </div>

        <div className="space-y-3">
          {data.fundAllocations.map((alloc) => (
            <div key={alloc.id} className="flex items-center gap-3">
              <input
                className="field-input flex-1"
                placeholder="Category name"
                value={alloc.category}
                onChange={(e) => updateAllocation(alloc.id, 'category', e.target.value)}
              />
              <div className="relative w-24">
                <input
                  className="field-input pr-7 text-right"
                  type="number"
                  min="0"
                  max="100"
                  value={alloc.percentage || ''}
                  onChange={(e) => updateAllocation(alloc.id, 'percentage', e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
              {data.fundAllocations.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAllocation(alloc.id)}
                  className="ghost-button p-2 h-9 w-9"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Allocation Visual */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Allocation</span>
            <div className="flex items-center gap-1.5">
              {allocationValid ? (
                <CheckCircle2 size={16} className="text-success" />
              ) : (
                <AlertCircle size={16} className="text-destructive" />
              )}
              <span className={`text-sm font-bold ${allocationValid ? 'text-success' : 'text-destructive'}`}>
                {totalAllocation}%
              </span>
            </div>
          </div>

          {/* Progress bars */}
          <div className="w-full h-4 rounded-full bg-secondary/85 overflow-hidden flex border border-border/50">
            {data.fundAllocations
              .filter((a) => a.percentage > 0)
              .map((alloc, i) => {
                const colors = [
                  'hsl(var(--primary))',
                  'hsl(var(--accent))',
                  'hsl(var(--info))',
                  'hsl(var(--success))',
                  'hsl(var(--warning))',
                  'hsl(var(--destructive))',
                ];
                return (
                  <div
                    key={alloc.id}
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${Math.min(alloc.percentage, 100)}%`,
                      backgroundColor: colors[i % colors.length],
                    }}
                    title={`${alloc.category}: ${alloc.percentage}%`}
                  />
                );
              })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-3">
            {data.fundAllocations
              .filter((a) => a.percentage > 0 && a.category)
              .map((alloc, i) => {
                const colors = [
                  'hsl(var(--primary))',
                  'hsl(var(--accent))',
                  'hsl(var(--info))',
                  'hsl(var(--success))',
                  'hsl(var(--warning))',
                  'hsl(var(--destructive))',
                ];
                return (
                  <div key={alloc.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: colors[i % colors.length] }}
                    />
                    {alloc.category} ({alloc.percentage}%)
                  </div>
                );
              })}
          </div>

          {!allocationValid && totalAllocation > 0 && (
            <p className="text-sm text-destructive mt-2">
              Total must equal 100%. Currently {totalAllocation > 100 ? 'over' : 'under'} by{' '}
              {Math.abs(100 - totalAllocation)}%.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestmentStructure;
