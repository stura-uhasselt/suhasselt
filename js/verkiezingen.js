/*
* Loader.js
* This file loads the JSON and provides the content for the page.
*
*/

var main;

var faculteiten;

var toLoad = 1;
var loaded = 0;
var toparse = 1;
var parsed = 0;
var loadingStatus = "Waiting for files to download.";

var mainCheck = false;

loadMain("verkiezingen.json");


function loadMain(file){
  var xmlhttp;
  if (window.XMLHttpRequest){
    // code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
  }
  else{
    // code for IE6, IE5
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  xmlhttp.onreadystatechange = function(){
    if (xmlhttp.readyState === 4 && xmlhttp.status === 200){
      loaded++;
      updateLoader();
      try {
        main = JSON.parse(xmlhttp.responseText);
        mainCheck = true;
        checkReady();
      } catch (error) {
        loadingStatus = "Parsing error file is not valid.";
        updateLoader();
        console.log(error);
      }
    }
  };
  var pad = file;
  xmlhttp.open("GET", pad, true);
  xmlhttp.send();
}

function checkReady() {
    if (mainCheck) {
      drawVerkiezingen();
      drawUpdateTime();
    }
}

function redraw(){
  drawVerkiezingen();
}

function escapeQuotes(string) {
    string = string.replace(/{/g, "(");
    string = string.replace(/}/g, ")");
    return string.replace(/\"/g, "'");
}

function updateLoader() {
    document.getElementById("faculteitenprogress").innerHTML = "<h2>Loading<img src=\"img/ionicons/load-d.svg\" width=\"30\" alt=\".\"/></h2><p>Downloading: " + loaded + "/" + toLoad + "</p><p>Parsing: " + parsed + "/" + toparse + "</p><p>Status: " + loadingStatus + "</p>";
}

function drawVerkiezingen(){
  var output = "";
  parsed = 0;
  loadingStatus = "parsing..";
  updateLoader();

  faculteiten = main.current;
  output += drawFaculteiten(faculteiten);

  document.getElementById("faculteitenprogress").innerHTML = output;
}

function drawUpdateTime(){
  var output = "";

  last_updated = main.last_updated;
  output += "Laatste update: " + last_updated;

  document.getElementById("lastupdated").innerHTML = output;
}

function drawFaculteiten(faculteiten) {
  var output = "";

  for (var i = 0; i < faculteiten.length; i++) {
    var faculteit = faculteiten[i];
    output += drawProgress(faculteit);
  }
  output += "";
  return output;
}

function drawProgress(faculteit){
  var output = "";

  var precent = Math.round(faculteit.votes / faculteit.total * 100);

  if(faculteit.faculteit == "Total"){
    output += "<hr>";
  }

  output += `
  <div class="row">
  <h1 class="col-md-1">${faculteit.faculteit}</h1>
  <div class="col-md-11">
    <div class="progress" style="height: 100px;">
      <div class="progress-bar" role="progressbar" style="width: ${precent}%; background-color: ${faculteit.bg_color}; color: ${faculteit.text_color};" aria-valuenow="${precent}" aria-valuemin="0" aria-valuemax="100"><h2>${precent}% = ${faculteit.votes}/${faculteit.total}</h2></div>
    </div>
  </div></div>`;

  return output;
}
