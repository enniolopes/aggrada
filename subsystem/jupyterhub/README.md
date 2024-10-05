# JupyterHub for Demo Outreach Notebooks

This repository provides a simple JupyterHub setup using `tmpauthenticator` to allow anonymous users with temporary sessions. Each user gets their own isolated environment and starts with a pre-configured Jupyter notebook. Idle sessions are automatically terminated after a defined timeout period. This setup also allows the JupyterHub to be embedded in an iFrame.

### Features

- Anonymous user login with `tmpauthenticator`
- Temporary, isolated user environments using the `Spawner`
- Automatic redirection to a pre-configured Jupyter notebook
- Sessions are terminated after being idle for a specified period
- JupyterHub can be embedded in an iFrame (security alert!)

### Prerequisites

- Docker installed

### File Structure

- `Dockerfile`: Contains the Docker build instructions.
- `jupyterhub_config.py`: JupyterHub configuration with session control, spawner configuration, and iframe embedding.
- `notebook.ipynb`: The notebook that is automatically opened for each user.

### Configuration

**Follow these steps to build a image for new notebooks:**

1. **`notebook.ipynb`:**

   - Make a copy of your jupyter notebook file at root directory: `/subsystem/outreach/jupyterhub/`
   - Rename the jupyter notebook file to `notebook.ipynb`

2. **`jupyterhub_config.py`:**

   - Change the base url `/demo-outreach/celnn-quantum` to the proxy route:

   ```python
   c.ServerApp.base_url = "/demo-outreach/<project-name>"
   ```

   - Change the bind url `https://:3030/demo-outreach/celnn-quantum` to the project PORT and proxy route:

   ```python
   c.JupyterHub.bind_url = 'https://:<PORT>/demo-outreach/<project-name>'
   ```

3. **Dockerfile:**
   - Change the expose port:
   ```
   EXPOSE <PORT>
   ```

### Installation

1. Build the Docker image:

   ```bash
    docker build -t <image-name> .
   ```

2. Run the Docker container:
   ```bash
    docker run -d -p <PORT>:<PORT> <image-name>
   ```

### Security Considerations

- The current setup allows embedding JupyterHub in an iFrame by setting `X-Frame-Options` to `ALLOWALL`. Ensure you use this feature carefully as it can expose security risks such as clickjacking.
