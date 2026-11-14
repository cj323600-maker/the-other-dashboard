# 전략기획 ERP

코오롱오토옥션 전략기획팀 보고·대시보드 통합 포털 (GitHub Pages)
주소: https://cj323600-maker.github.io/the-other-dashboard/

## 메뉴
| 메뉴 | 최신본(원본 저장소) | 지난 보고서 보관 폴더 |
|---|---|---|
| 일간보고 | Daily-dashboard | `daily/` |
| 주간보고 | week-dashboard | `weekly/` |
| 월간보고 | Month-dashboard | `monthly/` |
| 회원사 분석 | Country-dashboard | `member/` |
| 출품 및 낙찰 추이 | Auction-dashboard | `trend/` |
| 수출시장 환경모니터 | 이 저장소 `market/index.html` (원본 KAA_ClaudeCode 일보/mkt) | `market/` |
| 국내 경매장 시장 | 이 저장소 `kmarket/index.html` (원본 KAA_ClaudeCode 시장/build_market.py) | `kmarket/` |
| 매칭 테이블 | 이 저장소 `matching/index.html` (원본 KAA_ClaudeCode 매칭테이블/tools/mt_data.py · mt_build.py) | `matching/` |

- 화면 구성(2026-11-11 포털형): 왼쪽 고정 메뉴(보고·분석·시장), 상단 바(날짜·다음 경매), 보고서는 ERP 안에서 보기(최신본·지난 보고서 탭, 새 창 열기), 폰은 ☰ 메뉴
- 홈 상단: 일간보고 상단 카드 3개(출품대수·낙찰대수 예상·매출이익 예상)를 최신 일보에서 그대로 읽어 표시
- 다음 경매일과 D-day: 일보의 경매일 기준, 없으면 다음 수요일. D-n은 일보와 같은 영업일(주말 제외) 기준(2026-11-14)
- 각 보고서 카드: 최신본 제목·기준일·업데이트 시각(다른 저장소 메뉴는 GitHub Pages 배포 시각, 이 저장소 안 메뉴는 그 파일의 마지막 커밋 시각, 2026-11-14)
- 회원사 분석 권역 바로가기: `#member/r=권역` (매칭 테이블 수출 권역 카드에서 사용)

## 지난 보고서 파일명 규칙
`날짜_제목.확장자` · 일 단위 `2026-11-10_일간보고.html` · 월 단위 `2026-10_월간보고.html`

## 2026-11-14 화면 개선
- 홈 위 파란 영역: "다음 경매"(상단 바와 중복) 대신 "일간보고 최신본". 일보 기준일이 직전 영업일보다 오래되면 "최신 일보 아님 · 기준일 M/D" 빨간 표시.
- 홈 숫자 카드: 일보의 예상 범위(낙찰 · 매출이익)를 함께 표시.
- 보고서 카드: 메뉴 이름과 겹치는 파일 제목 줄을 빼고 핵심 한 줄(기준일 · 회차 등)을 굵게, 길면 줄바꿈.
