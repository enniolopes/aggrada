Installation
============

Requirements
-----------

Aggrada requires the following dependencies:

* Python 3.8 or higher
* pandas >= 1.3.0
* geopandas >= 0.10.0
* shapely >= 1.8.0
* numpy >= 1.20.0
* matplotlib >= 3.4.0
* pyproj >= 3.1.0

Installing from PyPI
-------------------

The recommended way to install Aggrada is via pip:

.. code-block:: bash

    pip install aggrada

This will install Aggrada and all its dependencies.

Installing from Source
---------------------

You can also install Aggrada from source:

.. code-block:: bash

    git clone https://github.com/username/aggrada.git
    cd aggrada
    pip install -e .

Development Installation
-----------------------

For development, you can install Aggrada with additional development dependencies:

.. code-block:: bash

    pip install -e ".[dev]"

This will install additional packages needed for development, such as:

* pytest
* pytest-cov
* flake8
* black
* sphinx
* sphinx-rtd-theme
