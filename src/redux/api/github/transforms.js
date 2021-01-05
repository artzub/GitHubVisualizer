import { Repository } from '@/models/Repository';

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
