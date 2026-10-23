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
  return tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("");
}

function title(l) {
  return `${l.building} ${l.floor}층 ${l.propertyType}`;
}

function photoHtml(l) {
  if (l.photos && l.photos.length) {
    return l.photos.map((p) => `<div class="photo has-img"><img src="${esc(p)}" alt="${esc(title(l))} 사진" loading="lazy"></div>`).join("");
  }
  return `<div class="photo">사진 준비 중입니다. 현장 사진은 상담 때 보여 드립니다.</div>`;
}

function priceText(l) {
  return `${won(l.deposit)} / ${won(l.rent)}`;
}

// 매물 한 줄 (PC는 표, 휴대폰은 카드처럼 쌓임)
function rowHtml(l) {
  const href = `listing.html?id=${encodeURIComponent(l.id)}`;
  const thumb = l.photos && l.photos.length ? `<img src="${esc(l.photos[0])}" alt="" loading="lazy">` : "";
  const avail = l.available || "문의";
  const desc = l.description || (l.business ? `현재 업종: ${l.business}` : l.vacant ? "현재 공실" : "");
  return `
  <a class="row" href="${href}" aria-label="${esc(l.id)} ${esc(title(l))} 자세히 보기">
    <span class="c-top"><span class="c-id">${esc(l.id)}</span>${tagHtml(l.tags)}<span class="c-avail">입점 ${esc(avail)}</span></span>
    <span class="c-main">
      <span class="c-place">${thumb}${esc(l.building)} ${l.floor}층</span>
      ${l.tags.length ? `<span class="c-tags">${tagHtml(l.tags)}</span>` : ""}
      ${desc ? `<span class="c-desc">${esc(desc)}</span>` : ""}
    </span>
    <span class="c-price m">${l.area ? `${l.area}평 · ` : ""}보증금/월세 <b>${priceText(l)}</b> · 권리금 ${premiumText(l.premium)}</span>
    <span class="c-cell">${area(l.area)}</span>
    <span class="c-cell strong">${priceText(l)}</span>
    <span class="c-cell">${premiumText(l.premium)}</span>
    <span class="c-cell">${esc(avail)}</span>
    <span class="c-go">자세히</span>
  </a>`;
}

function ledgerHtml(list) {
  return `<div class="ledger">
    <div class="ledger-head" aria-hidden="true"><span>매물번호</span><span>위치 · 층</span><span>전용면적</span><span>보증금 / 월세</span><span>권리금</span><span>입점</span><span></span></div>
    ${list.map(rowHtml).join("")}
  </div>
  <p class="ledger-foot">가격 단위 만원 · 호수와 상세 위치는 상담 때 안내합니다.</p>`;
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
  const navLinks = NAV.filter(([href]) => href !== "index.html")
    .map(([href, label]) => `<a href="${href}"${href === here ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  const tel = (n) => `tel:${n.replace(/-/g, "")}`;
  document.body.insertAdjacentHTML("afterbegin", `
  <header class="site-header">
    <div class="wrap">
      <a class="brand" href="index.html"><img src="images/logo-mark.webp" alt="" width="48" height="48"><span><b>로데오부동산</b><small>화정동 상가 · 점포 전문 중개</small></span></a>
      <nav class="nav" aria-label="주 메뉴">${navLinks}<a href="${OFFICE.requestForm}" target="_blank" rel="noopener">조건 남기기</a></nav>
      <a class="header-call" href="${tel(OFFICE.mobile)}">${OFFICE.mobile}</a>
    </div>
    <nav class="subnav" aria-label="모바일 메뉴">${navLinks}</nav>
  </header>`);
  document.body.insertAdjacentHTML("beforeend", `
  <footer class="site-footer">
    <div class="wrap">
      <div class="col">
        <b>${OFFICE.name}</b>
        <p>대표 공인중개사 ${OFFICE.ceo} · 중개사무소 등록번호 ${OFFICE.regNo}</p>
        <p>${OFFICE.address}</p>
        <p>휴대폰 <a href="${tel(OFFICE.mobile)}">${OFFICE.mobile}</a> · 사무소 <a href="${tel(OFFICE.office)}">${OFFICE.office}</a> · <a href="${OFFICE.kakao}" target="_blank" rel="noopener">카카오 상담</a></p>
      </div>
      <div class="col hours">
        <b>영업시간</b>
        <p>월~토 09:00~20:00</p>
        <p>매주 일요일, 둘째·넷째 토요일 휴무</p>
        <p>전화상담은 휴무일에도 가능</p>
        <p style="margin-top:8px"><a href="${OFFICE.privacy}" target="_blank" rel="noopener">개인정보 처리방침</a></p>
      </div>
    </div>
  </footer>
  <nav class="bottom-bar" aria-label="빠른 문의">
    <a class="btn btn-dark" href="${tel(OFFICE.mobile)}">전화</a>
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
  <a class="btn btn-dark" href="${OFFICE.requestForm}" target="_blank" rel="noopener">조건 남기기</a></div>`;

const pages = {
  async home() {
    const data = await loadListings();
    const quick = data.listings.filter((l) => l.tags.length).slice(0, 6);
    // 빠른거래에 이미 나온 매물은 최근 등록에서 빼고, 남는 게 없으면 칸을 숨긴다
    const recent = data.listings.filter((l) => !quick.includes(l)).sort((a, b) => b.registered.localeCompare(a.registered)).slice(0, 6);
    fill("#quick-list", quick.length ? ledgerHtml(quick) : EMPTY);
    if (recent.length) fill("#recent-list", ledgerHtml(recent));
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
      fill("#list", list.length ? ledgerHtml(list) : EMPTY);
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
      fill("#list", list.length ? ledgerHtml(list) : EMPTY);
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
      fill("#detail", `<div class="empty">거래가 완료됐거나 내려간 매물입니다.<br><br><a class="btn btn-dark" href="listings.html">다른 매물 보기</a></div>`);
      return;
    }
    document.title = `${title(l)} | 로데오부동산`;
    const specs = [
      ["거래 형태", l.dealType],
      ["매물 종류", l.propertyType],
      ["소재지", `고양시 덕양구 ${l.dong} (${l.building})`],
      ["해당 층", `${l.floor}층`],
      ["전용면적", area(l.area)],
      ["관리비", l.maintenance ? `월 ${won(l.maintenance)}만원` : "문의"],
      ["현재 업종", l.business || (l.vacant ? "공실" : "문의")],
      ["업종 제한", l.restriction ? `${l.restriction} 제한` : "없음"],
      ["입점 가능일", l.available || "문의"],
      ["도로변", l.roadside === true ? "도로변" : l.roadside === false ? "도로변 아님" : "문의"],
      ["주차", yesNo(l.parking)],
      ["엘리베이터", l.elevator === true ? "있음" : l.elevator === false ? "없음" : "문의"],
      ["총 층수 · 사용승인일 · 방향", "문의"],
      ["등록일", l.registered],
    ].map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("");
    const premium = l.premium ? `${won(l.premium)}만원` : premiumText(l.premium);
    fill("#detail", `
      <p class="crumbs"><a href="index.html">홈</a> / <a href="listings.html">매물 보기</a> / ${esc(l.id)}</p>
      <div class="detail-grid">
        <div class="detail-main">
          <div class="gallery">${photoHtml(l)}</div>
          <div class="detail-tags"><span class="c-id">${esc(l.id)}</span>${tagHtml(l.tags)}${l.available === "즉시" ? '<span class="tag solid">즉시 입점 가능</span>' : ""}</div>
          <h1>${esc(l.dong)} ${esc(title(l))}</h1>
          ${l.description ? `<p class="desc">${esc(l.description)}</p>` : '<p class="desc"></p>'}
          <h2>매물 정보</h2>
          <dl class="spec">${specs}</dl>
          <h2>중개사무소 정보</h2>
          <p class="office-box">${OFFICE.name} · 대표 공인중개사 ${OFFICE.ceo} · 등록번호 ${OFFICE.regNo} · ${OFFICE.address} · ${OFFICE.office}</p>
          <p class="note">표시된 금액과 조건은 등록일 기준이며, 계약 전 현장과 서류로 다시 확인해 안내드립니다.</p>
        </div>
        <aside class="detail-side" aria-label="가격과 문의">
          <p class="side-label">보증금 / 월세 (만원)</p>
          <p class="side-price">${priceText(l)}</p>
          <div class="side-sub">
            <div><p class="side-label">권리금</p><p>${premium}</p></div>
            <div><p class="side-label">관리비</p><p>${l.maintenance ? `${won(l.maintenance)}만원` : "문의"}</p></div>
          </div>
          <p style="margin:0">문의하실 때 <b>매물번호 ${esc(l.id)}</b>를 말씀해 주세요.</p>
          <div class="side-actions">
            <a class="btn btn-dark" href="tel:${OFFICE.mobile.replace(/-/g, "")}">전화 ${OFFICE.mobile}</a>
            <a class="btn btn-kakao" href="${OFFICE.kakao}" target="_blank" rel="noopener" data-kakao="${esc(l.id)}">카카오로 문의</a>
            <a class="btn btn-line" href="tel:${OFFICE.office.replace(/-/g, "")}">사무소 ${OFFICE.office}</a>
          </div>
          <p class="note" style="margin:16px 0 0">월~토 09:00~20:00 · 전화상담은 휴무일에도 가능 · 방문 시 1시간 30분 무료 주차</p>
        </aside>
      </div>`);
    const similar = data.listings.filter((x) => x.id !== l.id).sort((a, b) => Math.abs(a.area - l.area) - Math.abs(b.area - l.area)).slice(0, 3);
    fill("#similar", ledgerHtml(similar));
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
