"use strict";

var response = require("./res");
var puppeteer = require("puppeteer");

exports.index = function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  ); // If needed
  //res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // If needed
  //res.setHeader('Access-Control-Allow-Credentials', true); // If needed
  // var city_from = req.body.from;
  // var city_to = req.body.to;
  // var station_from = req.body.stationfrom;
  // var station_to = req.body.stationto;
  var ori = req.body.ori;
  var dest = req.body.dest;
  var date = req.body.date;
  var adult = req.body.adult;
  var infant = req.body.infant;

  date = date.replace(/-/g, '');

  var url = "https://tiket.tokopedia.com/kereta-api/search/?r=" + ori + "." + dest + "&d=" + date + "&a=" + adult + "&i=" + infant;
  // URL LAMA = "https://tiket.tokopedia.com/kereta-api/search/Surabaya-Surabaya.Gubeng-SGU/Bandung-Kiaracondong-KAC?adult=1&infant=0&trip=departure&dep_date=20-10-2019&ori=SGU&dest=KAC";
  // NEW URL --> https://tiket.tokopedia.com/kereta-api/search/?r=SGU.KSL&d=20200722&a=1&i=0
  (async () => {
    try {
      let browser = await puppeteer.launch({
        // headless: false,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-extensions",
        ],
      });

      let page = await browser.newPage();

      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 0,
      });

      await page.waitForSelector(".name", {
        visible: true,
        timeout: 10000,
      });

      let data = await page.evaluate(() => {
        let train_name = document.getElementsByClassName("name");
        let train_class = document.getElementsByClassName("class");
        let time = document.querySelectorAll(".journey_route > div.time");
        let price = document.getElementsByClassName("fare_title");

        var all_train = [];

        for (let index = 0; index < train_name.length; index++) {

          if (index == 0) {
            var dept_time = time[index].innerText;
            var arr_time = time[index + 1].innerText;
          } else {
            var dept_time = time[index + 1].innerText;
            var arr_time = time[index + 2].innerText;
          }

          all_train.push({
            train: train_name[index].innerText,
            status: "Tersedia",
            class: train_class[index].innerText,
            dept_time: dept_time,
            arr_time: arr_time,
            price: price[index].innerText,
          });
        }

        let trains = {
          trains: all_train,
          // url: url,
        };

        return trains;
      });

      response.ok(data, res);
      await browser.close();

    } catch (err) {
      var result = {
        msg: "Jadwal tidak ditemukan, coba cari rute lain.",
        url: url,
      };
      response.ok(result, res);
      await browser.close();
    }
  })();
};