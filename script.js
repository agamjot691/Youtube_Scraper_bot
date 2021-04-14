const puppy = require("puppeteer");
const fs = require("fs");
function wait(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      
      resolve(ms)
    }, ms )
  })
}
const id = "provide id here ";
const pass = "provide pass here";
let subscriber_count = "";
let string = "https://www.youtube.com/";
let genre = [" Top Standup Comedy International" , "Tech" ,    "  Gaming" , "  Music" ,"Vlogs" ];
let url = [];

async function main() {
    let browser = await puppy.launch({
        headless: false,
        defaultViewport: false,
        // args: ["--start-maximized"]
    });
      let tabs = await browser.pages();
      let tab = tabs[0];
      await tab.goto("https://www.youtube.com/");
      await wait(2000);
      await tab.waitForSelector("#button.style-scope.ytd-button-renderer .style-suggestive.size-small", {visible: true});
      await tab.click("#button.style-scope.ytd-button-renderer .style-suggestive.size-small");
      await wait(2000);
      let idbutton = await tab.waitForSelector("#yDmH0d", {visible: true});
     
      await idbutton.type(id);
      await tab.waitForSelector("div.VfPpkd-RLmnJb", {visible: true});
      await tab.click("div.VfPpkd-RLmnJb");
      await wait(2000);
      let passbutton = await tab.waitForSelector("#yDmH0d", {visible: true});
     
      await passbutton.type(pass);
      await tab.waitForSelector("div.VfPpkd-RLmnJb", {visible: true});
      await tab.click("div.VfPpkd-RLmnJb");

      for( let i = 0 ; i < genre.length; i++){
        url.push( {"genre" : genre[i]});
        await tab.waitForSelector("#search", {visible: true});
        let searchInput = await tab.$('#search');
        await searchInput.click({clickCount: 3});
        await searchInput.press('Backspace');
        await wait(3000); 
        await searchInput.type(genre[i]);
        await tab.keyboard.press('Enter');
        await wait (3000);
      
        await tab.waitForSelector("a#video-title", {visible: true});
        let videos =  await tab.$$("a#video-title");
        url[i]["urls"] = [];
        console.log(videos.length);
        for( let j = 0 ; j <5 ; j++ ){
        
          let VideoeUrl = await tab.evaluate(function(ele){
             return ele.getAttribute("href");
          },videos[j]); 
          url[i].urls.push(string + VideoeUrl); 
         
           }
          await wait(2000);   

       
        }
        


        console.log(url);

        let count = 0 ; 
        let finalData = [];
        let total_likes = "" ; 
       
        for( let i = 0 ; i < url.length ;  i ++){
         finalData.push( {"genre" : genre[i]});
         finalData[i]["videos"] =[];
         
         for(let j = 0 ; j < url[i].urls.length ; j++){
             await tab.goto(url[i].urls[j] , {
              waitUntil: 'networkidle2'
          });
             let temp_data= {};
             await tab.screenshot({ path: './image'+ i + j +count +'.jpg'  , type: 'jpeg' });
             
           
             await tab.waitForSelector("#button.style-scope.ytd-toggle-button-renderer", {visible: true});
             await tab.waitForSelector("#text[class='style-scope ytd-toggle-button-renderer style-text']", {visible: true});

             let like_dislike_info = await tab.$$("#text[class='style-scope ytd-toggle-button-renderer style-text']");
       
             let  Num_likes  = await tab.evaluate(function(ele){
              return ele.getAttribute("aria-label");
             },like_dislike_info[0]); 
             temp_data["Likes"]= Num_likes;
             await wait (2000);   
             let  Num_dislikes  = await tab.evaluate(function(ele){
              return ele.getAttribute("aria-label");
             },like_dislike_info[1]);
             temp_data["Dislikes"]= Num_dislikes;
             await wait (2000);   
             await tab.waitForSelector("yt-formatted-string[class='style-scope ytd-video-primary-info-renderer']", {visible: true});
             let title = await tab.$eval("yt-formatted-string[class='style-scope ytd-video-primary-info-renderer']",
                element=> element.textContent)
                temp_data["Title"]= title;

              await wait (1000);
              await tab.waitForSelector("#text a.yt-simple-endpoint.style-scope.yt-formatted-string", {visible: true});
              let channel_name = await tab.$eval("#text a.yt-simple-endpoint.style-scope.yt-formatted-string",
                 element=> element.textContent)
              temp_data["Channel_Name"]= channel_name;
              await wait (1000);  
              try {
                await tab.waitForSelector('#owner-sub-count.style-scope.ytd-video-owner-renderer');
                let subs_element =await tab.waitForSelector("#owner-sub-count.style-scope.ytd-video-owner-renderer", {visible: true});
                subscriber_count  = await tab.evaluate(function(ele){
                  return ele.getAttribute("aria-label");
                 },subs_element); 
                 
                await wait (1000); 
               
              } catch {
                subscriber_count = 0 ; 
              }
              
             
             
              
              
              
               
         
                              
              temp_data["Subscriber_count"]= subscriber_count;
               console.log(temp_data);
               finalData[i].videos.push(temp_data) ; 
              
              
               let buttons = await tab.$$("yt-icon-button#button #button.style-scope.yt-icon-button", {visible: true});
              
                 await buttons[5].click(); 
                    
                 await buttons[6].click(); 
                 await buttons[6].click(); 
                 await wait(1000);   
             }
        }
        fs.writeFileSync("youtube_data.json",JSON.stringify(finalData));
        await browser.close();
        
      }
        
         


main();