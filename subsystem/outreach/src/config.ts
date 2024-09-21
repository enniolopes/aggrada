export const config = {
  git: {
    repoUrl: process.env.GITLAB_REPO_URL || '',
    accessToken: process.env.GITLAB_ACCESS_TOKEN || '',
    branch: 'main',
  },
  docker: {
    registry: 'registry.simple4decision.com',
    registryUsername: process.env.REGISTRY_USERNAME,
    registryPassword: process.env.REGISTRY_PASSWORD,
  },
  paths: {
    repoPath: './app/repo',
  },
  server: {
    hostname: process.env.HOSTNAME,
  },
  authToken: process.env.AUTH_TOKEN,
};
