import type { Question, QuestionType } from '../models/interview.model';

const initialTypes: QuestionType[] = [
  { id: 't1', name: 'Angular' },
  { id: 't2', name: 'React' },
  { id: 't3', name: 'JavaScript' },
];

const initialQuestions: Question[] = [
  { id: 'q1', typeId: 't1', text: 'What is the difference between constructor and ngOnInit?', answer: 'Constructor is a default class method; ngOnInit is an Angular lifecycle hook that runs after the first change detection. Use ngOnInit for initialization logic that depends on input bindings.' },
  { id: 'q2', typeId: 't1', text: 'What are Angular signals?', answer: 'Signals are reactive primitives that hold a value and notify consumers when the value changes. They are used with computed() and effect() for fine-grained reactivity.' },
  { id: 'q3', typeId: 't1', text: 'Explain dependency injection in Angular.', answer: 'Angular\'s DI framework provides dependencies to classes (e.g. services) via constructor injection. Providers are configured in injectors (root or component-level).' },
  { id: 'q4', typeId: 't2', text: 'What is the virtual DOM?', answer: 'The virtual DOM is an in-memory representation of the real DOM. React compares the virtual DOM with the previous version and updates only the changed parts in the real DOM (reconciliation).' },
  { id: 'q5', typeId: 't2', text: 'What are React hooks?', answer: 'Hooks are functions that let you use state and other React features in function components. Examples: useState, useEffect, useContext.' },
  { id: 'q6', typeId: 't3', text: 'What is the difference between let, const, and var?', answer: 'let and const are block-scoped; var is function-scoped. const cannot be reassigned; let and var can. Prefer const by default, then let.' },
];

let types = [...initialTypes];
let questions = [...initialQuestions];

let typeIdCounter = 1;
let questionIdCounter = 10;

function nextTypeId(): string {
  return `t${++typeIdCounter}`;
}

function nextQuestionId(): string {
  return `q${++questionIdCounter}`;
}

export function getAllTypes(): QuestionType[] {
  return [...types];
}

export function addType(name: string): QuestionType {
  const newType: QuestionType = { id: nextTypeId(), name: name.trim() };
  types.push(newType);
  return newType;
}

export function updateType(id: string, name: string): QuestionType | null {
  const idx = types.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  types[idx] = { ...types[idx], name: name.trim() };
  return types[idx];
}

export function deleteType(id: string): void {
  types = types.filter((t) => t.id !== id);
  questions = questions.filter((q) => q.typeId !== id);
}

export function getQuestionsByTypeId(typeId: string): Question[] {
  return questions.filter((q) => q.typeId === typeId).slice();
}

export function getAllQuestions(): Question[] {
  return [...questions];
}

export function getQuestionById(id: string): Question | null {
  return questions.find((q) => q.id === id) ?? null;
}

export function addQuestion(question: Omit<Question, 'id'>): Question {
  const newQ: Question = {
    ...question,
    id: nextQuestionId(),
  };
  questions.push(newQ);
  return newQ;
}

export function updateQuestion(id: string, updates: Partial<Omit<Question, 'id'>>): Question | null {
  const idx = questions.findIndex((q) => q.id === id);
  if (idx === -1) return null;
  questions[idx] = { ...questions[idx], ...updates };
  return questions[idx];
}

export function deleteQuestion(id: string): void {
  questions = questions.filter((q) => q.id !== id);
}
