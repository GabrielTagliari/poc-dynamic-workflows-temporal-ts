// @@@SNIPSTART dynamic-workflow-project-template-ts-client
import { Client } from '@temporalio/client';
import { nanoid } from 'nanoid';
import { namespace, taskQueueName } from './types/shared';

// Cliente para testar workflow dinâmico
import { dynamicApprovalWorkflow } from './workflows';
import { 
  expenseApprovalWorkflow, 
  complexApprovalWorkflow,
  sampleExpenseData,
  sampleHighValueExpenseData,
  sampleLowValueExpenseData 
} from './examples/workflow-examples';

async function runDynamicWorkflow() {
  const client = new Client({
    namespace,
  });

  console.log('=== Testando Workflow Dinâmico de Aprovação ===\n');

  // Teste 1: Despesa de valor médio (requer aprovação de gerente)
  console.log('1. Testando despesa de valor médio ($1,500):');
  const handle1 = await client.workflow.start(dynamicApprovalWorkflow, {
    args: [expenseApprovalWorkflow, sampleExpenseData],
    taskQueue: taskQueueName,
    workflowId: 'expense-approval-' + nanoid(),
  });

  const result1 = await handle1.result();
  console.log('Resultado:', JSON.stringify(result1, null, 2));
  console.log('\n');

  // Teste 2: Despesa de alto valor (requer aprovação de diretor)
  console.log('2. Testando despesa de alto valor ($15,000):');
  const handle2 = await client.workflow.start(dynamicApprovalWorkflow, {
    args: [complexApprovalWorkflow, sampleHighValueExpenseData],
    taskQueue: taskQueueName,
    workflowId: 'complex-approval-' + nanoid(),
  });

  const result2 = await handle2.result();
  console.log('Resultado:', JSON.stringify(result2, null, 2));
  console.log('\n');

  // Teste 3: Despesa de baixo valor (aprovada automaticamente)
  console.log('3. Testando despesa de baixo valor ($500):');
  const handle3 = await client.workflow.start(dynamicApprovalWorkflow, {
    args: [expenseApprovalWorkflow, sampleLowValueExpenseData],
    taskQueue: taskQueueName,
    workflowId: 'low-value-approval-' + nanoid(),
  });

  const result3 = await handle3.result();
  console.log('Resultado:', JSON.stringify(result3, null, 2));
  console.log('\n');
}

// Função para executar workflow dinâmico com configuração customizada
export async function runCustomWorkflow(
  workflowConfig: any,
  inputData: Record<string, any>
) {
  const client = new Client({
    namespace,
  });

  const handle = await client.workflow.start(dynamicApprovalWorkflow, {
    args: [workflowConfig, inputData],
    taskQueue: taskQueueName,
    workflowId: 'custom-workflow-' + nanoid(),
  });

  return await handle.result();
}

// Descomente a linha abaixo para testar o workflow dinâmico
runDynamicWorkflow().catch((err) => {
  console.error(err);
  process.exit(1);
});
// @@@SNIPEND
