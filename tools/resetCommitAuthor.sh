#!/bin/sh
#
# Đặt lại tác giả (author) cho toàn bộ lịch sử commit về tài khoản GitHub thật,
# đồng thời loại bỏ trailer attribution của Cursor.
#
# Chạy:  sh tools/resetCommitAuthor.sh "Tên hiển thị" "email"
#
# Mặc định dùng tài khoản GitHub hiện tại:
#   sh tools/resetCommitAuthor.sh
#
# Sau khi chạy xong cần:  git push --force origin main

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

AUTHOR_NAME="${1:-JustForLife64}"
AUTHOR_EMAIL="${2:-293043865+DuongMinhMinh03@users.noreply.github.com}"

echo "== Đặt author =="
echo "   name : $AUTHOR_NAME"
echo "   email: $AUTHOR_EMAIL"
echo

FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch -f \
  --msg-filter "sh '$ROOT/tools/stripCursorTrailer.sh'" \
  --env-filter "export GIT_AUTHOR_NAME='$AUTHOR_NAME'; export GIT_AUTHOR_EMAIL='$AUTHOR_EMAIL'; export GIT_COMMITTER_NAME='$AUTHOR_NAME'; export GIT_COMMITTER_EMAIL='$AUTHOR_EMAIL'" \
  -- --all

echo
echo "== Kết quả =="
git log --format='%h %s%n  author: %an <%ae>%n%b' --all
