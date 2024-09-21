/* eslint-disable no-console */
import { config } from './config';
import fs from 'fs';
import path from 'path';
import simpleGit, { SimpleGit } from 'simple-git';

const repoPath = path.resolve(config.paths.repoPath);
const git: SimpleGit = simpleGit();

// Autenticação via HTTPS com Project Access Token
const repoURL = config.git.repoUrl.replace(
  'https://',
  `https://${config.git.accessToken}@`
);

export const cloneOrUpdateRepo = async () => {
  if (!fs.existsSync(repoPath)) {
    console.log('Clonando o repositório via HTTPS...');
    await git.clone(repoURL, repoPath);
  } else {
    console.log('Atualizando o repositório existente via HTTPS...');
    await git.cwd(repoPath);
    await git.pull('origin', config.git.branch);
  }
};

export const generateDockerfile = async (projectName: string) => {
  const projectPath = path.join(repoPath, 'notebooks', projectName);
  const dockerfilePath = path.join(projectPath, 'Dockerfile');

  const dockerfileContent = `
FROM jupyter/base-notebook

COPY . /home/jovyan/

RUN pip install --no-cache-dir -r /home/jovyan/requirements.txt
RUN pip install --no-cache-dir voila

RUN mkdir -p /etc/jupyter/voila && \\
    echo "c.VoilaConfiguration.tornado_settings = {'headers': {'Content-Security-Policy': \\"frame-ancestors 'self' *\\"}}" > /etc/jupyter/voila/config.py

EXPOSE 8888

WORKDIR /home/jovyan/

CMD ["voila", "notebook.ipynb", "--port=8888", "--no-browser", "--Voila.ip=0.0.0.0"]
  `;

  fs.writeFileSync(dockerfilePath, dockerfileContent.trim());
  console.log(`Dockerfile generated for the project ${projectName}`);
};

export const updateURL = async (projectName: string, url: string) => {
  const projectPath = path.join(repoPath, 'notebooks', projectName);
  const urlFilePath = path.join(projectPath, 'URL.md');

  fs.writeFileSync(urlFilePath, url);
  console.log(`URL.md updated for the project ${projectName}`);

  await git.cwd(repoPath);
  await git.add([`notebooks/${projectName}/URL.md`]);
  await git.commit(`Update URL for ${projectName}`);
  await git.push('origin', config.git.branch);
  console.log(`URL.md committed and pushed to the project ${projectName}`);
};

export const removeURL = async (projectName: string) => {
  const projectPath = path.join(repoPath, 'notebooks', projectName);
  const urlFilePath = path.join(projectPath, 'URL.md');

  if (fs.existsSync(urlFilePath)) {
    fs.unlinkSync(urlFilePath);
    console.log(`Removed URL.md for project ${projectName}`);

    await git.cwd(repoPath);
    await git.add([`notebooks/${projectName}/URL.md`]);
    await git.commit(`Remove URL for ${projectName}`);
    await git.push('origin', config.git.branch);
    console.log(
      `Removed committed and pushed URL.md to the project ${projectName}`
    );
  } else {
    console.log(`URL.md not found for project ${projectName}`);
  }
};
