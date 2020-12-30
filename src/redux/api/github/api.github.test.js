import {
  searchAccount,
  getProfile,
  getRepositories,
  getBranches,
  getCommits,
} from './index';

describe('Github Rest API', () => {
  it('should search accounts', async () => {
    expect(searchAccount).toBeInstanceOf(Function);
    const data = await searchAccount('test g');
    expect(data).toBeDefined();
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('should get profile of user by login', async () => {
    expect(getProfile).toBeInstanceOf(Function);
    const login = 'artzub';
    const data = await getProfile(login);
    expect(data).toHaveProperty('data.login', login);
  });

  it('should get profile of organisation by login', async () => {
    expect(getProfile).toBeInstanceOf(Function);
    const login = 'github';
    const data = await getProfile(login);
    expect(data).toHaveProperty('data.login', login);
  });

  it('should get repositories of a profile', async () => {
    expect(getRepositories).toBeInstanceOf(Function);
    const owner = 'ossf';
    const data = await getRepositories({ owner, perPage: 1 });
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('should get branches of a repo', async () => {
    expect(getBranches).toBeInstanceOf(Function);
    const owner = 'd3';
    const repo = 'd3';
    const data = await getBranches({ owner, repo, perPage: 1 });
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('should get commits of a repo and a branch', async () => {
    expect(getCommits).toBeInstanceOf(Function);
    const owner = 'd3';
    const repo = 'd3';
    const branch = '4';
    const data = await getCommits({ owner, repo, branch, perPage: 1 });
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBe(true);
  });
});
