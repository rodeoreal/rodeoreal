#!/usr/bin/env python3
"""검색 키워드별 안내 페이지(rent.html, listings.html, sale.html)를 만듭니다.

- 2026-11-05 네이버 관련검색어(화정동 상가 월세 / 화정동 상가매물 / 화정동상가매매)를 겨냥한 페이지.
- 공통 머리말·바닥글은 assets/app.js, 스타일은 assets/style.css (about.html과 같은 방식).
- 내용을 고칠 땐 이 파일의 PAGES를 고친 뒤 `python3 scripts/make_keyword_pages.py` 실행.
- 법 조문은 2026-11-05 현행 기준으로 확인함. 법이 바뀌면 같이 고칠 것.
"""
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = "https://sanggalab.com/"
MAEMUL = "https://maemul.sanggalab.com/"

LAW_NOTE = "법 조문은 2026년 11월 현행 기준입니다. 실제 적용은 계약 내용과 사실관계에 따라 달라질 수 있어, 계약 전에 함께 확인합니다."

PAGES = [
    {
        "file": "rent.html",
        "title": "화정동 상가 월세 | 화정역 상가 임대, 무권리 매물 - 로데오부동산",
        "desc": "고양시 화정동 상가 월세(임대) 상담. 화정역·화정로데오거리 1층 점포부터 대형 평수, 무권리 상가까지. 계약 전 확인할 것과 임차인 보호 규정 정리. 010-8981-0202",
        "eyebrow": "화정동 상가 월세 · 임대",
        "h1": "화정동 상가 월세,<br>계약 전에 확인할 것까지 함께 봅니다",
        "sub": "화정역·화정로데오거리 중심상업지에서 2005년부터 상가·점포 임대를 중개하고 있습니다. 지금 나와 있는 월세 매물은 급매물 페이지에서 매주 갱신합니다.",
        "sections": [
            ("features", "화정동 상가 임대, 이렇게 안내합니다", [
                ("1층 점포", "로데오거리 메인 라인과 화정역 광장, 대로변 1층 점포를 안내합니다. 소형 평수 판매점부터 음식점 자리까지 있습니다."),
                ("2층 이상·대형 평수", "병의원, 학원, 휘트니스·필라테스처럼 넓은 면적이 필요한 업종에 맞는 2층 이상 매물을 안내합니다."),
                ("무권리 상가", "권리금 없이 들어갈 수 있는 자리도 나옵니다. 나오는 시기가 일정하지 않아 조건을 남겨 두시면 먼저 연락드립니다."),
                ("양도양수", "영업 중인 가게를 시설과 함께 넘겨받는 매물도 있습니다. 권리금과 시설 인수 범위를 계약 전에 정리합니다."),
            ]),
            ("table", "월세 계약 전에 확인할 것", [
                ("월 부담 총액", "월세만 보지 않고 관리비, 부가세 별도 여부까지 합쳐서 봅니다. 부가세 별도인지는 계약서에 적습니다."),
                ("업종 가능 여부", "건축물대장의 용도와 건물 관리규약의 업종 제한을 확인합니다. 음식점, 학원, 병의원은 용도와 면적 조건이 업종마다 다릅니다."),
                ("권리금과 시설", "무권리인지, 기존 시설을 인수하는지 철거하는지, 원상복구 범위가 어디까지인지 정합니다."),
                ("입점 시기", "입점 가능 날짜와 인테리어 공사 기간의 월세 처리를 계약 전에 협의합니다."),
                ("등기부 권리관계", "등기사항전부증명서로 근저당 등 선순위 권리를 확인하고 보증금 규모와 비교합니다."),
            ]),
            ("table", "임차인 보호 규정 (상가건물 임대차보호법)", [
                ("계약갱신요구권", "임차인은 계약 만료 6개월 전부터 1개월 전까지 갱신을 요구할 수 있고, 최초 계약을 포함한 전체 기간 10년 범위에서 행사할 수 있습니다. (법 제10조 제1항·제2항) 보증금 규모와 관계없이 적용됩니다. (법 제2조 제3항)"),
                ("권리금 회수기회 보호", "임대인은 계약 만료 6개월 전부터 종료 시까지 임차인이 주선한 신규임차인에게서 권리금을 받는 것을 방해할 수 없습니다. (법 제10조의4) 이 규정도 보증금 규모와 관계없이 적용됩니다."),
                ("월세 증액 상한", "보증금·월세 증액 청구는 청구 당시 금액의 5%를 넘지 못합니다. (법 제11조, 시행령 제4조) 다만 이 상한은 환산보증금이 기준 이하인 계약에만 적용됩니다."),
                ("환산보증금 기준", "환산보증금은 보증금 + 월세×100입니다. 고양시는 수도권정비계획법상 과밀억제권역이라 기준이 6억9천만 원입니다. (시행령 제2조, 수도권정비계획법 시행령 별표1) 예: 보증금 5,000만 원, 월세 300만 원이면 3억5천만 원."),
            ]),
        ],
        "law_note": True,
        "faq": [
            ("화정동에서 권리금 없는(무권리) 상가를 구할 수 있나요?", "무권리 상가도 나옵니다. 다만 나오는 시기와 위치가 일정하지 않아, 급매물 페이지에 업종·예산·원하는 위치를 남겨 주시면 맞는 매물이 나올 때 먼저 연락드립니다."),
            ("상가 임대 중개수수료(중개보수)는 얼마인가요?", "상가·점포·사무실 중개보수는 거래금액의 0.9% 이내에서 협의해 정합니다. 임대는 보증금에 월세×100을 더한 금액을 거래금액으로 보고, 그 합이 5,000만 원 미만이면 월세×70으로 계산합니다. 금액은 계약 전에 먼저 안내해 드립니다."),
            ("화정동 상가를 임대로 내놓으려면 어떻게 하나요?", "전화(010-8981-0202, 031-938-5555)나 카카오채널로 상가 위치, 원하는 보증금·월세, 입점 가능한 시기를 알려 주시면 됩니다. 맞는 업종의 임차인을 찾아 연결하고, 특약까지 정리해 계약합니다."),
        ],
    },
    {
        "file": "listings.html",
        "title": "화정동 상가매물 | 급매·무권리·양도양수 매물 모음 - 로데오부동산",
        "desc": "고양시 덕양구 화정동 상가매물. 1층, 2층 이상·지하, 양도양수로 나눠 매주 갱신하는 급매물 페이지와 온라인에 올리지 않은 매물 조건 등록 안내.",
        "eyebrow": "화정동 상가매물",
        "h1": "화정동 상가매물,<br>매주 갱신해서 올립니다",
        "sub": "급매, 무권리, 양도양수 추천 매물을 골라 급매물 페이지에 올립니다. 온라인에 올리지 않은 매물도 있어 조건을 남겨 주시면 함께 찾아 드립니다.",
        "sections": [
            ("features", "매물은 이렇게 나눠 보여 드립니다", [
                ("1층", "급매와 무권리 매물 중 1층 자리만 모았습니다."),
                ("2층 이상·지하", "넓은 면적이 필요한 업종에 맞는 1층이 아닌 자리입니다."),
                ("양도양수", "운영 중인 가게를 이어받아 바로 영업할 수 있는 매물입니다. 층과 관계없이 모았습니다."),
            ]),
            ("table", "매물 정보 읽는 법", [
                ("면적", "전유면적 기준입니다. 계약면적(공용면적 포함)과 다르니 비교할 때 같은 기준으로 봅니다."),
                ("가격", "보증금·월세·권리금은 만원 단위입니다. 관리비와 부가세 별도 여부는 매물마다 따로 확인합니다."),
                ("무권리", "권리금이 없는 매물입니다. 기존 시설 철거와 원상복구 조건은 따로 확인합니다."),
                ("양도양수", "영업 중인 가게를 시설·영업과 함께 넘겨받는 매물로, 권리금이 있습니다."),
            ]),
            ("table", "현장 확인 때 같이 보는 서류", [
                ("등기사항전부증명서", "소유자, 근저당·가압류 등 권리관계"),
                ("건축물대장", "용도(근린생활시설 종류 등)와 위반건축물 표시 여부"),
                ("임대 조건", "관리비 항목, 입점 시기, 원상복구 범위, 업종 제한"),
            ]),
        ],
        "law_note": False,
        "faq": [
            ("급매물 페이지 매물은 얼마나 자주 바뀌나요?", "매주 갱신합니다. 페이지 맨 위에 최근 업데이트 날짜가 표시됩니다."),
            ("원하는 조건의 매물이 페이지에 없으면요?", "급매물 페이지 아래 조건 남기기에 업종, 예산, 원하는 위치를 적어 주시거나 전화 주세요. 온라인에 올리지 않은 매물까지 찾아 연락드립니다."),
            ("화정동 말고 다른 지역 상가도 안내하나요?", "화정역·화정로데오거리 일대 상가를 중심으로 중개합니다. 인근 지역은 전화로 문의해 주세요."),
        ],
    },
    {
        "file": "sale.html",
        "title": "화정동 상가매매 | 상가 매수·매도 상담 - 로데오부동산",
        "desc": "고양시 화정동 상가매매 상담. 매수 전 임대 현황, 수익률, 건축물대장·등기부, 부가세까지 확인합니다. 화정동 상가 매도 의뢰도 받습니다. 010-8981-0202",
        "eyebrow": "화정동 상가매매",
        "h1": "화정동 상가 매매,<br>임대 현황부터 확인합니다",
        "sub": "화정역·화정로데오거리 일대 상가 매매를 상담합니다. 예산과 원하는 층·업종·임대 수익 조건을 알려 주시면 맞는 물건을 안내합니다.",
        "sections": [
            ("table", "매수 전에 확인할 것", [
                ("임대 현황", "현재 임차인의 보증금·월세·계약 만료일과 업종. 임차인은 전체 10년 범위에서 계약갱신요구권이 있어 매수 후에도 계약이 이어질 수 있습니다. (상가건물 임대차보호법 제10조)"),
                ("수익률", "연 월세 ÷ (매매가 − 보증금)으로 먼저 봅니다. 예: 매매가 10억 원, 보증금 1억 원, 월세 400만 원이면 연 4,800만 ÷ 9억 = 약 5.3%. 대출 이자, 세금, 공실 기간은 따로 반영합니다."),
                ("건축물대장", "용도와 위반건축물 표시 여부. 위반건축물이면 이행강제금 부담과 대출 제한이 생길 수 있습니다."),
                ("등기부 권리관계", "근저당, 가압류, 가처분 등 말소할 권리와 승계할 권리를 구분합니다."),
                ("부가세", "상가 건물분에는 부가세가 붙습니다. 임대사업을 그대로 넘기는 사업양도에 해당하면 재화의 공급으로 보지 않습니다. (부가가치세법 제10조 제9항 제2호) 요건은 세무사와 함께 확인합니다."),
            ]),
            ("table", "매도를 맡기실 때 알려 주실 것", [
                ("물건", "상가 위치(건물명·호수), 층, 면적"),
                ("가격", "희망 매매가"),
                ("임대 상황", "보증금·월세·계약 기간, 현재 업종"),
            ]),
        ],
        "law_note": True,
        "faq": [
            ("화정동 상가 매매는 어디서 상담받을 수 있나요?", "로데오부동산에서 화정동 일대 상가 매매를 상담합니다. 예산과 원하는 층·업종·임대 수익 조건을 알려 주시면 맞는 물건을 안내하고, 매수 전에 임차인 계약 내용과 건축물 용도를 함께 확인합니다."),
            ("화정동 상가를 팔려고 하는데 어떻게 의뢰하나요?", "전화나 카카오채널로 상가 위치와 희망 가격, 현재 임대 상황(보증금·월세·계약 기간)을 알려 주시면 됩니다. 주변 거래 사례를 바탕으로 가격을 함께 검토하고, 매수자를 찾아 계약까지 진행합니다."),
            ("상가 매매 중개보수는 얼마인가요?", "상가 매매 중개보수는 거래금액의 0.9% 이내에서 협의해 정합니다. 금액은 계약 전에 먼저 안내해 드립니다."),
        ],
    },
]

RELATED = [
    ("rent.html", "화정동 상가 월세"),
    ("listings.html", "화정동 상가매물"),
    ("sale.html", "화정동 상가매매"),
]

e = html.escape


def render_section(kind, heading, rows, alt):
    out = [f'<section{" class=\"alt\"" if alt else ""}>', '  <div class="wrap">', f'    <h2 style="margin-bottom:24px">{e(heading)}</h2>']
    if kind == "features":
        out.append('    <div class="features">')
        for h, p in rows:
            out.append(f'      <div class="feature"><h3>{e(h)}</h3><p>{e(p)}</p></div>')
        out.append("    </div>")
    else:
        out.append('    <table class="info">')
        for h, p in rows:
            out.append(f"      <tr><th>{e(h)}</th><td>{e(p)}</td></tr>")
        out.append("    </table>")
    out += ["  </div>", "</section>"]
    return "\n".join(out)


def render(page):
    url = BASE + page["file"]
    faq_ld = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
            for q, a in page["faq"]
        ],
    }
    crumb_ld = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "로데오부동산", "item": BASE},
            {"@type": "ListItem", "position": 2, "name": page["eyebrow"], "item": url},
        ],
    }
    secs = [render_section(k, h, rows, i % 2 == 0) for i, (k, h, rows) in enumerate(page["sections"])]
    law = f'\n    <p class="note" style="margin-top:12px">{e(LAW_NOTE)}</p>' if page["law_note"] else ""
    if law:
        # 법 안내 문구는 마지막 표 아래에 붙인다
        secs[-1] = secs[-1].replace("    </table>\n  </div>", "    </table>" + law + "\n  </div>")
    faq = "\n".join(
        f'      <details style="border-bottom:1px solid var(--line);padding:4px 0"><summary style="padding:14px 0;font-weight:600;cursor:pointer">{e(q)}</summary><p style="margin:0 0 16px;color:var(--body)">{e(a)}</p></details>'
        for q, a in page["faq"]
    )
    related = " · ".join(
        f'<a href="{f}">{e(label)}</a>' for f, label in RELATED if f != page["file"]
    )
    return f"""<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(page["title"])}</title>
<meta name="description" content="{e(page["desc"])}">
<meta property="og:type" content="website">
<meta property="og:title" content="{e(page["title"])}">
<meta property="og:description" content="{e(page["desc"])}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="https://sanggalab.com/images/og.jpg?v=2">
<meta property="og:locale" content="ko_KR">
<link rel="canonical" href="{url}">
<script type="application/ld+json">{json.dumps(faq_ld, ensure_ascii=False)}</script>
<script type="application/ld+json">{json.dumps(crumb_ld, ensure_ascii=False)}</script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@500;700&display=swap">
<link rel="stylesheet" href="assets/style.css">
</head>
<body data-page="{page["file"].split(".")[0]}">
<main>
<section class="hero">
  <div class="wrap">
    <p class="eyebrow">{e(page["eyebrow"])}</p>
    <h1>{page["h1"]}</h1>
    <p class="sub">{e(page["sub"])}</p>
    <div class="btn-row">
      <a class="btn btn-brass" href="{MAEMUL}" target="_blank" rel="noopener">지금 나온 매물 보기</a>
      <a class="btn btn-kakao" href="tel:01089810202">전화 상담 010-8981-0202</a>
    </div>
  </div>
</section>

{chr(10).join(secs)}

<section>
  <div class="wrap">
    <h2 style="margin-bottom:12px">자주 묻는 질문</h2>
{faq}
  </div>
</section>

<section class="alt">
  <div class="wrap">
    <h2 style="margin-bottom:12px">찾는 자리가 있으신가요?</h2>
    <p class="lead">업종, 예산, 원하는 위치를 남겨 주시면 맞는 매물을 골라 먼저 연락드립니다. 전화상담은 휴무일에도 받습니다.</p>
    <div class="btn-row">
      <a class="btn btn-dark" href="{MAEMUL}#lead" target="_blank" rel="noopener">조건 남기기</a>
      <a class="btn btn-line" href="tel:01089810202">010-8981-0202</a>
      <a class="btn btn-line" href="tel:0319385555">031-938-5555</a>
    </div>
    <p class="note" style="margin-top:20px">함께 보기: {related} · <a href="about.html">사무소 소개</a> · <a href="https://blog.naver.com/seobuj" target="_blank" rel="noopener">네이버 블로그</a></p>
  </div>
</section>
</main>
<script src="assets/app.js"></script>
</body>
</html>
"""


if __name__ == "__main__":
    for p in PAGES:
        (ROOT / p["file"]).write_text(render(p), encoding="utf-8")
        print("wrote", p["file"])
