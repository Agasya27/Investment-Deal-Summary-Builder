export interface Founder {
  id: string;
  name: string;
  role: string;
  experience: string;
  background: string;
}

export interface Milestone {
  id: string;
  title: string;
  timeline: string;
}

export interface FundAllocation {
  id: string;
  category: string;
  percentage: number;
}

export interface DealData {
  // Deal Info
  companyName: string;
  industry: string;
  fundingStage: string;
  investmentAsk: string;
  valuation: string;

  // Founders
  founders: Founder[];

  // Financial
  revenue: string;
  monthlyBurnRate: string;
  growthPercentage: string;
  availableCash: string;

  // Investment Structure
  equityOffered: string;
  ticketSize: string;
  minimumInvestment: string;
  fundAllocations: FundAllocation[];

  // Risk
  marketRisk: number;
  productRisk: number;
  teamRisk: number;

  // Milestones
  milestones: Milestone[];

  // Notes
  keyAssumptions: string;
  exitStrategy: string;
  additionalRemarks: string;
}

export const initialDealData: DealData = {
  companyName: '',
  industry: '',
  fundingStage: '',
  investmentAsk: '',
  valuation: '',
  founders: [{ id: crypto.randomUUID(), name: '', role: '', experience: '', background: '' }],
  revenue: '',
  monthlyBurnRate: '',
  growthPercentage: '',
  availableCash: '',
  equityOffered: '',
  ticketSize: '',
  minimumInvestment: '',
  fundAllocations: [
    { id: crypto.randomUUID(), category: 'Product', percentage: 0 },
    { id: crypto.randomUUID(), category: 'Marketing', percentage: 0 },
    { id: crypto.randomUUID(), category: 'Hiring', percentage: 0 },
    { id: crypto.randomUUID(), category: 'Operations', percentage: 0 },
  ],
  marketRisk: 0,
  productRisk: 0,
  teamRisk: 0,
  milestones: [{ id: crypto.randomUUID(), title: '', timeline: '' }],
  keyAssumptions: '',
  exitStrategy: '',
  additionalRemarks: '',
};
