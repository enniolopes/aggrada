# Database Documentation

## Overview

The database's structure was designed for research centers to manage raw datasets and associated files. It aims to ensure:

- **Data Governance**: Ownership and access are controlled at the dataset level, ensuring data is properly managed by designated users.
- **Scalability**: The database supports large datasets, efficient queries through indexing, and is designed to scale with increasing data volume.
- **Security**: Access control via the UserDataset table ensures users have appropriate permissions to datasets, preventing unauthorized access.

## Structure

The detailed structure of the entities can be found in the [models directory](./src/models/index.ts).

## Normalization

- **1NF**: All attributes contain atomic values.
- **2NF**: No partial dependencies on composite keys.
- **3NF**: No transitive dependencies.

## Data Governance and Security

- **Ownership and Control**: The `owner_id` in `RawDataset` ensures datasets are linked to their creators, enforcing data governance policies.
- **Access Control**: The `UserDataset` table manages user access with predefined permission levels (read, write, admin), ensuring data security and integrity.
