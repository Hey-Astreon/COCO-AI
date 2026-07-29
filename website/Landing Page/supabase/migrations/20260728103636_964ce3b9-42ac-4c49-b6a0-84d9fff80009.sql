DROP POLICY "Anyone can submit a contributor application" ON public.contributor_applications;

CREATE POLICY "Anyone can submit a valid contributor application"
ON public.contributor_applications
FOR INSERT
TO anon
WITH CHECK (
  char_length(full_name) BETWEEN 1 AND 100
  AND char_length(email) BETWEEN 3 AND 255
  AND char_length(github_username) BETWEEN 1 AND 39
  AND char_length(resume_url) BETWEEN 10 AND 500
  AND char_length(motivation) BETWEEN 10 AND 1000
);