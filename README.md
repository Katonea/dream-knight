# 꿈지기 기사

밤의 꿈나라에 번진 악몽을 자동 공격으로 쓸어내는 3D 픽셀 서바이버 프로토타입.

- 플레이: https://katonea.github.io/dream-knight/ (PC 키보드·마우스, 모바일 터치)
- 조작: WASD 이동 · Space 점프(공중 점프는 바람 망토를 먹어야) · 마우스 이동(클릭 불필요)/← → 카메라 · E 상호작용 · R 궁극기 · Tab 큰 지도 · Esc 일시정지
- 모바일: 화면 왼쪽 절반 드래그 = 이동, 오른쪽 = 카메라, 버튼으로 점프·E·궁극기
- 디버그: `?debug=1` (FPS·적 수·드로우콜)

`index.html` 한 파일로 동작한다(three.js r128 CDN). 그림은 전부 코드로 찍은 픽셀 아트다. 에이전트용 기획서는 [docs/기획서.md](docs/기획서.md), 구현 결과 보고는 [REPORT.md](REPORT.md).


## 랭킹

지역(구역 3)을 클리어하면 결과 화면에 랭킹이 뜬다. 랭킹은 이 저장소의 [`ranking.json`](ranking.json)에 저장된다.

- 읽기: 게임이 `raw.githubusercontent.com/Katonea/dream-knight/main/ranking.json`을 불러와 상위 10명과 내 예상 순위를 보여 준다.
- 쓰기: "랭킹에 등록"을 누르면 기록이 미리 채워진 GitHub 이슈 화면이 열린다(GitHub 로그인 필요). **Submit new issue**만 누르면 [`ranking` 워크플로](.github/workflows/ranking.yml)가 점수를 같은 공식으로 다시 계산해 맞으면 `ranking.json`에 더하고(최대 300명, 한 계정 20건) 이슈를 닫는다.
- 한계: 브라우저에서 만든 기록이라 작정하고 조작하면 막지 못한다(점수·시간·처치 범위와 점수 공식 일치만 검사한다).
- 오프라인이거나 막힌 환경에서는 이 기기에 저장한 내 기록만 보인다.
