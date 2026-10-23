# 로데오부동산 공개 홈페이지 (`site/`)

정적 HTML/CSS/JS. 빌드 도구 없음. 모든 경로가 상대경로라 GitHub Pages(`/rodeoreal/site/`)와 Netlify(`site/`를 배포 폴더로 지정) 어디서나 동작한다.

- `index.html` 홈 / `listings.html` 매물 목록·필터 / `listing.html?id=R-001` 매물 상세 / `quick.html` 빠른거래(메뉴에서 뺌, 주소로만 접속) / `about.html` 사무소 소개
- `data/listings.json` 공개 매물 데이터
- 조건 등록 폼과 개인정보 처리방침은 기존 랜딩(rodeo-realty.netlify.app)을 링크한다.

## 매물 갱신

1. 구글시트 "로데오 공개매물" → `공개매물` 탭을 CSV로 받는다.
2. `python3 scripts/build_listings.py 공개매물.csv`
3. `site/data/listings.json` 변경분을 커밋해 `main`에 반영하면 GitHub Pages가 자동 배포한다.

공개(Y) 줄만, 계약완료가 아닌 줄만 들어간다. 지번·호수·임대인 연락처·괄호메모(상호)는 JSON에 넣지 않는다. 기획서: `docs/homepage-plan.md`.
