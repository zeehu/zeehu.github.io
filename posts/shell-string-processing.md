---
title: shell字符串处理
date: 2018-08-23
---

# shell字符串处理

## 常用shell字符串处理方法

1. `${var#*string}`  从左向右截取var最后一个string后的字符串
2. `${var%string*}`  从右向左截取var第一个string后的字符串 
3. `${var:n1:n2}` 截取变量var从n1到n2之间的字符串
4. 
