import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/api';
import {
  Clock, Flag, ChevronLeft, ChevronRight, CheckCircle,
  AlertTriangle, RotateCcw, Send, HelpCircle, X,
  ShieldCheck, ShieldAlert, Maximize2, Lock
} from 'lucide-react';

export const ExamScreen = ({ examId, onExamSubmitted, onExit }) => {
  const [attemptData, setAttemptData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: { selectedOptionId, markedForReview } }
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Safe Exam Browser State
  const [hasEnteredSafeMode, setHasEnteredSafeMode] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [violationModal, setViolationModal] = useState(null); // { strike: 1, reason: 'Tab switch detected' }
  const lastViolationTimeRef = useRef(0);

  const autoSaveTimerRef = useRef(null);

  // 1. Start or resume exam attempt
  useEffect(() => {
    let mounted = true;

    const startExam = async () => {
      try {
        const data = await api.attempts.start(examId);
        if (!mounted) return;

        setAttemptData(data);
        setRemainingSeconds(data.remainingSeconds || 0);
        setViolationCount(data.violationCount || 0);

        // Populate already saved answers if resuming
        const initialAnswers = {};
        if (data.savedAnswers && Array.isArray(data.savedAnswers)) {
          data.savedAnswers.forEach(ans => {
            initialAnswers[ans.questionId] = {
              selectedOptionId: ans.selectedOptionId,
              markedForReview: ans.markedForReview
            };
          });
        }
        setAnswers(initialAnswers);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || 'Failed to start examination');
      }
    };

    startExam();

    return () => {
      mounted = false;
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    };
  }, [examId]);

  // 2. Countdown Timer
  useEffect(() => {
    if (!attemptData || remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit('Time Expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [attemptData, remainingSeconds]);

  // 3. Periodic Background Auto-Save (Every 10 seconds)
  useEffect(() => {
    if (!attemptData?.attemptId) return;

    autoSaveTimerRef.current = setInterval(() => {
      performAutoSave();
    }, 10000);

    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    };
  }, [attemptData, answers]);

  // 4. Safe Exam Browser Proctoring & Anti-Cheating Event Listeners
  useEffect(() => {
    if (!attemptData || !hasEnteredSafeMode) return;

    const handleViolation = async (reason) => {
      const now = Date.now();
      // Debounce violations within 3 seconds to avoid multiple triggers on single tab switch
      if (now - lastViolationTimeRef.current < 3000) return;
      lastViolationTimeRef.current = now;

      const newCount = violationCount + 1;
      setViolationCount(newCount);

      // Report violation to backend in real time
      try {
        const report = await api.attempts.reportViolation(attemptData.attemptId, reason);
        if (report.terminated) {
          alert('EXAMINATION TERMINATED: You reached the maximum violation limit of 3 strikes.');
          onExamSubmitted(attemptData.attemptId);
          return;
        }
      } catch (err) {
        console.warn('Could not record violation:', err.message);
      }

      setViolationModal({ strike: newCount, reason });
    };

    // Fullscreen change listener
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        handleViolation('Exited Fullscreen Mode');
      }
    };

    // Tab visibility change
    const onVisibilityChange = () => {
      if (document.hidden) {
        handleViolation('Tab Switch / Window Minimized');
      }
    };

    // Window focus loss
    const onWindowBlur = () => {
      handleViolation('Focus Lost to External Application');
    };

    // Context menu (Right click) prevent
    const onContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Copy / Paste / Cut prevent
    const onCopyPaste = (e) => {
      e.preventDefault();
      return false;
    };

    // Keyboard shortcut prevention (Ctrl+C, Ctrl+V, F12, etc.)
    const onKeyDown = (e) => {
      // F12 or Ctrl+Shift+I or Ctrl+U (DevTools / Source)
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.key === 'p')
      ) {
        e.preventDefault();
        handleViolation('Prohibited Keyboard Shortcut (DevTools / Print / Inspect)');
        return false;
      }
      // Ctrl+C, Ctrl+V, Ctrl+X
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onWindowBlur);
    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('copy', onCopyPaste);
    document.addEventListener('paste', onCopyPaste);
    document.addEventListener('cut', onCopyPaste);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onWindowBlur);
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('copy', onCopyPaste);
      document.removeEventListener('paste', onCopyPaste);
      document.removeEventListener('cut', onCopyPaste);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [attemptData, hasEnteredSafeMode, violationCount]);

  const enterSafeModeFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request bypassed:', err);
    }
    setHasEnteredSafeMode(true);
  };

  const reEnterFullscreen = async () => {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn('Re-enter fullscreen error:', err);
    }
    setViolationModal(null);
  };

  const performAutoSave = async () => {
    if (!attemptData?.attemptId) return;
    try {
      setSaving(true);
      const answerList = Object.entries(answers).map(([qId, val]) => ({
        questionId: parseInt(qId),
        selectedOptionId: val.selectedOptionId,
        markedForReview: val.markedForReview || false
      }));

      await api.attempts.saveAnswers(attemptData.attemptId, answerList);
    } catch (err) {
      console.warn('Autosave warning:', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAutoSubmit = async (reason = '') => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const answerList = Object.entries(answers).map(([qId, val]) => ({
        questionId: parseInt(qId),
        selectedOptionId: val.selectedOptionId,
        markedForReview: val.markedForReview || false
      }));

      await api.attempts.submit(attemptData.attemptId, answerList);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      onExamSubmitted(attemptData.attemptId);
    } catch (err) {
      alert('Examination submitted: ' + (err.message || ''));
      onExit();
    }
  };

  const handleManualSubmit = async () => {
    setSubmitting(true);
    try {
      const answerList = Object.entries(answers).map(([qId, val]) => ({
        questionId: parseInt(qId),
        selectedOptionId: val.selectedOptionId,
        markedForReview: val.markedForReview || false
      }));

      await api.attempts.submit(attemptData.attemptId, answerList);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setShowSubmitModal(false);
      onExamSubmitted(attemptData.attemptId);
    } catch (err) {
      setError(err.message || 'Failed to submit examination');
      setSubmitting(false);
    }
  };

  if (error) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <div className="alert alert-danger" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <AlertTriangle size={24} />
          <div>
            <strong>Examination Error:</strong> {error}
          </div>
        </div>
        <button className="btn btn-secondary" onClick={onExit} style={{ marginTop: '20px' }}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (!attemptData) {
    return (
      <div style={{ padding: '80px', textAlign: 'center' }}>
        <div className="spin" style={{ display: 'inline-block', marginBottom: '16px' }}>
          <Clock size={40} color="var(--primary)" />
        </div>
        <h3>Loading examination environment...</h3>
        <p style={{ color: 'var(--text-muted)' }}>Synchronizing secure question palette and server timer.</p>
      </div>
    );
  }

  // Safe Exam Browser Entry Screen if not yet entered
  if (attemptData.safeExamBrowserEnabled && !hasEnteredSafeMode) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          padding: '40px',
          maxWidth: '620px',
          width: '100%',
          border: '1px solid #334155',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(79, 70, 229, 0.2)',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Lock size={32} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Safe Exam Browser Environment</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '6px' }}>
              Examination: <strong>{attemptData.examTitle}</strong>
            </p>
          </div>

          <div style={{
            backgroundColor: '#0f172a',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #334155',
            marginBottom: '28px',
            fontSize: '14px',
            lineHeight: '1.7',
            color: '#cbd5e1'
          }}>
            <h4 style={{ color: '#f8fafc', fontSize: '15px', fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#10b981" /> Proctoring & Integrity Rules:
            </h4>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>Full-Screen Lock:</strong> The exam runs in dedicated fullscreen mode.</li>
              <li><strong>No Tab Switching:</strong> Navigating away or minimizing the window triggers a strike.</li>
              <li><strong>Disabled Shortcuts:</strong> Copying, pasting, right-clicking, and developer tools are blocked.</li>
              <li><strong>3-Strike Policy:</strong> Accumulating 3 violations will automatically terminate and submit your examination.</li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={onExit}>
              Cancel & Exit
            </button>
            <button className="btn btn-primary btn-lg" onClick={enterSafeModeFullscreen}>
              <Maximize2 size={18} /> Launch Safe Exam Browser Mode
            </button>
          </div>
        </div>
      </div>
    );
  }

  const questions = attemptData.questions || [];
  const currentQuestion = questions[currentIndex] || null;

  // Options helpers
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;
  const selectedOptionId = currentAnswer?.selectedOptionId || null;
  const isMarkedForReview = currentAnswer?.markedForReview || false;

  const handleSelectOption = (optId) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        selectedOptionId: optId
      }
    }));
  };

  const handleClearSelection = () => {
    if (!currentQuestion) return;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        selectedOptionId: null
      }
    }));
  };

  const handleToggleMarkForReview = () => {
    if (!currentQuestion) return;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        markedForReview: !isMarkedForReview
      }
    }));
  };

  // Format Timer mm:ss
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timerDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isTimeCritical = remainingSeconds < 120; // under 2 minutes

  // Palette Status Logic
  const getQuestionStatus = (qId) => {
    const ans = answers[qId];
    const hasAnswer = ans && ans.selectedOptionId !== null && ans.selectedOptionId !== undefined;
    const isReview = ans && ans.markedForReview;

    if (hasAnswer && isReview) return 'answered-review';
    if (isReview) return 'review';
    if (hasAnswer) return 'answered';
    return 'unanswered';
  };

  // Counts for summary
  const answeredCount = questions.filter(q => {
    const a = answers[q.id];
    return a && a.selectedOptionId !== null && a.selectedOptionId !== undefined;
  }).length;

  const reviewCount = questions.filter(q => answers[q.id]?.markedForReview).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="exam-taking-page" style={{ userSelect: 'none' }}>
      {/* Sticky Exam Nav */}
      <header className="exam-nav">
        <div className="exam-title-badge">
          <CheckCircle size={20} color="var(--primary)" />
          <span>{attemptData.examTitle}</span>
          <span className="badge badge-neutral">{attemptData.subject}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Safe Exam Browser Badge */}
          {attemptData.safeExamBrowserEnabled && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '9999px',
              backgroundColor: violationCount > 0 ? '#fee2e2' : '#ecfdf5',
              color: violationCount > 0 ? '#991b1b' : '#065f46',
              fontSize: '12px',
              fontWeight: '700',
              border: `1px solid ${violationCount > 0 ? '#fca5a5' : '#a7f3d0'}`
            }}>
              {violationCount > 0 ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
              <span>Safe Browser Active &bull; Strikes: {violationCount}/3</span>
            </div>
          )}

          {saving && (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Autosaving...
            </span>
          )}

          <div className={`timer-box ${isTimeCritical ? 'warning' : ''}`} title="Remaining Time">
            <Clock size={20} />
            <span>{timerDisplay}</span>
          </div>

          <button
            className="btn btn-success"
            onClick={() => setShowSubmitModal(true)}
          >
            <Send size={16} /> Submit Exam
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="exam-content-grid">
        {/* Left Side: Question Card */}
        <div className="exam-question-card">
          {currentQuestion ? (
            <>
              {/* Question Metadata */}
              <div className="question-meta">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)' }}>
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="badge badge-neutral">{currentQuestion.questionType}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-info">+{currentQuestion.marks} Marks</span>
                  {currentQuestion.negativeMarks > 0 && (
                    <span className="badge badge-warning">-{currentQuestion.negativeMarks} Negative</span>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div className="question-text">
                {currentQuestion.questionText}
              </div>

              {/* Answer Options */}
              <div className="options-list">
                {currentQuestion.options?.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  return (
                    <div
                      key={opt.id}
                      className={`option-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectOption(opt.id)}
                    >
                      <div className="option-indicator" />
                      <span>{opt.optionText}</span>
                    </div>
                  );
                })}
              </div>

              {/* Toolbar */}
              <div className="exam-nav-toolbar">
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleClearSelection}
                    disabled={!selectedOptionId}
                  >
                    <RotateCcw size={14} /> Clear Selection
                  </button>

                  <button
                    className={`btn btn-sm ${isMarkedForReview ? 'btn-warning' : 'btn-secondary'}`}
                    onClick={handleToggleMarkForReview}
                  >
                    <Flag size={14} />
                    {isMarkedForReview ? 'Unmark Review' : 'Mark for Review'}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>

                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      if (currentIndex < questions.length - 1) {
                        setCurrentIndex(prev => prev + 1);
                      } else {
                        setShowSubmitModal(true);
                      }
                    }}
                  >
                    {currentIndex < questions.length - 1 ? (
                      <>Next <ChevronRight size={16} /></>
                    ) : (
                      <>Review & Submit</>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div>No questions available in this examination.</div>
          )}
        </div>

        {/* Right Side: Question Navigation Palette */}
        <aside className="palette-card">
          <h4 style={{ fontSize: '16px', fontWeight: '700' }}>Question Palette</h4>

          {/* Grid of numbers */}
          <div className="palette-grid">
            {questions.map((q, idx) => {
              const status = getQuestionStatus(q.id);
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  className={`palette-btn ${status} ${isCurrent ? 'current' : ''}`}
                  onClick={() => setCurrentIndex(idx)}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="palette-legend">
            <div className="legend-item">
              <span className="legend-dot answered" />
              <span>{answeredCount} Answered</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot review" />
              <span>{reviewCount} Marked for Review</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot answered-review" />
              <span>Answered & Review</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot unanswered" />
              <span>{unansweredCount} Unanswered</span>
            </div>
          </div>
        </aside>
      </div>

      {/* PROCTORING VIOLATION WARNING MODAL */}
      {violationModal && (
        <div className="modal-overlay" style={{ zIndex: 999 }}>
          <div className="modal-content" style={{ maxWidth: '520px', border: '2px solid #ef4444' }}>
            <div className="modal-header" style={{ backgroundColor: '#fef2f2', borderBottom: '1px solid #fecaca' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b' }}>
                <ShieldAlert size={24} />
                <h3 style={{ color: '#991b1b', margin: 0 }}>Proctoring Violation Warning</h3>
              </div>
            </div>

            <div className="modal-body">
              <div style={{
                fontSize: '18px',
                fontWeight: '800',
                color: '#b91c1c',
                marginBottom: '10px'
              }}>
                Strike {violationModal.strike} of 3 Recorded!
              </div>

              <p style={{ fontSize: '14px', color: 'var(--text-main)', marginBottom: '12px', lineHeight: '1.6' }}>
                A security rule was violated: <strong>{violationModal.reason}</strong>.
              </p>

              <div style={{
                padding: '12px 16px',
                backgroundColor: '#fff7ed',
                border: '1px solid #fed7aa',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#9a3412',
                marginBottom: '16px'
              }}>
                <strong>Notice:</strong> Your screen must remain in full-screen mode throughout the exam. Navigating away, switching tabs, or pressing prohibited shortcuts is recorded. If you reach <strong>3 strikes</strong>, your exam will be automatically cancelled and submitted immediately.
              </div>
            </div>

            <div className="modal-footer" style={{ backgroundColor: '#f8fafc' }}>
              <button
                className="btn btn-danger"
                onClick={reEnterFullscreen}
                style={{ width: '100%' }}
              >
                <Maximize2 size={16} /> Return to Full-Screen Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION SUBMIT MODAL */}
      {showSubmitModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>Confirm Exam Submission</h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setShowSubmitModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ marginBottom: '16px', fontSize: '15px' }}>
                Are you sure you want to finalize and submit your examination? Once submitted,
                your answers will be automatically graded and cannot be modified.
              </p>

              <div style={{
                backgroundColor: '#f8fafc',
                borderRadius: '10px',
                padding: '16px',
                border: '1px solid var(--border)',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                textAlign: 'center',
                gap: '8px'
              }}>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--success)' }}>
                    {answeredCount}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Answered</div>
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--warning)' }}>
                    {reviewCount}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Under Review</div>
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--danger)' }}>
                    {unansweredCount}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Unanswered</div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowSubmitModal(false)}
                disabled={submitting}
              >
                Return to Exam
              </button>
              <button
                className="btn btn-primary"
                onClick={handleManualSubmit}
                disabled={submitting}
              >
                {submitting ? 'Grading & Submitting...' : 'Yes, Submit Examination'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
