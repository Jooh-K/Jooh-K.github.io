/* 사례 도식: 수치 없이 구조만. data-t는 등장 순서, data-idle은 다 그린 뒤의 은은한 움직임 */
const DIAGRAMS = {};
(() => {
  const N="#12263a", S="#e6ecf2", L="#b9c5d1", B="#3c4650";
  const at=(t,fx,d)=>` data-t="${(+t).toFixed(2)}" data-fx="${fx}"${d?` data-d="${d}"`:""}`;
  const box=(x,y,w,h,t,o={})=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx||14}" fill="${o.fill||S}"/>`+
    (t?`<text x="${x+w/2}" y="${y+h/2+(o.dy||7)}" text-anchor="middle" font-size="${o.fs||20}" font-weight="${o.fw||700}" fill="${o.color||N}">${t}</text>`:"");
  const ln=(x1,y1,x2,y2,t,col=L,w=2)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${w}" pathLength="1" style="--da:${(3.6/Math.hypot(x2-x1,y2-y1)).toFixed(4)} ${(3/Math.hypot(x2-x1,y2-y1)).toFixed(4)};--do:${(-13.2/Math.hypot(x2-x1,y2-y1)).toFixed(4)}"${at(t,"draw",.3)}/>`;
  const dn=(x,y,t,col=L)=>`<path d="M${x-9} ${y-10} L${x} ${y} L${x+9} ${y-10}" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${at(t,"fade",.2)}/>`;
  let s;

  // 질레트: 조합별 추적
  const ON=[1,2,5,9,10,14,18,19,22,27,28];
  s=`<svg viewBox="0 0 520 470" role="img" aria-label="매체, 타깃, 소재, 카피 조합별로 구매전환을 추적하고 성과를 비교해 운영을 조정한 구조">`;
  ["매체","타깃","소재","카피"].forEach((t,i)=>{ const x=8+i*128; s+=`<g${at(i*.12,"pop")}>${box(x,6,120,56,t,{fs:21})}</g>`+ln(x+60,62,x+60,104,.55+i*.05); });
  s+=ln(68,104,452,104,.8)+ln(260,104,260,132,.95)+`<text x="260" y="162" text-anchor="middle" font-size="19" font-weight="600" fill="${B}"${at(1.1,"fade")}>조합별 구매전환 추적</text>`;
  for(let r=0;r<4;r++) for(let c=0;c<8;c++){ const i=r*8+c,x=37+c*63.7,y=208+r*54;
    s+=`<circle class="${ON.includes(i)?"":"lo"}" cx="${x}" cy="${y}" r="17" fill="#fff" stroke="${L}" stroke-width="2"${at(1.3+c*.03+r*.07,"pop",.3)}/>`;
    if(ON.includes(i)) s+=`<g data-idle="pulse" style="--d:${(ON.indexOf(i)*.37).toFixed(2)}s"><circle cx="${x}" cy="${y}" r="18" fill="${N}"${at(2.3+ON.indexOf(i)*.13,"pop",.3)}/></g>`; }
  s+=`<g${at(3.9,"fade")}><circle cx="37" cy="436" r="10" fill="${N}"/><text x="56" y="443" font-size="18" fill="${B}">성과가 높은 조합</text><circle cx="275" cy="436" r="9" fill="#fff" stroke="${L}" stroke-width="2"/><text x="294" y="443" font-size="18" fill="${B}">성과가 낮은 조합</text></g></svg>`;
  DIAGRAMS.gillette=s;

  // PCA: 제각각인 자료가 공통 기준의 표로 (밝은 바탕용)
  const shapes=[[20,18,150,74,-7],[196,6,104,112,5],[330,30,170,60,-3],[58,112,112,84,8],[226,134,140,58,-9],[392,108,96,96,4]];
  s=`<svg viewBox="0 0 520 520" role="img" aria-label="형식과 기준이 제각각인 법인 자료를 공통 기준의 표로 다시 정리한 흐름">`;
  shapes.forEach(([x,y,w,h,a],i)=>{ s+=`<g class="raw"${at(i*.13,"pop")}><g transform="rotate(${a} ${x+w/2} ${y+h/2})"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${i%2?4:12}" fill="none" stroke="#7f97ae" stroke-width="2" ${i%3===1?'stroke-dasharray="7 6"':''}/>`;
    const n=2+(i%3); for(let k=0;k<n;k++) s+=`<line x1="${x+14}" y1="${y+20+k*18}" x2="${x+w-14-(k*17)%40}" y2="${y+20+k*18}" stroke="#a9b8c7" stroke-width="2"/>`; s+=`</g></g>`; });
  s+=`<text x="260" y="246" text-anchor="middle" font-size="19" fill="${B}"${at(1.0,"fade")}>법인마다 다른 형식과 기준</text>`;
  s+=ln(260,266,260,306,1.4,N,2.5)+dn(260,310,1.6,N)+`<text x="286" y="292" font-size="18" font-weight="600" fill="${N}"${at(1.6,"fade")}>직접 재분류, 지표 재계산</text>`;
  s+=`<g class="tbl"${at(2.1,"pop")}><rect x="10" y="330" width="500" height="48" rx="10" fill="${N}"/>`+["채널","플랫폼","오디언스","성과지표"].map((t,i)=>`<text x="${72+i*125}" y="361" text-anchor="middle" font-size="19" font-weight="700" fill="#fff">${t}</text>`).join("")+`</g>`;
  for(let r=0;r<3;r++){ const y=392+r*40; s+=`<g data-idle="sweep" style="--d:${r*.6}s"><g class="tbl"${at(2.5+r*.18,"growx",.4)}><rect x="10" y="${y}" width="500" height="32" rx="8" fill="#fff"/>`;
    for(let c=0;c<4;c++) s+=`<line x1="${36+c*125}" y1="${y+16}" x2="${108+c*125}" y2="${y+16}" stroke="#b9c5d1" stroke-width="2"/>`; s+=`</g></g>`; }
  DIAGRAMS.pca=s+`</svg>`;

  // 태블릿 신제품: 세 고객군과 메시지
  s=`<svg viewBox="0 0 520 440" role="img" aria-label="재구매, 신규 수요, 경쟁사 전환 세 고객군의 동기를 CRM 단계와 콘텐츠 방향으로 연결한 구조">`;
  [["재구매","기존 사용자","다시 선택할 이유"],["신규 수요","관심사 기반","처음 필요해질 이유"],["경쟁사 전환","경쟁사 사용자","브랜드를 바꿀 이유"]].forEach((g,i)=>{ const x=4+i*172,cx=x+84;
    s+=`<g${at(i*.22,"pop")}>${box(x,6,168,84,"")}<text x="${cx}" y="42" text-anchor="middle" font-size="21" font-weight="700" fill="${N}">${g[0]}</text><text x="${cx}" y="70" text-anchor="middle" font-size="16" fill="${B}">${g[1]}</text></g>`;
    s+=ln(cx,90,cx,150,.8+i*.12)+dn(cx,150,1.05+i*.12)+`<text x="${cx}" y="188" text-anchor="middle" font-size="17" font-weight="600" fill="${B}"${at(1.2+i*.15,"fade")}>${g[2]}</text>`+ln(cx,206,cx,268,1.8); });
  s+=ln(88,268,432,268,2.1)+ln(260,268,260,308,2.3)+dn(260,308,2.5);
  s+=`<g data-idle="breathe"><g${at(2.6,"pop")}>${box(60,322,400,96,"",{fill:N})}<text x="260" y="362" text-anchor="middle" font-size="21" font-weight="700" fill="#fff">CRM 단계별 목표</text><text x="260" y="394" text-anchor="middle" font-size="21" font-weight="700" fill="#fff">콘텐츠 방향</text></g></g></svg>`;
  DIAGRAMS.tab=s;

  // 브랜드 × 매출 × 미디어
  s=`<svg viewBox="0 0 520 400" role="img" aria-label="미디어 투자, 브랜드 지표, 매출 성과를 공통 분석 단위로 맞춰 나란히 비교한 구조">`;
  const pat=[[.35,.6,.9,.7,.45,.3,.55,.8],[.3,.45,.75,.85,.6,.4,.45,.7],[.25,.4,.6,.9,.75,.5,.4,.6]];
  ["미디어 투자","브랜드 지표","매출 성과"].forEach((t,r)=>{ const y=20+r*112;
    s+=`<text x="6" y="${y+18}" font-size="19" font-weight="700" fill="${N}"${at(r*.35,"fade")}>${t}</text>`;
    pat[r].forEach((o,c)=>{ s+=`<g data-idle="cell" style="--d:${(c*.28+r*.45).toFixed(2)}s"><rect x="${6+c*64}" y="${y+32}" width="56" height="44" rx="8" fill="${N}" fill-opacity="${o}"${at(r*.35+.15+c*.07,"pop",.3)}/></g>`; }); });
  s+=`<g${at(1.9,"fade",.6)}>`; for(let c=1;c<8;c++) s+=`<line x1="${2+c*64}" y1="44" x2="${2+c*64}" y2="330" stroke="${L}" stroke-width="1.5" stroke-dasharray="4 6"/>`;
  s+=`</g><text x="260" y="376" text-anchor="middle" font-size="18" fill="${B}"${at(2.4,"fade")}>공통 분석 단위로 맞춰 변화를 나란히 비교</text></svg>`;
  DIAGRAMS.bsm=s;

  // 거버넌스
  s=`<svg viewBox="0 0 520 472" role="img" aria-label="법인과 사업부 데이터를 취합, 표준화와 검증, DB, 분석으로 잇는 흐름">`;
  [[20,30],[70,62],[34,96],[92,22],[110,84],[56,128]].forEach(([x,y],i)=>{ s+=`<rect x="${x}" y="${y}" width="26" height="18" rx="4" fill="none" stroke="${L}" stroke-width="2"${at(i*.09,"pop",.3)}/>`; });
  s+=`<g${at(.6,"fade")}><text x="160" y="52" font-size="17" fill="${B}">법인과 사업부에</text><text x="160" y="76" font-size="17" fill="${B}">흩어진 투자 데이터</text></g>`;
  ["취합","표준화와 검증","DB","분석"].forEach((t,i)=>{ const x=20+i*60,y=172+i*66,last=i===3; s+=`<g${last?' data-idle="breathe"':""}><g${at(1.0+i*.38,"pop")}>${box(x,y,300,52,t,{fill:last?N:S,color:last?"#fff":N})}</g></g>`; });
  s+=`<text x="350" y="458" font-size="17" fill="${B}" text-anchor="middle"${at(2.7,"fade")}>본사가 투자와 성과를 함께 보는 기반</text></svg>`;
  DIAGRAMS.gov=s;

  // AI/AX
  s=`<svg viewBox="0 0 520 440" role="img" aria-label="DB를 입력하면 분석 로직과 검증 절차를 거쳐 HTML 보고서가 만들어지는 구조">`;
  s+=`<g${at(0,"pop")}>${box(110,6,300,64,"DB 입력")}</g>`+ln(260,70,260,112,.45)+dn(260,112,.65);
  s+=`<g${at(.8,"pop")}>${box(40,126,440,116,"")}<text x="260" y="172" text-anchor="middle" font-size="20" font-weight="700" fill="${N}">분석 로직, 시각화, 검증 절차</text><text x="260" y="206" text-anchor="middle" font-size="16.5" fill="${B}">데이터 유형과 업무 목적에 맞춰 설계</text></g>`;
  s+=ln(260,242,260,284,1.3)+dn(260,284,1.5);
  s+=`<g${at(1.65,"pop")}><rect x="90" y="298" width="340" height="136" rx="14" fill="${N}"/><text x="118" y="338" font-size="20" font-weight="700" fill="#fff">HTML 보고서</text></g>`;
  [44,70,30,58,84,48].forEach((h,i)=>{ s+=`<g data-idle="bob" style="--d:${(i*.23).toFixed(2)}s"><rect x="${118+i*30}" y="${416-h*.72}" width="18" height="${h*.72}" rx="3" fill="#7f97ae"${at(2.1+i*.09,"growy",.35)}/></g>`; });
  s+=`<g${at(2.6,"fade")}><line x1="312" y1="372" x2="402" y2="372" stroke="#7f97ae" stroke-width="2"/><line x1="312" y1="392" x2="388" y2="392" stroke="#7f97ae" stroke-width="2"/><line x1="312" y1="412" x2="396" y2="412" stroke="#7f97ae" stroke-width="2"/></g></svg>`;
  DIAGRAMS.ax=s;

  // P&G 홈케어
  s=`<svg viewBox="0 0 520 460" role="img" aria-label="제안, 기획, 바잉, 운영, 최적화, 보고로 이어지는 캠페인 수행 범위">`;
  s+=`<circle cx="260" cy="230" r="158" fill="none" stroke="${L}" stroke-width="2" stroke-dasharray="3 8"${at(0,"fade",.6)}/>`;
  ["제안","기획","바잉","운영","최적화","보고"].forEach((t,i)=>{ const a=(-90+i*60)*Math.PI/180,x=260+158*Math.cos(a),y=230+158*Math.sin(a);
    s+=`<g${i===4?' data-idle="breathe"':""}><g${at(.4+i*.25,"pop")}><rect x="${x-58}" y="${y-28}" width="116" height="56" rx="28" fill="${i===4?N:S}"/><text x="${x}" y="${y+7}" text-anchor="middle" font-size="20" font-weight="700" fill="${i===4?"#fff":N}">${t}</text></g></g>`; });
  s+=`<g${at(2.1,"fade")}><text x="260" y="222" text-anchor="middle" font-size="19" font-weight="700" fill="${N}">도달 확대 중심</text><text x="260" y="250" text-anchor="middle" font-size="16.5" fill="${B}">YouTube와 SNS</text></g></svg>`;
  DIAGRAMS.pg=s;

  // LG 글로벌
  s=`<svg viewBox="0 0 520 400" role="img" aria-label="국가와 KPI별로 성과를 비교해 미디어 구조와 예산을 조정한 구조">`;
  ["브랜딩","유입","전환"].forEach((t,c)=>{ s+=`<text x="${222+c*118}" y="34" text-anchor="middle" font-size="19" font-weight="700" fill="${N}"${at(c*.15,"fade")}>${t}</text>`; });
  const fill=[[.85,.4,.25],[.35,.8,.5],[.3,.45,.75]];
  ["미국","프랑스","기타 시장"].forEach((t,r)=>{ const y=56+r*96; s+=`<text x="6" y="${y+46}" font-size="19" font-weight="700" fill="${N}"${at(.5+r*.3,"fade")}>${t}</text>`;
    for(let c=0;c<3;c++) s+=`<g data-idle="cell" style="--d:${(r*.6+c*.35).toFixed(2)}s"><rect x="${168+c*118}" y="${y}" width="108" height="80" rx="12" fill="${N}" fill-opacity="${fill[r][c]}"${at(.6+r*.3+c*.1,"pop",.35)}/></g>`; });
  s+=`<text x="260" y="378" text-anchor="middle" font-size="18" fill="${B}"${at(2.0,"fade")}>국가, 제품, KPI별 성과를 비교해 구조와 예산 조정</text></svg>`;
  DIAGRAMS.lg=s;

  // 연간 전략: 퍼널에 중간 단계 추가
  s=`<svg viewBox="0 0 520 470" role="img" aria-label="인지에서 전환으로 바로 이어지지 않던 퍼널에 영상 시청 중심의 중간 단계를 넣어 고려와 전환으로 잇는 구조">`;
  const st=[["인지","브랜드 지표는 상승",480,S,N,0],["중간 단계(evoke)","영상 시청",400,N,"#fff",1.5],["고려","consideration",320,S,N,.25],["전환","conversion",240,S,N,.5]];
  st.forEach(([t,sub,w,f,col,tt],i)=>{ const x=260-w/2,y=20+i*100; s+=`<g class="${i===1?"evk":""}"${i===1?' data-idle="breathe"':""}><g${at(tt,"pop",.4)}><rect x="${x}" y="${y}" width="${w}" height="80" rx="16" fill="${f}"/><text x="260" y="${y+36}" text-anchor="middle" font-size="21" font-weight="700" fill="${col}">${t}</text><text x="260" y="${y+62}" text-anchor="middle" font-size="16" fill="${col==="#fff"?"#c9d5e1":B}">${sub}</text></g></g>`; });
  s+=`<text class="gaptx" x="260" y="168" text-anchor="middle" font-size="18" font-weight="600" fill="#c0463e" style="opacity:0"${at(.6,"gap",1.3)}>여기서 전환으로 잘 이어지지 않음</text>`;
  s+=`<text x="260" y="458" text-anchor="middle" font-size="17" fill="${B}"${at(2.1,"fade")}>중간 단계를 추가하자고 제안. 인과관계 분석은 하지 않음</text></svg>`;
  DIAGRAMS.funnel=s;

  // 대시보드 전환: 취합 기간
  s=`<svg viewBox="0 0 520 360" role="img" aria-label="법인 투자 데이터 취합 기간이 약 2주에서 약 3일로 줄어든 비교">`;
  s+=`<text x="6" y="40" font-size="18" font-weight="700" fill="${N}"${at(0,"fade")}>이전</text><text x="6" y="64" font-size="18" fill="${B}"${at(0,"fade")}>엑셀을 받아 수작업 취합</text>`;
  s+=`<g${at(.25,"growx",.8)}><rect x="6" y="80" width="508" height="72" rx="16" fill="#cfd8e1"/><text x="32" y="126" font-size="30" font-weight="800" fill="${N}">약 2주</text></g>`;
  s+=`<text x="6" y="212" font-size="18" font-weight="700" fill="${N}"${at(1.1,"fade")}>현재</text><text x="6" y="236" font-size="18" fill="${B}"${at(1.1,"fade")}>법인이 대시보드에 올리고 내부 값으로 보정</text>`;
  s+=`<g data-idle="breathe"><g${at(1.35,"growx",.5)}><rect x="6" y="252" width="150" height="72" rx="16" fill="${N}"/><text x="32" y="298" font-size="30" font-weight="800" fill="#fff">약 3일</text></g></g>`;
  s+=`<text x="514" y="348" text-anchor="end" font-size="17" fill="${B}"${at(1.9,"fade")}>실무 기준 추정</text></svg>`;
  DIAGRAMS.speed=s;

  // 글로벌 미디어 오딧: 같은 체크리스트로 점검하고 이슈와 과제로
  s=`<svg viewBox="0 0 520 470" role="img" aria-label="TV와 디지털 캠페인을 같은 체크리스트로 점검해 법인별 이슈와 개선 과제로 정리한 구조">`;
  ["TV 캠페인","디지털 캠페인"].forEach((t,i)=>{ const x=40+i*230; s+=`<g${at(i*.15,"pop")}>${box(x,6,210,56,t,{fs:20})}</g>`+ln(x+105,62,x+105,98,.45+i*.05); });
  s+=ln(145,98,375,98,.6)+ln(260,98,260,122,.7)+dn(260,124,.8);
  s+=`<g${at(.9,"pop")}><rect x="60" y="136" width="400" height="190" rx="16" fill="#fff" stroke="${L}" stroke-width="2"/></g>`;
  ["범위와 일정","운영 현황 검토","성과 데이터 정합성"].forEach((t,i)=>{ const y=180+i*50;
    s+=`<g data-idle="tick" style="--d:${(i*.5).toFixed(2)}s"><g${at(1.2+i*.3,"pop",.3)}><rect x="92" y="${y-20}" width="28" height="28" rx="8" fill="${N}"/><path d="M99 ${y-6} l6 6 l10 -12" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g></g>`;
    s+=`<text x="138" y="${y+2}" font-size="19" font-weight="600" fill="${N}"${at(1.25+i*.3,"fade")}>${t}</text>`; });
  s+=ln(260,326,260,360,2.3)+dn(260,362,2.45);
  s+=`<g data-idle="breathe"><g${at(2.55,"pop")}>${box(60,376,400,80,"",{fill:N})}<text x="260" y="410" text-anchor="middle" font-size="20" font-weight="700" fill="#fff">법인별 이슈 구조화</text><text x="260" y="438" text-anchor="middle" font-size="17" fill="#c9d5e1">개선 과제로 정리</text></g></g></svg>`;
  DIAGRAMS.audit=s;

  // LG전자 국내: 여러 데이터가 타깃 전략으로
  s=`<svg viewBox="0 0 520 450" role="img" aria-label="행동 데이터, DMP, 경쟁사 데이터, 맞춤 관심사를 모아 타깃 전략과 성과 최적화로 잇는 구조">`;
  [[130,72],[390,72],[130,158],[390,158]].forEach(([x,y],i)=>{ const len=Math.hypot(260-x,246-y)*1.12; s+=`<path d="M${x} ${y} C ${x} ${y+60}, 260 ${200}, 260 ${246}" fill="none" stroke="${L}" stroke-width="2" pathLength="1" style="--da:${(3.6/len).toFixed(4)} ${(3/len).toFixed(4)};--do:${(-13.2/len).toFixed(4)}"${at(.7+i*.1,"draw",.5)}/>`; });
  [["GA 행동 데이터",14,10],["DMP",274,10],["경쟁사 데이터",14,96],["맞춤 관심사",274,96]].forEach(([t,x,y],i)=>{ s+=`<g${at(i*.14,"pop")}>${box(x,y,232,62,t,{fs:19})}</g>`; });
  s+=dn(260,250,1.25);
  s+=`<g data-idle="breathe"><g${at(1.35,"pop")}>${box(70,264,380,84,"",{fill:N})}<text x="260" y="300" text-anchor="middle" font-size="21" font-weight="700" fill="#fff">타깃 전략</text><text x="260" y="328" text-anchor="middle" font-size="17" fill="#c9d5e1">캠페인 운영과 성과 최적화</text></g></g>`;
  ["TV","Gram","MiniBeam","Portable Speaker"].forEach((t,i)=>{ const w=[70,90,120,180][i], x=[14,94,194,324][i]; s+=`<g${at(1.9+i*.1,"pop")}><rect x="${x}" y="384" width="${w}" height="44" rx="22" fill="${S}"/><text x="${x+w/2}" y="412" text-anchor="middle" font-size="16" font-weight="600" fill="${N}">${t}</text></g>`; });
  DIAGRAMS.lgkr=s+`</svg>`;

  // 아모레퍼시픽: A/B 비교
  s=`<svg viewBox="0 0 520 440" role="img" aria-label="타깃과 크리에이티브를 A와 B로 나눠 반응을 비교하고 반응이 좋은 쪽으로 최적화한 구조">`;
  s+=`<text x="260" y="30" text-anchor="middle" font-size="18" font-weight="600" fill="${B}"${at(0,"fade")}>IOPE, 한율, 마몽드, HERA</text>`;
  [["A",.0],["B",.25]].forEach(([t,d],i)=>{ const x=50+i*230;
    s+=`<g${at(.2+d,"pop")}><rect x="${x}" y="56" width="190" height="130" rx="16" fill="${S}"/><text x="${x+95}" y="138" text-anchor="middle" font-size="54" font-weight="800" fill="${N}">${t}</text></g>`; });
  s+=`<text x="260" y="222" text-anchor="middle" font-size="18" fill="${B}"${at(.8,"fade")}>타깃과 크리에이티브 반응 비교</text>`;
  [[50,120,"#b9c5d1"],[280,190,N]].forEach(([x,w,f],i)=>{ s+=`<g${i?' data-idle="breathe"':""}><rect x="${x}" y="246" width="${w}" height="40" rx="10" fill="${f}"${at(1.1+i*.2,"growx",.6)}/></g>`; });
  s+=ln(375,286,375,330,1.9)+dn(375,332,2.05);
  s+=`<g${at(2.15,"pop")}>${box(150,346,340,72,"반응이 좋은 쪽으로 최적화",{fill:N,color:"#fff",fs:19})}</g></svg>`;
  DIAGRAMS.amore=s;

  // 보고 대시보드 TF: 조사에서 테스트까지
  s=`<svg viewBox="0 0 520 470" role="img" aria-label="고객 조사, 데이터 요구사항, 시각화와 비교 구조, 데모와 운영 테스트로 이어진 대시보드 기획 흐름">`;
  ["고객 조사","데이터 항목 요구사항","시각화와 비교 구조","데모와 운영 테스트"].forEach((t,i)=>{ const y=10+i*76;
    s+=`<g${at(i*.35,"pop")}><circle cx="34" cy="${y+28}" r="20" fill="${i===3?N:S}"/><text x="34" y="${y+35}" text-anchor="middle" font-size="18" font-weight="800" fill="${i===3?"#fff":N}">${i+1}</text><text x="70" y="${y+35}" font-size="19" font-weight="700" fill="${N}">${t}</text></g>`;
    if(i<3) s+=ln(34,y+50,34,y+82,.25+i*.35); });
  s+=`<g${at(1.5,"pop")}><rect x="290" y="14" width="220" height="280" rx="16" fill="${N}"/></g>`;
  [[310,40,180,16],[310,70,120,10]].forEach(([x,y,w,h],i)=>{ s+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="#7f97ae"${at(1.7+i*.1,"growx",.4)}/>`; });
  [52,88,36,70,100,60].forEach((h,i)=>{ s+=`<g data-idle="bob" style="--d:${(i*.2).toFixed(2)}s"><rect x="${312+i*30}" y="${270-h}" width="18" height="${h}" rx="3" fill="#c9d5e1"${at(1.9+i*.08,"growy",.35)}/></g>`; });
  s+=`<text x="260" y="350" text-anchor="middle" font-size="18" fill="${B}"${at(2.5,"fade")}>내부 기획, 개발 조직과 협업</text>`;
  s+=`<text x="260" y="380" text-anchor="middle" font-size="18" fill="${B}"${at(2.6,"fade")}>미디어 실행 경험이 보고 프로덕트 기획으로</text></svg>`;
  DIAGRAMS.tf=s;
})();

const _c = x => Math.max(0, Math.min(1, x)), _e = x => 1 - Math.pow(1 - _c(x), 3);
const _b = x => { x = _c(x); const c = 1.8; return 1 + (c+1)*Math.pow(x-1,3) + c*Math.pow(x-1,2); };
function applyFx(e, x){ const p = _e(x);
  switch (e.dataset.fx){
    case "fade": e.style.opacity = p; break;
    case "pop": e.style.opacity = Math.min(1, _c(x)*2.5); e.style.transform = `scale(${.6 + .4*_b(x)})`; break;
    case "draw": e.style.strokeDashoffset = 1 - p; break;
    case "growx": e.style.transform = `scaleX(${p})`; break;
    case "growy": e.style.transform = `scaleY(${p})`; break;
    case "gap": e.style.opacity = Math.min(_e(x*4), 1 - _e((x - .75)*4)); break;
    case "wipe": e.style.clipPath = `inset(0 ${(1-p)*100}% 0 0 round 14px)`; break; } }
function playDiagram(root, btn){ const els = [...root.querySelectorAll("[data-t]")]; if (!els.length) return;
  const dur = Math.max(...els.map(e => +e.dataset.t + (+e.dataset.d || .45))) + .1, t0 = performance.now();
  cancelAnimationFrame(root._raf); els.forEach(e => applyFx(e, 0)); if (btn) btn.textContent = "재생 중";
  const frame = now => { const t = (now - t0)/1000; els.forEach(e => applyFx(e, (t - +e.dataset.t)/(+e.dataset.d || .45)));
    if (t < dur) root._raf = requestAnimationFrame(frame); else { els.forEach(e => applyFx(e, 1)); if (btn) btn.textContent = "다시 재생"; } };
  root._raf = requestAnimationFrame(frame); }
/* 사례별 인터랙션: 수치 없이 구조만, 문구는 확인된 사실만 */
const INTERACT = {
  gillette: {kind:"toggle", label:"성과가 높은 조합만 보기", cls:"only-hi"},
  pca:      {kind:"seg", opts:[["정리 전","before"],["정리 후",""]]},
  funnel:   {kind:"seg", opts:[["제안 전","before"],["제안 후",""]]},
  tab:      {kind:"note", opts:[
    ["자사 사용자","업그레이드하거나 신규 제품으로 바꾸는 자사 사용자는 디스플레이 크기와 품질, S펜 기능 개선 같은 요인이 뚜렷했습니다."],
    ["경쟁사 사용자","경쟁 태블릿에서 넘어오는 사용자는 가격이 더 큰 이유로 보였습니다. 하지만 가격만 말하면 프리미엄 이미지가 떨어져, DeX 환경, 상자에 기본 포함된 S펜, 안드로이드 환경을 더 강조했습니다."]]}
};
function addInteraction(root, key){ const it = INTERACT[key]; if (!it) return;
  const box = document.createElement("div"); box.className = "ctl"; box.setAttribute("role","group"); box.setAttribute("aria-label","도식 보기 방식");
  if (it.kind === "toggle"){ const b = document.createElement("button"); b.type = "button"; b.className = "seg"; b.textContent = it.label; b.setAttribute("aria-pressed","false");
    b.addEventListener("click", () => { const on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", String(on)); root.classList.toggle(it.cls, on); }); box.appendChild(b); }
  if (it.kind === "seg"){ it.opts.forEach(([lab,cls],i) => { const b = document.createElement("button"); b.type = "button"; b.className = "seg"; b.textContent = lab; b.setAttribute("aria-pressed", String(i === it.opts.length-1));
    b.addEventListener("click", () => { box.querySelectorAll(".seg").forEach(x => x.setAttribute("aria-pressed", String(x === b))); root.classList.toggle("before", cls === "before"); }); box.appendChild(b); }); }
  if (it.kind === "note"){ const note = document.createElement("p"); note.className = "dnote"; note.setAttribute("aria-live","polite");
    it.opts.forEach(([lab,txt],i) => { const b = document.createElement("button"); b.type = "button"; b.className = "seg"; b.textContent = lab; b.setAttribute("aria-pressed", String(i === 1));
      b.addEventListener("click", () => { box.querySelectorAll(".seg").forEach(x => x.setAttribute("aria-pressed", String(x === b))); note.textContent = txt; }); box.appendChild(b); });
    note.textContent = it.opts[1][1]; root.appendChild(box); root.appendChild(note); return; }
  root.appendChild(box); }

/* 업무 구분: 썸네일·도식 바탕색과 이름표. 도식 하나가 사례 하나에 대응 */
const DIAGRAM_GROUP = {gillette:"run", pg:"run", lg:"run", lgkr:"run", amore:"run",
  pca:"ana", gov:"ana", funnel:"ana", audit:"ana", bsm:"ana", tab:"ana",
  speed:"ax", ax:"ax", tf:"ax"};
const GROUP_NAME = {run:"미디어 실행·운영", ana:"분석·전략", ax:"분석 환경·AX"};
/* 남색 바탕(분석 환경·AX)용: 밝은 바탕 도식의 색을 바꿔 그림. 남색 상자는 흰 상자로, 그 안의 흰 글자는 남색으로 */
const DARK_SVG = {};
function diagramFor(key){
  const svg = DIAGRAMS[key]; if (!svg || DIAGRAM_GROUP[key] !== "ax") return svg || "";
  if (DARK_SVG[key]) return DARK_SVG[key];
  const N="#12263a", B="#3c4650", S="#e6ecf2", L="#b9c5d1";
  const swap = (tag, attr, map) => tag.replace(new RegExp(`${attr}="([^"]+)"`), (m, v) => map[v] ? `${attr}="${map[v]}"` : m);
  const out = svg.replace(/<(text|rect|circle|path|line)\b[^>]*>/g, tag => {
    if (tag.startsWith("<text")) return swap(tag, "fill", {[N]:"#fff", "#fff":N, [B]:"#c9d5e1"});
    tag = swap(tag, "fill", {[N]:"#fff", [S]:"#22405c", "#fff":"#1b3650", "#cfd8e1":"#2f4d6a"});
    return swap(tag, "stroke", {[N]:"#fff", [L]:"#5f7a95"});
  });
  return (DARK_SVG[key] = out);
}
