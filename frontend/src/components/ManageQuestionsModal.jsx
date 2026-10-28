import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import { PlusCircle, Trash2, X, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';

export const ManageQuestionsModal = ({ exam, onClose, onUpdated }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('MCQ');
  const [marks, setMarks] = useState(5);
  const [negativeMarks, setNegativeMarks] = useState(exam?.negativeMarkingEnabled ? (exam.defaultNegativeMarks || 0.5) : 0);
  const [explanation, setExplanation] = useState('');
  const [options, setOptions] = useState([
    { optionText: '', isCorrect: true },
    { optionText: '', isCorrect: false },
    { optionText: '', isCorrect: false },
    { optionText: '', isCorrect: false }
  ]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const data = await api.questions.getByExam(exam.id);
      setQuestions(data);
    } catch (err) {
      setError(err.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [exam.id]);

  const handleTypeChange = (type) => {
    setQuestionType(type);
    if (type === 'TRUE_FALSE') {
      setOptions([
        { optionText: 'True', isCorrect: true },
        { optionText: 'False', isCorrect: false }
      ]);
    } else {
      setOptions([
        { optionText: '', isCorrect: true },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false }
      ]);
    }
  };

  const handleOptionTextChange = (index, text) => {
    const updated = [...options];
    updated[index].optionText = text;
    setOptions(updated);
  };

  const handleCorrectSelect = (index) => {
    const updated = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index
    }));
    setOptions(updated);
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    const emptyOptions = options.some(opt => !opt.optionText.trim());
    if (emptyOptions) {
      setError('Please provide text for all options.');
      return;
    }

    try {
      await api.questions.add(exam.id, {
        questionText,
        questionType,
        marks,
        negativeMarks,
        explanation,
        options
      });

      setSuccess('Question added successfully!');
      // Reset form
      setQuestionText('');
      setExplanation('');
      handleTypeChange(questionType);

      loadQuestions();
      if (onUpdated) onUpdated();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to add question');
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await api.questions.delete(qId);
      setSuccess('Question deleted.');
      loadQuestions();
      if (onUpdated) onUpdated();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete question');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '840px' }}>
        <div className="modal-header">
          <div>
            <h3>Manage Questions &bull; {exam.title}</h3>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Subject: {exam.subject} &bull; Total Marks: {exam.totalMarks}
            </span>
          </div>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <CheckCircle size={18} />
              <span>{success}</span>
            </div>
          )}

          {/* Form to Add New Question */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '28px'
          }}>
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PlusCircle size={18} color="var(--primary)" /> Add New Examination Question
            </h4>

            <form onSubmit={handleAddQuestion}>
              <div className="form-group">
                <label className="form-label">Question Text</label>
                <textarea
                  className="form-control"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter the full question prompt..."
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Question Type</label>
                  <select
                    className="form-control"
                    value={questionType}
                    onChange={(e) => handleTypeChange(e.target.value)}
                  >
                    <option value="MCQ">Multiple Choice (4 Options)</option>
                    <option value="TRUE_FALSE">True / False</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Marks</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-control"
                    value={marks}
                    onChange={(e) => setMarks(parseFloat(e.target.value) || 0)}
                    min="0.5"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Negative Marks Penalty</label>
                  <input
                    type="number"
                    step="0.25"
                    className="form-control"
                    value={negativeMarks}
                    onChange={(e) => setNegativeMarks(parseFloat(e.target.value) || 0)}
                    min="0"
                  />
                </div>
              </div>

              {/* Options */}
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ marginBottom: '10px' }}>
                  Answer Options (Select radio for Correct Answer)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {options.map((opt, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="radio"
                        name="correctOption"
                        checked={opt.isCorrect}
                        onChange={() => handleCorrectSelect(i)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        title="Mark as correct answer"
                      />
                      <input
                        type="text"
                        className="form-control"
                        value={opt.optionText}
                        onChange={(e) => handleOptionTextChange(i, e.target.value)}
                        placeholder={`Option ${i + 1}${opt.isCorrect ? ' (Correct Answer)' : ''}`}
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Explanation (Revealed to student only in results review)</label>
                <input
                  type="text"
                  className="form-control"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="e.g. Because the algorithm requires logarithmic time complexity..."
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <PlusCircle size={16} /> Save Question to Examination
              </button>
            </form>
          </div>

          {/* Existing Questions List */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '14px' }}>
              Existing Questions in this Exam ({questions.length})
            </h4>

            {questions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                No questions added yet. Use the form above to add questions.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      padding: '16px',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontWeight: '700', color: 'var(--primary)' }}>Q{idx + 1}.</span>
                          <span className="badge badge-neutral">{q.questionType}</span>
                          <span className="badge badge-info">+{q.marks} Marks</span>
                          {q.negativeMarks > 0 && (
                            <span className="badge badge-warning">-{q.negativeMarks} Wrong</span>
                          )}
                        </div>
                        <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-main)', marginBottom: '10px' }}>
                          {q.questionText}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                          {q.options?.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                border: '1px solid var(--border)',
                                backgroundColor: opt.isCorrect ? '#ecfdf5' : '#f8fafc',
                                color: opt.isCorrect ? '#065f46' : 'var(--text-main)',
                                fontWeight: opt.isCorrect ? '700' : '500'
                              }}
                            >
                              {opt.isCorrect ? '✓ ' : ''}{opt.optionText}
                            </div>
                          ))}
                        </div>
                        {q.explanation && (
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>
                            <strong>Explanation:</strong> {q.explanation}
                          </div>
                        )}
                      </div>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteQuestion(q.id)}
                        style={{ marginLeft: '16px' }}
                        title="Delete Question"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
