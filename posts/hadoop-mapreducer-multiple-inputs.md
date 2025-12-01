---
title: hadoop mapreducer 多输入配置
date: 2018-08-23
---

# hadoop mapreducer 多输入配置

## 为什么需要多输入

使用MapReduce的时候经常需要加载词典或者配置数据

## MapReduce文件分发配置参数

1. -file 将客户端本地文件上传到HDFS然后分发到计算节点
2. -cachefile 将HDFS文件分发到计算节点
3. -cacheArchive 将HDFS压缩文件分发到计算节点并解压，也可以指定符号链接
4. -files 将指定的本地/HDFS文件分发到各个task的工作目录下，部队文件进行任何处理
