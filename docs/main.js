import * as Plot from "https://esm.sh/@observablehq/plot@0.6";
import { useRef, useEffect, useState } from "https://esm.sh/react@18.2.0";
import ReactDOM from "https://esm.sh/react-dom@18.2.0";
import { html } from "https://esm.sh/htm@3.1.1/react";

async function fetchData() {
  const blob = await fetch('data.jsonl.gz');
  const ds = new DecompressionStream('gzip');
  const os = blob.body.pipeThrough(ds);
  const res = new Response(os);
  const lines = await res.text();
  return lines.split('\n').map(JSON.parse);
}

function Chart({ data, title, column, from, to }) {
  const ref = useRef(null);

  useEffect(() => {
    if (data.length === 0) return;

    const x = d => new Date(d[0] * 1000);
    const filter = d => d[0] * 1000 > from.getTime();
    const result = Plot.plot({
      title,
      x: {
        domain: [from, to],
        grid: true
      },
      marks: [
        Plot.ruleY([0]),
        Plot.lineY(data, { filter, x, y: column }),
        Plot.crosshair(data, { x, y: column })
      ]
    });

    if (ref.current.firstChild) {
      ref.current.replaceChild(result, ref.current.firstChild);
    } else {
      ref.current.appendChild(result);
    }
  }, [ref.current, data, from, to]);

  return html`<div ref=${ref}></div>`;
}

function Main() {
  const [data, setData] = useState([]);
  const [to, setTo] = useState(new Date());
  const [from, setFrom] = useState(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000));

  useEffect(() => fetchData().then(data => setData(data), console.error), []);

  return html`<div>
    <h1>VS Code Stats</h1>
    <form class="form">
      <div>
        <label for="from">From:</label>
        <input name="from" id="from" type="date" value=${from.toISOString().slice(0, 10)} onInput=${e => setFrom(new Date(e.target.value))} />
      </div>
      <div>
        <label for="to">To:</label>
        <input name="to" id="to" type="date" value=${to.toISOString().slice(0, 10)} onInput=${e => setTo(new Date(e.target.value))} />
      </div>
    </form>
    <div class="charts">
      <${Chart} data=${data} title="Open Issues" column="1" from=${from} to=${to} ></div>
      <${Chart} data=${data} title="Open PRs" column="7" from=${from} to=${to} ></div>
      <${Chart} data=${data} title="Open Bugs" column="3" from=${from} to=${to} ></div>
      <${Chart} data=${data} title="Open Feature Requests" column="5" from=${from} to=${to} ></div>
    </div>
  </div>`;
}

async function main() {
  ReactDOM.render(html`<${Main} />`, document.body);
}

main();