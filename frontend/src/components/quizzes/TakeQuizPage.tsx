import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../ui/Button';
import QuizService, { AttemptResult, QuizDetail } from '../../services/quizService';

export const TakeQuizPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [started, setStarted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [result, setResult] = useState<AttemptResult | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const q = await QuizService.get(id);
        setQuiz(q);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!started) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [started]);

  const formattedTime = useMemo(() => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, [seconds]);

  const submit = async () => {
    if (!id) return;
    try {
      const res = await QuizService.submitAttempt(id, answers, seconds);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submission failed');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!quiz) return <div className="alert alert-warning">Quiz not found</div>;

  if (result) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{quiz.title} - Results</h1>
        <div className="card p-6">
          <p className="text-lg font-semibold">Score: {Math.round(result.percentage)}%</p>
          <p className="text-sm text-gray-600">Correct: {result.correctAnswers}/{result.totalQuestions}</p>
          <div className="mt-4 space-y-3">
            {quiz.questions.map((q, i) => (
              <div key={q._id} className="border rounded p-3">
                <div className="font-medium mb-1">{i + 1}. {q.question}</div>
                {q.options && q.options.map((opt, oi) => (
                  <div key={oi} className="text-sm flex items-center gap-2">
                    <span className={`${(opt as any).isCorrect ? 'text-green-600' : ''}`}>{opt.text}</span>
                  </div>
                ))}
                {q.explanation && <div className="text-sm text-gray-600 mt-2">Explanation: {q.explanation}</div>}
              </div>
            ))}
          </div>
          <Button className="mt-4" onClick={() => navigate('/quizzes')}>Back to Quizzes</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        <div className="badge badge-secondary">Time: {formattedTime}</div>
      </div>

      {!started ? (
        <div className="card p-6">
          <p className="text-gray-700">{quiz.subject} • {quiz.level} • {quiz.totalQuestions} questions</p>
          <Button className="mt-4" onClick={() => setStarted(true)}>Start Quiz</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {quiz.questions.map((q, idx) => (
            <div key={q._id} className="card p-4">
              <div className="font-medium mb-2">{idx + 1}. {q.question}</div>
              {q.options ? (
                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    const idOpt = `${q._id}-${oi}`;
                    return (
                      <label key={idOpt} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={q._id}
                          className="h-4 w-4"
                          onChange={() => setAnswers((prev) => ({ ...prev, [q._id]: opt.text }))}
                          checked={answers[q._id] === opt.text}
                        />
                        <span className="text-sm">{opt.text}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <input
                  className="form-input"
                  placeholder="Your answer"
                  value={answers[q._id] || ''}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [q._id]: e.target.value }))}
                />
              )}
            </div>
          ))}
          <div className="flex justify-end">
            <Button onClick={submit}>Submit</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeQuizPage;

