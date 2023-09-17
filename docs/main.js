import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm";

// openIssues
// closedIssues
// openBugs
// closedBugs
// openFeatureRequests
// closedFeatureRequests
// openPRs
// closedPRs
// mergedPRs

async function createPlot() {
  const blob = await fetch('data.jsonl.gz');
  const ds = new DecompressionStream('gzip');
  const os = blob.body.pipeThrough(ds);
  const res = new Response(os);
  const lines = await res.text();
  const data = lines.split('\n').map(JSON.parse);

  const plot = Plot.plot({
    marks: [
      Plot.areaY(data, { x: d => new Date(d[0] * 1000), y: "1", fillOpacity: 0.2 }),
      Plot.lineY(data, { x: d => new Date(d[0] * 1000), y: "1" }),
    ]
  });

  document.body.append(plot);
}

async function main() {
  await createPlot();
}

main();