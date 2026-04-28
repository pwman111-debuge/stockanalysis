"""
보고서 파일을 stockanalysis 레포로 push하는 스크립트.
사용법: python -X utf8 scripts/push_report.py <보고서파일경로> "<커밋메시지>"
예시:   python -X utf8 scripts/push_report.py content/picks/20260427-genesis-report.mdx "feat: 2026-04-27 단기유망종목"
"""
import sys
import os
import shutil
import subprocess
import tempfile

STOCKANALYSIS_REPO = "https://github.com/pwman111-debuge/stockanalysis"
GIT_USER_NAME = "Genesis"
GIT_USER_EMAIL = "pwman111@gmail.com"


def run(cmd, cwd=None):
    result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"[오류] {cmd}\n{result.stderr}")
        sys.exit(1)
    return result.stdout.strip()


def main():
    if len(sys.argv) < 3:
        print("사용법: python -X utf8 scripts/push_report.py <파일경로> \"<커밋메시지>\"")
        sys.exit(1)

    report_path = sys.argv[1]          # 예: content/picks/20260427-genesis-report.mdx
    commit_msg  = sys.argv[2]

    # 절대 경로로 변환
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    abs_report = os.path.join(root_dir, report_path)

    if not os.path.exists(abs_report):
        print(f"[오류] 파일 없음: {abs_report}")
        sys.exit(1)

    # 임시 폴더에 stockanalysis 클론
    tmp_dir = tempfile.mkdtemp(prefix="stockanalysis-")
    print(f"[1/4] stockanalysis 레포 클론 중...")
    run(f'git clone {STOCKANALYSIS_REPO} "{tmp_dir}"')
    run(f'git config user.name "{GIT_USER_NAME}"', cwd=tmp_dir)
    run(f'git config user.email "{GIT_USER_EMAIL}"', cwd=tmp_dir)

    # 보고서 파일 복사 (디렉토리 구조 유지)
    print(f"[2/4] 파일 복사: {report_path}")
    dest = os.path.join(tmp_dir, report_path)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    shutil.copy2(abs_report, dest)

    # 커밋 & push
    print(f"[3/4] 커밋 & push...")
    run(f'git add "{report_path}"', cwd=tmp_dir)
    run(f'git commit -m "{commit_msg}"', cwd=tmp_dir)
    output = run("git push origin main", cwd=tmp_dir)

    # 커밋 해시 확인
    commit_hash = run("git rev-parse --short HEAD", cwd=tmp_dir)

    # 정리
    shutil.rmtree(tmp_dir, ignore_errors=True)
    print(f"[4/4] 완료 — 커밋: {commit_hash} → stockanalysis/{report_path}")
    return commit_hash


if __name__ == "__main__":
    main()
