import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CpuChipIcon, 
  BookOpenIcon, 
  LightBulbIcon,
  AcademicCapIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import OllamaService, { 
  StudyGuideRequest, 
  ExplanationRequest, 
  StudyPlanRequest 
} from '../../services/ollamaService';

interface StudyAssistantProps {
  onClose: () => void;
}

const StudyAssistant: React.FC<StudyAssistantProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'explain' | 'guide' | 'plan' | 'chat'>('explain');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Explain concept form
  const [explainForm, setExplainForm] = useState({
    concept: '',
    subject: '',
    level: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    context: ''
  });

  // Study guide form
  const [guideForm, setGuideForm] = useState({
    subject: '',
    topic: '',
    level: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    format: 'detailed' as 'outline' | 'detailed' | 'summary',
    focusAreas: ''
  });

  // Study plan form
  const [planForm, setPlanForm] = useState({
    subjects: '',
    timeAvailable: 10,
    goals: '',
    deadline: '',
    currentLevel: 'intermediate' as 'beginner' | 'intermediate' | 'advanced'
  });

  // Chat form
  const [chatForm, setChatForm] = useState({
    message: ''
  });
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'History', 'Geography', 'Literature', 'Economics', 'Psychology',
    'Philosophy', 'Art', 'Music', 'Languages', 'Engineering'
  ];

  const handleExplainConcept = async () => {
    if (!explainForm.concept || !explainForm.subject) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await OllamaService.explainConcept(explainForm);
      setResponse(result);
    } catch (err) {
      setError('Failed to get explanation. Please ensure Ollama is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateGuide = async () => {
    if (!guideForm.subject || !guideForm.topic) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await OllamaService.generateStudyGuide({
        ...guideForm,
        focusAreas: guideForm.focusAreas ? guideForm.focusAreas.split(',').map(s => s.trim()) : undefined
      });
      setResponse(result);
    } catch (err) {
      setError('Failed to generate study guide. Please ensure Ollama is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStudyPlan = async () => {
    if (!planForm.subjects || !planForm.goals) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await OllamaService.createStudyPlan({
        ...planForm,
        subjects: planForm.subjects.split(',').map(s => s.trim()),
        goals: planForm.goals.split(',').map(s => s.trim())
      });
      setResponse(result);
    } catch (err) {
      setError('Failed to create study plan. Please ensure Ollama is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChat = async () => {
    if (!chatForm.message.trim()) return;

    const userMessage = chatForm.message;
    setChatForm({ message: '' });
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);

    setIsLoading(true);
    setError(null);

    try {
      // Simple chat implementation - you could enhance this with a proper chat API
      const result = await OllamaService.explainConcept({
        concept: userMessage,
        subject: 'General',
        level: 'intermediate'
      });
      
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: result.content || result.explanation || 'I understand your question. Let me help you with that.' 
      }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error. Please ensure Ollama is running and try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderExplainTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Concept to Explain *
          </label>
          <input
            type="text"
            value={explainForm.concept}
            onChange={(e) => setExplainForm({...explainForm, concept: e.target.value})}
            placeholder="e.g., Photosynthesis, Derivatives, Supply and Demand"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject *
          </label>
          <select
            value={explainForm.subject}
            onChange={(e) => setExplainForm({...explainForm, subject: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a subject</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Level
          </label>
          <select
            value={explainForm.level}
            onChange={(e) => setExplainForm({...explainForm, level: e.target.value as any})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Context (Optional)
          </label>
          <input
            type="text"
            value={explainForm.context}
            onChange={(e) => setExplainForm({...explainForm, context: e.target.value})}
            placeholder="e.g., For a biology exam, In calculus class"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        onClick={handleExplainConcept}
        disabled={isLoading || !explainForm.concept || !explainForm.subject}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Explaining...
          </>
        ) : (
          <>
            <LightBulbIcon className="h-4 w-4 mr-2" />
            Explain Concept
          </>
        )}
      </button>
    </div>
  );

  const renderGuideTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject *
          </label>
          <select
            value={guideForm.subject}
            onChange={(e) => setGuideForm({...guideForm, subject: e.target.value})}
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
            value={guideForm.topic}
            onChange={(e) => setGuideForm({...guideForm, topic: e.target.value})}
            placeholder="e.g., Cell Division, World War II, Organic Chemistry"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Level
          </label>
          <select
            value={guideForm.level}
            onChange={(e) => setGuideForm({...guideForm, level: e.target.value as any})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Format
          </label>
          <select
            value={guideForm.format}
            onChange={(e) => setGuideForm({...guideForm, format: e.target.value as any})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="outline">Outline</option>
            <option value="detailed">Detailed</option>
            <option value="summary">Summary</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Focus Areas (Optional)
        </label>
        <input
          type="text"
          value={guideForm.focusAreas}
          onChange={(e) => setGuideForm({...guideForm, focusAreas: e.target.value})}
          placeholder="e.g., formulas, examples, common mistakes (comma-separated)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={handleGenerateGuide}
        disabled={isLoading || !guideForm.subject || !guideForm.topic}
        className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Generating...
          </>
        ) : (
          <>
            <BookOpenIcon className="h-4 w-4 mr-2" />
            Generate Study Guide
          </>
        )}
      </button>
    </div>
  );

  const renderPlanTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subjects *
        </label>
        <input
          type="text"
          value={planForm.subjects}
          onChange={(e) => setPlanForm({...planForm, subjects: e.target.value})}
          placeholder="e.g., Mathematics, Physics, Chemistry (comma-separated)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Available (hours/week)
          </label>
          <input
            type="number"
            min="1"
            max="40"
            value={planForm.timeAvailable}
            onChange={(e) => setPlanForm({...planForm, timeAvailable: parseInt(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Level
          </label>
          <select
            value={planForm.currentLevel}
            onChange={(e) => setPlanForm({...planForm, currentLevel: e.target.value as any})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Goals *
        </label>
        <input
          type="text"
          value={planForm.goals}
          onChange={(e) => setPlanForm({...planForm, goals: e.target.value})}
          placeholder="e.g., Pass final exam, Improve grades, Learn new concepts (comma-separated)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Deadline (Optional)
        </label>
        <input
          type="date"
          value={planForm.deadline}
          onChange={(e) => setPlanForm({...planForm, deadline: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={handleCreateStudyPlan}
        disabled={isLoading || !planForm.subjects || !planForm.goals}
        className="w-full px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Creating...
          </>
        ) : (
          <>
            <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
            Create Study Plan
          </>
        )}
      </button>
    </div>
  );

  const renderChatTab = () => (
    <div className="space-y-6">
      <div className="h-96 border border-gray-200 rounded-lg p-4 overflow-y-auto bg-gray-50">
        {chatHistory.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Start a conversation with your AI study assistant!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-900 border border-gray-200 px-4 py-2 rounded-lg">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          value={chatForm.message}
          onChange={(e) => setChatForm({...chatForm, message: e.target.value})}
          onKeyPress={(e) => e.key === 'Enter' && handleChat()}
          placeholder="Ask me anything about your studies..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleChat}
          disabled={isLoading || !chatForm.message.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );

  const renderResponse = () => {
    if (!response) return null;

    return (
      <div className="mt-6 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Response</h3>
        <div className="prose max-w-none">
          {response.content ? (
            <div className="whitespace-pre-wrap text-gray-700">{response.content}</div>
          ) : (
            <div className="whitespace-pre-wrap text-gray-700">{JSON.stringify(response, null, 2)}</div>
          )}
        </div>
      </div>
    );
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
              <h2 className="text-2xl font-bold text-gray-900">AI Study Assistant</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'explain', label: 'Explain', icon: LightBulbIcon },
              { id: 'guide', label: 'Study Guide', icon: BookOpenIcon },
              { id: 'plan', label: 'Study Plan', icon: ClipboardDocumentListIcon },
              { id: 'chat', label: 'Chat', icon: ChatBubbleLeftRightIcon }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {activeTab === 'explain' && renderExplainTab()}
          {activeTab === 'guide' && renderGuideTab()}
          {activeTab === 'plan' && renderPlanTab()}
          {activeTab === 'chat' && renderChatTab()}

          {renderResponse()}
        </div>
      </motion.div>
    </div>
  );
};

export default StudyAssistant;
