export const Profile = ({
  login,
  name,
  avatar,
  url,
  publicRepos,
  site,
  type,
  ...rest
}) => ({
  login,
  name,
  avatar,
  url,
  publicRepos,
  site,
  type,
  misc: rest,
});
