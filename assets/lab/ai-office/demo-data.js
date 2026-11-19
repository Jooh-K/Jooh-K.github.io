/* 예시 데이터: 실제 프로젝트, 에이전트, 모델 정보 없이 화면 구성만 재생합니다 */
(function(){
  var now = Date.now(), iso = function(t){ return new Date(t).toISOString(); };
  var cycle = Math.floor(now / 6000);
  var team = [
    ["lead","총괄 에이전트","사실 확인, 전략, 최종 판단","openai",null,"main"],
    ["sub-a1","자료 확인","원본 자료와 사실 대조","openai","lead","sub"],
    ["sub-a2","문장 검수","표현과 사실 범위 점검","openai","lead","sub"],
    ["sub-a3","경력 기획","사례 구성과 우선순위","openai","lead","sub"],
    ["sub-a4","관점 리뷰","채용 담당자 관점 검토","openai","lead","sub"],
    ["sub-a5","데이터 정리","수치와 기간 정리","openai","lead","sub"],
    ["sub-a6","화면 검수","출력물 확인","openai","lead","sub"],
    ["maker","제작 총괄","승인된 내용의 제작과 검증","anthropic",null,"main"],
    ["sub-b1","화면 제작","페이지와 영상 장면 제작","anthropic","maker","sub"],
    ["sub-b2","제작 검수","제작물 자체 검수","anthropic","maker","sub"],
    ["ext_draft","초안 지원","초안 작성 지원","google",null,"sub"]
  ];
  var works = ["사례 문장 다듬는 중","자료 대조 중","화면 구성 검토 중","도식 제작 중","수치 확인 중","검수 의견 정리 중"];
  var subs = team.filter(function(a){ return a[5] === "sub" && a[3] !== "google"; });
  var active = {lead: true, maker: true};
  for (var k = 0; k < 3; k++) active[subs[(cycle * 3 + k * 2) % subs.length][0]] = true;
  var agents = team.map(function(a, i){
    var on = !!active[a[0]];
    return {id: a[0] + "-demo", profile: a[0], name: a[1], role: a[2], color: a[3] === "openai" ? "green" : a[3] === "anthropic" ? "orange" : "gray",
      parent_id: a[4], level: a[5], work: on ? works[(cycle + i) % works.length] : "다음 작업 대기", detail: "예시 기록",
      task_id: "T0" + (i % 9 + 1), run_id: "R" + (100 + i), state: on ? "running" : "completed",
      model_display: "작업에 맞춘 모델", reasoning_display: "자동", reasoning: {}, reasoning_source: "demo", reasoning_confidence: "configured",
      provider: a[3], room: a[3] === "google" ? "external" : "main", connection_state: null, source: "native",
      execution_kind: on ? "native_live" : "native_completed", is_current: on, updated: iso(now - (on ? 1000 : 600000 + i * 60000)),
      last: iso(now - (on ? 1000 : 600000)), reporting: {}, progress: on ? "진행 중" : "완료", workflow: {}};
  });
  window.AI_DASHBOARD_DATA = {
    schema_version: 2, integration_version: "demo", project: {name: "경력 아카이브 제작 (예시)"}, generated: iso(now),
    agents: agents,
    planned_agents: [{id: "ext_research", profile: "ext_research", name: "리서치 (예정)", role: "공개 자료 수집", provider: "perplexity", room: "external",
      enabled: false, lifecycle: "planned", state: "planned", status_label: "예정", connection_state: "준비 중", billing_state: "준비 중",
      model_display: "준비 중", reasoning_display: "준비 중", work: "예정", account_usage_state: "준비 중", execution_kind: "planned_definition", is_current: false, run_id: null, updated: null}],
    configuration_snapshots: [], handoffs: [], tasks: [], runs: [], warnings: [],
    checks: {model_calls: false, heartbeat_ttl_sec: 15, template_present: true},
    reporting_schema_version: 1, workflow: {}, auto_resume: {jobs: [], connections: []}
  };
})();
