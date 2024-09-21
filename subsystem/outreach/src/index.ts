/* eslint-disable no-console */
import { config } from './config';
import { deleteProject, updateProject } from './orchestrator';
import bodyParser from 'body-parser';
import express from 'express';

const app = express();

app.use(bodyParser.json());

// Middleware to verify authentication token
app.use((req, res, next) => {
  const token = req.headers['authorization'];
  if (token !== config.authToken) {
    return res.status(401).send('Unauthorized');
  }
  next();
});

app.post('/projects', async (req, res) => {
  const { project, action } = req.body;
  if (!project || !action) {
    return res.status(400).send('Project and action are required');
  }

  try {
    if (action === 'update' || action === 'add') {
      await updateProject(project);
      res.status(200).send(`Project ${project} ${action} successfully`);
    } else {
      res.status(400).send('Invalid action');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(`Error processing project ${project}`);
  }
});

app.delete('/projects', async (req, res) => {
  const { project } = req.body;
  if (!project) {
    return res.status(400).send('Project is required');
  }

  try {
    await deleteProject(project);
    res.status(200).send(`Project ${project} deleted successfully`);
  } catch (error) {
    console.error(error);
    res.status(500).send(`Error deleting project ${project}`);
  }
});

app.listen(3000, () => {
  console.log('Docker Orchestrator is running on port 3000');
});
