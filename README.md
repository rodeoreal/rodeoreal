# rodeoreal

로데오부동산 **공개 홈페이지**(sanggalab.com) 소스입니다. 저장소 맨 앞(루트)이 그대로 홈페이지로 배포됩니다.

| 경로 | 내용 |
|---|---|
| `index.html`, `about.html` | 홈, 사무소 소개 |
| `card/` | 모바일 웹명함 (sanggalab.com/card/). 전화·문자·카톡·지도 버튼, 연락처 저장(.vcf) |
| `assets/`, `images/` | 공통 스타일·스크립트, 사진 |
| `CNAME` | 연결 도메인 sanggalab.com (DNS는 클라우드플레어에서 관리) |
| `docs/site-README.md` | 홈페이지 구성 설명 |

- `main`에 push하면 GitHub Pages가 자동 배포합니다. `.nojekyll`로 파일을 그대로 올립니다.
- 저장소는 공개(public) 상태입니다.

---

예전 사내용 상가 물건 관리 화면(login/rental/sale 등)은 동작하지 않았고 로그인 정보가 소스에 보여서 2026-10-24 지웠습니다. 필요하면 git 기록(PR #18 이전)에서 찾을 수 있습니다. 지금 직원용 도구는 상가룩업(sanga-lookup.onrender.com)입니다.
