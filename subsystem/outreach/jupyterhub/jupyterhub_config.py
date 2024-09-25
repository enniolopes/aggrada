# Use tmpauthenticator to allow anonymous login
c.JupyterHub.authenticator_class = 'tmpauthenticator.TmpAuthenticator'

# Base URL for Proxy route
c.ServerApp.base_url = "/demo-outreach/celnn-quantum"

# Configure spawner to avoid home directory issues
c.JupyterHub.spawner_class = 'simple'
# c.JupyterHub.spawner_class = 'jupyterhub.spawner.LocalProcessSpawner'

# Avoid manual login, auto-authentication when accessing the URL
c.TmpAuthenticator.auto_login = True

# Maximum number of concurrent users
c.JupyterHub.concurrent_spawn_limit = 10

# Address for JupyterHub to listen to
c.JupyterHub.bind_url = 'https://:3030/demo-outreach/celnn-quantum'

# Force each instance to open a specific notebook
c.Spawner.default_url = '/lab/tree/work/notebook.ipynb'

# Copy the notebook to each user's directory at the start of each new session
def pre_spawn_hook(spawner):
    import shutil
    import os
    notebook_source = '/home/jovyan/work/notebook.ipynb'
    target_dir = spawner.home_dir
    if not os.path.exists(os.path.join(target_dir, 'work')):
        os.makedirs(os.path.join(target_dir, 'work'))
    shutil.copy(notebook_source, os.path.join(target_dir, 'work'))

c.Spawner.pre_spawn_hook = pre_spawn_hook

# Enable idle culler to automatically shut down idle user sessions
c.JupyterHub.cull_idle_timeout = 600
c.JupyterHub.cull_interval = 240

# Allow JupyterHub to be loaded in an iFrame (caution: security)
c.JupyterHub.tornado_settings = {
    'headers': {
        'X-Frame-Options': 'ALLOWALL',
    },
    'cookie_options': {
        'SameSite': 'None',
        'Secure': True,
    }
}

# Config spawner cookies SameSite=None and Secure=True
# def spawner_pre_spawn_hook(spawner):
#     spawner.environment['JUPYTER_COOKIES_SAMESITE'] = 'None'
#     spawner.environment['JUPYTER_COOKIES_SECURE'] = 'True'

# c.Spawner.pre_spawn_hook = spawner_pre_spawn_hook
