let url_to_head = (url) => {
  return new Promise(function(resolve, reject) {
      var script = document.createElement('script');
      script.src = url;
      script.onload = function() {
          resolve();
      };
      script.onerror = function() {
          reject('Error loading script.');
      };
      document.head.appendChild(script);
  });
}
let handle_close = (event) => {
  event.target.closest(".ms-alert").remove();
}
let handle_click = (event) => {
  if (event.target.classList.contains("ms-close")) {
      handle_close(event);
  }
}
document.addEventListener("click", handle_click);
const paypal_sdk_url = "https://www.paypal.com/sdk/js";
const client_id = "Af5_RwOeOEV7FRAlQlMX1pNYnWpw65eBcEYNTGmeSUr034tkIiRBf084fCpI4Rf7-Ha4y2ia4Pv0MQ0l";
const currency = "USD";
const intent = "capture";
let alerts = document.getElementById("alerts");


url_to_head(paypal_sdk_url + "?client-id=" + client_id + "&enable-funding=venmo&currency=" + currency + "&intent=" + intent)
.then(() => {
  document.getElementById("loading").classList.add("hide");
  document.getElementById("content").classList.remove("hide");
  let alerts = document.getElementById("alerts");
  let paypal_buttons = paypal.Buttons({
      onClick: (data) => {
      },
      style: {
          shape: 'rect',
          color: 'gold',
          layout: 'vertical',
          label: 'paypal'
      },

      createOrder: function(data, actions) {
          return fetch("http://localhost:3000/create_order", {
              method: "post", headers: { "Content-Type": "application/json; charset=utf-8" },
              body: JSON.stringify({ "intent": intent })
          })
          .then((response) => response.json())
          .then((order) => { return order.id; });
      },

      onApprove: function(data, actions) {
          let order_id = data.orderID;
          return fetch("http://localhost:3000/complete_order", {
              method: "post", headers: { "Content-Type": "application/json; charset=utf-8" },
              body: JSON.stringify({
                  "intent": intent,
                  "order_id": order_id
              })
          })
          .then((response) => response.json())
          .then((order_details) => {
              console.log(order_details);
              let intent_object = intent === "authorize" ? "authorizations" : "captures";
              alerts.innerHTML = `<div class=\'ms-alert ms-action\'>Thank you ` + order_details.payer.name.given_name + ` ` + order_details.payer.name.surname + ` for your payment of ` + order_details.purchase_units[0].payments[intent_object][0].amount.value + ` ` + order_details.purchase_units[0].payments[intent_object][0].amount.currency_code + `! Order ID: ` + order_details.id + `</div>`;
              paypal_buttons.close();
           })
           .catch((error) => {
              console.log(error);
              alerts.innerHTML = `<div class="ms-alert ms-action2 ms-small"><span class="ms-close"></span><p>An Error Ocurred!</p>  </div>`;
           });
      },

      onCancel: function (data) {
          alerts.innerHTML = `<div class="ms-alert ms-action2 ms-small"><span class="ms-close"></span><p>Order cancelled!</p>  </div>`;
      },

      onError: function(err) {
          console.log(err);
      }
  });
  paypal_buttons.render('#payment_options');
})
.catch((error) => {
  console.error(error);
});