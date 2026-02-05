/** Category/type for questions (e.g. React, Angular) */
export interface QuestionType {
  id: string;
  name: string;
}

/** Single interview question */
export interface Question {
  id: string;
  typeId: string;
  text: string;
  answer: string;
  imageUrls?: string[];
}
