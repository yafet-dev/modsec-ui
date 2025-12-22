import { type Rule, type Severity, type ApprovalStatus } from "@/data/rules";

export interface CreateRuleRequest {
  name: string;
  description: string;
  severity: Severity;
  category: string;
  ruleContent: string;
}

export interface CreateRuleResponse {
  rule: Rule;
}

export interface ApproveRuleRequest {
  ruleId: string;
  approved: boolean;
}

export interface ApproveRuleResponse {
  rule: Rule;
}

// Mock API functions for rules
export const rulesApi = {
  create: async (data: CreateRuleRequest): Promise<CreateRuleResponse> => {
    // Mock API call - simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generate a new rule ID
    const newId = `CUSTOM-${Date.now()}`;
    const now = new Date().toISOString().split("T")[0];

    const newRule: Rule = {
      id: newId,
      name: data.name,
      description: data.description,
      severity: data.severity,
      source: "Custom",
      hits: 0,
      enabled: false, // New rules start disabled until approved
      category: data.category,
      createdAt: now,
      updatedAt: now,
      approvalStatus: "pending",
      ruleContent: data.ruleContent,
      createdBy: "current-user@example.com", // In real app, get from auth context
    };

    // In a real app, this would make an API call
    // For now, we'll store in localStorage for persistence
    const existingRules = JSON.parse(
      localStorage.getItem("custom_rules") || "[]"
    );
    existingRules.push(newRule);
    localStorage.setItem("custom_rules", JSON.stringify(existingRules));

    return { rule: newRule };
  },

  approve: async (
    ruleId: string,
    approved: boolean
  ): Promise<ApproveRuleResponse> => {
    // Mock API call - simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Get rules from localStorage
    const customRules: Rule[] = JSON.parse(
      localStorage.getItem("custom_rules") || "[]"
    );
    const ruleIndex = customRules.findIndex((r) => r.id === ruleId);

    if (ruleIndex === -1) {
      throw new Error("Rule not found");
    }

    const updatedRule: Rule = {
      ...customRules[ruleIndex],
      approvalStatus: approved ? "approved" : "rejected",
      enabled: approved,
      updatedAt: new Date().toISOString().split("T")[0],
    };

    customRules[ruleIndex] = updatedRule;
    localStorage.setItem("custom_rules", JSON.stringify(customRules));

    return { rule: updatedRule };
  },

  getAll: async (): Promise<Rule[]> => {
    // Mock API call - simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Get custom rules from localStorage
    const customRules: Rule[] = JSON.parse(
      localStorage.getItem("custom_rules") || "[]"
    );

    return customRules;
  },
};
