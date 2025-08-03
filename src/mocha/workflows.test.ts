import { TestWorkflowEnvironment } from '@temporalio/testing';
import { after, before, it } from 'mocha';
import { Worker } from '@temporalio/worker';
import { strict as assert } from 'assert';
import * as activities from '../activities';
import { dynamicWorkflow } from '../workflows';
import type { DynamicWorkflowConfig } from '../types/shared';

describe('Dynamic Workflow Tests', () => {
  let testEnv: TestWorkflowEnvironment;
  
  before(async function () {
    this.timeout(10000);
    testEnv = await TestWorkflowEnvironment.createLocal();
  });

  after(async () => {
    await testEnv?.teardown();
  });

  it('should execute a simple workflow with trigger and action', async () => {
    const { client, nativeConnection } = testEnv;
    const taskQueue = 'test';

    const worker = await Worker.create({
      connection: nativeConnection,
      taskQueue,
      workflowsPath: require.resolve('../workflows'),
      activities,
    });

    const workflowConfig: DynamicWorkflowConfig = {
      id: 'simple-test',
      name: 'Simple Test Workflow',
      version: '1.0.0',
      nodes: [
        {
          id: 'trigger',
          type: 'trigger',
          label: 'Test Trigger',
          position: { x: 100, y: 50 },
          data: { triggerType: 'test_trigger' }
        },
        {
          id: 'action',
          type: 'action',
          label: 'Test Action',
          position: { x: 100, y: 150 },
          data: {
            actionType: 'log_activity',
            actionParams: {
              message: 'Test workflow executed',
              level: 'info'
            }
          }
        }
      ],
      edges: [
        {
          id: 'edge-1',
          source: 'trigger',
          target: 'action'
        }
      ]
    };

    const inputData = { testField: 'testValue' };

    await worker.runUntil(async () => {
      const result = await client.workflow.execute(dynamicWorkflow, {
        args: [workflowConfig, inputData],
        workflowId: 'dynamic-workflow-test',
        taskQueue,
      });

      assert.equal(result.status, 'EXECUTED');
      assert.equal(result.executionPath.length, 2);
      assert.equal(result.executionPath[0], 'trigger');
      assert.equal(result.executionPath[1], 'action');
    });
  });

  it('should execute workflow with condition', async () => {
    const { client, nativeConnection } = testEnv;
    const taskQueue = 'test';

    const worker = await Worker.create({
      connection: nativeConnection,
      taskQueue,
      workflowsPath: require.resolve('../workflows'),
      activities,
    });

    const workflowConfig: DynamicWorkflowConfig = {
      id: 'condition-test',
      name: 'Condition Test Workflow',
      version: '1.0.0',
      nodes: [
        {
          id: 'trigger',
          type: 'trigger',
          label: 'Test Trigger',
          position: { x: 100, y: 50 },
          data: { triggerType: 'test_trigger' }
        },
        {
          id: 'condition',
          type: 'condition',
          label: 'Test Condition',
          position: { x: 100, y: 150 },
          data: {
            conditionField: 'value',
            conditionOperator: 'greater_than',
            conditionValue: 10
          }
        },
        {
          id: 'action',
          type: 'action',
          label: 'Test Action',
          position: { x: 100, y: 250 },
          data: {
            actionType: 'log_activity',
            actionParams: {
              message: 'Condition met',
              level: 'info'
            }
          }
        }
      ],
      edges: [
        {
          id: 'edge-1',
          source: 'trigger',
          target: 'condition'
        },
        {
          id: 'edge-2',
          source: 'condition',
          target: 'action',
          condition: {
            field: 'value',
            operator: 'greater_than',
            value: 10
          }
        }
      ]
    };

    const inputData = { value: 15 };

    await worker.runUntil(async () => {
      const result = await client.workflow.execute(dynamicWorkflow, {
        args: [workflowConfig, inputData],
        workflowId: 'condition-workflow-test',
        taskQueue,
      });

      assert.equal(result.status, 'EXECUTED');
      assert.equal(result.executionPath.length, 3);
      assert.equal(result.executionPath[0], 'trigger');
      assert.equal(result.executionPath[1], 'condition');
      assert.equal(result.executionPath[2], 'action');
    });
  });
});
