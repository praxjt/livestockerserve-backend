require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jsOTP = require("jsotp");
const app = express();
app.use(express.json());

let susertoken = null;

app.use(cors({
    // origin: process.env.allowedOrigin,
    // methods: ["POST"],
  }));
// && origin?.startsWith(process.env.allowedOrigin)
  app.use((req, res, next) => {
    const apiKey = req.headers["x-api-key"];
    const origin = req.headers["origin"];
    if (apiKey === process.env.MY_SECRET_KEY) {
      next(); 
    } else {
      return res.status(403).json({ error: "Unauthorized" });
    }
  });
app.post("/api/get-token", async(req, res) => {
try{
   
    let totp = jsOTP.TOTP(process.env.totp);
    let timeCode = totp.now(); 
    let jData = {}

       jData["apkversion"]= process.env.apkversion,
       jData["uid"]= process.env.uid,
       jData["pwd"]= process.env.pwd1,
       jData["factor2"] =timeCode,
       jData["vc"] =process.env.vc,
       jData["appkey"]= process.env.appkey,
       jData["imei"]= process.env.imei,
       jData["source"]= process.env.source
      
  let data = `jData=${JSON.stringify(jData)}`;
      
      
       let response = await fetch("https://api.shoonya.com/NorenWClientTP/QuickAuth/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" ,

        },
        body:data,
    });

    let result = await response.json();
    susertoken= result.susertoken;

    res.json({
        actid: result.actid,
        susertoken: result.susertoken,
    });

} catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Something went wrong" });
}

});
app.post("/api/search-scrip", async (req, res) => {
    const { query } = req.body;
    const userid = "FN112024"; // or use from token if dynamic
    const selectedExchange = "NSE"; // or make dynamic
const jData = JSON.stringify({
    uid: userid,
    stext: query,
    exch: selectedExchange,
  });
  let dataq = `jData=${jData}&jKey=${susertoken}`
// valid format
// jData={"uid":"FN0124","stext":"s","exch":"NSE"}&jKey=dcca27de2043f469e08dcdc2e194d3dabccf4d239521e0621723bd13d326a161
// jData={"uid":"FN0124","stext":"ss","exch":"NSE"}&jKey=dcca27de2043f469e08dcdc2e194d3dabccf4d239521e0621723bd13d326a161


    try {
      const response = await fetch("https://api.shoonya.com/NorenWClientWeb/SearchScrip", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: dataq,
      });
  
      const data = await response.json();
      res.json(data); // send back to frontend
    } catch (err) {
      console.error("Error hitting Shoonya Search API", err);
      res.status(500).json({ stat: "Not_Ok", emsg: "Server error" });
    }
  });
  
  let port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
