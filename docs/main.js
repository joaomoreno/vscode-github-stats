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

async function fetchData() {
  const blob = await fetch('data.jsonl.gz');
  const ds = new DecompressionStream('gzip');
  const os = blob.body.pipeThrough(ds);
  const res = new Response(os);
  const lines = await res.text();
  return lines.split('\n').map(JSON.parse);
}

function plot(data, year, y) {
  const from = new Date(year);
  const to = new Date(String(Number(year) + 1));
  const x = d => new Date(d[0] * 1000);
  const filter = d => d[0] * 1000 > from.getTime();

  document.body.replaceChild(Plot.plot({
    title: 'Open Issues',
    x: {
      domain: [from, to],
      grid: true
    },
    marks: [
      Plot.ruleY([0]),
      // Plot.areaY(data, { x, y, fillOpacity: 0.2 }),
      Plot.lineY(data, { filter, x, y }),
      Plot.crosshair(data, { x, y })
    ]
  }), document.body.firstChild);
}

async function main() {
  const data = await fetchData();
  plot(data, "2023", "1");
}

main();