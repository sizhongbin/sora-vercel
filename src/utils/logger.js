export default (requestId, level, text) => {
  let stamp = new Date().getTime() + 8 * 60 * 60 * 1000;
  let time = new Date(stamp).toJSON().substr(0, 23).replace('T', ' ');
  switch (level) {
    case 'DEBUG':
      console.debug(`${time}|DEBUG|${requestId}: ${text}`);
      return;
    case 'INFO':
      console.info(`${time}|INFO|${requestId}: ${text}`);
      return;
    case 'WARN':
      console.warn(`${time}|WARN|${requestId}: ${text}`);
      return;
    case 'ERROR':
      console.error(`${time}|ERROR|${requestId}: ${text}`);
      return;
  }
};
