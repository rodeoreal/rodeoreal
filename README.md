# rodeoreal

화정동로데오부동산 **상가 물건 관리 시스템**(사내용) 정적 웹 소스입니다.
고객용 랜딩페이지(rodeo-realty.netlify.app)의 소스는 이 저장소에 없습니다.

> 이 문서는 2026-10-23 기준 `main` 브랜치(커밋 `a546b03`) 내용을 확인해 작성했습니다.

## 구성

| 경로 | 내용 |
|---|---|
| `login.html` | 로그인 화면 (계정은 페이지 안 스크립트에 하드코딩) |
| `index.html` | 대시보드 |
| `rental.html` | 임대 물건 관리 |
| `sale.html` | 매매 물건 관리 (수익률 계산기 포함) |
| `customers.html` | 손님(내방) 관리 |
| `settings.html` | 설정 (관리자 전용 메뉴) |
| `css/common.css` | 공통 스타일 |
| `js/common.js` | 세션·인증·API 호출 공통 유틸리티 |
| `js/rental.js`, `js/sales.js`, `js/customers.js`, `js/settings.js` | 화면별 스크립트 |
| `images/logo.png` | 로고 |

- 빌드 도구, 패키지 설정(`package.json` 등), 서버 코드는 없습니다. HTML/CSS/JS 파일 그대로 배포됩니다.
- 외부 리소스: Font Awesome 6.4.0 (jsDelivr CDN).
- 데이터 API: `js/common.js`는 현재 페이지 경로 기준 `tables/` 하위로 `fetch` 요청을 보냅니다. 이 저장소에는 `tables/`를 처리하는 서버가 없습니다.
- 로그인 상태는 브라우저 `sessionStorage`에만 저장됩니다.

## 배포

- GitHub Pages가 켜져 있고, `main` 브랜치에 push하면 GitHub의 기본 워크플로 "pages build and deployment"가 자동 실행됩니다. 별도 워크플로 파일은 없습니다.
- HTML의 리소스 경로가 `/rodeoreal/...`로 되어 있어 프로젝트 사이트 주소(`https://rodeoreal.github.io/rodeoreal/`)를 전제로 합니다. 다른 경로나 도메인으로 옮기면 경로를 함께 바꿔야 합니다.
- 저장소는 공개(public) 상태입니다.

## 메타데이터

- 모든 페이지에 `charset`, `viewport`, `<title>`만 있습니다.
- 카카오톡·SNS 링크 미리보기용 Open Graph 태그(`og:title`, `og:description`, `og:image` 등)는 없습니다.

## 확인된 문제 (수정 전)

- `js/*.js`, `css/common.css` 파일 내용 각 줄 앞에 줄 번호와 탭(`1\t`, `2\t` …)이 붙어 있어 브라우저에서 정상 동작하지 않습니다.
- `customers.html`: 로고 `<img>` 태그가 깨져 있고, `<scriptsrc=...>`처럼 공백이 빠져 스크립트가 로드되지 않습니다.
- `settings.html`: 로고 태그가 `<img rc=...>`로 되어 있어 이미지가 표시되지 않습니다.
- `rental.html`: 스크립트 경로가 `/rodeoreal/js/common/js//common.js`, `/rodeoreal/js/rental.js"/rental.js"`로 잘못되어 있습니다.
- `sale.html`: `<script src="/rodeoreal/images/logo.png">`로 로고를 스크립트로 불러오고, `common.js`는 불러오지 않으며, 존재하지 않는 `js/sale.js`를 참조합니다(실제 파일은 `js/sales.js`).
- `login.html`: 계정 이메일·비밀번호가 화면과 소스에 그대로 노출되어 있고, 인증이 브라우저 안에서만 이루어집니다. 공개 저장소·공개 사이트이므로 실제 업무 데이터를 넣기 전에 인증 방식을 바꿔야 합니다.
