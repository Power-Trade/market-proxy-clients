const DEBUG: boolean = JSON.parse(process.env.DEBUG ?? 'false');

export const log = (...args: any) => {
  if (DEBUG) {
    console.log(...args);
  }
};
