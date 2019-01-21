import getCache from './cache';

export const isDev = () => process.env.NODE_ENV !== 'production';

export { getCache };
