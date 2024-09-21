/* eslint-disable no-console */
import * as dockerManager from './dockerManager';
import * as gitManager from './gitManager';

export const updateProject = async (projectName: string) => {
  try {
    // Clone or update the repository
    await gitManager.cloneOrUpdateRepo();

    // Gerar o Dockerfile para o projeto
    await gitManager.generateDockerfile(projectName);

    // Construir a imagem Docker
    await dockerManager.buildImage(projectName);

    // Registrar a imagem no Docker Registry
    await dockerManager.pushImage(projectName);

    // Parar e remover o contêiner existente (se houver)
    await dockerManager.removeContainer(projectName);

    // Iniciar um novo contêiner
    await dockerManager.runContainer(projectName);

    // Obter a URL do notebook
    const url = await dockerManager.getNotebookURL(projectName);

    // Atualizar o URL.md e fazer push
    await gitManager.updateURL(projectName, url);
  } catch (error) {
    console.error(`Erro ao atualizar o projeto ${projectName}:`, error);
    throw error;
  }
};

export const deleteProject = async (projectName: string) => {
  try {
    // Parar e remover o contêiner
    await dockerManager.removeContainer(projectName);

    // Remover a imagem Docker local
    await dockerManager.removeImage(projectName);

    // Remover o URL.md e fazer push
    await gitManager.removeURL(projectName);
  } catch (error) {
    console.error(`Erro ao deletar o projeto ${projectName}:`, error);
    throw error;
  }
};
