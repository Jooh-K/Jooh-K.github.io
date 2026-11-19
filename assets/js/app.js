/* 화면 구성: 관점 전환, 경력 흐름, 대표 사례, 전체 경력, 작업실, 메뉴 바로가기, 사례 상세 */
const DEFAULT_LENS = (() => {
  try { const q = new URLSearchParams(location.search).get("lens"); if (q && LENSES.some(l => l.id === q)) return q; } catch (e) {}
  return document.documentElement.dataset.lens || "all";
})();
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const recById = id => RECORDS.find(r => r.id === id);
const CAPS = [["CAP-01","데이터 분석"],["CAP-02","마케팅 전략"],["CAP-03","디지털 미디어"],["CAP-04","분석 환경과 AX"]];
const CAP_NAME = Object.fromEntries(CAPS);
const reduceMotion = (() => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } })();
const hasShorts = !!document.getElementById("watch");
const state = {lens: DEFAULT_LENS, grp: null, q: "", view: "cards"};
const lensLabel = id => (LENSES.find(l => l.id === id) || LENSES[0]).label;
const smooth = () => reduceMotion ? "auto" : "smooth";
const barH = () => document.getElementById("bar").offsetHeight;
function scrollToEl(el, extra = 0){ if (el) window.scrollTo({top: el.getBoundingClientRect().top + scrollY - barH() - extra, behavior: smooth()}); }

/* ---------- 도식 재생: 화면에 들어오면 한 번 그리고, 그 뒤엔 은은하게 ---------- */
const REPLAY_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>`;
function diagramDuration(root){ const els = $$("[data-t]", root); return els.length ? Math.max(...els.map(e => +e.dataset.t + (+e.dataset.d || .45))) + .1 : 0; }
function finish(root){ $$("[data-t]", root).forEach(e => applyFx(e, 1)); }
function play(root){
  root.classList.remove("idle"); clearTimeout(root._idle);
  playDiagram(root);
  root._idle = setTimeout(() => { root.classList.add("idle"); if (root._replay) root._replay.classList.add("show"); }, diagramDuration(root) * 1000 + 150);
}
const io = ("IntersectionObserver" in window) ? new IntersectionObserver(es => es.forEach(en => {
  if (en.isIntersecting){ io.unobserve(en.target); play(en.target); } }), {threshold: .35}) : null;
function setupDiagram(root, mode){
  const key = root.dataset.key; if (key) addInteraction(root, key);
  const fig = root.closest(".fig");
  if (fig && !fig.querySelector(".replay")){
    const b = document.createElement("button"); b.type = "button"; b.className = "replay"; b.innerHTML = REPLAY_ICON;
    b.setAttribute("aria-label", "도식 다시 재생"); b.title = "다시 재생"; root._replay = b;
    b.addEventListener("click", () => play(root)); fig.appendChild(b);
  }
  if (reduceMotion){ finish(root); if (root._replay) root._replay.classList.add("show"); return; }
  $$("[data-t]", root).forEach(e => applyFx(e, 0));
  if (mode === "now") requestAnimationFrame(() => play(root));
  else if (io) io.observe(root); else { finish(root); root.classList.add("idle"); }
}
window.addEventListener("beforeprint", () => $$("[data-t]").forEach(e => applyFx(e, 1)));

/* 업무 구분 바탕색은 대표 사례에서만(colored). 상세 창과 전체 경력은 연회색으로 통일하고 이름표만 */
function figHTML(c, colored){
  if (!c || !c.diagram || !DIAGRAMS[c.diagram]) return "";
  const g = DIAGRAM_GROUP[c.diagram] || "ana", dark = colored && g === "ax";
  return `<figure class="fig${colored ? ` g-${g}` : ""}${dark ? " dark" : ""}"><span class="grp"><i class="dot g-${g}"></i>${GROUP_NAME[g]}</span><div class="diagram" data-key="${c.diagram}">${dark ? diagramFor(c.diagram) : DIAGRAMS[c.diagram]}</div></figure>`;
}
function figNote(c){
  if (c.fig) return `<p class="case-fig"><strong>${esc(c.fig)}</strong><span>${esc(c.figNote || "")}</span></p>`;
  if (c.giant) return `<p class="case-fig"><strong>${esc(c.giant)} 법인</strong><span>형식과 기준이 제각각이던 글로벌 법인 자료</span></p>`;
  return "";
}

/* ---------- 첫 화면: 관점에 따라 문장이 바뀝니다 ---------- */
const heroTitle = $("#heroTitle"), heroSub = $("#heroSub");
const heroLines = lines => lines.map((t, i) => `<span class="ln"><span style="--i:${i}">${esc(t)}</span></span>`).join("");
let heroTok = 0;
function setHero(id, first){
  const h = HERO[id] || HERO.all;
  const apply = () => { heroTitle.classList.remove("in", "out"); heroTitle.innerHTML = heroLines(h.title); heroTitle.setAttribute("aria-label", h.title.join(" ")); heroSub.textContent = h.sub;
    void heroTitle.offsetWidth; requestAnimationFrame(() => heroTitle.classList.add("in")); heroSub.classList.remove("fade"); };
  if (first || reduceMotion) return apply();
  const tok = ++heroTok; heroTitle.classList.add("out"); heroSub.classList.add("fade");
  setTimeout(() => { if (tok === heroTok) apply(); }, 420);
}
const lensRow = $("#lensRow");
lensRow.innerHTML = LENSES.map((l, k) => `<button type="button" class="chip" data-lens="${l.id}" aria-pressed="false" style="--k:${k}">${esc(l.label)}<small>${esc(LENS_HINT[l.id] || "")}</small></button>`).join("");
lensRow.addEventListener("click", e => { const b = e.target.closest(".chip"); if (b && b.dataset.lens !== state.lens) setLens(b.dataset.lens); });
function setLens(id, first){
  state.lens = id;
  $$(".chip[data-lens]").forEach(b => { b.setAttribute("aria-pressed", String(b.dataset.lens === id)); if (!first) b.style.animation = "none"; });
  setHero(id, first); renderWork(); renderArchive();
  if (!first){ try { const u = new URL(location.href); if (id === (document.documentElement.dataset.lens || "all")) u.searchParams.delete("lens"); else u.searchParams.set("lens", id); history.replaceState(history.state, "", u); } catch (e) {} }
}

/* ---------- 경력 흐름: 나스미디어와 제일기획 두 묶음, 그냥 스크롤로 ---------- */
const flow = $("#flow"), erasEl = $("#eras");
const ARROW = `<svg viewBox="0 0 48 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12h42"/><path d="M34 3l10 9-10 9"/></svg>`;
/* 역할 범위 띠: 회사마다 더해진 역량을 한 줄씩 쌓아, 띠가 두꺼워지는 모양으로 넓어진 폭을 보여 줍니다 */
(() => { const box = $("#scopeBand"); if (!box) return;
  const y0 = ERAS[0].from, y1 = new Date().getFullYear(), pos = y => ((y - y0) / (y1 - y0) * 100).toFixed(2);
  const lanes = ERAS.flatMap((e, n) => e.scope.map(s => ({s, from: e.from, n}))).reverse();
  box.setAttribute("role", "img");
  box.setAttribute("aria-label", "역할 범위: " + ERAS.map(e => `${e.from}년부터 ${e.scope.join(", ")}`).join(", 이어서 ") + " 더해짐. 앞선 집행 경험은 이후 판단의 바탕으로 이어짐");
  /* 역할 범위 테두리: 줄 수만큼 높이가 바뀌는 하나의 띠로 감싸, 회사가 바뀔 때 범위가 넓어지는 모양을 보여 줍니다 */
  /* 역할 범위 테두리: 회사가 바뀌는 해에 직각 계단으로 넓어집니다. 크기에 맞춰 픽셀 단위로 그려 모서리를 막대처럼 살짝 둥글게 */
  const envelope = () => `<svg class="sb-env" aria-hidden="true"><path/></svg>`;
  const drawEnv = () => { const lanesEl = $(".sb-lanes", box), svg = $(".sb-env", box); if (!lanesEl || !svg) return;
    const W = lanesEl.clientWidth, H = lanesEl.clientHeight, P = 8, n = lanes.length, r = 9;
    const steps = ERAS.map(e => ({x: P + W * (+pos(e.from)) / 100, y: P + H * (1 - ERAS.filter(z => z.from <= e.from).reduce((s, z) => s + z.scope.length, 0) / n)}));
    const pts = [[0, H + 2 * P], [0, steps[0].y - P]];
    steps.slice(1).forEach((s, k) => { pts.push([s.x, steps[k].y - P], [s.x, s.y - P]); });
    pts.push([W + 2 * P, steps[steps.length - 1].y - P], [W + 2 * P, H + 2 * P]);
    const q = (a, b, d) => { const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, k = Math.min(d, len / 2) / len; return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]; };
    let d = ""; pts.forEach((p, k) => { const prev = pts[(k - 1 + pts.length) % pts.length], next = pts[(k + 1) % pts.length], a = q(p, prev, r), b = q(p, next, r);
      d += (k ? ` L${a[0]} ${a[1]}` : `M${a[0]} ${a[1]}`) + ` Q${p[0]} ${p[1]} ${b[0]} ${b[1]}`; });
    svg.setAttribute("width", W + 2 * P); svg.setAttribute("height", H + 2 * P); svg.setAttribute("viewBox", `0 0 ${W + 2 * P} ${H + 2 * P}`);
    $("path", svg).setAttribute("d", d + " Z");
    /* '집행 경험이 바탕': 점선 구간 왼쪽 끝, 점선 줄들 세로 가운데 */
    const base = $(".sb-basebox", box), bl = $$(".sb-lane.based", box);
    if (base && bl.length){ const L = lanesEl.getBoundingClientRect(), a = bl[0].getBoundingClientRect(), z = bl[bl.length - 1].getBoundingClientRect(), cut = a.left + a.width * parseFloat(getComputedStyle(bl[0]).getPropertyValue("--cut")) / 100;
      Object.assign(base.style, {left: (cut - L.left) + "px", top: (a.top - L.top) + "px", width: (a.right - cut) + "px", height: (z.bottom - a.top) + "px"}); } };
  /* 다음 회사로 넘어간 뒤의 앞 역량은 지금 하는 일이 아니라 판단의 바탕이라, 그 구간은 연한 점선으로 */
  const cutOf = n => ERAS[n + 1] ? (ERAS[n + 1].from - ERAS[n].from) / (y1 - ERAS[n].from) * 100 : 100;
  const firstBase = lanes.findIndex(l => cutOf(l.n) < 100);
  box.innerHTML = `<div class="sb-lanes">${lanes.map((l, k) => { const c = cutOf(l.n).toFixed(2);
      return `<div class="sb-lane${l.n ? " add" : ""}${c < 100 ? " based" : ""}" style="--from:${pos(l.from)}%;--cut:${c}%;--d:${Math.round(+pos(l.from) * 18)}ms"><i></i><span>${esc(l.s)}</span></div>`; }).join("")}
      ${ERAS.slice(1).map(e => `<b class="sb-cut" style="left:${pos(e.from)}%"></b>`).join("")}${envelope()}${firstBase >= 0 ? `<b class="sb-basebox"><em>집행 경험이 바탕</em></b>` : ""}</div>
    <div class="sb-axis">${ERAS.map(e => `<span style="left:${pos(e.from)}%"><em>${e.from}</em>${esc(e.co)}</span>`).join("")}<span class="end">지금</span></div>`;
  drawEnv(); if ("ResizeObserver" in window) new ResizeObserver(drawEnv).observe(box); else addEventListener("resize", drawEnv);
  if (reduceMotion || !("IntersectionObserver" in window)) { box.classList.add("on"); return; }
  const io = new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) { box.classList.add("on"); io.disconnect(); } }, {threshold: .4}); io.observe(box);
})();
erasEl.innerHTML = ERAS.map((e, n) => { const st = STAGES.map((s, i) => [s, i]).filter(([s]) => s.y >= e.from && s.y <= e.to);
  const per = esc(e.period).replace("현재", `<em>현재</em>`);
  return `<article class="era${n ? " now" : ""}"><div class="era-top"><h3>${esc(e.co)}</h3><span>${per}</span></div>
    <p class="era-role">${esc(e.role)}</p><ul class="scope">${e.scope.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
    <ol class="yrs">${st.map(([s, i], k) => `<li id="st-${i}" style="--k:${k + n * 4}"><b class="y">${s.y}</b><div><h4>${esc(s.title)}</h4><p>${esc(s.body)}</p>
      <div class="links">${s.recs.map(recById).filter(Boolean).map(r => `<a href="#case-${r.id}">${esc(r.title)}</a>`).join("")}</div></div></li>`).join("")}</ol></article>`; })
  .join(`<div class="era-arrow" aria-hidden="true">${ARROW}<span>+ 데이터, 전략, 자동화</span></div>`);
const flowSeen = ("IntersectionObserver" in window) ? new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting){ flow.classList.add("seen"); flowSeen.disconnect(); } }), {threshold: .15}) : null;
if (flowSeen && !reduceMotion) flowSeen.observe(flow); else flow.classList.add("seen");
/* 경력 흐름 항목: 연도 목록 맨 위를 기준으로 두고, 누른 항목이 화면 아래로 잘리면 보일 만큼만 더 내립니다 */
function goStage(i){ const li = document.getElementById("st-" + i); if (!li) return; flow.classList.add("seen");
  const top0 = $("#eras").getBoundingClientRect().top + scrollY - barH() - 24, liB = li.getBoundingClientRect().bottom + scrollY;
  const tab = document.getElementById("tabbar"), bottomGap = (tab && tab.offsetHeight && getComputedStyle(tab).display !== "none" ? tab.offsetHeight : 0) + 24;
  const need = liB + bottomGap - innerHeight, liTop = li.getBoundingClientRect().top + scrollY - barH() - 24;
  window.scrollTo({top: Math.min(Math.max(top0, need), liTop), behavior: smooth()});
  $$(".yrs li.hl").forEach(x => x.classList.remove("hl")); li.classList.add("hl"); setTimeout(() => li.classList.remove("hl"), 2200); }

/* ---------- 대표 사례 ---------- */
const featuredEl = $("#featured");
function featuredHTML(id, i){
  const c = CASES[id]; if (!c) return "";
  return `<article class="case${i % 2 ? " flip" : ""}" id="w-${id}">
    <div class="case-text"><p class="case-org"><b>${esc(c.org)}</b><span>${esc(c.ctx)}</span></p>
      <h3>${esc(c.title)}</h3><p class="case-body">${esc(c.body)}</p>${figNote(c)}
      <a class="more" href="#case-${id}">자세히 보기</a></div>${figHTML(c, true)}</article>`;
}
function renderWork(){
  const L = LENSES.find(l => l.id === state.lens) || LENSES[0];
  $("#workLead").textContent = state.lens === "all"
    ? "경력 전체에서 고른 세 가지 사례입니다. 첫 화면에서 관점을 바꾸면 그 관점에 맞는 사례로 바뀝니다."
    : `${L.label} 관점에서 고른 세 가지 사례입니다. 도식의 버튼으로 전과 후를 바꿔 볼 수 있습니다.`;
  featuredEl.innerHTML = L.cases.map(featuredHTML).join("");
  $$(".diagram", featuredEl).forEach(r => setupDiagram(r));
}

/* ---------- 전체 경력: 회사별 카드 ---------- */
const rowsEl = $("#rows"), countEl = $("#count"), searchEl = $("#search"), capRow = $("#capRow");
const GROUPS = [["", "전체"], ["run", GROUP_NAME.run], ["ana", GROUP_NAME.ana], ["ax", GROUP_NAME.ax]];
const grpOf = r => DIAGRAM_GROUP[(CASES[r.id] || {}).diagram] || "ana";
capRow.innerHTML = GROUPS.map(([id, n]) => `<button type="button" class="chip" data-grp="${id}" aria-pressed="${id ? "false" : "true"}">${id ? `<i class="dot g-${id}"></i>` : ""}${esc(n)}</button>`).join("");
function matches(r){
  const grpOK = !state.grp || grpOf(r) === state.grp;
  const q = state.q.trim().toLowerCase(); const c = CASES[r.id] || {};
  const hay = [r.title, r.company, r.period, r.context, r.phase, r.searchContext, c.title, c.body, c.ctx, ...r.roleScope, ...r.dataEnv, ...r.outputs, ...r.evidence, ...r.caps.map(x => CAP_NAME[x]), GROUP_NAME[grpOf(r)]].join(" ").toLowerCase();
  return grpOK && (!q || hay.includes(q));
}
const CO = [["제일기획", "2022–현재"], ["나스미디어", "2016–2022"]];
function cardHTML(r){
  const c = CASES[r.id] || {}, g = grpOf(r);
  return `<a class="card" href="#case-${r.id}"><span class="thumb" aria-hidden="true">${DIAGRAMS[c.diagram] || ""}</span>
    <span class="cb"><span class="meta"><span>${esc(r.period)}</span><span class="gm"><i class="dot g-${g}"></i>${GROUP_NAME[g]}</span></span>
    <b>${esc(r.title)}</b><p>${esc(c.title || r.context)}</p></span></a>`;
}
function rowHTML(r){
  const c = CASES[r.id] || {};
  return `<a class="row" href="#case-${r.id}"><span class="per">${esc(r.period)}</span><span><b>${esc(r.title)}</b><small>${esc(c.title || r.context)}</small></span><span class="ph gm"><i class="dot g-${grpOf(r)}"></i>${GROUP_NAME[grpOf(r)]}</span></a>`;
}
function renderArchive(){
  const list = RECORDS.filter(matches);
  const bits = [state.grp ? GROUP_NAME[state.grp] : "전체"]; if (state.q.trim()) bits.push(`"${state.q.trim()}"`);
  countEl.textContent = `${bits.join(", ")} ${list.length}개 경험`;
  if (!list.length){ rowsEl.innerHTML = `<p class="empty">맞는 경험이 없습니다. 검색어를 지우거나 다른 구분을 골라 보세요.</p>`; return; }
  rowsEl.innerHTML = CO.map(([co, per]) => { const g = list.filter(r => r.company === co); if (!g.length) return "";
    return `<div class="co"><h3>${co}<span>${per}</span></h3><div class="${state.view === "cards" ? "cards" : "rows"}">${g.map(state.view === "cards" ? cardHTML : rowHTML).join("")}</div></div>`; }).join("");
  if (typeof markSection === "function") requestAnimationFrame(markSection);
}
capRow.addEventListener("click", e => { const b = e.target.closest(".chip"); if (!b) return;
  state.grp = b.dataset.grp || null;
  $$(".chip", capRow).forEach(x => x.setAttribute("aria-pressed", String((x.dataset.grp || null) === state.grp))); renderArchive(); });
let qt; searchEl.addEventListener("input", () => { clearTimeout(qt); qt = setTimeout(() => { state.q = searchEl.value; renderArchive(); }, 120); });
$$(".view button").forEach(b => b.addEventListener("click", () => { state.view = b.dataset.view;
  $$(".view button").forEach(x => x.setAttribute("aria-pressed", String(x === b))); renderArchive(); }));

/* ---------- 작업실 ---------- */
const LAB_PREVIEW = {
  media: `<svg viewBox="0 0 480 270" role="img" aria-label="영상 세 편과 이 페이지"><rect width="480" height="270" rx="16" fill="#fff"/>
    <rect x="22" y="28" width="250" height="141" rx="10" fill="#12263a"/><text x="44" y="78" font-size="30" font-weight="800" fill="#fff">2016</text><rect x="44" y="92" width="150" height="9" rx="4" fill="#7f97ae"/><rect x="44" y="108" width="110" height="9" rx="4" fill="#7f97ae"/><circle cx="246" cy="148" r="12" fill="#fff"/><path d="M242 142 l9 6 l-9 6z" fill="#12263a"/>
    <rect x="292" y="28" width="76" height="135" rx="10" fill="#12263a"/><rect x="384" y="28" width="76" height="135" rx="10" fill="#e6ecf2"/>
    <rect x="392" y="60" width="44" height="12" rx="6" fill="#fff"/><rect x="408" y="80" width="44" height="18" rx="6" fill="#12263a"/><rect x="392" y="106" width="40" height="12" rx="6" fill="#fff"/>
    <text x="304" y="88" font-size="16" font-weight="800" fill="#fff">10+</text>
    ${["기획","검수","제작","렌더링","반영"].map((s, i) => `<rect x="${22 + i * 89}" y="198" width="80" height="44" rx="22" fill="${i === 4 ? "#12263a" : "#e6ecf2"}"/><text x="${62 + i * 89}" y="226" text-anchor="middle" font-size="15" font-weight="700" fill="${i === 4 ? "#fff" : "#12263a"}">${s}</text>`).join("")}</svg>`,
  trend: `<svg viewBox="0 0 480 270" role="img" aria-label="매주 쌓이는 트렌드 리포트"><rect width="480" height="270" rx="16" fill="#fff"/>
    ${[0, 1, 2, 3].map(i => `<g transform="translate(${30 + i * 18} ${30 + i * 14})"><rect width="250" height="170" rx="12" fill="${i === 3 ? "#12263a" : "#fff"}" stroke="#e3e7eb" stroke-width="2"/></g>`).join("")}
    <text x="108" y="102" font-size="15" font-weight="700" fill="#c9d5e1">월요일 리포트</text><rect x="108" y="116" width="180" height="10" rx="5" fill="#7f97ae"/><rect x="108" y="134" width="140" height="10" rx="5" fill="#7f97ae"/>
    <rect x="108" y="160" width="70" height="56" rx="8" fill="#2b4a6b"/><rect x="186" y="160" width="70" height="56" rx="8" fill="#2b4a6b"/><rect x="264" y="160" width="70" height="56" rx="8" fill="#2b4a6b"/>
    <g transform="translate(372 48)"><rect width="84" height="96" rx="12" fill="#e6ecf2"/><text x="42" y="40" text-anchor="middle" font-size="15" font-weight="800" fill="#12263a">매주</text><text x="42" y="66" text-anchor="middle" font-size="15" font-weight="800" fill="#12263a">월요일</text></g></svg>`
};
$("#labGrid").innerHTML = LAB.map((it, i) => it.kind === "reports"
  ? reportCardHTML(it, i)
  : `<article class="lab-item" id="lab-${i}"><div class="lab-prev idle${it.image ? " photo" : ""}${it.video ? " fill" : ""}${it.live ? " live" : ""}"${it.live && it.liveBg ? ` style="background:${it.liveBg}"` : ""}>${it.tag ? `<span class="lab-tag">${esc(it.tag)}</span>` : ""}${it.video
      ? `<video class="lab-vid" src="${it.video}" poster="${it.image}" muted loop playsinline preload="metadata" aria-label="${esc(it.imageAlt || "")}"></video>${it.live ? `<button type="button" class="lab-open" data-live="${it.live}" data-title="${esc(it.title)}">${esc(it.liveLabel || "크게 보기")}</button>` : ""}`
      : it.live
      ? `<div class="live-frame" data-h="${it.liveH || 822}"><iframe src="${it.live}" title="${esc(it.title)} 예시 화면" loading="lazy" tabindex="-1" aria-hidden="true" style="height:${it.liveH || 822}px"></iframe></div><button type="button" class="lab-open" data-live="${it.live}" data-title="${esc(it.title)}">${esc(it.liveLabel || "움직이는 화면 크게 보기")}</button>`
      : it.image ? `<a href="${it.image}" target="_blank" rel="noopener" aria-label="${esc(it.title)} 화면 크게 보기"><img src="${it.image}" alt="${esc(it.imageAlt || "")}" loading="lazy"></a>` : (LAB_PREVIEW[it.preview] || "")}</div>
    <div class="lab-body"><span class="st">${esc(it.status)}</span><h3>${esc(it.title)}</h3><p>${esc(it.body)}</p>
    ${it.steps ? `<ol class="lab-steps">${it.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol>` : ""}
    <ul class="tags">${(it.tags || []).map(t => `<li>${esc(t)}</li>`).join("")}</ul>
    ${it.go ? `<a class="more" href="#${it.go}">영상 보러 가기</a>` : ""}</div></article>`).join("");
/* 작업실 둘러보기 영상: 화면에 보일 때만 소리 없이 반복 재생, 움직임 줄이기 설정이면 정지 그림만 */
$$(".lab-vid").forEach(v => { if (reduceMotion || !("IntersectionObserver" in window)) return;
  new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: .25 }).observe(v); });
/* 작업실 실제 화면: 카드나 버튼을 누르면 페이지 안 창으로 크게 열고, 닫기, 바깥 클릭, Esc로 닫습니다 */
const liveModal = $("#liveModal"), lmFrame = $("#lmFrame");
function openLive(src, title){ $("#lmTitle").textContent = title; lmFrame.src = src; try { liveModal.showModal(); } catch (e) { liveModal.setAttribute("open", ""); } document.body.classList.add("lock"); $("#lmClose").focus(); }
function closeLive(){ if (liveModal.open) liveModal.close(); }
liveModal.addEventListener("close", () => { lmFrame.src = "about:blank"; document.body.classList.remove("lock"); });
$("#lmClose").addEventListener("click", closeLive);
if (typeof initReports === "function") initReports(document.getElementById("reports"), openLive);
liveModal.addEventListener("click", e => { if (e.target === liveModal) closeLive(); });
$$(".lab-prev.live").forEach(box => { const b = $(".lab-open", box); box.style.cursor = "pointer";
  box.addEventListener("click", () => openLive(b.dataset.live, b.dataset.title)); });
/* 작업실 실제 화면: 1280×(data-h) 화면을 카드 안에 다 들어가게 줄여 가운데 둡니다 */
$$(".live-frame").forEach(box => { const f = $("iframe", box); const fit = () => { const H = +box.dataset.h || 822, s = Math.min(box.clientWidth / 1280, box.clientHeight / H); f.style.transform = `translateX(${Math.max(0, (box.clientWidth - 1280 * s) / 2)}px) scale(${s})`; };
  fit(); if ("ResizeObserver" in window) new ResizeObserver(fit).observe(box); else addEventListener("resize", fit); });

/* 대표 사례 끝: 첫 화면의 관점 고르기로 돌아갑니다 */
$("#workBack").addEventListener("click", e => { e.preventDefault(); const box = $(".lens-box"); scrollToEl(box, 16);
  const on = $(".lens [aria-pressed='true']") || $(".lens .chip"); if (on) setTimeout(() => on.focus({preventScroll: true}), 500); });

/* ---------- 메뉴 바로가기: PC는 마우스를 올리면, 휴대폰은 아래 탭을 누르면 펼쳐집니다 ---------- */
const MENU_TITLE = {flow:"경력 흐름", work:"대표 사례", archive:"전체 경력", lab:"작업실", watch:"영상"};
function menuHTML(key, inSheet){
  const head = `<div class="mg-head">${inSheet ? "<span></span>" : `<b>${MENU_TITLE[key]}</b>`}<a href="#${key}" data-go="sec">섹션으로 이동</a></div>`;
  if (key === "flow") return head + `<div class="mg-grid">${STAGES.map((s, i) => `<button type="button" class="mg-item" data-stage="${i}"><small>${s.y}</small><span>${esc(s.title)}</span></button>`).join("")}</div>`;
  if (key === "work"){ const L = LENSES.find(l => l.id === state.lens) || LENSES[0];
    return head + `<div class="mg-grid">${L.cases.map(id => { const c = CASES[id]; return `<button type="button" class="mg-item" data-case="${id}"><span>${esc(c.title)}<em>${esc(c.org)}, ${esc(recById(id).title)}</em></span></button>`; }).join("")}</div>`; }
  if (key === "archive") return head + `<div class="mg-cols">${CO.map(([co, per]) => `<div><h4>${co} ${per}</h4>${RECORDS.filter(r => r.company === co).map(r => `<a class="mg-item" href="#case-${r.id}"><small>${esc((r.period.match(/\d{4}/) || [""])[0])}</small><span>${esc(r.title)}</span></a>`).join("")}</div>`).join("")}</div>`;
  if (key === "lab") return head + `<div class="mg-grid">${LAB.map((it, i) => `<a class="mg-item" href="#lab-${i}" data-go="el"><span>${esc(it.title)}<em>${esc(it.status)}</em></span></a>`).join("")}</div>`;
  if (key === "watch") return head + `<div class="mg-grid"><a class="mg-item" href="#film" data-go="sec"><small>30초</small><span>경력 흐름<em>첫 화면 바로 아래</em></span></a>
    <a class="mg-item" href="#intro" data-go="el"><small>34초</small><span>경력 소개</span></a><a class="mg-item" href="#qa" data-go="el"><small>38초</small><span>묻고 답하기</span></a></div>`;
  return head;
}
function menuAction(e, after){
  const t = e.target.closest("[data-stage],[data-case],[data-go],a[href^='#case-']"); if (!t) return;
  if (t.matches("a[href^='#case-']")){ e.preventDefault(); after(); const h = t.getAttribute("href"); jumpToCard(decodeURIComponent(h.slice(6))); location.hash = h; return; }
  e.preventDefault(); after();
  if (t.dataset.stage) goStage(+t.dataset.stage);
  else if (t.dataset.case) scrollToEl(document.getElementById("w-" + t.dataset.case), 12);
  else if (t.dataset.go === "el") scrollToEl(document.getElementById(t.getAttribute("href").slice(1)), 20);
  else scrollToEl(document.getElementById(t.getAttribute("href").slice(1)));
}
const mega = $("#mega"), megaIn = $("#megaIn"), navLinks = $$(".nav a");
let megaKey = null, megaT;
function openMega(key){ clearTimeout(megaT); if (megaKey === key && !mega.hidden) return; megaKey = key; megaIn.innerHTML = menuHTML(key); mega.hidden = false;
  navLinks.forEach(a => { const on = a.dataset.menu === key; a.classList.toggle("open", on); a.setAttribute("aria-expanded", String(on)); }); }
function closeMega(now){ clearTimeout(megaT); const f = () => { mega.hidden = true; megaKey = null; navLinks.forEach(a => { a.classList.remove("open"); a.setAttribute("aria-expanded", "false"); }); };
  now ? f() : (megaT = setTimeout(f, 160)); }
const canHover = (() => { try { return matchMedia("(hover: hover) and (pointer: fine)").matches; } catch (e) { return false; } })();
navLinks.forEach(a => { a.setAttribute("aria-haspopup", "true"); a.setAttribute("aria-expanded", "false");
  if (canHover) a.addEventListener("mouseenter", () => { clearTimeout(megaT); megaT = setTimeout(() => openMega(a.dataset.menu), 90); });
  if (canHover) a.addEventListener("mouseleave", () => closeMega());
  a.addEventListener("keydown", e => { if (e.key === "ArrowDown"){ e.preventDefault(); openMega(a.dataset.menu); const f = $("a,button", megaIn); if (f) f.focus(); } });
  /* 마우스가 없는 태블릿: 누르면 세부 메뉴를 펼치고(섹션 이동은 메뉴 안 '섹션으로 이동'), 같은 항목을 다시 누르면 닫습니다 */
  a.addEventListener("click", e => { e.preventDefault();
    if (!canHover){ if (megaKey === a.dataset.menu && !mega.hidden) closeMega(true); else openMega(a.dataset.menu); return; }
    closeMega(true); scrollToEl(document.getElementById(a.dataset.menu)); });
});
mega.addEventListener("mouseenter", () => clearTimeout(megaT));
if (canHover) mega.addEventListener("mouseleave", () => closeMega());
mega.addEventListener("click", e => menuAction(e, () => closeMega(true)));
document.addEventListener("keydown", e => { if (e.key === "Escape" && !mega.hidden){ const k = megaKey; closeMega(true); const a = $(`.nav a[data-menu="${k}"]`); if (a) a.focus({preventScroll: true}); } });
document.addEventListener("focusin", e => { if (!mega.hidden && !e.target.closest(".bar")) closeMega(true); });
document.addEventListener("pointerdown", e => { if (!mega.hidden && !e.target.closest(".bar")) closeMega(true); });
// 휴대폰 아래 탭바
const tabbar = $("#tabbar"), msheet = $("#msheet"), msBody = $("#msBody");
function openSheetMenu(key){ $("#msTitle").textContent = MENU_TITLE[key]; msBody.innerHTML = menuHTML(key, true);
  try { msheet.showModal(); } catch (err) { msheet.setAttribute("open", ""); } }
tabbar.addEventListener("click", e => { const b = e.target.closest("button[data-menu]"); if (b) openSheetMenu(b.dataset.menu); });
msBody.addEventListener("click", e => menuAction(e, () => msheet.close()));
$("#msClose").addEventListener("click", () => msheet.close());
msheet.addEventListener("click", e => { if (e.target === msheet) msheet.close(); });

/* ---------- 사례 상세: 주소 끝의 #case-아이디로 열립니다 ---------- */
const sheet = $("#sheet"), shBody = $("#shBody"), shMeta = $("#shMeta");
function listBox(title, arr){ return arr && arr.length ? `<div><h4>${title}</h4><ul>${arr.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""; }
function sheetHTML(r){
  const c = CASES[r.id];
  const order = RECORDS.map(x => x.id), k = order.indexOf(r.id);
  const prev = recById(order[k - 1]), next = recById(order[k + 1]);
  const rel = (r.related || []).map(recById).filter(Boolean);
  const stories = (r.stories || []).map(s => `<section class="story"><h3>${esc(s.title)}</h3><ol>${s.parts.map(([a, b]) => `<li><b>${esc(a)}</b><span>${esc(b)}</span></li>`).join("")}</ol></section>`).join("");
  return `<h2 id="shTitle" tabindex="-1">${esc(r.title)}</h2><p class="sh-ctx">${esc(c ? c.ctx : r.context)}</p>
    ${c ? `<div class="sh-lead"><h3>${esc(c.title)}</h3><p>${esc(c.body)}</p>${figNote(c)}</div>${figHTML(c)}` : ""}
    ${stories}
    <div class="facts">${listBox("맡은 역할", r.roleScope)}${listBox("데이터와 환경", r.dataEnv)}${listBox("결과물", r.outputs)}${listBox("근거", r.evidence)}</div>
    ${rel.length ? `<p class="rel"><span>함께 보면 좋은 경험</span>${rel.map(x => `<a href="#case-${x.id}">${esc(x.title)}</a>`).join("")}</p>` : ""}
    <nav class="sh-nav" aria-label="이전, 다음 경험">${prev ? `<a href="#case-${prev.id}"><small>이전 경험</small><b>${esc(prev.title)}</b></a>` : ""}${next ? `<a href="#case-${next.id}"><small>다음 경험</small><b>${esc(next.title)}</b></a>` : ""}</nav>`;
}
let lastFocus = null;
function openCase(id){
  const r = recById(id); if (!r) return closeCase();
  if (msheet.open) msheet.close(); closeMega(true);
  shMeta.innerHTML = `<b>${esc(r.company)}</b>${esc(r.period)}`;
  shBody.innerHTML = sheetHTML(r); shBody.scrollTop = 0;
  $$(".diagram", shBody).forEach(d => setupDiagram(d, "now"));
  if (!sheet.open){ lastFocus = document.activeElement; try { sheet.showModal(); } catch (e) { sheet.setAttribute("open", ""); } document.body.classList.add("lock"); }
  const t = $("#shTitle"); if (t) t.focus({preventScroll: true});
}
/* 페이지 안에서 사례를 열면 주소에 #case-가 한 단계 쌓입니다. 닫기 버튼으로 닫을 때도 그 단계를 되돌려,
   휴대폰 뒤로 가기가 '닫힌 상세 → 같은 페이지'로 한 번 헛돌지 않게 합니다. 링크로 바로 들어온 경우만 주소를 바꿔 둡니다. */
let caseByNav = false;
/* 메뉴의 전체 경력 항목: 상세를 열기 전에 목록의 그 카드로 한 번에 옮겨 두고, 닫으면 그 카드를 잠깐 표시합니다 */
let flashId = null;
const cardOf = id => rowsEl.querySelector(`a[href="#case-${CSS.escape(id)}"]`);
function jumpToCard(id){
  if (!cardOf(id)){ state.grp = null; state.q = ""; searchEl.value = "";
    $$(".chip", capRow).forEach(x => x.setAttribute("aria-pressed", String(!x.dataset.grp))); renderArchive(); }
  const el = cardOf(id); if (!el) return;
  window.scrollTo({top: el.getBoundingClientRect().top + scrollY - barH() - 20, behavior: "instant"}); flashId = id;
}
function closeCase(){ if (sheet.open) sheet.close(); }
sheet.addEventListener("close", () => {
  document.body.classList.remove("lock");
  if (/^#case-/.test(location.hash)) { if (caseByNav) { caseByNav = false; history.back(); } else history.replaceState(history.state, "", location.pathname + location.search); }
  if (lastFocus && lastFocus.focus) lastFocus.focus({preventScroll: true});
  if (flashId){ const el = cardOf(flashId); flashId = null;
    if (el){ el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 1800); } }
});
$("#shClose").addEventListener("click", closeCase);
sheet.addEventListener("click", e => { if (e.target === sheet) closeCase(); });
function route(){ const m = location.hash.match(/^#case-(.+)$/); if (m) openCase(decodeURIComponent(m[1])); else { caseByNav = false; closeCase(); } }
window.addEventListener("hashchange", () => { if (/^#case-/.test(location.hash)) caseByNav = true; route(); });

/* ---------- 현재 위치 표시, 영상 ---------- */
const bar = $("#bar"), readbar = $("#readbar"), tabBtns = $$("#tabbar button");
/* 지금 보고 있는 섹션: 화면 45% 지점에 걸친 섹션. 필터로 섹션 길이가 바뀌어도 맞도록 스크롤마다 다시 계산 */
const SECS = ["top", "film", "flow", "work", "archive", "lab", "watch", "tools"].map(id => document.getElementById(id)).filter(Boolean);
let curSec = null;
function markSection(){ const y = innerHeight * .45; const s = SECS.find(el => { const r = el.getBoundingClientRect(); return r.top <= y && r.bottom > y; });
  const id = s ? s.id : null; if (id === curSec) return; curSec = id;
  navLinks.forEach(a => a.classList.toggle("on", a.dataset.menu === id));
  tabBtns.forEach(b => b.classList.toggle("on", b.dataset.menu === id)); }
let ticking = false;
function onScroll(){ if (ticking) return; ticking = true; requestAnimationFrame(() => { ticking = false;
  bar.classList.toggle("scrolled", scrollY > 8); markSection();
  const max = document.documentElement.scrollHeight - innerHeight; readbar.style.setProperty("--rp", (max > 0 ? Math.min(1, scrollY / max) : 0).toFixed(4));
  }); }
addEventListener("scroll", onScroll, {passive: true}); addEventListener("resize", onScroll); requestAnimationFrame(markSection);
$$(".vplay[data-vid]").forEach(b => b.addEventListener("click", () => { const v = document.getElementById(b.dataset.vid); b.remove(); v.controls = true; v.play().catch(() => {}); }));
if (!hasShorts) $$('[data-opt="shorts"]').forEach(el => el.remove());
tabbar.style.setProperty("--tabs", $$("button", tabbar).length);

/* ---------- 시작 ---------- */
setLens(state.lens, true);
onScroll();
route();
