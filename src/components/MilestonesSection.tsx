import { DealData, Milestone } from '@/types/deal';
import { Plus, Trash2, Milestone as MilestoneIcon } from 'lucide-react';

interface Props {
  data: DealData;
  onChange: (data: Partial<DealData>) => void;
  errors: Record<string, string>;
}

const MilestonesSection = ({ data, onChange, errors }: Props) => {
  const updateMilestone = (id: string, field: keyof Milestone, value: string) => {
    onChange({
      milestones: data.milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    });
  };

  const addMilestone = () => {
    onChange({
      milestones: [...data.milestones, { id: crypto.randomUUID(), title: '', timeline: '' }],
    });
  };

  const removeMilestone = (id: string) => {
    if (data.milestones.length <= 1) return;
    onChange({ milestones: data.milestones.filter((m) => m.id !== id) });
  };

  return (
    <div className="section-card">
      <div className="section-header">
        <div className="section-title-wrap">
          <div className="section-icon">
            <MilestoneIcon size={16} />
          </div>
          <div>
            <h2 className="section-title mb-0">Milestones</h2>
            <p className="section-subtitle">Key milestones and expected timelines</p>
          </div>
        </div>
        <button type="button" onClick={addMilestone} className="gold-button text-xs gap-1.5">
          <Plus size={14} /> Add Milestone
        </button>
      </div>

      <div className="relative pl-6 space-y-4">
        <div className="timeline-rail" />
        {data.milestones.map((milestone, idx) => (
          <div key={milestone.id} className="relative flex items-start gap-4">
            <div className="timeline-dot" />
            <div className="flex-1 flex gap-3 items-start">
              <div className="flex-1">
                <label className="field-label">Milestone {idx + 1} *</label>
                <input
                  className="field-input"
                  placeholder="e.g. Product launch"
                  value={milestone.title}
                  onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
                />
                {errors[`milestone_${idx}_title`] && (
                  <p className="text-sm text-destructive mt-1">{errors[`milestone_${idx}_title`]}</p>
                )}
              </div>
              <div className="w-36">
                <label className="field-label">Timeline</label>
                <input
                  className="field-input"
                  placeholder="e.g. Q2 2026"
                  value={milestone.timeline}
                  onChange={(e) => updateMilestone(milestone.id, 'timeline', e.target.value)}
                />
              </div>
              {data.milestones.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMilestone(milestone.id)}
                  className="mt-6 ghost-button p-2 h-9 w-9"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MilestonesSection;
