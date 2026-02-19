import { DealData } from '@/types/deal';

interface Props {
  data: DealData;
}

const formatCurrency = (value: string) => {
  const amount = parseFloat(value);
  if (Number.isNaN(amount)) return '—';
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
};

const riskLabel = (score: number | null) => {
  if (score === null) return { text: 'Pending', className: 'text-muted-foreground' };
  if (score <= 1.5) return { text: 'Low', className: 'text-success' };
  if (score <= 2.5) return { text: 'Moderate', className: 'text-warning' };
  return { text: 'High', className: 'text-destructive' };
};

const PDFLivePreview = ({ data }: Props) => {
  const burn = parseFloat(data.monthlyBurnRate) || 0;
  const cash = parseFloat(data.availableCash) || 0;
  const runway = burn > 0 ? `${(cash / burn).toFixed(1)} months` : 'N/A';
  const riskScore = data.marketRisk > 0 && data.productRisk > 0 && data.teamRisk > 0
    ? (data.marketRisk + data.productRisk + data.teamRisk) / 3
    : null;
  const totalAlloc = data.fundAllocations.reduce((sum, item) => sum + (item.percentage || 0), 0);
  const rankedMilestones = data.milestones.filter((m) => m.title.trim()).slice(0, 4);
  const founders = data.founders.filter((f) => f.name.trim()).slice(0, 3);

  return (
    <section className="section-card">
      <div className="section-header !mb-4">
        <div>
          <h2 className="section-title">Live PDF Preview</h2>
          <p className="section-subtitle">Real-time approximation of the exported investment memo</p>
        </div>
      </div>

      <div className="pdf-preview">
        <div className="pdf-preview-header">
          <div>
            <p className="pdf-preview-kicker">Investment Deal Summary</p>
            <h3 className="pdf-preview-company">{data.companyName || 'Company Name'}</h3>
          </div>
          <p className="pdf-preview-date">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <div className="pdf-preview-grid">
          <article className="pdf-preview-block">
            <p className="pdf-preview-label">Deal Snapshot</p>
            <div className="pdf-preview-meta">
              <span>Industry</span><strong>{data.industry || '—'}</strong>
              <span>Stage</span><strong>{data.fundingStage || '—'}</strong>
              <span>Ask</span><strong>{formatCurrency(data.investmentAsk)}</strong>
              <span>Valuation</span><strong>{formatCurrency(data.valuation)}</strong>
            </div>
          </article>

          <article className="pdf-preview-block">
            <p className="pdf-preview-label">Financial Overview</p>
            <div className="pdf-preview-meta">
              <span>Revenue</span><strong>{formatCurrency(data.revenue)}</strong>
              <span>Burn Rate</span><strong>{formatCurrency(data.monthlyBurnRate)}</strong>
              <span>Growth</span><strong>{data.growthPercentage ? `${data.growthPercentage}%` : '—'}</strong>
              <span>Runway</span><strong>{runway}</strong>
            </div>
          </article>

          <article className="pdf-preview-block pdf-preview-block-wide">
            <p className="pdf-preview-label">Fund Allocation</p>
            <div className="space-y-2">
              {data.fundAllocations.filter((item) => item.category).slice(0, 5).map((item) => (
                <div key={item.id} className="pdf-bar-row">
                  <span>{item.category}</span>
                  <div className="pdf-bar-track"><div className="pdf-bar-fill" style={{ width: `${Math.min(item.percentage, 100)}%` }} /></div>
                  <strong>{item.percentage}%</strong>
                </div>
              ))}
            </div>
            <p className={`text-xs mt-2 ${totalAlloc === 100 ? 'text-success' : 'text-destructive'}`}>Total Allocation: {totalAlloc}%</p>
          </article>

          <article className="pdf-preview-block">
            <p className="pdf-preview-label">Risk Summary</p>
            <p className={`text-lg font-bold ${riskLabel(riskScore).className}`}>
              {riskScore !== null ? `${riskScore.toFixed(1)} / 3.0` : 'Pending'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{riskLabel(riskScore).text} Risk</p>
          </article>

          <article className="pdf-preview-block">
            <p className="pdf-preview-label">Founders</p>
            <ul className="space-y-1.5 text-sm">
              {founders.length === 0 && <li className="text-muted-foreground">No founder details yet</li>}
              {founders.map((founder) => (
                <li key={founder.id} className="pdf-list-line">
                  <span>{founder.name}</span>
                  <span>{founder.role || 'Role'}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="pdf-preview-block pdf-preview-block-wide">
            <p className="pdf-preview-label">Milestone Timeline</p>
            <div className="pdf-timeline">
              {rankedMilestones.length === 0 && <p className="text-sm text-muted-foreground">No milestones added yet</p>}
              {rankedMilestones.map((milestone) => (
                <div key={milestone.id} className="pdf-timeline-item">
                  <div className="pdf-timeline-dot" />
                  <div>
                    <p className="text-sm font-semibold">{milestone.title}</p>
                    <p className="text-xs text-muted-foreground">{milestone.timeline || 'Timeline pending'}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default PDFLivePreview;
