/* eslint-disable no-console */
import { config } from './config';
import Docker from 'dockerode';
import path from 'path';
import tar from 'tar-fs';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });
const registry = config.docker.registry;
const repoPath = path.resolve(config.paths.repoPath);

const registryUsername = config.docker.registryUsername;
const registryPassword = config.docker.registryPassword;

export const buildImage = async (projectName: string) => {
  const projectPath = path.join(repoPath, 'notebooks', projectName);
  const imageTag = `${registry}/${projectName}:latest`;

  console.log(`Building the Docker image for the project ${projectName}...`);

  const tarStream = tar.pack(projectPath);

  await new Promise<void>((resolve, reject) => {
    docker.buildImage(
      tarStream,
      {
        t: imageTag,
      },
      (err, stream) => {
        if (err) {
          console.error('Error starting image build:', err);
          return reject(err);
        }

        stream?.on('data', (data: Buffer) => {
          const output = data.toString();
          console.log(output);
        });

        stream?.on('end', () => {
          console.log(`Docker image built for the project ${projectName}`);
          resolve();
        });

        stream?.on('error', (error: unknown) => {
          console.error('Error while building image:', error);
          reject(error);
        });
      }
    );
  });
};

export const pushImage = async (projectName: string) => {
  const imageTag = `${registry}/${projectName}:latest`;
  const image = docker.getImage(imageTag);

  console.log(`Pushing the image ${imageTag} to the Docker Registry...`);

  const authConfig = {
    username: registryUsername,
    password: registryPassword,
    serveraddress: registry,
  };

  await new Promise<void>((resolve, reject) => {
    image.push({ authconfig: authConfig }, (err, stream) => {
      if (err) {
        console.error('Error starting image push:', err);
        return reject(err);
      }

      stream?.on('data', (data: Buffer) => {
        const output = data.toString();
        console.log(output);
      });

      stream?.on('end', () => {
        console.log(`${imageTag} image push completed`);
        resolve();
      });

      stream?.on('error', (error: unknown) => {
        console.error('Error while pushing image:', error);
        reject(error);
      });
    });
  });
};

export const removeContainer = async (projectName: string) => {
  try {
    const container = docker.getContainer(projectName);
    await container.stop();
    await container.remove();
    console.log(`Container removed for project ${projectName}`);
  } catch (error) {
    console.log(`No existing containers for the project ${projectName}`);
  }
};

export const runContainer = async (projectName: string) => {
  const imageTag = `${registry}/${projectName}:latest`;

  console.log(`Starting the container for the project ${projectName}...`);

  // Parar e remover o contêiner existente
  await removeContainer(projectName);

  // Criar e iniciar o novo contêiner
  const container = await docker.createContainer({
    Image: imageTag,
    name: projectName,
    ExposedPorts: { '8888/tcp': {} },
    HostConfig: {
      PortBindings: { '8888/tcp': [{ HostPort: '' }] }, // Let Docker choose the port
    },
  });

  await container.start();
  console.log(`Container started for project ${projectName}`);
};

export const getNotebookURL = async (projectName: string): Promise<string> => {
  const container = docker.getContainer(projectName);
  const data = await container.inspect();

  const portBindings = data.NetworkSettings.Ports['8888/tcp'];
  if (!portBindings || portBindings.length === 0) {
    throw new Error('No exposed ports found for container');
  }

  const port = portBindings[0].HostPort;
  const url = `http://${config.server.hostname}:${port}/`;

  console.log(`Notebook URL for project ${projectName}: ${url}`);
  return url;
};

export const removeImage = async (projectName: string) => {
  const imageTag = `${registry}/${projectName}:latest`;
  try {
    const image = docker.getImage(imageTag);
    await image.remove();
    console.log(`Removed Docker image for project ${projectName}`);
  } catch (error) {
    console.log(`No existing Docker image for project ${projectName}`);
  }
};
