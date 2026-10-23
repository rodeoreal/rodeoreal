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
  ["about.html", "사무소 소개"],
  ["index.html#notes", "상가 정보"],
  ["index.html#visit", "오시는 길"],
];

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

renderChrome();
