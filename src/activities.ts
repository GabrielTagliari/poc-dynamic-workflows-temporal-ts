// Atividades para workflow dinâmico de aprovação
import type { 
  WorkflowNode, 
  WorkflowEdge, 
  DynamicWorkflowConfig, 
  WorkflowExecutionContext,
  ActionType,
  ConditionOperator 
} from './types/shared';

// Atividade para avaliar condições
export async function evaluateCondition(
  condition: {
    field: string;
    operator: ConditionOperator;
    value: any;
  },
  context: Record<string, any>
): Promise<boolean> {
  console.log(`Evaluating condition: ${condition.field} ${condition.operator} ${condition.value}`);
  
  const fieldValue = context[condition.field];
  
  switch (condition.operator) {
    case 'equals':
      return fieldValue === condition.value;
    case 'not_equals':
      return fieldValue !== condition.value;
    case 'greater_than':
      return fieldValue > condition.value;
    case 'greater_than_or_equal':
      return fieldValue >= condition.value;
    case 'less_than':
      return fieldValue < condition.value;
    case 'less_than_or_equal':
      return fieldValue <= condition.value;
    case 'contains':
      return Array.isArray(fieldValue) ? fieldValue.includes(condition.value) : 
             typeof fieldValue === 'string' ? fieldValue.includes(condition.value) : false;
    case 'not_contains':
      return Array.isArray(fieldValue) ? !fieldValue.includes(condition.value) : 
             typeof fieldValue === 'string' ? !fieldValue.includes(condition.value) : true;
    default:
      return false;
  }
}

// Atividade para executar ações
export async function executeAction(
  actionType: ActionType,
  actionParams: Record<string, any>,
  context: Record<string, any>
): Promise<any> {
  console.log(`Executing action: ${actionType} with params:`, actionParams);
  
  switch (actionType) {
    case 'require_approval':
      return await requireApproval(actionParams, context);
    case 'send_notification':
      return await sendNotification(actionParams, context);
    case 'update_status':
      return await updateStatus(actionParams, context);
    case 'log_activity':
      return await logActivity(actionParams, context);
    case 'custom_action':
      return await executeCustomAction(actionParams, context);
    default:
      throw new Error(`Unknown action type: ${actionType}`);
  }
}

// Atividade para solicitar aprovação
export async function requireApproval(
  params: Record<string, any>,
  context: Record<string, any>
): Promise<{ approved: boolean; approverId: string; comments?: string }> {
  const { approverRole, approverId, timeout = '24 hours' } = params;
  
  console.log(`Requesting approval from ${approverRole || approverId} for workflow ${context.workflowId}`);
  
  // Simular processo de aprovação
  // Em um cenário real, isso seria integrado com um sistema de aprovação
  const approvalResult = {
    approved: Math.random() > 0.3, // 70% chance de aprovação
    approverId: approverId || 'system',
    comments: Math.random() > 0.5 ? 'Aprovado automaticamente' : undefined
  };
  
  console.log(`Approval result:`, approvalResult);
  return approvalResult;
}

// Atividade para enviar notificação
export async function sendNotification(
  params: Record<string, any>,
  context: Record<string, any>
): Promise<{ sent: boolean; recipient: string; message: string }> {
  const { recipient, message, type = 'email' } = params;
  
  console.log(`Sending ${type} notification to ${recipient}: ${message}`);
  
  // Simular envio de notificação
  return {
    sent: true,
    recipient,
    message
  };
}

// Atividade para atualizar status
export async function updateStatus(
  params: Record<string, any>,
  context: Record<string, any>
): Promise<{ updated: boolean; newStatus: string }> {
  const { status, reason } = params;
  
  console.log(`Updating status to: ${status} (reason: ${reason})`);
  
  return {
    updated: true,
    newStatus: status
  };
}

// Atividade para registrar atividade
export async function logActivity(
  params: Record<string, any>,
  context: Record<string, any>
): Promise<{ logged: boolean; activityId: string }> {
  const { message, level = 'info', metadata = {} } = params;
  
  console.log(`Logging activity [${level}]: ${message}`, metadata);
  
  return {
    logged: true,
    activityId: `log_${Date.now()}`
  };
}

// Atividade para executar ação customizada
export async function executeCustomAction(
  params: Record<string, any>,
  context: Record<string, any>
): Promise<any> {
  const { actionName, ...actionData } = params;
  
  console.log(`Executing custom action: ${actionName}`, actionData);
  
  // Aqui você pode implementar lógica customizada baseada no actionName
  return {
    executed: true,
    actionName,
    result: `Custom action ${actionName} executed successfully`
  };
}
