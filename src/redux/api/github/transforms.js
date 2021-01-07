import { Profile } from '@/models/Profile';
import { Repository } from '@/models/Repository';

export const profile = (item) => Profile({
  ...item,
  avatar: item.avatar_url,
  url: item.html_url,
  publicRepos: item.public_repos,
  site: item.blog,
});

export const repository = (item) => Repository({
  ...item,
  defaultBranch: item.default_branch,
  url: item.html_url,
  openIssues: item.open_issues,
  stars: item.stargazers_count,
  isPrivate: item.private,
  isFork: item.fork,
  isArchived: item.archived,
  isLocked: item.disabled,
  updatedAt: Date.parse(item.updated_at),
  createdAt: Date.parse(item.created_at),
  pushedAt: Date.parse(item.pushed_at),
});
