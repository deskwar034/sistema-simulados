# Simulado OAB 46 (Next.js + TypeScript + Tailwind)

Sistema web completo para aplicação de simulado da OAB usando **arquivo local JSON**, sem banco de dados, com persistência em `localStorage` e pronto para deploy na Vercel.

## Como instalar

```bash
npm install
```

## Rodar localmente

```bash
npm run dev
```

Acesse `http://localhost:3000`.

## Build de produção

```bash
npm run build
npm start
```

## Substituir o JSON de questões

1. Substitua `data/questions.json` pelo seu arquivo real (80 questões).
2. Mantenha a estrutura esperada (ou campos equivalentes tolerados):

```ts
type Question = {
  id: number;
  disciplina?: string;
  tema?: string;
  enunciado: string;
  alternativas?: { A: string; B: string; C: string; D: string };
  alternatives?: { A: string; B: string; C: string; D: string };
  correta?: "A" | "B" | "C" | "D";
  correctAnswer?: "A" | "B" | "C" | "D";
  comentarios?: { A?: string; B?: string; C?: string; D?: string };
  comments?: { A?: string; B?: string; C?: string; D?: string };
  explicacao?: string;
  explanation?: string;
};
```

## Deploy na Vercel

1. Faça push do projeto para o GitHub.
2. Na Vercel, clique em **Add New Project**.
3. Importe o repositório.
4. Deploy com configurações padrão do Next.js.

Sem banco de dados e sem variáveis obrigatórias.
