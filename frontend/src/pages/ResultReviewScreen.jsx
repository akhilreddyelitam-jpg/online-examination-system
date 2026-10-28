import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import {
  Award, CheckCircle, XCircle, AlertCircle, ArrowLeft,
  Clock, HelpCircle, FileText, Check, X, RefreshCw
} from 'lucide-react';

export const ResultReviewScreen = ({ attemptId, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await api.results.getByAttemptId(attemptId);
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to load examination result');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div style={{ padding: '80px', textAlign: 'center' }}>
        <RefreshCw className="spin" size={32} />
        <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Calculating and compiling examination report...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
        <div className="alert alert-danger">
          <AlertCircle size={20} />
          <span>{error || 'Result details not available.'}</span>
        </div>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Return to Dashboard
        </button>
      </div>
    );
  }

  const { result, questions } = data;

  return (
    <div style={{ maxWidth: '960px', margin: '32px auto', padding: '0 24px' }}>
      {/* Back button */}
      <div style={{ marginBottom: '20px' }}>
        <button className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      {/* Main Score Banner */}
      <div style={{
        background: result.passed
          ? 'linear-gradient(135deg, #064e3b 0%, #047857 100%)'
          : 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)',
        color: '#ffffff',
        borderRadius: '16px',
        padding: '36px',
        boxShadow: 'var(--shadow-md)',
        marginBottom: '28px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px'
      }}>
        <div>
          <span style={{
            fontSize: '12px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '4px 12px',
            borderRadius: '9999px',
            display: 'inline-block',
            marginBottom: '10px'
          }}>
            Examination Result Summary
          </span>
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '6px' }}>
            {result.examTitle}
          </h2>
          <p style={{ opacity: 0.9, fontSize: '15px' }}>
            Candidate: <strong>{result.studentName}</strong> &bull; Subject: {result.subject}
          </p>
          <div style={{ marginTop: '10px' }}>
            {result.violationCount > 0 ? (
              <span style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '9999px',
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                fontSize: '12px',
                fontWeight: '700'
              }}>
                ⚠️ Proctoring: {result.violationCount} Violation Strike(s) Recorded
              </span>
            ) : (
              <span style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: '700'
              }}>
                🛡️ Safe Exam Browser: 0 Violations (Clean Exam Session)
              </span>
            )}
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          color: 'var(--text-main)',
          padding: '20px 28px',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: 'var(--shadow)',
          minWidth: '200px'
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: '900',
            color: result.passed ? 'var(--success)' : 'var(--danger)'
          }}>
            {result.percentage}%
          </div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-muted)' }}>
            Score: {result.marksObtained} / {result.totalMarks}
          </div>
          <span style={{
            display: 'inline-block',
            marginTop: '8px',
            fontSize: '12px',
            fontWeight: '800',
            textTransform: 'uppercase',
            padding: '2px 10px',
            borderRadius: '9999px',
            backgroundColor: result.passed ? '#d1fae5' : '#fee2e2',
            color: result.passed ? '#065f46' : '#991b1b'
          }}>
            {result.passed ? 'Passed Certificate' : 'Did Not Pass'}
          </span>
        </div>
      </div>

      {/* Breakdown Metrics Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title"><Award size={18} /> Performance Breakdown</h3>
        </div>
        <div className="card-body">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '16px',
            textAlign: 'center'
          }}>
            <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)' }}>
                {result.totalQuestions}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Questions</div>
            </div>

            <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#0ea5e9' }}>
                {result.answeredQuestions}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Answered</div>
            </div>

            <div style={{ padding: '16px', backgroundColor: '#ecfdf5', borderRadius: '10px' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--success)' }}>
                {result.correctAnswers}
              </div>
              <div style={{ fontSize: '12px', color: '#065f46' }}>Correct Answers</div>
            </div>

            <div style={{ padding: '16px', backgroundColor: '#fef2f2', borderRadius: '10px' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--danger)' }}>
                {result.wrongAnswers}
              </div>
              <div style={{ fontSize: '12px', color: '#991b1b' }}>Wrong Answers</div>
            </div>

            <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-muted)' }}>
                {result.unansweredQuestions}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Unanswered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Question by Question Review */}
      <div style={{ marginTop: '32px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={20} color="var(--primary)" /> Question Analysis & Explanations
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {questions?.map((q, idx) => {
            const isCorrect = q.correct;
            const isAnswered = q.answered;

            return (
              <div
                key={q.questionId}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: `2px solid ${isCorrect ? '#a7f3d0' : isAnswered ? '#fecaca' : 'var(--border)'}`,
                  padding: '24px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {/* Question Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '800' }}>Q{idx + 1}.</span>
                    <span className="badge badge-neutral">{q.questionType}</span>
                    <span className="badge badge-info">+{q.marks} Marks</span>
                  </div>

                  <div>
                    {isCorrect ? (
                      <span className="badge badge-success" style={{ gap: '4px' }}>
                        <Check size={14} /> Correct (+{q.marks})
                      </span>
                    ) : isAnswered ? (
                      <span className="badge badge-danger" style={{ gap: '4px' }}>
                        <X size={14} /> Incorrect {q.negativeMarks > 0 ? `(-${q.negativeMarks})` : ''}
                      </span>
                    ) : (
                      <span className="badge badge-neutral">Skipped / Unanswered</span>
                    )}
                  </div>
                </div>

                {/* Question Text */}
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '18px', lineHeight: '1.5' }}>
                  {q.questionText}
                </div>

                {/* Options List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                  {q.options?.map((opt) => {
                    const isCandidateSelected = q.selectedOptionId === opt.id;
                    const isRightOption = opt.isCorrect;

                    let bg = '#f8fafc';
                    let border = 'var(--border)';
                    let color = 'var(--text-main)';

                    if (isRightOption) {
                      bg = '#ecfdf5';
                      border = '#10b981';
                      color = '#065f46';
                    } else if (isCandidateSelected && !isRightOption) {
                      bg = '#fef2f2';
                      border = '#ef4444';
                      color = '#991b1b';
                    }

                    return (
                      <div
                        key={opt.id}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '8px',
                          border: `1.5px solid ${border}`,
                          backgroundColor: bg,
                          color: color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontWeight: (isRightOption || isCandidateSelected) ? '700' : '500',
                          fontSize: '14px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {isRightOption ? (
                            <Check size={16} color="#10b981" />
                          ) : isCandidateSelected ? (
                            <X size={16} color="#ef4444" />
                          ) : (
                            <span style={{ width: '16px' }} />
                          )}
                          <span>{opt.optionText}</span>
                        </div>

                        <div>
                          {isRightOption && (
                            <span style={{ fontSize: '12px', fontWeight: '700', color: '#059669' }}>
                              (Correct Answer)
                            </span>
                          )}
                          {isCandidateSelected && !isRightOption && (
                            <span style={{ fontSize: '12px', fontWeight: '700', color: '#dc2626' }}>
                              (Your Choice)
                            </span>
                          )}
                          {isCandidateSelected && isRightOption && (
                            <span style={{ fontSize: '12px', fontWeight: '700', color: '#059669' }}>
                              &bull; Your Correct Choice
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div style={{
                    padding: '14px 18px',
                    borderRadius: '8px',
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#1e3a8a',
                    fontSize: '13px',
                    lineHeight: '1.6'
                  }}>
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
