'use strict';

var response = require('./res');
var puppeteer = require('puppeteer');

exports.index = function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
  //res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // If needed
  //res.setHeader('Access-Control-Allow-Credentials', true); // If needed
  var city_from = req.body.from;
  var city_to = req.body.to;
  var station_from = req.body.stationfrom;
  var station_to = req.body.stationto;
  var ori = req.body.ori;
  var dest = req.body.dest;
  var date = req.body.date;
  var adult = req.body.adult;
  var infant = req.body.infant;

  var url = "https://tiket.tokopedia.com/kereta-api/search/"+city_from+"-"+station_from+"-"+ori+"/"+city_to+"-"+station_to+"-"+dest+"?adult="+adult+"&infant="+infant+"&trip=departure&dep_date="+date+"&ori="+ori+"&dest="+dest;
  // var url = "https://tiket.tokopedia.com/kereta-api/search/Surabaya-Surabaya.Gubeng-SGU/Bandung-Kiaracondong-KAC?adult=1&infant=0&trip=departure&dep_date=20-10-2019&ori=SGU&dest=KAC";
  (async () => {

    let browser = await puppeteer.launch({
      args: ['--no-sandbox','--disable-setuid-sandbox']
    });

    let page = await browser.newPage();

    await page.goto(url, {
      waitUntil:'networkidle2',
      timeout: 0
    });
  
    let data = await page.evaluate(() => {
      
      let train_name = document.getElementsByClassName("train-name");
      let train_class = document.getElementsByClassName("train-class");
      let dept_time = document.getElementsByClassName("dept-time");
      let arrival = document.getElementsByClassName("arrival-time");
      let price = document.getElementsByClassName("price-amount-main");
      let price1 = document.getElementsByClassName("price-amount-tail");
  
      var all_train = [];
  
      for (var i = 0; i < train_name.length; i++) {
          var real_price = price[i].innerText+price1[i].innerText;
          var name = train_name[i].innerText;
          name = name.replace(/\n/g,'-');
          var status = name.split('-')[1];
          name = name.split('-')[0];
          if(status === undefined){
            status = "PENUH";
          }
          all_train.push(
              {
                  "train" : name,
                  "status" : status,
                  "class" : train_class[i].innerText,
                  "dept_time" : dept_time[i].innerText,
                  "arr_time" : arrival[i].innerText,
                  "price" : real_price,
              }
          );
      }
  
      let trains = {
          "trains" : all_train,
          "url": url
      };
  
      return trains;
  
    });

    response.ok(data, res);
    await browser.close();
  
  })();
};

