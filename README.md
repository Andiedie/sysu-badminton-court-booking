# 中大东校羽毛球场地极简预定
一个用户脚本，用于在中山大学[体育场馆管理与预订系统](http://gym.sysu.edu.cn/index.html)中自动预定羽毛球场馆。

## 功能
- 可自定义日期
- 可自定义时间段
- 若设定了多个时间段，则每个时间段都会预定一个场地

## Todo
- [ ] 登录状态检测
- [ ] 连续时间段尽量预定相同场地
- [ ] 更美观的 UI

## 安装
首先需要安装 [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)

[![](https://img.shields.io/badge/%E5%AE%89%E8%A3%85%E7%9B%B4%E9%93%BE-%F0%9F%90%92-blue.svg?longCache=true&style=flat-square)](https://github.com/Andiedie/sysu-badminton-court-booking/raw/master/sysu-badminton-court-booking.user.js)

## 使用
打开 [东校园羽毛球场](http://gym.sysu.edu.cn/product/show.html?id=35)，点击`自动预定`即可。

## 兼容性
只测试了 Tampermonkey 的兼容性

## LICENSE
MIT