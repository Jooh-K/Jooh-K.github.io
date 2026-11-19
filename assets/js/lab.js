/* 작업실: 광고비 모니터링 보고서 생성기. 실제 생성기에 가상 데이터를 넣어 만든 샘플이며, 생성 과정은 그때 나온 숫자를 그대로 보여 줍니다 */
function reportCardHTML(it, i){
  const r0 = it.reports[0];
  const tabLabel = s => s.split(" ").map(w => `<span>${esc(w)}</span>`).join(" ");
  return `<article class="lab-item lab-reports" id="lab-${i}"><div class="lab-body"><span class="st">${esc(it.status)}</span><h3>${esc(it.title)}</h3><p>${esc(it.body)}</p>
    <ul class="tags">${(it.tags || []).map(t => `<li>${esc(t)}</li>`).join("")}</ul>
    ${it.link ? `<a class="more" href="#case-${it.link}">관련 경험 보기</a>` : ""}</div>
    <div class="rp" id="reports">
      <div class="rp-tabs" role="tablist" aria-label="보고서 종류">${it.reports.map((r, i) => `<button type="button" role="tab" class="rp-tab" id="rpt-${r.key}" aria-controls="rp-panel" aria-selected="${i === 0}" data-i="${i}">${tabLabel(r.label)}</button>`).join("")}</div>
      <div class="rp-panel" id="rp-panel" role="tabpanel" aria-labelledby="rpt-${r0.key}">
        <div class="rp-run"><p class="rp-desc"></p><ol class="rp-steps" aria-label="생성 과정, 단계를 누르면 그 장면을 다시 봅니다"></ol><button type="button" class="rp-again">처음부터 실행</button></div>
        <div class="rp-view"><span class="lab-tag">샘플</span><picture><source media="(max-width:760px)"><img alt="" loading="lazy"></picture><div class="rp-stage" aria-hidden="true"></div><button type="button" class="lab-open">샘플 크게 보기</button></div>
      </div>
    </div></article>`;
}
function stageHTML(d){
  const fileIco = `<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 1.5h5l3 3v10H4z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M9 1.5v3h3" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`;
  const max = Math.max(...d.bars.items.map(x => x[1]));
  return `<div class="rs-top"><span class="rs-file">${fileIco}${esc(d.file)}</span><span class="rs-n"><b>0</b> <span></span></span></div>
    <table class="rs-tbl"><thead><tr>${d.cols.map((c, k) => `<th class="c${k}">${esc(c)}</th>`).join("")}<th class="tg"></th></tr></thead>
    <tbody>${d.rows.map((r, x) => `<tr class="${d.keep2[x] ? "" : "o2"}${d.keep3[x] ? "" : " o3"}" style="--x:${x}">${r.map((v, k) => `<td class="c${k}">${esc(v)}</td>`).join("")}<td class="mt">${esc([r[0], r[1], r[3]].join(" · "))}</td><td class="tg">${d.tag2[x] ? `<i>${esc(d.tag2[x])}</i>` : ""}</td></tr>`).join("")}</tbody></table>
    <div class="rs-bars"><b>${esc(d.bars.title)}</b>${d.bars.items.map(([n, v], k) => `<div class="rs-bar" style="--k:${k}"><span>${esc(n)}</span><i style="--w:${(v / max * 100).toFixed(1)}%"></i><em>${v.toFixed(1)}%</em></div>`).join("")}</div>`;
}
function initReports(root, openLive){
  if (!root) return;
  const it = LAB.find(x => x.kind === "reports"); if (!it) return;
  const tabs = [...root.querySelectorAll(".rp-tab")], panel = root.querySelector(".rp-panel"), steps = root.querySelector(".rp-steps"),
        desc = root.querySelector(".rp-desc"), view = root.querySelector(".rp-view"), img = view.querySelector("img"), src = view.querySelector("source"),
        open = view.querySelector(".lab-open"), stage = view.querySelector(".rp-stage");
  const quiet = (() => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } })();
  let cur = 0, timers = [], from = 0, lis = [];
  const clear = () => { timers.forEach(clearTimeout); timers = []; };
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));
  const r = () => it.reports[cur];
  function count(k){ const counter = stage.querySelector(".rs-n b"), unit = stage.querySelector(".rs-n span"); const [to, label] = r().demo.n[k];
    unit.textContent = label; const s0 = from, t0 = performance.now(), me = timers; from = to;
    if (quiet){ counter.textContent = to.toLocaleString("ko-KR"); return; }
    const tick = now => { if (me !== timers) { counter.textContent = to.toLocaleString("ko-KR"); return; }
      const p = Math.min(1, (now - t0) / 700); counter.textContent = Math.round(s0 + (to - s0) * (1 - Math.pow(1 - p, 3))).toLocaleString("ko-KR"); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick); }
  function mark(k, live){ lis.forEach((li, x) => { li.className = x < k ? "done" : x === k ? (live ? "on" : "done cur") : ""; li.setAttribute("aria-current", x === k ? "step" : "false"); }); }
  /* 단계 하나의 장면. 앞 단계 상태에서 시작해 그 단계의 변화만 보여 줍니다 */
  function scene(k, then){
    view.classList.remove("ready");
    if (k === 3){ mark(3, true); stage.dataset.s = "done"; view.classList.add("ready"); at(quiet ? 0 : 700, () => { mark(3, false); then && then(); }); return; }
    mark(k, true);
    if (k === 0){ stage.dataset.s = "0"; from = 0; at(30, () => { stage.dataset.s = "1"; count(0); }); at(quiet ? 60 : 1500, () => { mark(0, false); then && then(); }); return; }
    stage.dataset.s = String(k); from = r().demo.n[k - 1][0];
    stage.querySelector(".rs-n b").textContent = from.toLocaleString("ko-KR"); stage.querySelector(".rs-n span").textContent = r().demo.n[k - 1][1];
    at(quiet ? 0 : 350, () => { stage.dataset.s = String(k + 1); count(k); });
    if (k === 2){ at(quiet ? 0 : 1200, () => { stage.dataset.s = "4"; }); at(quiet ? 30 : 1280, () => { stage.dataset.s = "5"; }); }
    at(quiet ? 60 : (k === 2 ? 2300 : 1600), () => { mark(k, false); then && then(); });
  }
  function runAll(){ clear(); let k = 0; const next = () => { if (k > 3) { mark(4, false); return; } const s = k++; scene(s, () => at(250, next)); }; next(); }
  function show(i, animate){
    cur = i; clear(); const rep = r();
    tabs.forEach((t, k) => { t.setAttribute("aria-selected", String(k === i)); t.tabIndex = k === i ? 0 : -1; });
    panel.setAttribute("aria-labelledby", "rpt-" + rep.key);
    desc.textContent = rep.desc;
    steps.innerHTML = rep.steps.map(([a, b], k) => `<li role="button" tabindex="0" data-k="${k}"><b>${esc(a)}</b><span>${esc(b)}</span></li>`).join("");
    lis = [...steps.children];
    img.src = rep.image; img.alt = rep.alt || ""; if (rep.imageM) src.srcset = rep.imageM; else src.removeAttribute("srcset");
    if (rep.live){ open.hidden = false; open.dataset.live = rep.live; open.dataset.title = rep.label + " 샘플"; view.classList.add("can-open"); } else { open.hidden = true; view.classList.remove("can-open"); }
    stage.innerHTML = stageHTML(rep.demo); stage.dataset.s = "0";
    if (!animate || quiet){ mark(4, false); stage.dataset.s = "done"; view.classList.add("ready"); return; }
    runAll();
  }
  tabs.forEach((t, i) => t.addEventListener("click", () => show(i, true)));
  root.querySelector(".rp-tabs").addEventListener("keydown", e => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (!d) return;
    e.preventDefault(); const n = (cur + d + tabs.length) % tabs.length; tabs[n].focus(); show(n, true); });
  const pick = li => { if (!li) return; clear(); scene(+li.dataset.k); };
  steps.addEventListener("click", e => pick(e.target.closest("li[data-k]")));
  steps.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " "){ const li = e.target.closest("li[data-k]"); if (li){ e.preventDefault(); pick(li); } } });
  root.querySelector(".rp-again").addEventListener("click", () => runAll());

  /* 미리보기나 '샘플 크게 보기'를 누르면 생성 과정 중이라도 기다리지 않고 바로 크게 엽니다 */
  view.addEventListener("click", () => { if (!view.classList.contains("can-open") || !open.dataset.live) return;
    clear(); mark(4, false); stage.dataset.s = "done"; view.classList.add("ready"); openLive(open.dataset.live, open.dataset.title); });
  show(0, false);
  /* 화면에 처음 들어올 때 한 번 생성 과정을 보여 줍니다 */
  if (!quiet && "IntersectionObserver" in window){
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)){ io.disconnect(); runAll(); } }, { threshold: .35 });
    io.observe(root);
  }
}
