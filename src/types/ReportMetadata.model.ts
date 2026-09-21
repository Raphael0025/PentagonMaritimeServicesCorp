import { Timestamp } from 'firebase/firestore'

export interface TrainingReportByID extends TrainingReport{
    id: string;
    generatedAt: Timestamp;
    generatedBy: string;
}

export interface TrainingReport {
    month: number;
    year: number;
    plannedTrainingSched: PlannedTrainingSchedMD;
    issues_challenges: Issues_Challenges[];
    actionPlan: string;
    improvements: string;
    plannedTraining: string;
    upcomingPlans: string;
    simulatorProbs: string;
    additional: string;
    facilities: string;
}

export const initTrainingReport = {
    month: 0,
    year: 0,
    plannedTrainingSched: {
        stcw: {
            w_oIns: 0,
            w_Ins: 0,
        },
        mds: {
            w_oIns: 0,
            w_Ins: 0,
        },
        simu: {
            w_oIns: 0,
            w_Ins: 0,
        },
        nonSimu: {
            w_oIns: 0,
            w_Ins: 0,
        },
    },
    issues_challenges: [],
    actionPlan: '',
    improvements: '',
    plannedTraining: '',
    upcomingPlans: '',
    simulatorProbs: '',
    additional: '',
    facilities: '',
}

export interface PlannedTrainingSchedMD{
    stcw:With_OutINS,
    mds:With_OutINS,
    simu:With_OutINS,
    nonSimu:With_OutINS,
}

export interface Issues_Challenges{
    issue: string;
    action: string;
    recommend: string;
    responsible: string;
    timeline: string;
    status: string;
}

export const initIssues_Challenges = {
    issue: '',
    action: '',
    recommend: '',
    responsible: '',
    timeline: '',
    status: '',
}

interface With_OutINS{
    w_oIns: number;
    w_Ins: number; 
}