import { apiRequest } from './api';

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

export interface QuizGenerationRequest {
  subject: string;
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  questionCount: number;
  questionTypes: ('multiple_choice' | 'true_false' | 'short_answer' | 'essay')[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface StudyGuideRequest {
  subject: string;
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  format: 'outline' | 'detailed' | 'summary';
  focusAreas?: string[];
}

export interface ExplanationRequest {
  concept: string;
  subject: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  context?: string;
}

export interface StudyPlanRequest {
  subjects: string[];
  timeAvailable: number; // hours per week
  goals: string[];
  deadline?: string;
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
}

class OllamaService {
  private baseUrl = 'http://localhost:11434';
  private defaultModel = 'llama2:latest';

  async generateQuiz(request: QuizGenerationRequest): Promise<any> {
    const prompt = this.buildQuizPrompt(request);
    return this.callOllama(prompt, 'quiz');
  }

  async generateStudyGuide(request: StudyGuideRequest): Promise<any> {
    const prompt = this.buildStudyGuidePrompt(request);
    return this.callOllama(prompt, 'study_guide');
  }

  async explainConcept(request: ExplanationRequest): Promise<any> {
    const prompt = this.buildExplanationPrompt(request);
    return this.callOllama(prompt, 'explanation');
  }

  async createStudyPlan(request: StudyPlanRequest): Promise<any> {
    const prompt = this.buildStudyPlanPrompt(request);
    return this.callOllama(prompt, 'study_plan');
  }

  async generateFlashcards(subject: string, topic: string, count: number = 10): Promise<any> {
    const prompt = `Create ${count} flashcards for ${subject} - ${topic}. Format as JSON array with "front" and "back" fields.`;
    return this.callOllama(prompt, 'flashcards');
  }

  async generatePracticeProblems(subject: string, topic: string, level: string, count: number = 5): Promise<any> {
    const prompt = `Generate ${count} practice problems for ${subject} - ${topic} at ${level} level. Include solutions and explanations. Format as JSON.`;
    return this.callOllama(prompt, 'practice_problems');
  }

  async analyzeLearningProgress(subject: string, scores: number[], topics: string[]): Promise<any> {
    const prompt = `Analyze learning progress for ${subject}. Scores: ${scores.join(', ')}. Topics: ${topics.join(', ')}. Provide insights and recommendations.`;
    return this.callOllama(prompt, 'progress_analysis');
  }

  async generateMotivationalMessage(achievement: string, subject: string): Promise<any> {
    const prompt = `Generate a motivational message for a student who just achieved: ${achievement} in ${subject}. Keep it encouraging and educational.`;
    return this.callOllama(prompt, 'motivation');
  }

  private async callOllama(prompt: string, type: string): Promise<any> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.defaultModel,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 2000
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseResponse(data.response, type);
    } catch (error) {
      console.error('Ollama service error:', error);
      throw new Error('Failed to connect to AI service. Please ensure Ollama is running.');
    }
  }

  private parseResponse(response: string, type: string): any {
    try {
      // Try to parse as JSON first
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Return raw response if not JSON
      return { content: response, type };
    } catch {
      return { content: response, type };
    }
  }

  private buildQuizPrompt(request: QuizGenerationRequest): string {
    return `Create a ${request.level} level quiz about ${request.subject} - ${request.topic}.

Requirements:
- ${request.questionCount} questions
- Question types: ${request.questionTypes.join(', ')}
- Difficulty: ${request.difficulty}
- Include correct answers and explanations
- Format as JSON with this structure:
{
  "title": "Quiz Title",
  "description": "Brief description",
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "Why this is correct",
      "points": 1
    }
  ],
  "totalPoints": ${request.questionCount},
  "timeLimit": 30
}`;
  }

  private buildStudyGuidePrompt(request: StudyGuideRequest): string {
    return `Create a ${request.format} study guide for ${request.subject} - ${request.topic} at ${request.level} level.

Format: ${request.format}
${request.focusAreas ? `Focus areas: ${request.focusAreas.join(', ')}` : ''}

Structure the guide with:
1. Key concepts and definitions
2. Important formulas/theorems (if applicable)
3. Examples and practice problems
4. Common mistakes to avoid
5. Study tips and strategies
6. Further reading suggestions

Make it comprehensive yet easy to understand for ${request.level} level students.`;
  }

  private buildExplanationPrompt(request: ExplanationRequest): string {
    return `Explain "${request.concept}" in ${request.subject} for a ${request.level} level student.

${request.context ? `Context: ${request.context}` : ''}

Provide:
1. Simple, clear definition
2. Real-world examples
3. Step-by-step explanation
4. Visual analogies (if helpful)
5. Common misconceptions
6. Related concepts to explore

Use simple language and build understanding progressively.`;
  }

  private buildStudyPlanPrompt(request: StudyPlanRequest): string {
    return `Create a personalized study plan for the following:

Subjects: ${request.subjects.join(', ')}
Time available: ${request.timeAvailable} hours per week
Current level: ${request.currentLevel}
Goals: ${request.goals.join(', ')}
${request.deadline ? `Deadline: ${request.deadline}` : ''}

Provide:
1. Weekly schedule breakdown
2. Subject prioritization
3. Study techniques for each subject
4. Milestone checkpoints
5. Review and practice schedule
6. Tips for staying motivated
7. Resources and materials needed

Format as a structured study plan with specific time allocations.`;
  }

  // Check if Ollama is running
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Get available models
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch {
      return [];
    }
  }

  // Set custom model
  setModel(model: string): void {
    this.defaultModel = model;
  }
}

export default new OllamaService();
