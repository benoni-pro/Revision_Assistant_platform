import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import QuizService, { QuizListItem, CreateQuizDto } from '../../services/quizService';

export const QuizzesPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [form, setForm] = useState<CreateQuizDto>({ title: '', subject: '', level: 'beginner' });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const data = await QuizService.list();
        setQuizzes(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const createQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const newQuiz = await QuizService.create(form);
      setQuizzes((prev) => [newQuiz as any, ...prev]);
      setShowForm(false);
      setForm({ title: '', subject: '', level: 'beginner' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create quiz');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quizzes</h1>
        <Button leftIcon={<PlusIcon className="h-4 w-4" />} onClick={() => setShowForm((v) => !v)}>
          New Quiz
        </Button>
      </div>

      {showForm && (
        <div className="card p-6">
          <form onSubmit={createQuiz} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="form-label">Title</label>
              <input className="form-input" name="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="form-label">Subject</label>
              <input className="form-input" name="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
            </div>
            <div>
              <label className="form-label">Level</label>
              <select className="form-select" name="level" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value as any })}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button type="submit">Create</Button>
            </div>
            {error && <div className="md:col-span-4 alert alert-danger">{error}</div>}
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center">Loading...</div>
        ) : quizzes.length === 0 ? (
          <div className="col-span-full text-center text-gray-600">No quizzes yet.</div>
        ) : (
          quizzes.map((q) => (
            <motion.div key={q._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{q.title}</h3>
                  <p className="text-sm text-gray-600">{q.subject} • {q.level}</p>
                </div>
                <div className="flex items-center gap-2 text-gray-600"><AcademicCapIcon className="h-5 w-5" /> {q.totalQuestions ?? 0}</div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuizzesPage;

