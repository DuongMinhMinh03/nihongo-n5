#!/bin/sh
#
# Dọn trailer attribution của Cursor khỏi toàn bộ lịch sử commit.
# Chạy:  sh tools/cleanCommitTrailers.sh
#
# Ghi đè lịch sử (git filter-branch). Đã có backup ở branch/tag
# 'backup-before-rewrite' trước khi chạy.
#
# Sau khi chạy xong cần:  git push --force origin main

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "== Trước khi sửa =="
git log --format='%h %s%n%b' --all | head -40

echo
echo "== Đang sửa =="
FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch -f \
  --msg-filter "sh '$ROOT/tools/stripCursorTrailer.sh'" \
  -- --all

echo
echo "== Sau khi sửa =="
git log --format='%h %s%n%b' --all | head -40
