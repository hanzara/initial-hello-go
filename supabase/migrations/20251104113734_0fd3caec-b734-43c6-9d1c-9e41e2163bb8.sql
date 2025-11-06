-- Create lessons table
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  code_snippet TEXT NOT NULL,
  language TEXT NOT NULL,
  concepts TEXT[] DEFAULT '{}',
  youtube_videos JSONB DEFAULT '[]',
  quiz_data JSONB DEFAULT '[]',
  difficulty_level TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  xp_points INTEGER NOT NULL,
  learning_objectives TEXT[] DEFAULT '{}',
  key_takeaways TEXT[] DEFAULT '{}',
  next_topics TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lesson_comments table
CREATE TABLE public.lesson_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_progress table
CREATE TABLE public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  quiz_score INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable Row Level Security
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lessons
CREATE POLICY "Anyone can view lessons"
ON public.lessons FOR SELECT
USING (true);

CREATE POLICY "Users can create their own lessons"
ON public.lessons FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own lessons"
ON public.lessons FOR UPDATE
USING (true);

CREATE POLICY "Users can delete their own lessons"
ON public.lessons FOR DELETE
USING (true);

-- RLS Policies for lesson_comments
CREATE POLICY "Anyone can view comments"
ON public.lesson_comments FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create comments"
ON public.lesson_comments FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own comments"
ON public.lesson_comments FOR UPDATE
USING (true);

CREATE POLICY "Users can delete their own comments"
ON public.lesson_comments FOR DELETE
USING (true);

-- RLS Policies for user_progress
CREATE POLICY "Users can view their own progress"
ON public.user_progress FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own progress"
ON public.user_progress FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own progress"
ON public.user_progress FOR UPDATE
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_lessons_updated_at
BEFORE UPDATE ON public.lessons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
BEFORE UPDATE ON public.user_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();