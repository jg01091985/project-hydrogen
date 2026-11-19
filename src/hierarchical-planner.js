class HierarchicalStrategicPlanner {
  constructor() {
    this.masterPlans = new Map();
  }

  decomposeBigPlan(masterGoal) {
    const planId = `plan_${Date.now()}`;
    const phases = [
      { id: 'phase_1', title: 'Architecture & Threat Modeling', status: 'pending' },
      { id: 'phase_2', title: 'Atomic Micro-Task Execution', status: 'pending' },
      { id: 'phase_3', title: 'Adversarial Verification & Fuzzing', status: 'pending' },
      { id: 'phase_4', title: 'Deterministic Grounding & GitOps Push', status: 'pending' }
    ];

    const plan = {
      planId,
      masterGoal,
      createdAt: new Date().toISOString(),
      phases,
      currentPhaseIndex: 0,
      status: 'INITIALIZED'
    };

    this.masterPlans.set(planId, plan);
    return plan;
  }

  advancePlan(planId) {
    const plan = this.masterPlans.get(planId);
    if (!plan) throw new Error(`Plan not found: ${planId}`);

    if (plan.currentPhaseIndex < plan.phases.length) {
      plan.phases[plan.currentPhaseIndex].status = 'COMPLETED';
      plan.currentPhaseIndex++;
      if (plan.currentPhaseIndex >= plan.phases.length) {
        plan.status = 'COMPLETED';
      } else {
        plan.status = 'IN_PROGRESS';
      }
    }
    return plan;
  }
}

export const hierarchicalPlanner = new HierarchicalStrategicPlanner();
