lo = require("lodash")
stores = require('./stores.js')
products = require('./products.js')
superagent = require("superagent")

make_store_element = (title, distance, hours, image_url, web_url, phone, dir_url ) => {
  
  elem = {
    "title": title + ", " + distance,
    "image_url": image_url,
    "subtitle": hours,
    "default_action": {
      "type":"web_url",
      "url": web_url
      // "webview_height_ratio": "full",
      // "messenger_extensions": true,
      // "fallback_url": web_url
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

make_product_element = (title, subtitle, image_url, web_url) => {
  
  elem = {
    "title": title,
    "image_url": image_url,
    "subtitle": subtitle,
    "default_action": {
      "type":"web_url",
      "url": web_url
      // "webview_height_ratio": "full",
      // "messenger_extensions": true,
      // "fallback_url": web_url
    },
    "buttons":[
      {
        "type":"web_url",
        "url": web_url,
        "title":"Product Details"
      }
    ]
  };
  
  return elem

}

make_generic_message = (elems) => {
  var msg = {
      "messages": [
        {
          "attachment":{
            "type":"template",
            "payload":{
              "template_type":"generic",
              "elements": elems
            }
          }
        }
      ]
    }
  return msg
}

make_text_message = (texts) => {
  txt = lo.map(texts, (text) => {return {text: text}})
  return {
    messages: txt
  }
}



module.exports = (app) => {
  
  app.get("/stores", function (request, response) {
    console.log('>>> Stores endpoint.')
    
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
    
    storesMessage = make_generic_message(storesElements)
    
    console.log(storesMessage)
    
    response.send(storesMessage);
  });
  
  
  
  app.get("/search", function (request, response) {
    console.log('>>> Search endpoint.')
    
    query = request.query.search_q
    console.log("search_q = ", query)
    
    productsElements = lo.map(products.hot, (elem) => {
      return make_product_element(
        elem.title,
        elem.subtitle,
        elem.image_url,
        elem.web_url
      )
    })
    
    resultsMessages = make_generic_message(productsElements)

    console.log(resultsMessages)
    
    response.send(resultsMessages);
  });
  
  
  app.get("/faq", function (request, response) {
    console.log('>>> Faq endpoint.')
    
    query = request.query.faq_q
    console.log("faq_q = ", query)
    
    superagent
       .post('https://westus.api.cognitive.microsoft.com/qnamaker/v1.0/knowledgebases/331317f3-3a40-42c3-967d-3a4b404a238d/generateAnswer')
       .send({ question: query })
       .set('Ocp-Apim-Subscription-Key', process.env.QA_SECRET)
       .set('Content-Type', 'application/json')
       .end(function(err, res) {
         if (err || !res.ok) {
           response.send({answer: "Oh no! error = " + err + ", " + JSON.stringify(res)});
         } else {
           console.log("res.body =", res.body)
           texts = [res.body.answer, "Score: " + res.body.score]
           console.log("texts =", texts)
           textMessage = make_text_message(texts)
           console.log('textMessage =', textMessage)
           response.send(textMessage);
         }
       });
    
  });

  
};