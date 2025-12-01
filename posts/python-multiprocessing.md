---
title: python多进程方法
date: 2018-08-22
---

# python多进程方法

## 为什么要使用多进程

由于python GIL锁(Global Interpreter Lock)的原因，导致python多线程并没有明显的加速效果。

## 多进程使用方法

### Pool进程池

1.  map方法
    比较适合大量数据进行简单的处理，如读取文件、并行计算等。

```python
from multiprocessing import Pool
import time
def run(data):
    print data
    return data
if __name__ == "__main__":
    t = time.time()
    pool = Pool() #可以通过Pool(num)指定进程数
    datas = [ "AA", "BB", "CC" ]
    res = pool.map(run, datas)
    pool.close()
    pool.join()
    print "并行执行时间：" + str(time.time() - t)
    print res
```
