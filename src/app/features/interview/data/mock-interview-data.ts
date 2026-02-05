import type {Question, QuestionType} from '../models/interview.model';

const initialTypes: QuestionType[] = [
  {id: 't1', name: 'Web basic'},
];

const initialQuestions: Question[] = [
  {
    id: 'q1',
    typeId: 't1',
    text: 'When a user enters a URL in the browser and presses Enter, walk me through what happens end-to-end until the page is rendered.',
    answer: '1. Browser performs <b>DNS lookup</b> to resolve domain to IP.<br>2. Establishes <b>TCP connection</b> and <b>TLS handshake</b> (HTTPS).<br>3. Sends <b>HTTP request</b> to the server.<br>4. Server processes request and returns <b>HTTP response</b>.<br>5. Browser parses <b>HTML</b> → builds <b>DOM</b>.<br>6. Parses <b>CSS</b> → builds <b>CSSOM</b>.<br>7. Executes <b>JavaScript</b>.<br>8. Builds <b>render tree</b>.<br>9. Performs <b>layout</b> and <b>paint</b> to render the page.',
    imageUrls: []
  },
  {
    id: 'q2',
    typeId: 't1',
    text: 'Explain the difference between CSR, SSR, SSG, and ISR.',
    answer: '<b>CSR (Client-Side Rendering)</b>: HTML is minimal, rendering happens in the <b>browser</b> using JavaScript; slower first paint, better interactivity.<br><b>SSR (Server-Side Rendering)</b>: HTML is rendered on the <b>server per request</b>; faster first paint, better <b>SEO</b>, higher server cost.<br><b>SSG (Static Site Generation)</b>: HTML is generated at <b>build time</b>; very fast, low cost, content is <b>static</b>.<br><b>ISR (Incremental Static Regeneration)</b>: Hybrid of SSG + SSR; pages are <b>revalidated</b> and regenerated in the background on demand.',
    imageUrls: []
  },
  {
    id: 'q3',
    typeId: 't1',
    text: 'What is CORS and why does it exist?',
    answer: '<b>CORS (Cross-Origin Resource Sharing)</b> is a <b>browser security mechanism</b> that controls cross-origin HTTP requests. It exists to enforce the <b>Same-Origin Policy</b>, preventing malicious websites from accessing sensitive resources. Servers explicitly allow trusted origins using <b>CORS headers</b> like <b>Access-Control-Allow-Origin</b>.',
    imageUrls: []
  }
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
  const newType: QuestionType = {id: nextTypeId(), name: name.trim()};
  types.push(newType);
  return newType;
}

export function updateType(id: string, name: string): QuestionType | null {
  const idx = types.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  types[idx] = {...types[idx], name: name.trim()};
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
  questions[idx] = {...questions[idx], ...updates};
  return questions[idx];
}

export function deleteQuestion(id: string): void {
  questions = questions.filter((q) => q.id !== id);
}
