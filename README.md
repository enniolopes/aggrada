# Aggrada

[![PyPI version](https://img.shields.io/pypi/v/aggrada.svg)](https://pypi.org/project/aggrada/)
[![Tests](https://github.com/username/aggrada/workflows/Tests/badge.svg)](https://github.com/username/aggrada/actions?query=workflow%3ATests)
[![Documentation Status](https://readthedocs.org/projects/aggrada/badge/?version=latest)](https://aggrada.readthedocs.io/en/latest/?badge=latest)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

Automatic spatiotemporal aggregation of multi-source heterogeneous raw data at multiple granularities.

## Overview

Aggrada is a Python library designed to automate the process of aggregating heterogeneous raw data from multiple sources across different spatial and temporal granularities. It helps researchers and data scientists identify optimal granularity levels that maximize data consistency and representativeness.

The framework is particularly useful for working with open data sources that have varying formats, spatial scales, and temporal resolutions.

## Features

- Read and process data from various formats (CSV, Excel, Shapefile, JSON)
- Automatically index data spatially and temporally
- Aggregate data at different spatial and temporal granularities
- Evaluate data consistency across different granularity levels
- Visualize aggregated data and analysis results

## Installation

```bash
pip install aggrada
```

## Quick Start

```python
import aggrada as ag

# Read data from a CSV file
data = ag.read_csv("data.csv")

# Index data spatially and temporally
indexed_data = ag.index(data, 
                        spatial_column="location", 
                        temporal_column="date")

# Aggregate data at different granularities
aggregated_data = ag.aggregate(indexed_data, 
                               spatial_granularity="municipality", 
                               temporal_granularity="monthly")

# Evaluate consistency across granularities
consistency = ag.evaluate_consistency(aggregated_data)

# Visualize results
ag.plot(aggregated_data)
```

## Documentation

Full documentation is available at [https://aggrada.readthedocs.io/](https://aggrada.readthedocs.io/)

## Citation

If you use Aggrada in your research, please cite:

```
Lopes, E. P. (2025). Aggrada: Automatic spatiotemporal aggregation of multi-source heterogeneous raw data at multiple granularities. Journal of Open Source Software, X(XX), XXXX. https://doi.org/10.XXXX/joss.XXXX
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
