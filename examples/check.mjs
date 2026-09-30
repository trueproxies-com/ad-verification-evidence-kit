import { chromium } from "playwright";

// Node 18+, npm i playwright. Run: node check.mjs https://example.com/landing
// Gateway and credentials come from your dashboard. Targeting is written on the
// username: USER-country-de on both products, USER-country-de-city-berlin on GB-based.
// Options reference: https://docs.trueproxies.com/proxy-instructions/how-to-connect/#options
const url = process.argv[2];
const proxy = {
  server: process.env.PROXY_SERVER, // e.g. http://YOUR_HOST:8080
  username: process.env.PROXY_USER, // e.g. USER-country-de-city-berlin-session-ad01
  password: process.env.PROXY_PASS,
};

const browser = await chromium.launch({ proxy });
const context = await browser.newContext({ recordHar: { path: "check.har" } });
const page = await context.newPage();

// Preflight: record the exit the ad server will see before loading the target.
const exit = await (await page.goto("https://httpbin.org/ip")).json();

const navigations = [];
page.on("framenavigated", (frame) => {
  if (frame === page.mainFrame()) navigations.push(frame.url());
});

const response = await page.goto(url, { waitUntil: "networkidle" });
const httpRedirects = [];
for (let request = response?.request(); request; request = request.redirectedFrom()) {
  httpRedirects.unshift(request.url());
}

await page.screenshot({ path: "check.png", fullPage: true });
console.log(JSON.stringify({
  checkedAt: new Date().toISOString(),
  exit,
  url,
  status: response?.status(),
  httpRedirects,
  navigations,
  finalUrl: page.url(),
}, null, 2));

await context.close(); // writes check.har
await browser.close();
