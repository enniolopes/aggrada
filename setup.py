from setuptools import setup, find_packages

# Read the contents of README file
with open("README.md", encoding="utf-8") as f:
    long_description = f.read()

setup(
    name="aggrada",
    version="0.1.0",
    description="Automatic spatiotemporal aggregation of multi-source heterogeneous raw data at multiple granularities",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="Ennio Politi Lopes",
    author_email="enniolopes@gmail.com",
    url="https://github.com/enniolopes/aggrada",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Science/Research",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Topic :: Scientific/Engineering :: GIS",
        "Topic :: Scientific/Engineering :: Information Analysis",
    ],
    python_requires=">=3.8",
    install_requires=[
        "pandas>=1.3.0",
        "geopandas>=0.10.0",
        "shapely>=1.8.0",
        "numpy>=1.20.0",
        "matplotlib>=3.4.0",
        "pyproj>=3.1.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-cov>=4.0.0",
            "flake8>=6.0.0",
            "black>=23.0.0",
            "sphinx>=7.0.0",
            "sphinx-rtd-theme>=1.0.0",
        ],
    },
)
