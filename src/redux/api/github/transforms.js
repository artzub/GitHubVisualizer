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
  updateAt: Date.parse(item.update_at),
  createAt: Date.parse(item.create_at),
  pushedAt: Date.parse(item.pushed_at),
});
