import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { DealData, initialDealData } from '@/types/deal';
import DealInformation from '@/components/DealInformation';
import FoundersSection from '@/components/FoundersSection';
import FinancialHighlights from '@/components/FinancialHighlights';
import InvestmentStructure from '@/components/InvestmentStructure';
import RiskAssessment from '@/components/RiskAssessment';
import MilestonesSection from '@/components/MilestonesSection';
import NotesSection from '@/components/NotesSection';
import { buildInvestmentPDF, generatePDF } from '@/lib/pdfGenerator';
import { CheckCircle2, Circle, FileDown, AlertTriangle, Clock3, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ActivityItem {
  id: string;
  text: string;
  time: string;
}

const AnimatedNumber = ({
  value,
  suffix = '',
  decimals = 0,
  className = '',
}: {
  value: number;
  suffix?: string;
  decimals?: number;
  className?: string;
}) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 700;
    const startValue = display;
    const endValue = Number.isFinite(value) ? value : 0;
    const startTime = performance.now();
    let frame = 0;

    const tick = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = startValue + (endValue - startValue) * eased;
      setDisplay(current);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span className={className}>{display.toFixed(decimals)}{suffix}</span>;
};

const Index = () => {
  const [data, setData] = useState<DealData>(initialDealData);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const previousSectionStatusRef = useRef<Record<string, boolean> | null>(null);

  const handleChange = useCallback((partial: Partial<DealData>) => {
    setHasInteracted(true);
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!data.companyName.trim()) e.companyName = 'Required';
    if (!data.industry.trim()) e.industry = 'Required';
    if (!data.fundingStage) e.fundingStage = 'Required';
    if (!data.investmentAsk || parseFloat(data.investmentAsk) <= 0) e.investmentAsk = 'Must be > 0';
    if (!data.valuation || parseFloat(data.valuation) <= 0) e.valuation = 'Must be > 0';
    if (!data.revenue) e.revenue = 'Required';
    if (!data.monthlyBurnRate || parseFloat(data.monthlyBurnRate) <= 0) e.monthlyBurnRate = 'Must be > 0';
    if (!data.growthPercentage) e.growthPercentage = 'Required';
    if (!data.availableCash || parseFloat(data.availableCash) <= 0) e.availableCash = 'Must be > 0';
    if (!data.equityOffered || parseFloat(data.equityOffered) <= 0) e.equityOffered = 'Must be > 0';
    if (!data.ticketSize || parseFloat(data.ticketSize) <= 0) e.ticketSize = 'Must be > 0';
    if (!data.minimumInvestment || parseFloat(data.minimumInvestment) <= 0) e.minimumInvestment = 'Must be > 0';

    data.founders.forEach((f, i) => {
      if (!f.name.trim()) e[`founder_${i}_name`] = 'Required';
      if (!f.role.trim()) e[`founder_${i}_role`] = 'Required';
    });
    data.milestones.forEach((m, i) => {
      if (!m.title.trim()) e[`milestone_${i}_title`] = 'Required';
    });

    const totalAlloc = data.fundAllocations.reduce((s, a) => s + (a.percentage || 0), 0);
    if (totalAlloc !== 100) e.allocation = 'Must equal 100%';

    if (data.marketRisk === 0) e.marketRisk = 'Required';
    if (data.productRisk === 0) e.productRisk = 'Required';
    if (data.teamRisk === 0) e.teamRisk = 'Required';

    return e;
  }, [data]);

  const isValid = Object.keys(errors).length === 0;
  const visibleErrors = hasInteracted ? errors : {};
  const totalAllocation = data.fundAllocations.reduce((sum, allocation) => sum + (allocation.percentage || 0), 0);
  const riskScore = data.marketRisk && data.productRisk && data.teamRisk
    ? (data.marketRisk + data.productRisk + data.teamRisk) / 3
    : null;
  const runwayMonths = (() => {
    const burn = parseFloat(data.monthlyBurnRate) || 0;
    const cash = parseFloat(data.availableCash) || 0;
    return burn > 0 ? (cash / burn).toFixed(1) : '0.0';
  })();

  const sectionStatus = useMemo(() => {
    const foundersValid = data.founders.every((f) => f.name.trim() && f.role.trim());
    const milestonesValid = data.milestones.every((m) => m.title.trim());
    const notesValid = [data.keyAssumptions, data.exitStrategy, data.additionalRemarks].some((note) => note.trim().length > 0);
    const financialValid = !errors.revenue && !errors.monthlyBurnRate && !errors.growthPercentage && !errors.availableCash;
    const dealValid = !errors.companyName && !errors.industry && !errors.fundingStage && !errors.investmentAsk && !errors.valuation;
    const structureValid = !errors.equityOffered && !errors.ticketSize && !errors.minimumInvestment && !errors.allocation;
    const riskValid = !errors.marketRisk && !errors.productRisk && !errors.teamRisk;

    return [
      { id: 'deal-information', title: 'Deal Information', complete: !!dealValid },
      { id: 'founders', title: 'Founders', complete: foundersValid },
      { id: 'financial-highlights', title: 'Financial Highlights', complete: !!financialValid },
      { id: 'investment-structure', title: 'Investment Structure', complete: !!structureValid },
      { id: 'risk-assessment', title: 'Risk Assessment', complete: !!riskValid },
      { id: 'milestones', title: 'Milestones', complete: milestonesValid },
      { id: 'notes-strategy', title: 'Notes & Strategy', complete: notesValid },
    ];
  }, [data.founders, data.milestones, data.keyAssumptions, data.exitStrategy, data.additionalRemarks, errors]);

  const completedCount = sectionStatus.filter((s) => s.complete).length;
  const completionPct = Math.round((completedCount / sectionStatus.length) * 100);

  const pendingItems = useMemo(() => {
    const items: string[] = [];
    const addIf = (condition: boolean, label: string) => {
      if (condition && !items.includes(label)) items.push(label);
    };

    addIf(!!errors.companyName || !!errors.industry || !!errors.fundingStage, 'Complete deal information');
    addIf(!!errors.investmentAsk || !!errors.valuation, 'Enter valid ask and valuation (> 0)');
    addIf(!!errors.revenue || !!errors.monthlyBurnRate || !!errors.growthPercentage || !!errors.availableCash, 'Complete financial highlights');
    addIf(!!errors.equityOffered || !!errors.ticketSize || !!errors.minimumInvestment, 'Complete investment structure fields');
    addIf(!!errors.allocation, 'Set fund allocation total to exactly 100%');
    addIf(data.founders.some((founder) => !founder.name.trim() || !founder.role.trim()), 'Complete founder names and roles');
    addIf(data.milestones.some((milestone) => !milestone.title.trim()), 'Add milestone title(s)');
    addIf(!!errors.marketRisk || !!errors.productRisk || !!errors.teamRisk, 'Select all risk ratings');
    return items;
  }, [errors, data.founders, data.milestones]);

  const handleGeneratePDF = () => {
    if (!isValid) return;
    generatePDF(data);
  };

  useEffect(() => {
    if (!previewOpen) return;
    const doc = buildInvestmentPDF(data);
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [previewOpen, data]);

  useEffect(() => {
    const nextMap = Object.fromEntries(sectionStatus.map((section) => [section.id, section.complete]));
    if (!hasInteracted) {
      previousSectionStatusRef.current = nextMap;
      return;
    }
    const previousMap = previousSectionStatusRef.current;
    if (!previousMap) {
      previousSectionStatusRef.current = nextMap;
      return;
    }

    const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const changes: ActivityItem[] = sectionStatus
      .filter((section) => previousMap[section.id] !== section.complete)
      .map((section) => ({
        id: crypto.randomUUID(),
        text: `${section.title} ${section.complete ? 'completed' : 'marked incomplete'}`,
        time,
      }));

    if (changes.length > 0) {
      setRecentActivity((prev) => [...changes, ...prev].slice(0, 5));
    }
    previousSectionStatusRef.current = nextMap;
  }, [sectionStatus, hasInteracted]);

  return (
    <div className="app-shell vc-app">
      <header className="vc-topbar">
        <div className="vc-topbar-inner">
          <div>
            <p className="vc-eyebrow">FundNexus</p>
            <h1 className="vc-title vc-title-animated">Investment Deal Summary Builder</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`vc-pill ${isValid ? 'vc-pill-ok' : hasInteracted ? 'vc-pill-warn' : 'vc-pill-neutral'}`}>
              {isValid ? <CheckCircle2 size={14} /> : hasInteracted ? <AlertTriangle size={14} /> : <Clock3 size={14} />}
              {isValid ? 'Export Ready' : hasInteracted ? `${pendingItems.length} blockers` : 'Start entering deal data'}
            </span>
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
              <DialogTrigger asChild>
                <button className="ghost-button gap-2">
                  <Eye size={16} />
                  Preview PDF
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl h-[90vh] p-4 md:p-5">
                <DialogHeader>
                  <DialogTitle>PDF Preview (Exact Download Render)</DialogTitle>
                  <DialogDescription>
                    This preview is rendered from the same PDF source used by the download action.
                  </DialogDescription>
                </DialogHeader>
                <div className="pdf-frame-wrap">
                  {previewUrl ? (
                    <iframe title="Investment Summary PDF Preview" src={previewUrl} className="pdf-frame" />
                  ) : (
                    <div className="pdf-frame-loading">Generating preview...</div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <button onClick={handleGeneratePDF} disabled={!isValid} className="gold-button gap-2">
              <FileDown size={16} />
              Generate PDF
            </button>
          </div>
        </div>
      </header>

      <main className="vc-layout">
        <section className="vc-main">
          <div className="vc-kpi-row">
            <div className="vc-kpi-card vc-kpi-card-wide">
              <span>Export Readiness</span>
              <div className="vc-kpi-readiness vc-kpi-readiness-row">
                <div>
                  <strong>{isValid ? 'Ready to Export' : hasInteracted ? `${pendingItems.length} blockers remaining` : 'Waiting for first input'}</strong>
                  <p>{completedCount} of {sectionStatus.length} sections complete</p>
                </div>
                <span className={`vc-score-pill ${isValid ? 'vc-score-pill-ok' : 'vc-score-pill-pending'}`}>
                  <AnimatedNumber value={completionPct} suffix="%" />
                </span>
              </div>
            </div>
          </div>

          <div id="deal-information"><DealInformation data={data} onChange={handleChange} errors={visibleErrors} /></div>
          <div id="founders"><FoundersSection data={data} onChange={handleChange} errors={visibleErrors} /></div>
          <div id="financial-highlights"><FinancialHighlights data={data} onChange={handleChange} errors={visibleErrors} /></div>
          <div id="investment-structure"><InvestmentStructure data={data} onChange={handleChange} errors={visibleErrors} /></div>
          <div id="risk-assessment"><RiskAssessment data={data} onChange={handleChange} errors={visibleErrors} /></div>
          <div id="milestones"><MilestonesSection data={data} onChange={handleChange} errors={visibleErrors} /></div>
          <div id="notes-strategy"><NotesSection data={data} onChange={handleChange} /></div>
        </section>

        <aside className="vc-right">
          <div className="vc-right-card vc-right-card-metrics">
            <p className="vc-rail-label mb-2">Live Metrics</p>
            <div className="vc-metric-row">
              <span>Runway</span>
              <strong><AnimatedNumber value={Number(runwayMonths)} decimals={1} suffix=" mo" /></strong>
            </div>
            <div className="vc-metric-row">
              <span>Risk Score</span>
              <strong>{riskScore !== null ? <AnimatedNumber value={riskScore} decimals={1} /> : 'Pending'}</strong>
            </div>
            <div className="vc-metric-row">
              <span>Allocation</span>
              <strong className={totalAllocation === 100 ? 'text-success' : 'text-destructive'}>
                <AnimatedNumber value={totalAllocation} suffix="%" />
              </strong>
            </div>
            <div className="vc-metric-row"><span className="inline-flex items-center gap-1"><Clock3 size={12} /> Est. memo review</span><strong>4 min</strong></div>
          </div>

          <div className="vc-right-card">
            <p className="vc-rail-label mb-2">Section Workflow</p>
            <nav className="space-y-1">
              {sectionStatus.map((section) => (
                <a key={section.id} href={`#${section.id}`} className="vc-nav-row vc-nav-row-light">
                  {section.complete ? <CheckCircle2 size={14} className="text-success" /> : <Circle size={14} className="text-muted-foreground" />}
                  <span>{section.title}</span>
                </a>
              ))}
            </nav>
          </div>

          <div className="vc-right-card">
            <p className="vc-rail-label mb-2">Recent Activity</p>
            {recentActivity.length === 0 && (
              <p className="text-sm text-muted-foreground">Section completion updates will appear here.</p>
            )}
            {recentActivity.length > 0 && (
              <div className="space-y-2">
                {recentActivity.map((item) => (
                  <div key={item.id} className="vc-activity-row">
                    <p>{item.text}</p>
                    <span>{item.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
};

export default Index;
