# 로데오부동산 공개 홈페이지 (`site/`)

정적 HTML/CSS/JS. 빌드 도구 없음. 모든 경로가 상대경로라 GitHub Pages(`/rodeoreal/site/`)와 Netlify(`site/`를 배포 폴더로 지정) 어디서나 동작한다.

- `index.html` 홈: 신뢰 → 전화 유도(로데오거리 사진, 창업/양도/건물주 안내, 대표 소개, 상가랩 블로그 글, 오시는 길). 스타일은 파일 안에 있다.
- `about.html` 사무소 소개: 공통 머리말·바닥글은 `assets/app.js`, 스타일은 `assets/style.css`.
- 조건 등록 폼과 개인정보 처리방침은 기존 랜딩(rodeo-realty.netlify.app)을 링크한다.

## 매물

2026-10-23 매물 목록은 내렸다(건물명 노출, 임대만 보이는 문제). 다시 올릴 땐 건물명 없이 위치·층·평수로 쓰고 매매·양도양수도 넣는다. 예전 목록 코드는 git 기록(PR #9 시점)과 `scripts/build_listings.py`에 있다.

## 상가 정보 카드

홈의 블로그 글 4개는 `index.html`에 직접 적혀 있다. 새 글이 올라오면 제목·날짜·주소를 바꾼다.
