# Locationpedia

Locationpedia는 React 및 Firebase를 사용하여 구축한 웹 사이트입니다.
사용자는 전세계 다양한 위치에 있는 비 종교적 성지순례 장소를 확인할 수 있습니다.(k-pop 뮤비 촬영지, 일본 애니메이션 실제 배경 등)
사용자는 직접 지도를 클릭하여 새 위치를 추가하고, 국가별로 위치를 필터링하여 내 위치 근처에 어떤 장소가 있는지 확인 가능합니다!

## 기능

- **장소 확인**: 저장된 모든 위치 목록을 표시합니다.
- **장소 추가하기**: 지도에서 한 지점을 클릭하여 새 위치를 추가할 수 있습니다.
- **장소 필터링**: 각 고유 국가에 대한 탭을 사용하여 국가별로 위치를 필터링할 수 있습니다.
- **장소 이동**: 사용자가 위치에 해당하는 'Move' 버튼을 클릭하면 선택한 위치로 지도 보기가 확대됩니다.
- **장소 삭제**: 사용자는 데이터베이스에서 위치를 삭제할 수 있습니다.

## 사용 기술

- React
- Firebase Firestore
- OpenCage Geocoding API
- React-Bootstrap
- React-Leaflet

## 향후 추가할 기능

- **사용자 인증**
- **프로필 관리(즐겨찾는 장소, 방문한 장소 저장)**
- **소셜 공유**
- **장소 리뷰&평가**

## 이용방법

사이트 : [Locationpedia](map-project-12345-da651.firebaseapp.com)

### 위치 추가

1. Locationpedia에 접속합니다.
2. 지도에서 원하는 지점을 클릭합니다.
3. 위치의 이름과 설명을 입력할 수 있는 양식이 사이드바에 나타납니다.
4. 양식을 입력하고 '저장'을 클릭하면 이제 새 위치가 추가되고 위치 목록에 나타납니다.

### 위치 삭제

1. 위치 목록을 확인합니다.
2. 목록에서 'Delete' 버튼을 클릭합니다. 이제 해당 장소가 목록에서 제거됩니다.

## License

MIT License. See `LICENSE` for more information.