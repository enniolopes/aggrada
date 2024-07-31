export * as db from './models';
export { loadSequelize } from './loadSequelize';

/**
 * Export all models from the models folder to avoid the error
 * 'The inferred type of 'getAllDataloggerDataProviders' cannot be named without a reference to'
 */
export * from './models';
