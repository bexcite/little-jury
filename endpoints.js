lo = require("lodash")
stores = require('./stores.js')


make_store_element = (title, distance, hours, image_url, web_url, phone, dir_url ) => {
  
  elem = {
    "title": title + ", " + distance,
    "image_url": image_url,
    "subtitle": hours,
    "default_action": {
      "type":"web_url",
      "url": web_url,
      "webview_height_ratio": "full",
      "messenger_extensions": true,
      "fallback_url": web_url
    },
    "buttons":[
      {
        "type":"phone_number",
        "phone_number": phone,
        "title": "Call Store"
      },
      {
        "type":"web_url",
        "url": dir_url,
        "title":"Get Directions"
      }
    ]
  };
  
  return elem

}



module.exports = (app) => {
  
  app.get("/stores", function (request, response) {
    console.log('>>> Stores enpoint.')
    
    storesElements = lo.map(stores, (elem) => {
      return make_store_element(
        elem.name,
        elem.calc_distance,
        elem.hours,
        elem.image_url,
        elem.url,
        elem.phone,
        elem.directions_url
      )
    })
    
    storesMessage = {
      "messages": [
        {
          "attachment":{
            "type":"template",
            "payload":{
              "template_type":"generic",
              "elements": storesElements
            }
          }
        }
      ]
    }
    
    
    // var testStores = JSON.parse(JSON.stringify(stores[0]));
    // testStores.messages.push({text: "ZipCode = " + request.query.zipcode});
    response.send(storesMessage);
  });

  
};