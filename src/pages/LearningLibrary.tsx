import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { BookOpen, Trophy, Clock, Search, TrendingUp, Award } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  summary: string;
  language: string;
  concepts: string[];
  difficulty_level: string;
  duration_minutes: number;
  xp_points: number;
  created_at: string;
}

interface UserProgress {
  lesson_id: string;
  completed: boolean;
  quiz_score: number;
}

export default function LearningLibrary() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [myLessons, setMyLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalXP, setTotalXP] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    fetchLessons();
    fetchProgress();
  }, []);

  const fetchLessons = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch all public lessons
      const { data: allLessons, error: allError } = await supabase
        .from('lessons')
        .select('*')
        .order('created_at', { ascending: false });

      if (allError) throw allError;
      setLessons((allLessons || []) as any);

      // Fetch user's own lessons
      if (user) {
        const { data: userLessons, error: userError } = await supabase
          .from('lessons')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (userError) throw userError;
        setMyLessons((userLessons || []) as any);
      }
    } catch (error: any) {
      toast.error('Failed to load lessons');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_progress')
        .select('lesson_id, completed, quiz_score')
        .eq('user_id', user.id);

      if (error) throw error;
      
      setProgress(data || []);
      
      // Calculate total XP and completed count
      const completed = data?.filter(p => p.completed) || [];
      setCompletedCount(completed.length);
      
      // Fetch XP for completed lessons
      if (completed.length > 0) {
        const lessonIds = completed.map(p => p.lesson_id);
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('xp_points')
          .in('id', lessonIds);

        if (!lessonsError && lessonsData) {
          const total = lessonsData.reduce((sum, lesson) => sum + lesson.xp_points, 0);
          setTotalXP(total);
        }
      }
    } catch (error: any) {
      console.error('Error fetching progress:', error);
    }
  };

  const getLessonProgress = (lessonId: string) => {
    return progress.find(p => p.lesson_id === lessonId);
  };

  const filteredLessons = lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.concepts.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
    lesson.language.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMyLessons = myLessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.concepts.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
    lesson.language.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderLessonCard = (lesson: Lesson) => {
    const lessonProgress = getLessonProgress(lesson.id);
    const isCompleted = lessonProgress?.completed || false;

    return (
      <Card
        key={lesson.id}
        className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => navigate(`/lesson/${lesson.id}`)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">{lesson.title}</h3>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{lesson.summary}</p>
          </div>
          {isCompleted && (
            <Award className="h-6 w-6 text-green-500 flex-shrink-0 ml-2" />
          )}
        </div>

        <div className="flex gap-2 flex-wrap mb-3">
          <Badge variant="outline">{lesson.difficulty_level}</Badge>
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            {lesson.duration_minutes}m
          </Badge>
          <Badge variant="secondary">
            <Trophy className="mr-1 h-3 w-3" />
            {lesson.xp_points} XP
          </Badge>
          <Badge variant="secondary">{lesson.language}</Badge>
        </div>

        <div className="flex gap-2 flex-wrap">
          {lesson.concepts.slice(0, 3).map((concept, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {concept}
            </Badge>
          ))}
          {lesson.concepts.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{lesson.concepts.length - 3} more
            </Badge>
          )}
        </div>

        {isCompleted && lessonProgress && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Quiz Score: <span className="font-medium">{lessonProgress.quiz_score || 0}</span>
            </p>
          </div>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your learning library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">📚 Learning Library</h1>
          <p className="text-muted-foreground">Your personalized learning journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 rounded-full p-3">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total XP Earned</p>
                <p className="text-2xl font-bold">{totalXP}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-500/10 rounded-full p-3">
                <Award className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lessons Completed</p>
                <p className="text-2xl font-bold">{completedCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/10 rounded-full p-3">
                <BookOpen className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">My Lessons</p>
                <p className="text-2xl font-bold">{myLessons.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search lessons by title, concept, or language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">
              <TrendingUp className="mr-2 h-4 w-4" />
              All Lessons
            </TabsTrigger>
            <TabsTrigger value="my-lessons">
              <BookOpen className="mr-2 h-4 w-4" />
              My Lessons
            </TabsTrigger>
            <TabsTrigger value="completed">
              <Award className="mr-2 h-4 w-4" />
              Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {filteredLessons.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No lessons found</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : 'Start by creating your first lesson from the Editor!'}
                </p>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredLessons.map(renderLessonCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-lessons">
            {filteredMyLessons.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No lessons yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first lesson from the Editor!
                </p>
                <Button onClick={() => navigate('/editor')}>
                  Go to Editor
                </Button>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredMyLessons.map(renderLessonCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {progress.filter(p => p.completed).length === 0 ? (
              <Card className="p-12 text-center">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No completed lessons</h3>
                <p className="text-muted-foreground">
                  Complete lessons and quizzes to earn XP!
                </p>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {lessons
                  .filter(lesson => progress.find(p => p.lesson_id === lesson.id && p.completed))
                  .map(renderLessonCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}