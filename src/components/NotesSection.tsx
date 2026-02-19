import { DealData } from '@/types/deal';
import { NotebookPen } from 'lucide-react';

interface Props {
  data: DealData;
  onChange: (data: Partial<DealData>) => void;
}

const NotesSection = ({ data, onChange }: Props) => {
  return (
    <div className="section-card">
      <div className="section-header">
        <div className="section-title-wrap">
          <div className="section-icon">
            <NotebookPen size={16} />
          </div>
          <div>
            <h2 className="section-title">Notes & Strategy</h2>
            <p className="section-subtitle">Additional context for the investment summary</p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="field-block">
          <label className="field-label">Key Assumptions</label>
          <textarea
            className="field-input min-h-[100px] resize-y"
            placeholder="Core assumptions underlying the investment thesis..."
            value={data.keyAssumptions}
            onChange={(e) => onChange({ keyAssumptions: e.target.value })}
          />
        </div>
        <div className="field-block">
          <label className="field-label">Exit Strategy</label>
          <textarea
            className="field-input min-h-[100px] resize-y"
            placeholder="Expected exit path (IPO, acquisition, secondary sale)..."
            value={data.exitStrategy}
            onChange={(e) => onChange({ exitStrategy: e.target.value })}
          />
        </div>
        <div className="field-block">
          <label className="field-label">Additional Remarks</label>
          <textarea
            className="field-input min-h-[80px] resize-y"
            placeholder="Any other relevant information..."
            value={data.additionalRemarks}
            onChange={(e) => onChange({ additionalRemarks: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};

export default NotesSection;
