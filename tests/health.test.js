import test from "node:test";
import assert from "node:assert";
import app from "../src/app.js";
import http from "node:http";

function startTestServer() {
  return new Promise((resolve) => {
    const server = http.createServer(app);
    server.listen(0, () => resolve(server));
  });
}

test("health endpoint returns ok", async () => {
  const server = await startTestServer();
  const port = server.address().port;

  const response = await fetch(`http://127.0.0.1:${port}/health`);
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.status, "ok");

  server.close();
});
