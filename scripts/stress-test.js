const baseUrl = process.env.BASE_URL || "http://localhost:3000";
const concurrentUsers = Number(process.env.CONCURRENT_USERS || 20);
const totalRequests = Number(process.env.TOTAL_REQUESTS || 100);

async function sendRequest() {
  const start = Date.now();

  try {
    const response = await fetch(`${baseUrl}/health`);
    await response.text();

    return {
      success: response.ok,
      status: response.status,
      time: Date.now() - start
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      time: Date.now() - start,
      error: error.message
    };
  }
}

async function runTest() {
  let completed = 0;
  const results = [];

  while (completed < totalRequests) {
    const batchSize = Math.min(concurrentUsers, totalRequests - completed);
    const batch = [];

    for (let i = 0; i < batchSize; i++) {
      batch.push(sendRequest());
    }

    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
    completed += batchSize;
  }

  const successful = results.filter((result) => result.success).length;
  const failed = results.length - successful;
  const times = results.map((result) => result.time).sort((a, b) => a - b);
  const average = times.reduce((sum, time) => sum + time, 0) / times.length;
  const p95Index = Math.floor(times.length * 0.95) - 1;

  console.log("Stress test finished");
  console.log("Base URL:", baseUrl);
  console.log("Concurrent users:", concurrentUsers);
  console.log("Total requests:", totalRequests);
  console.log("Successful:", successful);
  console.log("Failed:", failed);
  console.log("Average response time:", Math.round(average), "ms");
  console.log("P95 response time:", times[Math.max(0, p95Index)], "ms");
}

runTest();
