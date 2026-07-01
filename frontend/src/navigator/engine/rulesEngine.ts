import { RULES, RISK_FACTORS } from '../data/rules';
import type { RiskFactor, Rule, ScenarioConditions, ScenarioDefinition } from '../types';

function conditionsMatch(ruleWhen: Partial<ScenarioConditions>, actual: ScenarioConditions): boolean {
  return Object.entries(ruleWhen).every(([key, value]) => {
    const k = key as keyof ScenarioConditions;
    return actual[k] === value;
  });
}

export function applyRules(
  baseStepIds: string[],
  conditions: ScenarioConditions,
  scenario?: Pick<ScenarioDefinition, 'category' | 'id'>
): { stepIds: string[]; riskFactorIds: string[] } {
  let stepIds = [...baseStepIds];
  const riskFactorIds = new Set<string>();

  const applicable = RULES.filter((rule) => conditionsMatch(rule.when, conditions));

  for (const rule of applicable) {
    if (rule.id === 'rule-mortgage-add' && conditions.newbuilding) continue;
    if (rule.id === 'rule-sell-mortgage' && scenario?.category !== 'sell') continue;
    if (rule.removeStepIds) {
      stepIds = stepIds.filter((id) => !rule.removeStepIds!.includes(id));
    }
    if (rule.addStepIds) {
      for (const id of rule.addStepIds) {
        if (!stepIds.includes(id)) {
          const insertAfter = findInsertIndex(stepIds, id);
          stepIds.splice(insertAfter, 0, id);
        }
      }
    }
    rule.riskFactorIds?.forEach((rf) => riskFactorIds.add(rf));
  }

  return { stepIds: dedupe(stepIds), riskFactorIds: [...riskFactorIds] };
}

function findInsertIndex(stepIds: string[], newId: string): number {
  const phaseOrder: Record<string, string[]> = {
    preparation: ['matcapital-certificate', 'matcapital-pfr', 'prep-mortgage-approval', 'cash-origin-check'],
    object_check: ['poa-check', 'inheritance-heirs', 'co-owners-consent'],
    advance: ['chain-sync'],
    mortgage: ['mortgage-appraisal'],
    contract: ['matcapital-shares', 'minors-guardianship'],
    registration: ['sell-mortgage-payoff', 'sell-mortgage-release']
  };

  for (const ids of Object.values(phaseOrder)) {
    if (ids.includes(newId)) {
      const anchor = stepIds.findIndex((id) => ids.some((related) => related === id && related !== newId));
      if (anchor >= 0) return anchor + 1;
    }
  }
  return stepIds.length;
}

function dedupe(ids: string[]): string[] {
  return [...new Set(ids)];
}

export function getRiskFactors(ids: string[]): RiskFactor[] {
  return ids.map((id) => RISK_FACTORS[id]).filter(Boolean);
}

export function getApplicableRules(conditions: ScenarioConditions): Rule[] {
  return RULES.filter((rule) => conditionsMatch(rule.when, conditions));
}
