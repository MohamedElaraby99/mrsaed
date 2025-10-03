import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FaTimes, 
  FaCheck, 
  FaTimes as FaX, 
  FaChevronLeft, 
  FaChevronRight,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import { getExamHistoryDetails } from '../../Redux/Slices/ExamSlice';
import { generateImageUrl } from '../../utils/fileUtils';

const ExamHistoryModal = ({ isOpen, onClose, exam, courseId, lessonId, examType = 'training', examResult = null }) => {
  const dispatch = useDispatch();
  const { examHistoryDetails, loading, error } = useSelector(state => state.exam);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswers, setShowAnswers] = useState(true); // Default to showing answers
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);

  // Get questions from examHistoryDetails or exam prop
  // For exam review, we need to get questions with correct answers from the lesson data
  const questions = examHistoryDetails && examHistoryDetails.length > 0 
    ? examHistoryDetails[0].questions || []
    : exam?.questions || [];
  const totalQuestions = questions.length;

  // Fetch exam history details when modal opens (only if no examResult provided)
  useEffect(() => {
    if (isOpen && courseId && lessonId && !examResult) {
      console.log('Fetching exam history details:', { courseId, lessonId, examType });
      dispatch(getExamHistoryDetails({ courseId, lessonId, examType }));
    }
  }, [isOpen, courseId, lessonId, examType, dispatch, examResult]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentQuestionIndex(0);
      setShowAnswers(true); // Default to showing answers
    }
  }, [isOpen]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const getQuestionResult = (questionIndex) => {
    console.log('Getting question result:', {
      questionIndex,
      examResult,
      examHistoryDetails,
      hasResults: examHistoryDetails && examHistoryDetails.length > 0
    });
    
    // Use examResult prop if available (from just completed exam)
    if (examResult && examResult.answers) {
      const answerData = examResult.answers.find(
        answer => answer.questionIndex === questionIndex
      );
      return answerData || null;
    }
    
    // Fall back to examHistoryDetails from API
    if (!examHistoryDetails || examHistoryDetails.length === 0) return null;
    
    // Get the most recent result for this exam
    const latestResult = examHistoryDetails[0];
    const answerData = latestResult.answers.find(
      answer => answer.questionIndex === questionIndex
    );
    
    return answerData || null;
  };

  const renderQuestion = () => {
    const question = questions[currentQuestionIndex];
    if (!question) return null;

    const result = getQuestionResult(currentQuestionIndex);
    const userAnswer = result?.selectedAnswer;
    const correctAnswer = question.correctAnswer; // Use correct answer from question data
    const isCorrect = result?.isCorrect;

    // Ensure we have valid data
    const questionOptions = question.options || [];
    const validCorrectAnswer = typeof correctAnswer === 'number' && correctAnswer >= 0 && correctAnswer < questionOptions.length ? correctAnswer : 0;
    const validUserAnswer = typeof userAnswer === 'number' && userAnswer >= 0 && userAnswer < questionOptions.length ? userAnswer : undefined;

    // Debug logging
    console.log('Question Debug:', {
      questionIndex: currentQuestionIndex,
      question: question.question,
      options: questionOptions,
      correctAnswer: correctAnswer,
      validCorrectAnswer: validCorrectAnswer,
      userAnswer: userAnswer,
      validUserAnswer: validUserAnswer,
      isCorrect: isCorrect,
      result: result
    });


    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              السؤال {currentQuestionIndex + 1} من {totalQuestions}
            </span>
            {result && (
              <div className={`flex items-center gap-2 text-sm font-medium ${
                isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {isCorrect ? (
                  <>
                    <FaCheck className="text-green-500" />
                    <span>صحيح</span>
                  </>
                ) : (
                  <>
                    <FaX className="text-red-500" />
                    <span>خاطئ</span>
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Question Image */}
          {question.image && (
            <div className="mb-4 flex justify-center">
              <div 
                className="w-32 h-32 md:w-40 md:h-40 rounded-lg shadow-md overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => {
                  setCurrentImage(generateImageUrl(question.image));
                  setImageModalOpen(true);
                }}
              >
                <img 
                  src={generateImageUrl(question.image)}
                  alt="صورة السؤال" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Failed to load image:', question.image);
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 leading-relaxed">
            {question.question}
          </h3>
        </div>

        <div className="space-y-3">
          {questionOptions.slice(0, question.numberOfOptions || 4).map((option, optionIndex) => {
            const isUserAnswer = validUserAnswer === optionIndex;
            const isCorrectOption = validCorrectAnswer === optionIndex;
            
            let optionClass = 'flex items-center p-4 rounded-lg border-2 transition-all duration-200 ';
            let textClass = 'text-gray-700 dark:text-gray-300 flex-1';
            
            if (showAnswers) {
              if (isCorrectOption) {
                optionClass += 'border-green-500 bg-green-50 dark:bg-green-900/20';
                textClass = 'text-green-800 dark:text-green-200 font-semibold flex-1';
              } else if (isUserAnswer && !isCorrect) {
                optionClass += 'border-red-500 bg-red-50 dark:bg-red-900/20';
                textClass = 'text-red-800 dark:text-red-200 font-semibold flex-1';
              } else {
                optionClass += 'border-gray-200 dark:border-gray-600';
              }
            } else {
              if (isUserAnswer) {
                optionClass += 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
                textClass = 'text-orange-800 dark:text-orange-200 font-semibold flex-1';
              } else {
                optionClass += 'border-gray-200 dark:border-gray-600';
              }
            }

            return (
              <div key={optionIndex} className={optionClass}>
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                  showAnswers && isCorrectOption
                    ? 'border-green-500 bg-green-500'
                    : isUserAnswer
                    ? 'border-orange-500 bg-orange-500'
                    : 'border-gray-300 dark:border-gray-500'
                }`}>
                  {(showAnswers && isCorrectOption) || isUserAnswer ? (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  ) : null}
                </div>
                <span className={textClass}>{option}</span>
                
                {showAnswers && (
                  <div className="ml-2 flex items-center gap-2">
                    {isCorrectOption && (
                      <span className="text-green-600 dark:text-green-400 text-sm font-semibold">
                        ✓ صحيح
                      </span>
                    )}
                    {isUserAnswer && !isCorrect && (
                      <span className="text-red-600 dark:text-red-400 text-sm font-semibold">
                        ✗ إجابتك
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Answer Summary */}
        {showAnswers && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">إجابتك:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  isCorrect 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {validUserAnswer !== undefined && questionOptions[validUserAnswer] ? questionOptions[validUserAnswer] : 'لم تجب'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">الإجابة الصحيحة:</span>
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {questionOptions[validCorrectAnswer] || 'غير متوفر'}
                </span>
              </div>
            </div>
            
          
          </div>
        )}

        {/* Explanation */}
        {showAnswers && question.explanation && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">التفسير:</h4>
            <p className="text-blue-700 dark:text-blue-300">{question.explanation}</p>
          </div>
        )}
      </div>
    );
  };

  const renderQuestionNavigation = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200">أسئلة الامتحان</h4>
        <div className="text-sm text-gray-500">
          {examResult 
            ? `${examResult.correctAnswers} من ${totalQuestions} صحيح`
            : examHistoryDetails && examHistoryDetails.length > 0 
            ? `${examHistoryDetails[0].correctAnswers} من ${totalQuestions} صحيح`
            : 'لا توجد نتائج'
          }
        </div>
      </div>
      
      <div className="grid grid-cols-5 gap-2">
        {questions.map((_, index) => {
          const result = getQuestionResult(index);
          const isCorrect = result?.isCorrect;
          
          return (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                index === currentQuestionIndex
                  ? 'bg-orange-600 text-white'
                  : isCorrect === true
                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-2 border-green-300'
                  : isCorrect === false
                  ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-2 border-red-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (!isOpen || !exam) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">تاريخ الامتحان - {exam.title}</h2>
              <p className="text-orange-100 mt-1">مراجعة الأسئلة والإجابات الصحيحة</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAnswers(!showAnswers)}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                {showAnswers ? <FaEyeSlash /> : <FaEye />}
                {showAnswers ? 'إخفاء الإجابات' : 'إظهار الإجابات'}
              </button>
              <button
                onClick={onClose}
                className="text-white hover:text-red-200 text-2xl transition-colors"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          {error && (
            <div className="mb-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {loading && !examResult ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">جاري تحميل تاريخ الامتحان...</p>
            </div>
          ) : (examResult || (examHistoryDetails && examHistoryDetails.length > 0)) ? (
            <div className="space-y-6">
              {/* Question Navigation - Shown at top on mobile, right side on desktop */}
              <div className="block lg:hidden">
                {renderQuestionNavigation()}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                  {renderQuestion()}
                  
                  <div className="flex items-center justify-between mt-6">
                    <button
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <FaChevronRight />
                      السابق
                    </button>
                    
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {currentQuestionIndex + 1} من {totalQuestions}
                    </div>
                    
                    <button
                      onClick={handleNextQuestion}
                      disabled={currentQuestionIndex === totalQuestions - 1}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      التالي
                      <FaChevronLeft />
                    </button>
                  </div>
                </div>
                
                <div className="hidden lg:block lg:col-span-1">
                  {renderQuestionNavigation()}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-6">📝</div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                لا توجد محاولات سابقة
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                لم تقم بحل هذا الامتحان من قبل. قم بحل الامتحان أولاً لمراجعة الأسئلة والإجابات.
              </p>
              <button
                onClick={onClose}
                className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-6 rounded-lg font-medium transition-colors"
              >
                إغلاق
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {imageModalOpen && currentImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm">
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <button
              onClick={() => {
                setImageModalOpen(false);
                setCurrentImage(null);
              }}
              className="absolute top-2 right-2 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FaTimes className="text-gray-600 dark:text-gray-300 text-xl" />
            </button>
            <img
              src={currentImage}
              alt="صورة السؤال"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamHistoryModal;
