import https from 'https';
import { performance } from 'perf_hooks';

const TARGET_HOST = 'procureai-hazel.vercel.app';

async function request(path = '/') {
  return new Promise((resolve) => {
    const t0 = performance.now();
    const req = https.request({
      hostname: TARGET_HOST,
      path,
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'ProcureAI-LoadTester/1.0'
      }
    }, res => {
      let bytes = 0;
      res.on('data', chunk => { bytes += chunk.length; });
      res.on('end', () => {
        const latency = performance.now() - t0;
        resolve({
          statusCode: res.statusCode,
          latency,
          bytes,
          cache: res.headers['x-vercel-cache'] || 'MISS',
          server: res.headers['server'] || 'Vercel'
        });
      });
    });

    req.on('error', err => {
      resolve({
        statusCode: 0,
        latency: performance.now() - t0,
        error: err.message
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        statusCode: 408,
        latency: 10000,
        error: 'Timeout'
      });
    });

    req.end();
  });
}

async function runStage(concurrency, totalRequests, path = '/') {
  console.log(`\nTesting ${concurrency} Concurrent Workers (Total: ${totalRequests} requests to ${path})...`);
  const results = [];
  const start = performance.now();

  let completed = 0;
  async function worker() {
    while (completed < totalRequests) {
      completed++;
      const res = await request(path);
      results.push(res);
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  const totalTime = performance.now() - start;
  const latencies = results.map(r => r.latency).sort((a, b) => a - b);
  const success = results.filter(r => r.statusCode >= 200 && r.statusCode < 400).length;
  const cacheHits = results.filter(r => r.cache === 'HIT').length;

  const p50 = latencies[Math.floor(latencies.length * 0.50)]?.toFixed(1) || '0';
  const p95 = latencies[Math.floor(latencies.length * 0.95)]?.toFixed(1) || '0';
  const p99 = latencies[Math.floor(latencies.length * 0.99)]?.toFixed(1) || '0';
  const mean = (latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1)).toFixed(1);
  const rps = Math.round((results.length / totalTime) * 1000);

  console.log(`  -> Elapsed:     ${totalTime.toFixed(0)}ms`);
  console.log(`  -> Throughput:  ${rps.toLocaleString()} req/sec`);
  console.log(`  -> Success:     ${success}/${results.length} (${((success/results.length)*100).toFixed(1)}%)`);
  console.log(`  -> Edge Cache:  ${cacheHits}/${results.length} (${((cacheHits/results.length)*100).toFixed(1)}% HIT)`);
  console.log(`  -> Latency:     Mean=${mean}ms | P50=${p50}ms | P95=${p95}ms | P99=${p99}ms`);

  return { concurrency, totalRequests, totalTime, rps, success, cacheHits, mean, p50, p95, p99 };
}

async function main() {
  console.log('='.repeat(70));
  console.log(`LIVE TRAFFIC CAPACITY & LOAD BENCHMARK FOR https://${TARGET_HOST}`);
  console.log('='.repeat(70));

  // Warm-up
  await request('/');

  const s1 = await runStage(10, 30, '/');
  const s2 = await runStage(50, 100, '/');
  const s3 = await runStage(100, 200, '/');

  console.log('\n' + '='.repeat(70));
  console.log('CAPACITY SUMMARY:');
  console.log('='.repeat(70));
  console.log(`Tier: Vercel Global Edge Network (CDN)`);
  console.log(`Peak Observed Edge Throughput: ${Math.max(s1.rps, s2.rps, s3.rps).toLocaleString()} req/sec`);
  console.log('='.repeat(70));
}

main().catch(console.error);
