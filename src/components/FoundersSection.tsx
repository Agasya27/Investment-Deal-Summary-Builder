import { DealData, Founder } from '@/types/deal';
import { Plus, Trash2, UsersRound } from 'lucide-react';

interface Props {
  data: DealData;
  onChange: (data: Partial<DealData>) => void;
  errors: Record<string, string>;
}

const FoundersSection = ({ data, onChange, errors }: Props) => {
  const updateFounder = (id: string, field: keyof Founder, value: string) => {
    onChange({
      founders: data.founders.map((f) => (f.id === id ? { ...f, [field]: value } : f)),
    });
  };

  const addFounder = () => {
    onChange({
      founders: [...data.founders, { id: crypto.randomUUID(), name: '', role: '', experience: '', background: '' }],
    });
  };

  const removeFounder = (id: string) => {
    if (data.founders.length <= 1) return;
    onChange({ founders: data.founders.filter((f) => f.id !== id) });
  };

  return (
    <div className="section-card">
      <div className="section-header">
        <div className="section-title-wrap">
          <div className="section-icon">
            <UsersRound size={16} />
          </div>
          <div>
            <h2 className="section-title mb-0">Founders</h2>
            <p className="section-subtitle">Key team members leading the venture</p>
          </div>
        </div>
        <button type="button" onClick={addFounder} className="gold-button text-xs gap-1.5">
          <Plus size={14} /> Add Founder
        </button>
      </div>

      <div className="space-y-5">
        {data.founders.map((founder, idx) => (
          <div key={founder.id} className="relative rounded-xl border border-border/70 bg-white/90 p-5">
            {data.founders.length > 1 && (
              <button
                type="button"
                onClick={() => removeFounder(founder.id)}
                className="absolute top-3 right-3 ghost-button p-2 h-8 w-8"
              >
                <Trash2 size={16} />
              </button>
            )}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-4">
              Founder {idx + 1}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="field-block">
                <label className="field-label">Name *</label>
                <input
                  className="field-input"
                  placeholder="Full name"
                  value={founder.name}
                  onChange={(e) => updateFounder(founder.id, 'name', e.target.value)}
                />
                {errors[`founder_${idx}_name`] && (
                  <p className="text-sm text-destructive mt-1">{errors[`founder_${idx}_name`]}</p>
                )}
              </div>
              <div className="field-block">
                <label className="field-label">Role *</label>
                <input
                  className="field-input"
                  placeholder="e.g. CEO, CTO"
                  value={founder.role}
                  onChange={(e) => updateFounder(founder.id, 'role', e.target.value)}
                />
                {errors[`founder_${idx}_role`] && (
                  <p className="text-sm text-destructive mt-1">{errors[`founder_${idx}_role`]}</p>
                )}
              </div>
              <div className="field-block">
                <label className="field-label">Experience</label>
                <input
                  className="field-input"
                  placeholder="e.g. 10 years in fintech"
                  value={founder.experience}
                  onChange={(e) => updateFounder(founder.id, 'experience', e.target.value)}
                />
              </div>
              <div className="md:col-span-2 field-block">
                <label className="field-label">Background Summary</label>
                <textarea
                  className="field-input min-h-[80px] resize-y"
                  placeholder="Brief professional background..."
                  value={founder.background}
                  onChange={(e) => updateFounder(founder.id, 'background', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FoundersSection;
