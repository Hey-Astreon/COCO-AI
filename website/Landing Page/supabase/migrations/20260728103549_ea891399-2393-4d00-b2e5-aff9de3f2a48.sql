CREATE TABLE public.contributor_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 1 AND 100),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 255),
  github_username text NOT NULL CHECK (char_length(github_username) BETWEEN 1 AND 39),
  resume_url text NOT NULL CHECK (char_length(resume_url) BETWEEN 10 AND 500),
  motivation text NOT NULL CHECK (char_length(motivation) BETWEEN 10 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.contributor_applications TO anon;
GRANT ALL ON public.contributor_applications TO service_role;

ALTER TABLE public.contributor_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a contributor application"
ON public.contributor_applications
FOR INSERT
TO anon
WITH CHECK (true);