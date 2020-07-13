"use strict";

var response = require("./res");
var puppeteer = require("puppeteer");
var request = require("request");

exports.index = function (req, res) {
    var url = "https://twitter.com/KAI121/with_replies";
    var limit = req.body.jumlah;
    (async () => {
        const browser = await puppeteer.launch({
            // headless: false,
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-extensions"]
        });
        const page = await browser.newPage();

        await page.goto(url, {
            waitUntil: "networkidle2",
            timeout: 0
        });

        let allPost = [];
        var loop = true;
        while (loop) {
            for (let index = 0; index < 100; index++) {
                await page.keyboard.press("ArrowDown");
            }

            await page.waitFor(3000);

            const jmlPost = await page.evaluate(() => {
                var jml = document.querySelectorAll(
                    "#react-root > div > div > div.css-1dbjc4n.r-13qz1uu.r-417010 > main > div > div > div > div > div > div > div > div > div:nth-child(3) > section > div > div > div > div"
                ).length;

                return jml;
            });

            // console.log("(" + jmlPost + ")");

            await page.waitFor(2000);

            for (let index = 2; index < jmlPost; index++) {
                if (allPost.length >= limit) {
                    loop = false;
                    break;
                }
                await page.waitFor(3000);

                var postCheck = await page.evaluate(index => {
                    var postAvail = document.querySelector(
                        "#react-root > div > div > div.css-1dbjc4n.r-13qz1uu.r-417010 > main > div > div > div > div > div > div > div > div > div:nth-child(3) > section > div > div > div > div:nth-child(" +
                        index +
                        ") > div > div > article"
                    );
                    if (postAvail != null) {
                        document
                            .querySelector(
                                "#react-root > div > div > div.css-1dbjc4n.r-13qz1uu.r-417010 > main > div > div > div > div > div > div > div > div > div:nth-child(3) > section > div > div > div > div:nth-child(" +
                                index +
                                ") > div > div > article"
                            )
                            .click();
                    }

                    return postAvail;
                }, index);

                await page.waitFor(5000);

                var urlPost = page.url();

                const post = await page.evaluate(() => {
                    var cekTanggal = document.querySelector(
                        "#react-root > div > div > div.css-1dbjc4n.r-13qz1uu.r-417010 > main > div > div > div > div > div > div > div > section > div > div > div > div:nth-child(2) > div > div > article > div > div > div > div:nth-child(3) > div.css-1dbjc4n.r-vpgt9t > div > div > span:nth-child(1) > span"
                    );

                    var cekPengirim = document.querySelector(
                        "#react-root > div > div > div.css-1dbjc4n.r-13qz1uu.r-417010 > main > div > div > div > div > div > div > div > section > div > div > div > div:nth-child(2) > div > div > article > div > div > div > div:nth-child(3) > div.css-1dbjc4n.r-4qtqp9.r-156q2ks > div > div > a > span"
                    );

                    var cekPertanyaan = document.querySelector(
                        "#react-root > div > div > div.css-1dbjc4n.r-13qz1uu.r-417010 > main > div > div > div > div > div > div > div > section > div > div > div > div:nth-child(1) > div > div > article > div > div > div > div.css-1dbjc4n.r-18u37iz > div.css-1dbjc4n.r-1iusvr4.r-16y2uox.r-1777fci.r-1mi0q7o > div:nth-child(2) > div:nth-child(1) > div"
                    );

                    var cekJawaban = document.querySelector(
                        "#react-root > div > div > div.css-1dbjc4n.r-13qz1uu.r-417010 > main > div > div > div > div > div > div > div > section > div > div > div > div:nth-child(2) > div > div > article > div > div > div > div:nth-child(3) > div:nth-child(2) > div"
                    );

                    var post = "";

                    if (
                        cekTanggal != null &&
                        cekPengirim != null &&
                        cekPertanyaan != null &&
                        cekJawaban != null
                    ) {
                        post = {
                            tanggal: document.querySelector(
                                "#react-root > div > div > div.css-1dbjc4n.r-13qz1uu.r-417010 > main > div > div > div > div > div > div > div > section > div > div > div > div:nth-child(2) > div > div > article > div > div > div > div:nth-child(3) > div.css-1dbjc4n.r-vpgt9t > div > div > span:nth-child(1) > span"
                            ).innerText,

                            pengirim: document.querySelector(
                                "#react-root > div > div > div.css-1dbjc4n.r-13qz1uu.r-417010 > main > div > div > div > div > div > div > div > section > div > div > div > div:nth-child(2) > div > div > article > div > div > div > div:nth-child(3) > div.css-1dbjc4n.r-4qtqp9.r-156q2ks > div > div > a > span"
                            ).innerText,

                            pertanyaan: document.querySelector(
                                "#react-root > div > div > div.css-1dbjc4n.r-13qz1uu.r-417010 > main > div > div > div > div > div > div > div > section > div > div > div > div:nth-child(1) > div > div > article > div > div > div > div.css-1dbjc4n.r-18u37iz > div.css-1dbjc4n.r-1iusvr4.r-16y2uox.r-1777fci.r-1mi0q7o > div:nth-child(2) > div:nth-child(1) > div"
                            ).innerText,

                            jawaban: document.querySelector(
                                "#react-root > div > div > div.css-1dbjc4n.r-13qz1uu.r-417010 > main > div > div > div > div > div > div > div > section > div > div > div > div:nth-child(2) > div > div > article > div > div > div > div:nth-child(3) > div:nth-child(2) > div"
                            ).innerText
                        };
                    }

                    return post;
                });

                var statusSama = false;

                if (post != "") {
                    for (let j = 0; j < allPost.length; j++) {
                        if (
                            allPost[j].pertanyaan != undefined &&
                            allPost[j].pertanyaan == post.pertanyaan
                        ) {
                            statusSama = true;
                        }
                    }

                    if (!statusSama) {
                        var resultPost = {
                            tanggal: post.tanggal,
                            pengirim: post.pengirim,
                            pertanyaan: post.pertanyaan,
                            jawaban: post.jawaban,
                            postUrl: urlPost
                        };

                        allPost.push(resultPost);

                        request({
                                url: "https://loko-preprocessing.herokuapp.com/TwitterController/create",
                                method: "POST",
                                body: JSON.stringify({
                                    tanggal: post.tanggal,
                                    pengirim: post.pengirim,
                                    pertanyaan: post.pertanyaan,
                                    jawaban: post.jawaban,
                                    urlPost: urlPost
                                })
                            },
                            function (error, response, body) {
                                console.log("data " + allPost.length + " " + response.body);
                            }
                        );
                        await page.waitFor(7000);
                    }
                }

                if (page.url() != url) {
                    await page.evaluate(() => {
                        document
                            .querySelector(
                                "#react-root > div > div > div.css-1dbjc4n.r-13qz1uu.r-417010 > header > div.css-1dbjc4n.r-14lw9ot.r-uvzvve.r-rull8r.r-qklmqi.r-1d2f490.r-1xcajam.r-zchlnj.r-ipm5af.r-1siec45.r-o7ynqc.r-axxi2z.r-136ojw6 > div.css-1dbjc4n.r-1jgb5lz.r-1ye8kvj.r-13qz1uu > div > div.css-1dbjc4n.r-18u37iz.r-16y2uox.r-1h3ijdo.r-184en5c > div.css-1dbjc4n.r-1777fci.r-1mf7evn > div"
                            )
                            .click();
                    });
                }

                // console.log(allPost.length);
            }
        }
        response.ok(allPost, res);
        console.log(allPost);
    })();

}