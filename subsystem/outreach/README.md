# Demo Outreach - Jupyter Notebooks Docker Orchestrator

## Overview

The Docker Orchestrator automates the creation, execution, and management of Docker containers from Jupyter notebooks stored in a GitLab repository. It handles Docker image building, pushing to the Docker Registry, and container deployment, as well as updating notebook URLs in the repository.

## Features

- **Full Automation**: Clones the GitLab repository, generates a Dockerfile for each notebook, builds the Docker image, pushes it to the Docker Registry, and runs the container.
- **URL Management**: Automatically updates the `URL.md` file in the GitLab repository with the running notebook’s access URL.
- **Multi-Project Support**: Manages multiple notebooks from different projects simultaneously.
- **Deletion Detection**: Automatically removes Docker containers and images for notebooks deleted from the repository.

---

## Table of Contents

1. [Requirements](#requirements)
2. [Environment Setup](#environment-setup)
   - [1. Environment Variables](#1-environment-variables)
   - [2. Docker Compose](#2-docker-compose)
   - [3. Configuring the GitLab Repository](#3-configuring-the-gitlab-repository)
3. [Running the Orchestrator](#running-the-orchestrator)
4. [API Endpoints](#api-endpoints)
5. [Maintenance and Best Practices](#maintenance-and-best-practices)
6. [Contribution](#contribution)
7. [License](#license)

---

## Requirements

Before starting, make sure your environment meets the following requirements:

- **Docker** installed on the server where the orchestrator will run.
- **Docker Compose** installed to manage the orchestrator container.
- **GitLab Access Token** with read and write permissions to the notebooks repository.
- **Docker Registry** set up to store the generated Docker images.
- **Node.js** and **pnpm** as the package manager.

---

## Environment Setup

### 1. Environment Variables

The orchestrator relies on several environment variables to communicate with the GitLab repository and Docker Registry. These variables should be defined in the `.env` file.

#### Example of `.env` File

```dotenv
# Authentication and Hostname
AUTH_TOKEN=your-secret-token # to be defined for the connections with demo outreach orchestrator app
HOSTNAME=http://outreach.yourdomain.com  # or the IP address of the orchestrator server

# GitLab Credentials
GITLAB_ACCESS_TOKEN=repo-access-token
GITLAB_REPO_URL=https://gitlab.uspdigital.usp.br/eixosia/utils-public.git

# Docker Registry Credentials
REGISTRY_USERNAME=docker-registry-username
REGISTRY_PASSWORD=docker-registry-password
REGISTRY_HOST=registry.simple4decision.com
```

### 2. Configuring the GitLab Repository

In the GitLab repository where the notebooks are stored, you need to:

1. Create a **Project Access Token** with `read_repository` and `write_repository` permissions.
2. Configure the `.gitlab-ci.yml` file so GitLab can notify the Docker Orchestrator whenever a notebook is added, updated, or deleted.

---

## Running the Orchestrator

### Steps to Run the Orchestrator

1. **Create the Container**:

   ```bash
   pnpm install
   pnpm run docker:start
   ```

2. **Check Logs**:
   Check the logs to ensure the orchestrator has started correctly:

   ```bash
   docker logs outreach-orchestrator
   ```

3. **Test Connection**:
   Access the orchestrator's API to confirm it is running:

   ```bash
   curl -X POST http://HOSTNAME:3000/projects \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer secret-token" \
   -d '{"project": "project1", "action": "update"}'
   ```

---

## API Endpoints

The Docker Orchestrator provides a simple REST API to receive notifications of changes to the notebook repository. Authentication is done via a **Bearer Token**.

### 1. `POST /projects`

- **Description**: Notifies the orchestrator about a new or updated project.
- **Request Body**:

  ```json
  {
    "project": "project-name",
    "action": "update"
  }
  ```

- **Response**: Returns a 200 status code if the project was successfully processed.

### 2. `DELETE /projects`

- **Description**: Notifies the orchestrator about a project deletion.
- **Request Body**:

  ```json
  {
    "project": "project-name"
  }
  ```

- **Response**: Returns a 200 status code if the project was successfully deleted.

### Authentication

All requests to the API must include the following authorization header:

```
Authorization: Bearer <AUTH_TOKEN>
```

---

If you need more assistance or have questions about how the Docker Orchestrator works, feel free to reach out!
