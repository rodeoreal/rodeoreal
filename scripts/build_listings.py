"""구글시트 '로데오 공개매물' 탭을 CSV로 받아 data/listings.json을 만든다.

사용법: python3 scripts/build_listings.py 공개매물.csv
- '공개(Y)' 칸이 Y/y인 줄만, 상태가 '계약완료'가 아닌 줄만 넣는다.
- 괄호메모(비공개), 지번, 호수, 연락처는 JSON에 넣지 않는다.
"""
import csv
import datetime
import json
import os
import sys

OUT = os.path.join(os.path.dirname(__file__), "..", "site", "data", "listings.json")


def num(v):
    v = (v or "").replace(",", "").strip()
    if not v:
        return None
    f = float(v)
    return int(f) if f.is_integer() else f


def yn(v):
    v = (v or "").strip().upper()
    return True if v == "O" else False if v == "X" else None


def dong(addr):
    # "화정동 983-1" -> "화정동" (지번은 공개하지 않는다)
    return (addr or "").split()[0] if addr else ""


def build(rows):
    items = []
    for r in rows:
        if (r.get("공개(Y)") or "").strip().upper() != "Y":
            continue
        if (r.get("상태") or "").strip() == "계약완료":
            continue
        premium = num(r.get("권리금(만원)"))
        tags = [t.strip() for t in (r.get("태그(급매/양도양수)") or "").replace("/", ",").split(",") if t.strip()]
        if premium == 0 and "무권리" not in tags:
            tags.append("무권리")
        business = (r.get("현재업종(공개)") or "").strip()
        items.append({
            "id": r["매물번호"].strip(),
            "dealType": "임대",
            "propertyType": "상가",
            "building": r["건물명"].strip(),
            "dong": dong(r.get("주소")),
            "floor": num(r.get("층")),
            "area": num(r.get("전용평수")),
            "deposit": num(r.get("보증금(만원)")),
            "rent": num(r.get("월세(만원)")),
            "maintenance": num(r.get("관리비(만원)")),
            "premium": premium,
            "restriction": (r.get("업종제한") or "").strip(),
            "roadside": yn(r.get("도로변")),
            "parking": yn(r.get("주차")),
            "elevator": yn(r.get("엘리베이터")),
            "status": (r.get("상태") or "").strip(),
            "business": "" if business == "공실" else business,
            "vacant": business == "공실" or (r.get("상태") or "").strip() == "공실",
            "tags": tags,
            "available": (r.get("입점가능일") or "").strip(),
            "photos": [p.strip() for p in (r.get("사진링크") or "").split(",") if p.strip()],
            "description": (r.get("한줄설명") or "").strip(),
            "registered": (r.get("등록일") or "").strip(),
        })
    return items


def main(path):
    with open(path, encoding="utf-8-sig") as f:
        items = build(csv.DictReader(f))
    data = {"updated": datetime.date.today().isoformat(), "listings": items}
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"{len(items)}건 -> {os.path.normpath(OUT)}")


if __name__ == "__main__":
    main(sys.argv[1])
