// Check development env
export let env = () =>{
  if (process.env.__VERCEL_DEV_RUNNING) return 'DEV';
  else return 'PROD';
}

// Check development env
export let isDev = () => {
  if (process.env.__VERCEL_DEV_RUNNING) return true;
  else return false;
}