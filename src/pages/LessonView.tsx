import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft, Play, CheckCircle2, XCircle, Trophy, Clock, BookOpen, MessageSquare } from 'lucide-react';

interface Quiz {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

interface Lesson {
  id: string;
  title: string;
  summary: string;
  code_snippet: string;
  language: string;
  concepts: string[];
  youtube_videos: Array<{ title: string; url: string }>;
  quiz_data: Quiz[];
  difficulty_level: string;
  duration_minutes: number;
  xp_points: number;
  learning_objectives?: string[];
  key_takeaways?: string[];
  next_topics?: string[];
}

export default function LessonView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    fetchLesson();
    fetchComments();
  }, [id]);

  const fetchLesson = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setLesson(data as any);
    } catch (error: any) {
      toast.error('Failed to load lesson');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('lesson_comments')
        .select('*')
        .eq('lesson_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error: any) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAnswerSelect = (index: number) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !lesson) return;
    
    const isCorrect = selectedAnswer === lesson.quiz_data[currentQuiz].correct_answer;
    if (isCorrect) {
      setQuizScore(quizScore + 1);
    }
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (!lesson) return;
    
    if (currentQuiz < lesson.quiz_data.length - 1) {
      setCurrentQuiz(currentQuiz + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
      saveProgress();
    }
  };

  const saveProgress = async () => {
    if (!lesson) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lesson.id,
          completed: true,
          quiz_score: quizScore,
          completed_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success(`🎉 Lesson completed! You earned ${lesson.xp_points} XP!`);
    } catch (error: any) {
      console.error('Error saving progress:', error);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !lesson) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to comment');
        return;
      }

      const { error } = await supabase
        .from('lesson_comments')
        .insert({
          lesson_id: lesson.id,
          user_id: user.id,
          comment: comment.trim(),
        });

      if (error) throw error;
      setComment('');
      fetchComments();
      toast.success('Comment added!');
    } catch (error: any) {
      toast.error('Failed to add comment');
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Lesson not found</p>
          <Button onClick={() => navigate('/learning-library')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Library
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/learning-library')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Library
        </Button>

        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{lesson.title}</h1>
              <p className="text-muted-foreground text-lg">{lesson.summary}</p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
              {lesson.xp_points} XP
            </Badge>
          </div>

          <div className="flex gap-4 flex-wrap">
            <Badge>{lesson.difficulty_level}</Badge>
            <Badge variant="secondary">
              <Clock className="mr-1 h-3 w-3" />
              {lesson.duration_minutes} mins
            </Badge>
            <Badge variant="secondary">
              <BookOpen className="mr-1 h-3 w-3" />
              {lesson.language}
            </Badge>
            {lesson.concepts.map((concept, idx) => (
              <Badge key={idx} variant="outline">{concept}</Badge>
            ))}
          </div>
        </div>

        <Tabs defaultValue="lesson" className="space-y-6">
          <TabsList>
            <TabsTrigger value="lesson">Lesson</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="lesson" className="space-y-6">
            {lesson.learning_objectives && lesson.learning_objectives.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">🎯 Learning Objectives</h2>
                <ul className="space-y-2">
                  {lesson.learning_objectives.map((obj, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">💻 Code Example</h2>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                <code className="text-sm">{lesson.code_snippet}</code>
              </pre>
            </Card>

            {lesson.youtube_videos && lesson.youtube_videos.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">🎥 Video Resources</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {lesson.youtube_videos.map((video, idx) => (
                    <a
                      key={idx}
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group"
                    >
                      <Card className="p-4 hover:shadow-lg transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="bg-red-500 rounded-full p-2 group-hover:scale-110 transition-transform">
                            <Play className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium group-hover:text-primary">{video.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">Watch on YouTube</p>
                          </div>
                        </div>
                      </Card>
                    </a>
                  ))}
                </div>
              </Card>
            )}

            {lesson.key_takeaways && lesson.key_takeaways.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">💡 Key Takeaways</h2>
                <ul className="space-y-2">
                  {lesson.key_takeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {lesson.next_topics && lesson.next_topics.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">🚀 Next Topics to Explore</h2>
                <div className="flex gap-2 flex-wrap">
                  {lesson.next_topics.map((topic, idx) => (
                    <Badge key={idx} variant="secondary">{topic}</Badge>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="quiz">
            {!quizCompleted ? (
              <Card className="p-6">
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">
                      Question {currentQuiz + 1} of {lesson.quiz_data.length}
                    </span>
                    <span className="text-sm font-medium">
                      Score: {quizScore}/{lesson.quiz_data.length}
                    </span>
                  </div>
                  <Progress value={((currentQuiz + 1) / lesson.quiz_data.length) * 100} />
                </div>

                <h3 className="text-xl font-semibold mb-6">
                  {lesson.quiz_data[currentQuiz].question}
                </h3>

                <div className="space-y-3 mb-6">
                  {lesson.quiz_data[currentQuiz].options.map((option, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === lesson.quiz_data[currentQuiz].correct_answer;
                    const showResult = showExplanation;

                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswerSelect(idx)}
                        disabled={showExplanation}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                          isSelected
                            ? showResult
                              ? isCorrect
                                ? 'border-green-500 bg-green-50 dark:bg-green-950'
                                : 'border-red-500 bg-red-50 dark:bg-red-950'
                              : 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {showResult && isSelected && (
                            isCorrect ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {showExplanation && (
                  <Card className="p-4 mb-6 bg-muted">
                    <p className="font-medium mb-2">Explanation:</p>
                    <p className="text-sm">{lesson.quiz_data[currentQuiz].explanation}</p>
                  </Card>
                )}

                <div className="flex gap-4">
                  {!showExplanation ? (
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={selectedAnswer === null}
                      className="flex-1"
                    >
                      Submit Answer
                    </Button>
                  ) : (
                    <Button onClick={handleNextQuestion} className="flex-1">
                      {currentQuiz < lesson.quiz_data.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    </Button>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
                <p className="text-xl text-muted-foreground mb-4">
                  You scored {quizScore} out of {lesson.quiz_data.length}
                </p>
                <p className="text-lg mb-6">
                  You earned <span className="font-bold text-primary">{lesson.xp_points} XP</span>!
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => {
                    setCurrentQuiz(0);
                    setSelectedAnswer(null);
                    setShowExplanation(false);
                    setQuizScore(0);
                    setQuizCompleted(false);
                  }}>
                    Retake Quiz
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/learning-library')}>
                    Back to Library
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="community">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                <MessageSquare className="inline mr-2 h-5 w-5" />
                Community Discussion
              </h2>
              
              <div className="mb-6">
                <Textarea
                  placeholder="Share your thoughts or ask a question..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mb-2"
                />
                <Button onClick={handleAddComment}>Post Comment</Button>
              </div>

              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                ) : (
                  comments.map((c) => (
                    <Card key={c.id} className="p-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        {new Date(c.created_at).toLocaleString()}
                      </p>
                      <p>{c.comment}</p>
                    </Card>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}