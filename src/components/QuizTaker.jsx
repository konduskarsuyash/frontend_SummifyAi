'use client';

import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useParams } from 'react-router-dom';

const QuizComponent = () => {
  const { id } = useParams();
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const fetchQuizData = async () => {
      const token = localStorage.getItem('token');
      
    // BASE_URL = 'http://127.0.0.1:8000/'
    // DEPLOYED_URL = 'https://backend-summifyai.onrender.com'


      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/generate-quiz/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ summary_id: id })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch quiz data');
        }

        const data = await response.json();
        console.log('Raw quiz data:', data);
        
        // Combine multiple choice and true/false questions into a single array
        if (data?.quiz_data?.quiz_data) {
          const mcQuestions = data.quiz_data.quiz_data.multiple_choice_questions || [];
          const tfQuestions = data.quiz_data.quiz_data.true_or_false_questions || [];
          
          // Transform and combine the questions
          const combinedQuestions = [
            ...mcQuestions.map(q => ({
              ...q,
              type: 'multiple_choice'
            })),
            ...tfQuestions.map(q => ({
              ...q,
              type: 'true_false',
              options: { 'True': 'True', 'False': 'False' }
            }))
          ];

          setQuizData({ questions: combinedQuestions });
        } else {
          throw new Error('Invalid quiz data structure');
        }
      } catch (error) {
        console.error('Error processing quiz data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [id]);

  const handleAnswer = (questionIndex, answer) => {
    setUserAnswers({
      ...userAnswers,
      [questionIndex]: answer,
    });
  };

  const handleNext = () => {
    if (userAnswers[currentQuestionIndex] === undefined) {
      toast.error('Please select an option before proceeding.');
      return;
    }
    if (currentQuestionIndex < getTotalQuestions() - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const getTotalQuestions = () => {
    return quizData?.questions?.length || 0;
  };

  const getCurrentQuestion = () => {
    if (!quizData?.questions) return null;
    const question = quizData.questions[currentQuestionIndex];
    return question;
  };

  const calculateScore = () => {
    if (!quizData?.questions) return 0;
    return Object.entries(userAnswers).reduce((score, [index, answer]) => {
      const question = quizData.questions[parseInt(index)];
      if (question && answer === question.correct_option) {
        return score + 1;
      }
      return score;
    }, 0);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
  };

  if (loading) {
    return <div className="text-center text-white">Loading quiz data...</div>;
  }

  if (error) {
    return <div className="text-center text-white">Error: {error}</div>;
  }

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center p-6 text-white">
        <h1 className="text-4xl mb-6 text-blue-500">Quiz Results</h1>
        <p className="text-2xl mb-4">You scored {score} out of {getTotalQuestions()}</p>
        <button
          className="px-6 py-3 text-lg bg-blue-600 rounded hover:bg-blue-500 transition-all duration-300 transform active:scale-95"
          onClick={resetQuiz}
        >
          Retake Quiz
        </button>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center p-6 text-white">
      <Toaster />
      <h1 className="text-4xl mb-6 text-blue-500">SummifyAI Quiz</h1>
      <div className="w-full max-w-lg mb-8 bg-gray-800 p-6 rounded-lg">
        {currentQuestion ? (
          <div>
            <h2 className="text-xl mb-4">
              {currentQuestion.type === 'true_false' 
                ? currentQuestion.statement 
                : currentQuestion.question}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options && Object.entries(currentQuestion.options).map(([key, value]) => (
                <button
                  key={key}
                  className={`px-4 py-2 rounded transition-all duration-300 ${
                    userAnswers[currentQuestionIndex] === key ? 'bg-blue-600' : 'bg-gray-700'
                  }`}
                  onClick={() => handleAnswer(currentQuestionIndex, key)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p>No questions available.</p>
        )}
      </div>
      <div className="flex justify-between w-full max-w-lg">
        <button
          className={`px-6 py-3 text-lg bg-blue-600 rounded hover:bg-blue-500 transition-all duration-300 transform active:scale-95 ${
            currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </button>
        <button
          className="px-6 py-3 text-lg bg-blue-600 rounded hover:bg-blue-500 transition-all duration-300 transform active:scale-95"
          onClick={handleNext}
        >
          {currentQuestionIndex === getTotalQuestions() - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default QuizComponent;