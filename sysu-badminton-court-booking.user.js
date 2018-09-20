// ==UserScript==
// @name         中大东校羽毛球场地极简预定
// @namespace    badminton.sysu.andiedie
// @author       Andiedie
// @license      MIT License
// @homepageURL  https://github.com/Andiedie/sysu-badminton-court-booking
// @match        http://gym.sysu.edu.cn/product/show.html?id=35*
// @description  中大东校羽毛球场地极简预定
// @version      0.1
// @grant        none
// @require      https://cdn.bootcss.com/axios/0.18.0/axios.min.js
// @require      https://cdn.bootcss.com/date-fns/123/date_fns.min.js
// ==/UserScript==

(async function () {
  'use strict';

  const button = document.createElement('a');
  button.textContent = '自动预定';
  document.querySelector('div.switch.simple-lines div.boxes').appendChild(button);
  const wrapper = document.createElement('div');
  wrapper.style = `
    position: fixed;
    top: 0;
    left: 0;
  `;
  document.body.appendChild(wrapper);

  button.onclick = async () => {
    // 确认预订信息
    // dayOffset：预定日距离今天还有多少天
    const dayOffset = prompt('预定哪天的？\n0 for today.\n1 for tomorrow\netc.', 1);
    if (dayOffset === null) return;
    // targetDate：预定日
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + Number(dayOffset));
    // formatedDate：格式化文本
    const formatedDate = dateFns.format(targetDate, 'YYYY-MM-DD');

    // 获取可供预订的时间
    const { data } = await axios.get('/product/getarea2.html', {
      params: {
        s_dates: formatedDate,
        serviceid: '35',
        type: 'day'
      }
    });
    const timeTable = data.timeList.map(obj => obj.TIME_NO);

    // requiredIndex：预定时间的index
    const requiredIndex = prompt(`预定几点的？${timeTable.reduce((prev, cur, index) => `${prev}\n${index} for ${cur}`, '')}\n多个时间段逗号隔开`, '0,1,2,3');
    if (requiredIndex === null) return;

    // requireList：预定时间列表
    const requireList = [];
    requiredIndex.split(',').forEach(index => {
      requireList.push(timeTable[index]);
    });
    // 询问用户是否确认
    if (!confirm(`确定要预定\n${formatedDate}${requireList.reduce((prev, cur, index) => `${prev}\n${cur}`, '')}\n的羽毛球场地吗？`)) return;

    // 确认目标日期是否开放预定
    const checkAvailable = async dateString => {
      const { data } = await axios.get('http://gym.sysu.edu.cn/product/show.html?id=35');
      const result = data.match(/<div class="date">(\d+-\d+-\d+)<\/div>/g);
      return result.includes(`<div class="date">${dateString}</div>`);
    };

    let isDateAvailable = await checkAvailable(formatedDate);
    if (!isDateAvailable) {
      alert(`你选择的日期 ${formatedDate} 还未开始预定\n脚本将在开始时自动运行`);
    }    

    // UI
    for (const one of requireList) {
      const link = document.createElement('a');
      link.style = `
        display: block;
        background-color: white;
      `;
      link.target = '_blank';
      link.href = '#';
      link.targetTime = one;
      link.textContent = `${one} ${isDateAvailable ? '正在预定' : '等待开始'}`;
      wrapper.appendChild(link);
    }

    // 开始轮询
    while (requireList.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      isDateAvailable = await checkAvailable(formatedDate);
      for (const one of wrapper.children) {
        one.textContent = `${one.targetTime} ${isDateAvailable ? '正在预定' : '等待开始'}`;
      }
      if (!isDateAvailable) continue;
      // 可预订的场
      const availableList = [];
      // 获取预定日的所有可用场地
      const { data } = await axios.get('/product/findOkArea.html', {
        params: {
          s_date: formatedDate,
          serviceid: '35'
        }
      });
      if (!data.object) data.object = [];
      // 对于所有可用场地
      for (const one of data.object) {
        // 如果这个场地在预定列表里
        const requireListIndex = requireList.indexOf(one.stock.time_no);
        if (requireListIndex != -1) {
          one.requireListIndex = requireListIndex;
          if (Number(one.name) % 5 > 1) {
            // 将位置在中间的球场放在优先位置
            availableList.unshift(one);
          } else {
            // 将边缘的球场放在队列后面
            availableList.push(one);
          }
        }
      }
      // 如果有可以预定的场
      if (availableList.length) {
        const target = availableList[0];
        const formData = new FormData();
        formData.append('param', `{"activityPrice":0,"activityStr":null,"address":null,"dates":null,"extend":null,"flag":"0","isbookall":"0","isfreeman":"0","istimes":"1","merccode":null,"order":null,"orderfrom":null,"remark":null,"serviceid":null,"shoppingcart":"0","sno":null,"stock":{"${target.stockid}":"1"},"stockdetail":{"${target.stockid}":"${target.id}"},"stockdetailids":"${target.id}","subscriber":"0","time_detailnames":null,"userBean":null}`);
        formData.append('json', 'true');
        const { data } = await axios.post('/order/book.html', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (data.message === '未支付') {
          const [done] = requireList.splice(target.requireListIndex, 1);
          const orderId = data.object.orderid;
          const link = wrapper.children[target.requireListIndex];
          link.href = `/order/myorder_view.html?id=${orderId}`;
          link.textContent = `${done} √ 点击付款`;
        }
      }
    }
    alert('全部预定已经完成');
  };
})();