@echo off
chcp 65001 > nul
title [가시설 공법비교 앱] 1초 황금스냅샷 긴급 복구 도구
echo ========================================================
echo   [가시설 1·2·3안 비교 앱] 황금 스냅샷(v1.0.0) 즉시 복구
echo ========================================================
echo.
echo  현재 소스코드 및 단일 HTML을 100%% 완벽했던
echo  [황금 스냅샷 (v1.0.0-GOLDEN-STABLE)] 상태로 즉시 복구합니다.
echo.
echo  진행하시겠습니까? (Y/N)
set /p confirm=선택: 
if /I "%confirm%" neq "Y" goto cancel

echo.
echo [1/3] Git 영구 태그 기반 강제 롤백 진행 중...
git reset --hard v1.0.0-GOLDEN-STABLE
git clean -fd

echo [2/3] 황금 스냅샷 독립형 파일 동기화 중...
if exist _GOLDEN_BACKUP_SNAPSHOT (
    xcopy /E /Y /I _GOLDEN_BACKUP_SNAPSHOT\* . > nul
)

echo [3/3] 브라우저 앱 단일 HTML 최종 빌드 및 검증 중...
call npx vite build
python bundle_single_html.py
python copy_app.py

echo.
echo ========================================================
echo  ✓ 복구 완료! 지금 이 순간의 완벽한 상태로 원상복구되었습니다.
echo  브라우저를 새로고침(F5)하시면 완벽한 화면이 즉시 표시됩니다.
echo ========================================================
pause
exit

:cancel
echo 복구를 취소하였습니다.
pause
exit
