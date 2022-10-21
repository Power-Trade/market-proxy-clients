import fs from 'fs';

import { Config, Environment } from '../types';

const environments: Record<Environment, boolean> = {
  dev: true,
  prod: true,
  staging: true,
  test: true,
};

export const getEnvironment = (): Environment => {
  const env = process.env.ENVIRONMENT as Environment;

  if (!environments[env]) {
    return 'dev';
  }

  return env;
};

export const getConfig = () => {
  const file = fs.readFileSync(`./config.${getEnvironment().toLowerCase()}.json`, 'utf8');

  return JSON.parse(file) as Config;
};
