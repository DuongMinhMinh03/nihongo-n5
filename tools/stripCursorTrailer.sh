#!/bin/sh
#
# Lọc trailer attribution của Cursor ra khỏi nội dung commit message
# (đọc từ stdin, ghi ra stdout).
#
# Chỉ xóa trailer của Cursor; co-author thật của con người được giữ nguyên.

grep -viE '^(co-authored-by:[[:space:]]*cursor|made-with:[[:space:]]*cursor)[[:space:]]*<' || true
