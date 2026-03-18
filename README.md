# 밈레이더 UI

국내·해외 밈 트렌드 실시간 대시보드  
Next.js 14 + Supabase + Vercel 무료 배포

## 로컬 실행

```bash
npm install

# .env.local 파일 생성
cp .env.local.example .env.local
# SUPABASE_URL, SUPABASE_ANON_KEY 값 입력

npm run dev
# http://localhost:3000
```

## Vercel 배포 (무료 · 5분)

1. vercel.com 접속 → GitHub 계정으로 로그인
2. New Project → 이 repo 선택 (Import)
3. Environment Variables 에 두 값 입력:
   - `NEXT_PUBLIC_SUPABASE_URL`  → Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Supabase anon key
4. Deploy 클릭 → 2분 후 URL 발급

## 화면 구성

- 상단 통계 카드: 전체 / 유입 / 독립 / 역수출 카운트
- 생애주기 분포 바: 태동기 / 확산기 / 고점 / 쇠퇴기
- 소스별 수집 현황 차트
- 탭 필터: 전체 / 해외→국내 / 국내 독립 / 역수출
- 밈 목록: 제목 + 소스 + 생애주기 뱃지 + 흐름 분류 뱃지
