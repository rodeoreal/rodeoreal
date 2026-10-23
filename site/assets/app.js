// 로데오부동산 홈페이지 공통 스크립트
const OFFICE = {
  name: "로데오부동산(류재철)공인중개사사무소",
  ceo: "류재철",
  regNo: "다-34-2535",
  address: "경기도 고양시 덕양구 화신로272번길 38, 101호 (성보프라자 1층)",
  mobile: "010-8981-0202",
  office: "031-938-5555",
  kakao: "http://pf.kakao.com/_aiXNs/chat",
  requestForm: "https://rodeo-realty.netlify.app/",
  privacy: "https://rodeo-realty.netlify.app/privacy",
};

const NAV = [
  ["index.html", "홈"],
  ["listings.html", "매물 보기"],
  ["quick.html", "빠른거래"],
  ["about.html", "사무소 소개"],
];

const PYEONG = 3.3058;

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// 만원 단위 → "1억 5,000" / "3,500"
function won(v) {
  if (v === null || v === undefined || v === "") return "문의";
  const eok = Math.floor(v / 10000);
  const rest = v % 10000;
  if (eok && rest) return `${eok}억 ${rest.toLocaleString("ko-KR")}`;
  if (eok) return `${eok}억`;
  return v.toLocaleString("ko-KR");
}

function area(p) {
  if (!p) return "문의";
  return `${p}평 (${(p * PYEONG).toFixed(1)}㎡)`;
}

function premiumText(v) {
  if (v === 0) return "무권리";
  if (v === null || v === undefined) return "문의";
  return won(v);
}

function yesNo(v) {
  return v === true ? "가능" : v === false ? "불가" : "문의";
}

function tagHtml(tags) {
  return tags
    .map((t) => `<span class="tag ${t === "급매" ? "urgent" : t === "무권리" ? "free" : ""}">${esc(t)}</span>`)
    .join("");
}

function title(l) {
  return `${l.building} ${l.floor}층 ${l.propertyType}`;
}

function photoHtml(l, tags = true) {
  const img = l.photos && l.photos.length
    ? `<img src="${esc(l.photos[0])}" alt="${esc(title(l))} 사진" loading="lazy">`
    : `${esc(l.building)} ${l.floor}층<br><small style="font-weight:400;color:var(--muted)">사진 준비 중</small>`;
  return `<div class="card-photo${l.photos && l.photos.length ? "" : " no-photo"}" style="flex-direction:column;text-align:center">${img}${tags ? `<div class="card-tags">${tagHtml(l.tags)}</div>` : ""}</div>`;
}

function cardHtml(l) {
  const biz = l.business ? `현재 업종: ${esc(l.business)}` : l.vacant ? "현재 공실" : "";
  return `
  <article class="card">
    <a href="listing.html?id=${encodeURIComponent(l.id)}" aria-label="${esc(title(l))} 상세 보기">${photoHtml(l)}</a>
    <div class="card-body">
      <div class="card-meta">${esc(l.id)} · ${esc(l.dealType)} · ${esc(l.dong)}</div>
      <h3 class="card-title"><a href="listing.html?id=${encodeURIComponent(l.id)}">${esc(title(l))}</a></h3>
      <div class="price">보증금 ${won(l.deposit)} / 월세 ${won(l.rent)} <small>만원</small></div>
      <div class="card-spec">권리금 ${premiumText(l.premium)}${l.premium ? "만원" : ""} · 전용 ${area(l.area)}</div>
      <div class="card-spec">${biz}${biz && l.available ? " · " : ""}${l.available ? `입점 가능: ${esc(l.available)}` : ""}</div>
      ${l.description ? `<p class="card-desc">${esc(l.description)}</p>` : ""}
      <div class="card-actions">
        <a class="btn btn-pink" href="tel:${OFFICE.mobile.replace(/-/g, "")}" data-track="call_mobile" data-id="${esc(l.id)}">전화 문의</a>
        <a class="btn btn-kakao" href="${OFFICE.kakao}" target="_blank" rel="noopener" data-kakao="${esc(l.id)}">카카오 상담</a>
      </div>
    </div>
  </article>`;
}

let cache;
async function loadListings() {
  if (!cache) {
    const res = await fetch("data/listings.json", { cache: "no-cache" });
    cache = await res.json();
  }
  return cache;
}

function toast(msg) {
  let t = document.querySelector(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}

// 카카오 상담: 채팅창에 매물번호를 자동으로 넣을 수 없어서 먼저 복사해 둔다
document.addEventListener("click", (e) => {
  const a = e.target.closest("[data-kakao]");
  if (!a || !a.dataset.kakao) return;
  const id = a.dataset.kakao;
  if (navigator.clipboard) navigator.clipboard.writeText(`매물번호 ${id} 문의드립니다`).catch(() => {});
  toast(`매물번호 ${id} 복사됨. 채팅창에 붙여넣어 주세요`);
});

function renderChrome() {
  const here = location.pathname.split("/").pop() || "index.html";
  const navLinks = NAV.map(([href, label]) => `<a href="${href}"${href === here ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  document.body.insertAdjacentHTML("afterbegin", `
  <header class="site-header">
    <div class="wrap">
      <a class="brand" href="index.html"><b>로데오부동산</b><small>화정동 상가·점포 임대 매매 · 양도양수</small></a>
      <nav class="nav" aria-label="주 메뉴">${navLinks}</nav>
      <a class="header-call" href="tel:${OFFICE.mobile.replace(/-/g, "")}">${OFFICE.mobile}</a>
    </div>
    <nav class="subnav" aria-label="모바일 메뉴">${navLinks}</nav>
  </header>`);
  document.body.insertAdjacentHTML("beforeend", `
  <footer class="site-footer">
    <div class="wrap">
      <p><b>${OFFICE.name}</b></p>
      <p>대표 공인중개사 ${OFFICE.ceo} · 중개사무소 등록번호 ${OFFICE.regNo}</p>
      <p>${OFFICE.address}</p>
      <p>휴대폰 <a href="tel:${OFFICE.mobile.replace(/-/g, "")}">${OFFICE.mobile}</a> · 사무소 <a href="tel:${OFFICE.office.replace(/-/g, "")}">${OFFICE.office}</a> · <a href="${OFFICE.kakao}" target="_blank" rel="noopener">카카오 상담</a></p>
      <p>월~토 09:00~20:00 · 매주 일요일, 둘째·넷째 토요일 휴무 · 전화상담은 휴무일에도 가능</p>
      <p><a href="${OFFICE.privacy}" target="_blank" rel="noopener">개인정보 처리방침</a></p>
    </div>
  </footer>
  <nav class="bottom-bar" aria-label="빠른 문의">
    <a class="btn btn-pink" href="tel:${OFFICE.mobile.replace(/-/g, "")}">전화</a>
    <a class="btn btn-kakao" href="${OFFICE.kakao}" target="_blank" rel="noopener">카카오 상담</a>
    <a class="btn btn-line" href="${OFFICE.requestForm}" target="_blank" rel="noopener">조건 남기기</a>
  </nav>`);
}

function fill(sel, html) {
  const el = document.querySelector(sel);
  if (el) el.innerHTML = html;
}

function updatedText(data) {
  return `최종 갱신 ${data.updated} · 총 ${data.listings.length}건`;
}

const EMPTY = `<div class="empty">조건에 맞는 매물이 지금은 없습니다.<br>조건을 남겨 주시면 맞는 매물이 나올 때 연락드립니다.<br><br>
  <a class="btn btn-pink" href="${OFFICE.requestForm}" target="_blank" rel="noopener">조건 남기기</a></div>`;

const pages = {
  async home() {
    const data = await loadListings();
    const quick = data.listings.filter((l) => l.tags.length).slice(0, 6);
    // 빠른거래에 이미 나온 매물은 최근 등록에서 빼고, 남는 게 없으면 칸을 숨긴다
    const recent = data.listings.filter((l) => !quick.includes(l)).sort((a, b) => b.registered.localeCompare(a.registered)).slice(0, 6);
    fill("#quick-list", quick.length ? quick.map(cardHtml).join("") : EMPTY);
    if (recent.length) fill("#recent-list", recent.map(cardHtml).join(""));
    else document.querySelector("#recent-section").hidden = true;
    fill("#updated", updatedText(data));
  },

  async listings() {
    const data = await loadListings();
    const form = document.querySelector("#filters");
    const params = new URLSearchParams(location.search);
    for (const [k, v] of params) {
      const el = form.elements[k];
      if (!el) continue;
      if (el.type === "checkbox") el.checked = v === "1";
      else el.value = v;
    }
    const apply = () => {
      const f = Object.fromEntries(new FormData(form));
      const floor = f.floor;
      let list = data.listings.filter((l) => {
        if (floor === "1" && l.floor !== 1) return false;
        if (floor === "2" && l.floor !== 2) return false;
        if (floor === "3" && !(l.floor >= 3)) return false;
        if (f.maxDeposit && l.deposit > Number(f.maxDeposit)) return false;
        if (f.maxRent && l.rent > Number(f.maxRent)) return false;
        if (f.minArea && !(l.area >= Number(f.minArea))) return false;
        if (f.free && l.premium !== 0) return false;
        if (f.urgent && !l.tags.includes("급매")) return false;
        return true;
      });
      const sorters = {
        recent: (a, b) => b.registered.localeCompare(a.registered),
        rent: (a, b) => a.rent - b.rent,
        deposit: (a, b) => a.deposit - b.deposit,
        area: (a, b) => b.area - a.area,
      };
      list.sort(sorters[f.sort] || sorters.recent);
      fill("#count", `${list.length}건`);
      fill("#list", list.length ? list.map(cardHtml).join("") : EMPTY);
      const q = new URLSearchParams();
      for (const [k, v] of Object.entries(f)) if (v && !(k === "sort" && v === "recent")) q.set(k, v === "on" ? "1" : v);
      history.replaceState(null, "", q.toString() ? `?${q}` : location.pathname);
    };
    form.addEventListener("input", apply);
    form.addEventListener("reset", () => setTimeout(apply));
    fill("#updated", updatedText(data));
    apply();
  },

  async quick() {
    const data = await loadListings();
    const tabs = document.querySelectorAll("[data-tab]");
    const show = (tab) => {
      tabs.forEach((t) => t.setAttribute("aria-current", t.dataset.tab === tab ? "page" : "false"));
      const list = data.listings.filter((l) => (tab === "전체" ? l.tags.length : l.tags.includes(tab)));
      fill("#list", list.length ? list.map(cardHtml).join("") : EMPTY);
    };
    tabs.forEach((t) => t.addEventListener("click", (e) => { e.preventDefault(); show(t.dataset.tab); }));
    fill("#updated", updatedText(data));
    show("전체");
  },

  async detail() {
    const data = await loadListings();
    const id = new URLSearchParams(location.search).get("id");
    const l = data.listings.find((x) => x.id === id);
    if (!l) {
      fill("#detail", `<div class="empty">거래가 완료됐거나 내려간 매물입니다.<br><br><a class="btn btn-pink" href="listings.html">다른 매물 보기</a></div>`);
      return;
    }
    document.title = `${title(l)} | 로데오부동산`;
    const photos = l.photos.length
      ? l.photos.map((p) => `<div class="card-photo"><img src="${esc(p)}" alt="${esc(title(l))} 사진" loading="lazy"></div>`).join("")
      : photoHtml(l, false);
    const rows = [
      ["매물번호", l.id],
      ["거래 형태", l.dealType],
      ["매물 종류", l.propertyType],
      ["소재지", `고양시 덕양구 ${l.dong} (${l.building})`],
      ["해당 층", `${l.floor}층`],
      ["전용면적", area(l.area)],
      ["보증금", `${won(l.deposit)}만원`],
      ["월세", `${won(l.rent)}만원`],
      ["관리비", l.maintenance ? `${won(l.maintenance)}만원` : "문의"],
      ["권리금", l.premium ? `${won(l.premium)}만원` : premiumText(l.premium)],
      ["현재 업종", l.business || (l.vacant ? "공실" : "문의")],
      ["업종 제한", l.restriction ? `${l.restriction} 제한` : "없음"],
      ["입점 가능일", l.available || "문의"],
      ["도로변", l.roadside === true ? "도로변" : l.roadside === false ? "도로변 아님" : "문의"],
      ["주차", yesNo(l.parking)],
      ["엘리베이터", l.elevator === true ? "있음" : l.elevator === false ? "없음" : "문의"],
      ["총 층수 · 사용승인일 · 방향", "문의"],
      ["등록일", l.registered],
    ].map(([k, v]) => `<tr><th>${k}</th><td>${esc(v)}</td></tr>`).join("");
    fill("#detail", `
      <div class="detail-grid">
        <div>
          <div class="gallery">${photos}</div>
        </div>
        <div>
          <div class="card-tags" style="position:static;margin-bottom:8px">${tagHtml(l.tags)}</div>
          <h1>${esc(title(l))}</h1>
          <div class="price" style="font-size:22px">보증금 ${won(l.deposit)} / 월세 ${won(l.rent)} <small>만원</small></div>
          <p class="card-spec">권리금 ${l.premium ? `${won(l.premium)}만원` : premiumText(l.premium)} · 전용 ${area(l.area)}</p>
          ${l.description ? `<p>${esc(l.description)}</p>` : ""}
          <div class="ask-box">
            <p>이 매물은 <span class="id">${esc(l.id)}</span> 번으로 문의해 주세요.</p>
            <div class="btn-row">
              <a class="btn btn-pink" href="tel:${OFFICE.mobile.replace(/-/g, "")}">전화 ${OFFICE.mobile}</a>
              <a class="btn btn-kakao" href="${OFFICE.kakao}" target="_blank" rel="noopener" data-kakao="${esc(l.id)}">카카오 상담</a>
              <a class="btn btn-line" href="tel:${OFFICE.office.replace(/-/g, "")}">사무소 ${OFFICE.office}</a>
            </div>
          </div>
        </div>
      </div>
      <h2 style="margin-top:32px">매물 정보</h2>
      <table class="spec">${rows}</table>
      <p class="note">표시된 금액과 조건은 등록일 기준이며, 계약 전 현장과 서류로 다시 확인해 안내드립니다.</p>`);
    const similar = data.listings.filter((x) => x.id !== l.id).sort((a, b) => Math.abs(a.area - l.area) - Math.abs(b.area - l.area)).slice(0, 3);
    fill("#similar", similar.map(cardHtml).join(""));
  },
};

renderChrome();
const page = document.body.dataset.page;
if (pages[page]) {
  pages[page]().catch(() => {
    const msg = '<div class="empty">매물 정보를 불러오지 못했습니다. 잠시 후 다시 열어 주세요.</div>';
    ["#list", "#detail", "#quick-list", "#recent-list"].forEach((s) => fill(s, msg));
  });
}
