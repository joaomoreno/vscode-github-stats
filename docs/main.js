import * as Plot from "https://esm.sh/@observablehq/plot@0.6.13";
import React from "https://esm.sh/react@18.3.1";
import ReactDOM from "https://esm.sh/react-dom@18.3.1";
import htm from "https://esm.sh/htm@3.1.1";
import dayjs from "https://esm.sh/dayjs@1";
import relativeTime from "https://esm.sh/dayjs@1/plugin/relativeTime";

const html = htm.bind(React.createElement);

dayjs.extend(relativeTime);

async function fetchData() {
  const blob = await fetch('data.jsonl.gz');
  const ds = new DecompressionStream('gzip');
  const os = blob.body.pipeThrough(ds);
  const res = new Response(os);
  const lines = await res.text();
  return lines.split('\n').map(JSON.parse);
}

function Chart({ data, title, column, from, to, useZeroMin }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (data.length === 0) return;

    const x = d => new Date(d[0] * 1000);
    const filter = d => d[0] * 1000 > from.getTime();
    const filteredData = data.filter(filter);

    const yMax = Math.max(...filteredData.map(d => d[column]));
    const yMinRaw = Math.min(...filteredData.map(d => d[column]));
    const delta = yMax - yMinRaw;
    const yMin = useZeroMin ? 0 : yMinRaw - (delta * 0.1);


    const result = Plot.plot({
      style: { background: "transparent", color: "currentColor" },
      width: 600,
      height: 400,
      title,
      x: {
        domain: [from, to],
        grid: true
      },
      y: {
        domain: [yMin, Math.max(...filteredData.map(d => d[column]))]
      },
      marks: [
        Plot.ruleY([0]),
        Plot.ruleX([from]),
        Plot.lineY(data, { filter, x, y: column, tip: "x" }),
      ]
    });

    if (ref.current.firstChild) {
      ref.current.replaceChild(result, ref.current.firstChild);
    } else {
      ref.current.appendChild(result);
    }
  }, [ref.current, data, from, to, useZeroMin]);

  return html`<div class="chart" ref=${ref}></div>`;
}

function ThemeSwitcher() {
  const [theme, setTheme] = React.useState(localStorage.getItem('theme') || 'auto');

  React.useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  return html`
    <div class="theme-switcher">
      <select value=${theme} onChange=${e => setTheme(e.target.value)}>
        <option value="auto">Auto</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  `;
}

function Main() {
  const [data, setData] = React.useState([]);
  const [to, setTo] = React.useState(new Date());
  const [from, setFrom] = React.useState(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000));
  const [debouncedTo, setDebouncedTo] = React.useState(to);
  const [debouncedFrom, setDebouncedFrom] = React.useState(from);
  const [useZeroMin, setUseZeroMin] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedTo(to), 250);
    return () => clearTimeout(timer);
  }, [to]);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedFrom(from), 250);
    return () => clearTimeout(timer);
  }, [from]);

  React.useEffect(() => fetchData().then(data => setData(data), console.error), []);

  return html`<div>
    <${ThemeSwitcher} />
    <h1>VS Code Stats</h1>
    <form class="form">
      <div>
        <label for="from">From:</label>
        <input name="from" id="from" type="date" value=${from.toISOString().slice(0, 10)} onInput=${e => setFrom(new Date(e.target.value))} />
      </div>
      <div>
        <label for="to">To:</labbel>
        <input name="to" id="to" type="date" value=${to.toISOString().slice(0, 10)} onInput=${e => setTo(new Date(e.target.value))} />
      </div>
      <div>
        ${dayjs(to).from(dayjs(from), true)}
      </div>
      <div>
        <label>
          <input type="checkbox" checked=${useZeroMin} onChange=${e => setUseZeroMin(e.target.checked)} />
          Set minY to 0
        </label>
      </div>
    </form>
    <div class="charts">
      <${Chart} data=${data} title="Open Issues" column="1" from=${debouncedFrom} to=${debouncedTo} useZeroMin=${useZeroMin}></div>
      <${Chart} data=${data} title="Open PRs" column="7" from=${debouncedFrom} to=${debouncedTo} useZeroMin=${useZeroMin}></div>
      <${Chart} data=${data} title="Open Bugs" column="3" from=${debouncedFrom} to=${debouncedTo} useZeroMin=${useZeroMin}></div>
      <${Chart} data=${data} title="Open Feature Requests" column="5" from=${debouncedFrom} to=${debouncedTo} useZeroMin=${useZeroMin}></div>
    </div>
  </div>`;
}

async function main() {
  ReactDOM.render(html`<${Main} />`, document.body);
}

main();