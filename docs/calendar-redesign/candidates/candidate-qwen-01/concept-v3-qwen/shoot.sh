#!/bin/bash
# one-shot screenshot batch (absolute paths: headless Edge does not follow shell cwd)
E="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
D="/d/work/coding/mihoyo-calendar/docs/calendar-redesign/candidates/candidate-qwen-01/concept-v3-qwen"
S="D:/work/coding/mihoyo-calendar/docs/calendar-redesign/candidates/candidate-qwen-01/concept-v3-qwen/shots"
"$E" --headless --screenshot="$S/01-month-cover-1440x900.png" --window-size=1440,900 --hide-scrollbars --virtual-time-budget=10000 --force-device-scale-factor=1 "file:///D:/work/coding/mihoyo-calendar/docs/calendar-redesign/candidates/candidate-qwen-01/concept-v3-qwen/board01.html"
"$E" --headless --screenshot="$S/02-month-fondaine-1440x900.png" --window-size=1440,900 --hide-scrollbars --virtual-time-budget=10000 --force-device-scale-factor=1 "file:///D:/work/coding/mihoyo-calendar/docs/calendar-redesign/candidates/candidate-qwen-01/concept-v3-qwen/board02.html"
"$E" --headless --screenshot="$S/03-detail-arlecchino-1440x900.png" --window-size=1440,900 --hide-scrollbars --virtual-time-budget=10000 --force-device-scale-factor=1 "file:///D:/work/coding/mihoyo-calendar/docs/calendar-redesign/candidates/candidate-qwen-01/concept-v3-qwen/board03.html"
"$E" --headless --screenshot="$S/04-mobile-cover-390x844.png" --window-size=390,844 --hide-scrollbars --virtual-time-budget=10000 --force-device-scale-factor=1 "file:///D:/work/coding/mihoyo-calendar/docs/calendar-redesign/candidates/candidate-qwen-01/concept-v3-qwen/board04.html"
echo "=== done ==="
ls -la "$S"
