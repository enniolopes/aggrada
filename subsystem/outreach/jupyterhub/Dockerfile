FROM jupyter/base-notebook:latest

COPY jupyterhub_config.py /srv/jupyterhub/jupyterhub_config.py
COPY notebook.ipynb /home/jovyan/work/notebook.ipynb

# pip package installations
RUN pip install jupyterhub jupyterhub-tmpauthenticator dockerspawner

# Install Git
USER root
RUN apt-get update && apt-get install -y git && apt-get clean

# Defina permissions
RUN chown -R jovyan:users /srv/jupyterhub
USER jovyan

# Define workdir
WORKDIR /srv/jupyterhub

# Port
EXPOSE 3030

# Init JupyterHub
CMD ["jupyterhub", "-f", "/srv/jupyterhub/jupyterhub_config.py"]
