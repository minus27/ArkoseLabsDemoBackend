function getCookie(name){
  var re = new RegExp(name + "=([^;]+)");
  var value = re.exec(document.cookie);
  return (value != null) ? unescape(value[1]) : null;
 }

var arkosekey = getCookie("arkosekey");
var selectorid = getCookie("arkoseselector");

var script = document.createElement("script")
script.type = "text/javascript";
//Chrome,Firefox, Opera, Safari 3+
script.onload = function(){
  console.log("Script is loaded");
};
script.async = true;
script.defer = true;
script.setAttribute("data-callback", "setupEnforcement");
script.src = `//api.arkoselabs.com/v2/${arkosekey}/api.js`;
document.getElementsByTagName("head")[0].appendChild(script);

function setupEnforcement(myEnforcement) {
  myEnforcement.setConfig({
    selector: `${selectorid}`,
    onReady: function() {
       console.log("myEnforcement: Ready");
    },
    onCompleted: function(response) {
      console.log("myEnforcement: Completed");
      console.log(response.token);
      let xmlhttp = new XMLHttpRequest();

      let jsondata = JSON.stringify({
        username: $('#username').val(),
        password: $('#password').val()
      });

      xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          console.log("myEnforcement: XHR Call OK");
          console.log(this.getAllResponseHeaders());
          //alert(JSON.stringify(JSON.parse(this.responseText),null,"  "));
          var oResponse = JSON.parse(this.responseText);
          console.log(JSON.stringify(oResponse,null,"  "));
          location.assign(`${$('#form-id').attr('action')}?token=${oResponse.token}`);
        }
      };

      xmlhttp.open("POST","/api/login");
      xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xmlhttp.setRequestHeader('arkoseSessionToken', response.token);
      xmlhttp.send(jsondata);
    }
  });
}
