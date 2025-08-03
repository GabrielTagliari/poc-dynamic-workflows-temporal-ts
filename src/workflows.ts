/* eslint-disable @temporalio/eslint/no-unused-vars */
import { proxyActivities } from '@temporalio/workflow';
import { ApplicationFailure } from '@temporalio/common';

import type * as activities from './activities';

// Workflow dinâmico baseado em configuração de grafo
import type { 
  DynamicWorkflowConfig, 
  WorkflowExecutionContext, 
  WorkflowNode
} from './types/shared';

export async function dynamicApprovalWorkflow(
  config: DynamicWorkflowConfig,
  input: Record<string, any>
): Promise<{
  workflowId: string;
  status: string;
  results: Record<string, any>;
  executionPath: string[];
}> {
  
  // Configurar atividades para o workflow dinâmico
  const { 
    evaluateCondition, 
    executeAction 
  } = proxyActivities<typeof activities>({
    retry: {
      initialInterval: '1 second',
      maximumInterval: '1 minute',
      backoffCoefficient: 2,
      maximumAttempts: 3,
    },
    startToCloseTimeout: '5 minutes',
  });

  // Criar contexto de execução
  const context: WorkflowExecutionContext = {
    workflowId: `workflow_${Date.now()}`,
    input,
    context: { ...input },
    visitedNodes: new Set(),
    results: new Map()
  };

  // Encontrar o nó inicial (trigger)
  const startNode = config.nodes.find(node => node.type === 'trigger');
  if (!startNode) {
    throw new ApplicationFailure('No trigger node found in workflow configuration');
  }

  const executionPath: string[] = [];
  let currentNode = startNode;
  let maxIterations = 100; // Prevenir loops infinitos
  let iteration = 0;

  console.log(`Starting dynamic workflow: ${config.name} (${config.id})`);
  console.log(`Input data:`, input);

  while (currentNode && iteration < maxIterations) {
    iteration++;
    
    // Marcar nó como visitado
    context.visitedNodes.add(currentNode.id);
    executionPath.push(currentNode.id);
    
    console.log(`Executing node: ${currentNode.id} (${currentNode.type})`);
    
    try {
      // Executar lógica baseada no tipo do nó
      const result = await executeNode(currentNode, context, evaluateCondition, executeAction);
      context.results.set(currentNode.id, result);
      
      // Encontrar próximo nó baseado nas edges
      const nextNode = await findNextNode(currentNode, config, context, evaluateCondition);
      
      if (!nextNode) {
        console.log(`No next node found. Workflow completed.`);
        break;
      }
      
      currentNode = nextNode;
      
    } catch (error) {
      console.error(`Error executing node ${currentNode.id}:`, error);
      throw new ApplicationFailure(`Workflow execution failed at node ${currentNode.id}: ${error}`);
    }
  }

  if (iteration >= maxIterations) {
    throw new ApplicationFailure('Workflow exceeded maximum iterations. Possible infinite loop detected.');
  }

  // Determinar status final
  const finalStatus = determineFinalStatus(context, config);

  return {
    workflowId: context.workflowId,
    status: finalStatus,
    results: Object.fromEntries(context.results),
    executionPath
  };
}

// Função para executar um nó específico
async function executeNode(
  node: WorkflowNode,
  context: WorkflowExecutionContext,
  evaluateCondition: any,
  executeAction: any
): Promise<any> {
  
  switch (node.type) {
    case 'trigger':
      console.log(`Trigger activated: ${node.data.triggerType}`);
      return { triggered: true, triggerType: node.data.triggerType };
      
    case 'condition':
      if (!node.data.conditionField || !node.data.conditionOperator) {
        throw new Error(`Invalid condition configuration for node ${node.id}`);
      }
      
      const conditionResult = await evaluateCondition({
        field: node.data.conditionField,
        operator: node.data.conditionOperator,
        value: node.data.conditionValue
      }, context.context);
      
      console.log(`Condition ${node.id} evaluated to: ${conditionResult}`);
      return { conditionMet: conditionResult };
      
    case 'action':
      if (!node.data.actionType) {
        throw new Error(`Invalid action configuration for node ${node.id}`);
      }
      
      const actionResult = await executeAction(
        node.data.actionType,
        node.data.actionParams || {},
        context.context
      );
      
      console.log(`Action ${node.id} executed:`, actionResult);
      return actionResult;
      
    case 'approval':
      const approvalResult = await executeAction(
        'require_approval',
        {
          approverRole: node.data.approverRole,
          approverId: node.data.approverId,
          ...node.data.actionParams
        },
        context.context
      );
      
      console.log(`Approval ${node.id} result:`, approvalResult);
      return approvalResult;
      
    case 'end':
      console.log(`Workflow ended at node ${node.id}`);
      return { completed: true, endNode: node.id };
      
    default:
      throw new Error(`Unknown node type: ${node.type}`);
  }
}

// Função para encontrar o próximo nó baseado nas edges
async function findNextNode(
  currentNode: WorkflowNode,
  config: DynamicWorkflowConfig,
  context: WorkflowExecutionContext,
  evaluateCondition: any
): Promise<WorkflowNode | null> {
  
  // Encontrar todas as edges que saem do nó atual
  const outgoingEdges = config.edges.filter(edge => edge.source === currentNode.id);
  
  if (outgoingEdges.length === 0) {
    return null; // Nenhuma saída encontrada
  }
  
  // Se há apenas uma edge sem condição, seguir ela
  if (outgoingEdges.length === 1 && !outgoingEdges[0].condition) {
    const targetNode = config.nodes.find(node => node.id === outgoingEdges[0].target);
    return targetNode || null;
  }
  
  // Avaliar edges com condições
  for (const edge of outgoingEdges) {
    if (!edge.condition) {
      // Edge sem condição - seguir diretamente
      const targetNode = config.nodes.find(node => node.id === edge.target);
      return targetNode || null;
    }
    
    // Avaliar condição da edge
    const conditionMet = await evaluateCondition(
      edge.condition,
      context.context
    );
    
    if (conditionMet) {
      const targetNode = config.nodes.find(node => node.id === edge.target);
      return targetNode || null;
    }
  }
  
  // Se nenhuma condição foi atendida, procurar por edge padrão (else)
  const defaultEdge = outgoingEdges.find(edge => 
    edge.label === 'else' || edge.label === 'default'
  );
  
  if (defaultEdge) {
    const targetNode = config.nodes.find(node => node.id === defaultEdge.target);
    return targetNode || null;
  }
  
  return null;
}

// Função para determinar o status final do workflow
function determineFinalStatus(
  context: WorkflowExecutionContext,
  config: DynamicWorkflowConfig
): string {
  const visitedNodes = Array.from(context.visitedNodes);
  const lastNode = config.nodes.find(node => node.id === visitedNodes[visitedNodes.length - 1]);
  
  if (!lastNode) {
    return 'ERROR';
  }
  
  switch (lastNode.type) {
    case 'end':
      return 'COMPLETED';
    case 'approval':
      const approvalResult = context.results.get(lastNode.id);
      return approvalResult?.approved ? 'APPROVED' : 'REJECTED';
    case 'action':
      return 'EXECUTED';
    default:
      return 'IN_PROGRESS';
  }
}
