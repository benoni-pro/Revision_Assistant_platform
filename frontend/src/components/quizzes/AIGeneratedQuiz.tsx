import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CpuChipIcon, 
  AcademicCapIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import OllamaService, { QuizGenerationRequest } from '../../services/ollamaService';

interface AIGeneratedQuizProps {
  onQuizGenerated: (quiz: any) => void;
  onClose: () => void;
}

const AIGeneratedQuiz: React.FC<AIGeneratedQuizProps> = ({ onQuizGenerated, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [quizRequest, setQuizRequest] = useState<QuizGenerationRequest>({
    subject: '',
    topic: '',
    level: 'intermediate',
    questionCount: 5,
    questionTypes: ['multiple_choice'],
    difficulty: 'medium'
  });

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'History', 'Geography', 'Literature', 'Economics', 'Psychology',
    'Philosophy', 'Art', 'Music', 'Languages', 'Engineering'
  ];

  const questionTypes = [
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'true_false', label: 'True/False' },
    { value: 'short_answer', label: 'Short Answer' },
    { value: 'essay', label: 'Essay' }
  ];

  const handleGenerate = async () => {
    if (!quizRequest.subject || !quizRequest.topic) {
      setError('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedQuiz(null);

    try {
      const quiz = await OllamaService.generateQuiz(quizRequest);
      setGeneratedQuiz(quiz);
    } catch (err) {
      setError('Failed to generate quiz. Please ensure Ollama is running.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseQuiz = () => {
    if (generatedQuiz) {
      onQuizGenerated(generatedQuiz);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <CpuChipIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">AI Quiz Generator</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          {!generatedQuiz ? (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <SparklesIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <p className="text-sm text-blue-800">
                    Generate personalized quizzes using AI. Simply specify your subject, topic, and preferences.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    value={quizRequest.subject}
                    onChange={(e) => setQuizRequest({...quizRequest, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a subject</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic *
                  </label>
                  <input
                    type="text"
                    value={quizRequest.topic}
                    onChange={(e) => setQuizRequest({...quizRequest, topic: e.target.value})}
                    placeholder="e.g., Photosynthesis, Calculus, World War II"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level
                  </label>
                  <select
                    value={quizRequest.level}
                    onChange={(e) => setQuizRequest({...quizRequest, level: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={quizRequest.questionCount}
                    onChange={(e) => setQuizRequest({...quizRequest, questionCount: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={quizRequest.difficulty}
                    onChange={(e) => setQuizRequest({...quizRequest, difficulty: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Types
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {questionTypes.map(type => (
                    <label key={type.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={quizRequest.questionTypes.includes(type.value as any)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setQuizRequest({
                              ...quizRequest,
                              questionTypes: [...quizRequest.questionTypes, type.value as any]
                            });
                          } else {
                            setQuizRequest({
                              ...quizRequest,
                              questionTypes: quizRequest.questionTypes.filter(t => t !== type.value)
                            });
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !quizRequest.subject || !quizRequest.topic}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <CpuChipIcon className="h-4 w-4 mr-2" />
                      Generate Quiz
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                  <p className="text-sm text-green-800">
                    Quiz generated successfully! Review the questions below.
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {generatedQuiz.title || `${quizRequest.subject} - ${quizRequest.topic}`}
                </h3>
                <p className="text-gray-600 mb-6">
                  {generatedQuiz.description || `A ${quizRequest.level} level quiz with ${generatedQuiz.questions?.length || 0} questions`}
                </p>

                <div className="space-y-4">
                  {generatedQuiz.questions?.map((question: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-gray-900">
                          Question {index + 1}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {question.points || 1} point{question.points !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{question.question}</p>
                      
                      {question.type === 'multiple_choice' && question.options && (
                        <div className="space-y-2">
                          {question.options.map((option: string, optIndex: number) => (
                            <div key={optIndex} className="flex items-center">
                              <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                                {String.fromCharCode(65 + optIndex)}
                              </span>
                              <span className="text-gray-700">{option}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {question.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-md">
                          <p className="text-sm text-blue-800">
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setGeneratedQuiz(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Generate Another
                </button>
                <button
                  onClick={handleUseQuiz}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                >
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Use This Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AIGeneratedQuiz;
