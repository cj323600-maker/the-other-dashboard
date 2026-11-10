"""일간보고 분류 규칙 (2026-11-10 일보와 대조해 검증한 기준)

입력: ERP 경매출품 엑셀 (회차·출품번호·경매진행상태·출품그룹·출품구분·출품소스 등 63열)
"""
import pandas as pd

# 출품대수 = 경매진행상태 '출품등록' (출품취소·반출증발급 제외)
STATUS_REGISTERED = "출품등록"

# FC(시너지) 업체 (주간보고 FC 업체별 분석 기준, '신규+기타' = 협력점 중 아래 외 업체)
FC_COMPANIES = ["지디플러스", "바른오토", "위카", "케이오토옥션", "지에스옥션", "하나옥션",
                "모던카", "롱탄", "서울옥션", "리드옥션", "스토리카"]
NAME_COLS = ["출품고객", "출품유도업체", "출품대행업체", "실거래처", "출품소스"]


def fc_company(row):
    for k in FC_COMPANIES:
        for c in NAME_COLS:
            if k in row[c]:
                return k
    return ""


def team(row):
    g, gb, src = row["출품그룹"], row["출품구분"], row["출품소스"]
    if src == "자사(클레임)":
        return "일반(클레임 포함)"
    if g == "시너지":
        return "시너지"
    if src == "자사(매입)_영업":
        return "플랫폼매입"
    if g in ("협력점", "FC유도"):
        return "FC(시너지)"
    if g == "코오롱오토옥션" and gb == "출품대행":
        return "FC(시너지)" if row["fc"] else "출품영업"
    if g in ("출품전문점", "출품영업팀", "오토허브"):
        return "출품영업"
    return "법인영업"  # 코오롱오토옥션 유도·자사(법인 캐피탈·렌터카), 법인협력점


def classify(df):
    df = df.fillna("").astype(str)
    r = df[df["경매진행상태"] == STATUS_REGISTERED].copy()
    r["fc"] = r.apply(fc_company, axis=1)
    r["팀"] = r.apply(team, axis=1)
    r["재출품횟수"] = r["재출품횟수"].astype(int)
    r["신규"] = r["재출품여부"] == "N"
    r["재출품구간"] = pd.cut(r["재출품횟수"], [-1, 0, 1, 2, 999], labels=["초회", "2회", "3회", "4회 이상"])
    return r
