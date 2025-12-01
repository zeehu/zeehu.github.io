---
title: bash时间处理
date: 2018-08-23
---

# bash时间处理

## 时间解析

```bash
date -d "20180823"
date +"%Y%m%d %H:%M:%S" -d "208-08-23 21:12:17" #控制输出格式
```

## 时间运算

```bash
date -d "+1 days" #year/month/minutes/seconds适用
date -d "20180823 +1 days" #20180824
date -d "$(date +"%Y%m%d") -1 days" #一天前
```

## 时间转换

```bash
date --date @"1535028646" #从1970-01-01 00：00：00开始计秒
date +"%s"
```
