export const Repository = ({
  id,
  name,
  description,
  defaultBranch,
  url,
  language,
  forks = 0,
  stars = 0,
  watchers = 0,
  openIssues = 0,
  isFork,
  isPrivate,
  isArchived,
  isLocked,
  updatedAt,
  createdAt,
  pushedAt,
  ...rest
}) => ({
  id,
  name,
  description,
  defaultBranch,
  url,
  language: language || 'multi',
  forks,
  stars,
  watchers,
  openIssues,
  isFork,
  isPrivate,
  isArchived,
  isLocked,
  updatedAt,
  createdAt,
  pushedAt,
  mics: rest,
});
