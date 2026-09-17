#!/usr/bin/env bash
# 造一份「改造前」的产物，给 scripts/check-rendered-parity.mjs 当对照。
#
# 取出 git HEAD 的内容到 /tmp/fx-baseline-site 并构建一次。默认就是 HEAD——
# 所以要在提交前跑这个流程时，先把对照用的旧版本提交掉，或者用 FX_BASELINE_REF
# 指定一个 ref（例如某个 tag）。
#
#   bash scripts/make-baseline.sh              # 用 HEAD
#   FX_BASELINE_REF=v0.1.0 bash scripts/make-baseline.sh
#
# 产物默认在 /tmp/fx-baseline-site/.vitepress/dist，可用 FX_BASELINE_DIST 覆盖。
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REF="${FX_BASELINE_REF:-HEAD}"
DEST="${FX_BASELINE_SITE:-/tmp/fx-baseline-site}"

echo "· 从 $REF 检出对照版本到 $DEST"
rm -rf "$DEST"
mkdir -p "$DEST"
git --git-dir="$REPO/.git" --work-tree="$DEST" checkout -f "$REF" -- .

# node_modules 直接软链本仓库的，省一次安装
ln -sfn "$REPO/node_modules" "$DEST/node_modules"

echo "· 构建对照产物"
(cd "$DEST" && npx vitepress build >/dev/null)

echo "✓ 对照产物就绪：$DEST/.vitepress/dist"
echo "  现在跑：npm run docs:build && npm run check:rendered"
