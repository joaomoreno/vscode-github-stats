import * as Plot from "https://esm.sh/@observablehq/plot@0.6.13";
import { useRef, useEffect, useState } from "https://esm.sh/react@18.2.0";
import ReactDOM from "https://esm.sh/react-dom@18.2.0";
import { html } from "https://esm.sh/htm@3.1.1/react";
import dayjs from "https://esm.sh/dayjs@1";
import relativeTime from "https://esm.sh/dayjs@1/plugin/relativeTime";

dayjs.extend(relativeTime);

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
      width: 600,
      height: 400,
      title,
      x: {
        domain: [from, to],
        grid: true
      },
      marks: [
        Plot.ruleY([0]),
        Plot.ruleX([from]),
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

  return html`<div class="chart" ref=${ref}></div>`;
}

function Main() {
  const [data, setData] = useState([]);
  const [to, setTo] = useState(new Date());
  const [from, setFrom] = useState(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000));
  const [debouncedTo, setDebouncedTo] = useState(to);
  const [debouncedFrom, setDebouncedFrom] = useState(from);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTo(to), 250);
    return () => clearTimeout(timer);
  }, [to]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedFrom(from), 250);
    return () => clearTimeout(timer);
  }, [from]);

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
      <div>
        ${dayjs(to).from(dayjs(from), true)}
      </div>
    </form>
    <div class="charts">
      <${Chart} data=${data} title="Open Issues" column="1" from=${debouncedFrom} to=${debouncedTo}></div>
      <${Chart} data=${data} title="Open PRs" column="7" from=${debouncedFrom} to=${debouncedTo}></div>
      <${Chart} data=${data} title="Open Bugs" column="3" from=${debouncedFrom} to=${debouncedTo}></div>
      <${Chart} data=${data} title="Open Feature Requests" column="5" from=${debouncedFrom} to=${debouncedTo}></div>
    </div>
  </div>`;
}

async function main() {
  ReactDOM.render(html`<${Main} />`, document.body);
}

main();