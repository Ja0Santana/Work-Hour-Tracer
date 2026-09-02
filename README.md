# Work Hours Tracker

Aplicação web local para rastreamento de horas de trabalho. Permite registrar atividades diárias, acompanhar metas semanais, visualizar ganhos e exportar relatórios.

## Como funciona

A aplicação é dividida em três páginas:

- **Dashboard** — visão geral da semana com progresso da meta, timeline visual do dia, resumo mensal e lista de atividades
- **Histórico** — todas as atividades agrupadas por dia dentro do mês selecionado, com exportação para imagem e Excel
- **Configurações** — meta semanal de horas, valor por hora, importação/exportação de dados e limpeza

### Registro de atividades

Cada atividade contém: data, projeto, categoria, horário de início/fim, descrição e observações opcionais. A duração é calculada automaticamente.

### Valor por hora

O valor/hora é congelado no momento em que a atividade é criada. Alterar o valor nas configurações **não afeta atividades já registradas** — apenas novas atividades usarão o novo valor.

## Persistência de dados

Todos os dados são armazenados no **LocalStorage** do navegador. Não há backend, banco de dados ou serviços externos.

Os dados persistem após:
- Atualizar a página
- Fechar o navegador
- Reiniciar o servidor de desenvolvimento

> **Atenção:** Limpar os dados do navegador (cache/cookies) apagará todos os registros. Use a exportação para manter backups.

## Importação e Exportação

### JSON (backup completo)

Na página de **Configurações**:

- **Exportar dados** — gera um arquivo `.json` com todas as atividades e configurações
- **Importar dados** — restaura dados a partir de um arquivo `.json` exportado anteriormente. Substitui todos os dados locais atuais

### Excel (relatório mensal)

Na página de **Histórico**:

- **Exportar Excel** — gera um arquivo `.xlsx` com as atividades do mês selecionado, incluindo duração, categoria, valor/hora e ganho por atividade, com totais diários e mensal

### Imagem (resumo mensal)

Na página de **Histórico** e no **Dashboard** (resumo mensal):

- **Exportar Imagem** — gera uma imagem com o resumo do mês (total de horas, valor/hora, estimativa de ganhos)

## Stack

- React + TypeScript
- Vite
- LocalStorage
- SheetJS (xlsx) para exportação Excel

## Como rodar

```bash
npm install
npm run dev
```

## Testes

```bash
npm run test
```
