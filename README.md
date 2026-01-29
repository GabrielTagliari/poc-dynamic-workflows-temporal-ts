# Sistema de Workflow Dinâmico com Temporal

Este projeto implementa um sistema de workflows dinâmicos baseados em configurações JSON orientadas a grafo, executados no Temporal. Permite criar workflows flexíveis através de uma interface gráfica, similar ao mostrado em interfaces de usuário modernas.

## 🎯 Funcionalidades

- **Workflows Dinâmicos**: Configuração via JSON orientada a grafo
- **Nós Flexíveis**: trigger, condition, action, approval, end
- **Condições Avançadas**: Múltiplos operadores de comparação
- **Ações Customizáveis**: Aprovações, notificações, logs, etc.
- **Integração com UI**: Conversão de dados da interface
- **Execução Robusta**: Gerenciada pelo Temporal com retry, timeout e monitoramento

## 🚀 Como Executar

### Pré-requisitos
1. Certifique-se de que o Temporal Server está rodando localmente (comando abaixo):
```bash
temporal server start-dev
```

2. Node.js 18+ instalado

### Instalação e Execução

Se estiver criando um projeto novo, use `npx @temporalio/create`, e os pacotes serão instalados automaticamente.

Para adicionar o Temporal a um projeto existente, instale os pacotes manualmente com `npm install @temporalio/client @temporalio/worker @temporalio/workflow`

```bash
# Instalar Temporal CLI
brew install temporal

# Instalar dependências
npm install

# Iniciar o Worker
npm run worker

# Em outro terminal
npm run client                # Cliente de exemplo
```

## 📋 Exemplo de Saída

```bash
🚀 Exemplo Simples de Workflow Dinâmico

📋 Configuração do Workflow:
   - Trigger: Quando uma despesa é criada
   - Condição: Se o valor for menor que $100
   - Ação 1: Aprovar automaticamente
   - Ação 2: Enviar notificação

✅ Resultado da Execução:
   - Workflow ID: workflow_1754221344154
   - Status: EXECUTED
   - Caminho de execução: trigger → condition → action-approve → action-notify
```

## 🏗️ Estrutura de Dados

### WorkflowNode
```typescript
interface WorkflowNode {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'approval' | 'end';
  label: string;
  position: { x: number; y: number };
  data: {
    // Configurações específicas por tipo
    triggerType?: string;
    conditionField?: string;
    conditionOperator?: ConditionOperator;
    conditionValue?: any;
    actionType?: ActionType;
    actionParams?: Record<string, any>;
    approverRole?: string;
    approverId?: string;
    timeout?: string;
    retryPolicy?: RetryPolicy;
  };
}
```

### WorkflowEdge
```typescript
interface WorkflowEdge {
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
```

### DynamicWorkflowConfig
```typescript
interface DynamicWorkflowConfig {
  id: string;
  name: string;
  description?: string;
  version: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata?: Record<string, any>;
}
```

## 🔧 Tipos de Nós Suportados

### 1. Trigger
Ponto de início do workflow.
```json
{
  "id": "trigger-expense",
  "type": "trigger",
  "label": "When Expense occurs",
  "data": {
    "triggerType": "expense_created"
  }
}
```

### 2. Condition
Avalia condições baseadas em dados de entrada.
```json
{
  "id": "condition-amount",
  "type": "condition",
  "label": "If Amount >= $1,000",
  "data": {
    "conditionField": "amount",
    "conditionOperator": "greater_than_or_equal",
    "conditionValue": 1000.00
  }
}
```

### 3. Action
Executa ações específicas.
```json
{
  "id": "action-require-manager",
  "type": "action",
  "label": "Require Manager",
  "data": {
    "actionType": "require_approval",
    "actionParams": {
      "approverRole": "manager",
      "timeout": "24 hours"
    }
  }
}
```

### 4. Approval
Solicita aprovação específica.
```json
{
  "id": "approval-manager",
  "type": "approval",
  "label": "Manager Approval",
  "data": {
    "approverRole": "manager",
    "approverId": "manager123",
    "timeout": "24 hours"
  }
}
```

### 5. End
Ponto de finalização do workflow.
```json
{
  "id": "end-approve",
  "type": "end",
  "label": "Approve Expense",
  "data": {}
}
```

## ⚙️ Operadores de Condição Suportados

- `equals`: Igual a
- `not_equals`: Diferente de
- `greater_than`: Maior que
- `greater_than_or_equal`: Maior ou igual a
- `less_than`: Menor que
- `less_than_or_equal`: Menor ou igual a
- `contains`: Contém
- `not_contains`: Não contém

## 🎯 Tipos de Ação Suportados

- `require_approval`: Solicitar aprovação
- `send_notification`: Enviar notificação
- `update_status`: Atualizar status
- `log_activity`: Registrar atividade
- `custom_action`: Ação customizada

## 📝 Exemplo de Configuração Completa

```json
{
  "id": "expense-approval-v1",
  "name": "Aprovação de Despesas",
  "description": "Workflow para aprovação automática de despesas",
  "version": "1.0.0",
  "nodes": [
    {
      "id": "trigger-expense",
      "type": "trigger",
      "label": "When Expense occurs",
      "position": { "x": 100, "y": 50 },
      "data": {
        "triggerType": "expense_created"
      }
    },
    {
      "id": "condition-amount",
      "type": "condition",
      "label": "If Amount >= $1,000",
      "position": { "x": 100, "y": 150 },
      "data": {
        "conditionField": "amount",
        "conditionOperator": "greater_than_or_equal",
        "conditionValue": 1000.00
      }
    },
    {
      "id": "action-require-manager",
      "type": "action",
      "label": "Require Manager",
      "position": { "x": 50, "y": 250 },
      "data": {
        "actionType": "require_approval",
        "actionParams": {
          "approverRole": "manager",
          "timeout": "24 hours"
        }
      }
    },
    {
      "id": "action-approve-expense",
      "type": "action",
      "label": "Approve Expense",
      "position": { "x": 100, "y": 350 },
      "data": {
        "actionType": "update_status",
        "actionParams": {
          "status": "approved",
          "reason": "Despesa aprovada"
        }
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "trigger-expense",
      "target": "condition-amount",
      "label": "Start"
    },
    {
      "id": "edge-2",
      "source": "condition-amount",
      "target": "action-require-manager",
      "label": "True",
      "condition": {
        "field": "amount",
        "operator": "greater_than_or_equal",
        "value": 1000.00
      }
    },
    {
      "id": "edge-3",
      "source": "condition-amount",
      "target": "action-approve-expense",
      "label": "False"
    },
    {
      "id": "edge-4",
      "source": "action-require-manager",
      "target": "action-approve-expense",
      "label": "Approved"
    }
  ]
}
```

## 💻 Como Usar

### 1. Criar Configuração de Workflow

```typescript
import { createWorkflowFromJSON } from './workflow-examples';

const jsonConfig = {
  // Sua configuração JSON aqui
};

const workflowConfig = createWorkflowFromJSON(jsonConfig);
```

### 2. Executar Workflow

```typescript
import { runCustomWorkflow } from './client';

const inputData = {
  amount: 1500.00,
  description: 'Compra de equipamentos',
  category: 'equipment',
  requesterId: 'user123'
};

const result = await runCustomWorkflow(workflowConfig, inputData);
console.log('Resultado:', result);
```

### 3. Testar com Exemplos Prontos

```typescript
import { runDynamicWorkflow } from './client';

// Executa os testes de exemplo
runDynamicWorkflow().catch(console.error);
```

## ✅ Vantagens do Sistema

1. **Flexibilidade**: Workflows podem ser modificados sem alterar código
3. **Reutilização**: Configurações podem ser salvas e reutilizadas
4. **Escalabilidade**: Temporal gerencia a execução distribuída
5. **Monitoramento**: Rastreamento completo da execução
6. **Robustez**: Retry automático, timeout e tratamento de erros

## 🧪 Testes

```bash
# Executar todos os testes
npm test
```

## 📁 Estrutura do Projeto

```
src/
├── workflows.ts          # Workflow dinâmico principal
├── activities.ts         # Atividades do workflow
├── client.ts             # Cliente para execução
├── worker.ts             # Worker do Temporal
└── mocha/
    └── workflows.test.ts # Testes automatizados
└── types/
    └── shared.ts         # Tipos e interfaces
└── examples/
    └── workflow-examples.ts  # Exemplos de configuração
```

## 🚀 Próximos Passos

1. Implementar interface de usuário para configuração visual
2. Adicionar mais tipos de ações e condições
3. Implementar sistema de templates de workflow
4. Adicionar validação avançada de configurações
5. Implementar versionamento de workflows
