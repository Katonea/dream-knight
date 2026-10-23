#!/bin/sh
# claude.ai 아티팩트용 사본을 만든다: 아티팩트가 문서 골격(doctype/html/head/body)을 직접 씌우므로 그 태그만 뺀다.
cd "$(dirname "$0")"
mkdir -p dist
grep -v -E '^(<!doctype html>|<html lang="ko">|<head>|</head>|<body>|</body>|</html>|<meta charset="utf-8">|<meta name="viewport".*)$' index.html > dist/dream-knight.html
echo "dist/dream-knight.html $(wc -c < dist/dream-knight.html) bytes"
