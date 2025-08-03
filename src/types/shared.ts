// @@@SNIPSTART dynamic-workflow-project-template-ts-constants
export const namespace = 'default';
export const taskQueueName = 'dynamic-workflow';
// @@@SNIPEND

// @@@SNIPSTART dynamic-workflow-project-template-ts-shared

// Tipos para workflow dinâmico baseado em grafo
export type NodeType = 
  | 'trigger' 
  | 'condition' 
  | 'action' 
  | 'approval' 
  | 'end';

export type ConditionOperator = 
  | 'equals' 
  | 'not_equals' 
  | 'greater_than' 
  | 'greater_than_or_equal' 
  | 'less_than' 
  | 'less_than_or_equal' 
  | 'contains' 
  | 'not_contains';

export type ActionType = 
  | 'require_approval' 
  | 'send_notification' 
  | 'update_status' 
  | 'log_activity' 
  | 'custom_action';

export interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  position: { x: number; y: number };
  data: {
    // Para triggers
    triggerType?: string;
    
    // Para condições
    conditionField?: string;
    conditionOperator?: ConditionOperator;
    conditionValue?: any;
    
    // Para ações
    actionType?: ActionType;
    actionParams?: Record<string, any>;
    
    // Para aprovações
    approverRole?: string;
    approverId?: string;
    
    // Configurações gerais
    timeout?: string;
    retryPolicy?: {
      initialInterval: string;
      maximumInterval: string;
      backoffCoefficient: number;
      maximumAttempts: number;
    };
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: {
    field: string;
    operator: ConditionOperator;
    value: any;
  };
}

export interface DynamicWorkflowConfig {
  id: string;
  name: string;
  description?: string;
  version: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata?: Record<string, any>;
}

export interface WorkflowExecutionContext {
  workflowId: string;
  input: Record<string, any>;
  context: Record<string, any>;
  currentNode?: string;
  visitedNodes: Set<string>;
  results: Map<string, any>;
}

// @@@SNIPEND
