// resourceMonitor.js
setInterval(() => {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  const memoryMB = (memoryUsage.rss / 1024 / 1024).toFixed(2);
  const cpuUserMS = (cpuUsage.user / 1000).toFixed(2);

  console.log(`[Resource Usage] Memory: ${memoryMB} MB, CPU: ${cpuUserMS} ms`);
}, 10000); // every 10 seconds
