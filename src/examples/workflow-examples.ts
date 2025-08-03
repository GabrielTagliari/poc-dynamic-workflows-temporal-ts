import type { DynamicWorkflowConfig } from '../types/shared';

// Exemplo de configuração JSON baseada na imagem fornecida
// Workflow de aprovação de despesas
export const expenseApprovalWorkflow: DynamicWorkflowConfig = {
  id: 'expense-approval-v1',
  name: 'Aprovação de Despesas',
  description: 'Workflow para aprovação automática de despesas baseado em valor',
  version: '1.0.0',
  nodes: [
    {
      id: 'trigger-expense',
      type: 'trigger',
      label: 'When Expense occurs',
      position: { x: 100, y: 50 },
      data: {
        triggerType: 'expense_created'
      }
    },
    {
      id: 'condition-amount',
      type: 'condition',
      label: 'If Amount is greater than or equal to $1,000.00',
      position: { x: 100, y: 150 },
      data: {
        conditionField: 'amount',
        conditionOperator: 'greater_than_or_equal',
        conditionValue: 1000.00
      }
    },
    {
      id: 'action-require-manager',
      type: 'action',
      label: 'Require Manager',
      position: { x: 50, y: 250 },
      data: {
        actionType: 'require_approval',
        actionParams: {
          approverRole: 'manager',
          timeout: '24 hours',
          message: 'Aprovação de despesa de alto valor requerida'
        }
      }
    },
    {
      id: 'action-approve-expense',
      type: 'action',
      label: 'Approve Expense',
      position: { x: 100, y: 350 },
      data: {
        actionType: 'update_status',
        actionParams: {
          status: 'approved',
          reason: 'Despesa aprovada automaticamente'
        }
      }
    }
  ],
  edges: [
    {
      id: 'edge-1',
      source: 'trigger-expense',
      target: 'condition-amount',
      label: 'Start'
    },
    {
      id: 'edge-2',
      source: 'condition-amount',
      target: 'action-require-manager',
      label: 'True',
      condition: {
        field: 'amount',
        operator: 'greater_than_or_equal',
        value: 1000.00
      }
    },
    {
      id: 'edge-3',
      source: 'condition-amount',
      target: 'action-approve-expense',
      label: 'False',
      condition: {
        field: 'amount',
        operator: 'less_than',
        value: 1000.00
      }
    },
    {
      id: 'edge-4',
      source: 'action-require-manager',
      target: 'action-approve-expense',
      label: 'Approved'
    }
  ]
};

// Exemplo mais complexo com múltiplas condições e ações
export const complexApprovalWorkflow: DynamicWorkflowConfig = {
  id: 'complex-approval-v1',
  name: 'Aprovação Complexa de Despesas',
  description: 'Workflow com múltiplas condições e níveis de aprovação',
  version: '1.0.0',
  nodes: [
    {
      id: 'trigger-expense',
      type: 'trigger',
      label: 'When Expense occurs',
      position: { x: 100, y: 50 },
      data: {
        triggerType: 'expense_created'
      }
    },
    {
      id: 'condition-amount-high',
      type: 'condition',
      label: 'If Amount >= $10,000',
      position: { x: 100, y: 150 },
      data: {
        conditionField: 'amount',
        conditionOperator: 'greater_than_or_equal',
        conditionValue: 10000.00
      }
    },
    {
      id: 'condition-amount-medium',
      type: 'condition',
      label: 'If Amount >= $1,000',
      position: { x: 100, y: 250 },
      data: {
        conditionField: 'amount',
        conditionOperator: 'greater_than_or_equal',
        conditionValue: 1000.00
      }
    },
    {
      id: 'action-require-director',
      type: 'action',
      label: 'Require Director Approval',
      position: { x: 50, y: 350 },
      data: {
        actionType: 'require_approval',
        actionParams: {
          approverRole: 'director',
          timeout: '48 hours',
          message: 'Aprovação de diretor requerida para despesa de alto valor'
        }
      }
    },
    {
      id: 'action-require-manager',
      type: 'action',
      label: 'Require Manager Approval',
      position: { x: 150, y: 350 },
      data: {
        actionType: 'require_approval',
        actionParams: {
          approverRole: 'manager',
          timeout: '24 hours',
          message: 'Aprovação de gerente requerida'
        }
      }
    },
    {
      id: 'action-send-notification',
      type: 'action',
      label: 'Send Notification',
      position: { x: 100, y: 450 },
      data: {
        actionType: 'send_notification',
        actionParams: {
          recipient: 'finance@company.com',
          message: 'Nova despesa aprovada',
          type: 'email'
        }
      }
    },
    {
      id: 'action-approve-expense',
      type: 'action',
      label: 'Approve Expense',
      position: { x: 100, y: 550 },
      data: {
        actionType: 'update_status',
        actionParams: {
          status: 'approved',
          reason: 'Despesa aprovada'
        }
      }
    }
  ],
  edges: [
    {
      id: 'edge-1',
      source: 'trigger-expense',
      target: 'condition-amount-high',
      label: 'Start'
    },
    {
      id: 'edge-2',
      source: 'condition-amount-high',
      target: 'action-require-director',
      label: 'True',
      condition: {
        field: 'amount',
        operator: 'greater_than_or_equal',
        value: 10000.00
      }
    },
    {
      id: 'edge-3',
      source: 'condition-amount-high',
      target: 'condition-amount-medium',
      label: 'False'
    },
    {
      id: 'edge-4',
      source: 'condition-amount-medium',
      target: 'action-require-manager',
      label: 'True',
      condition: {
        field: 'amount',
        operator: 'greater_than_or_equal',
        value: 1000.00
      }
    },
    {
      id: 'edge-5',
      source: 'condition-amount-medium',
      target: 'action-send-notification',
      label: 'False'
    },
    {
      id: 'edge-6',
      source: 'action-require-director',
      target: 'action-send-notification',
      label: 'Approved'
    },
    {
      id: 'edge-7',
      source: 'action-require-manager',
      target: 'action-send-notification',
      label: 'Approved'
    },
    {
      id: 'edge-8',
      source: 'action-send-notification',
      target: 'action-approve-expense',
      label: 'Complete'
    }
  ]
};

// Função para criar configuração de workflow a partir de JSON
export function createWorkflowFromJSON(jsonConfig: any): DynamicWorkflowConfig {
  return {
    id: jsonConfig.id || `workflow-${Date.now()}`,
    name: jsonConfig.name || 'Dynamic Workflow',
    description: jsonConfig.description,
    version: jsonConfig.version || '1.0.0',
    nodes: jsonConfig.nodes || [],
    edges: jsonConfig.edges || [],
    metadata: jsonConfig.metadata || {}
  };
}

// Exemplo de dados de entrada para testar o workflow
export const sampleExpenseData = {
  amount: 1500.00,
  description: 'Compra de equipamentos',
  category: 'equipment',
  requesterId: 'user123',
  department: 'IT',
  date: '2024-01-15'
};

export const sampleHighValueExpenseData = {
  amount: 15000.00,
  description: 'Compra de servidores',
  category: 'equipment',
  requesterId: 'user456',
  department: 'IT',
  date: '2024-01-15'
};

export const sampleLowValueExpenseData = {
  amount: 500.00,
  description: 'Compra de material de escritório',
  category: 'office_supplies',
  requesterId: 'user789',
  department: 'HR',
  date: '2024-01-15'
}; 