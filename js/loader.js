/*
* Loader.js
* This file loads the JSON and provides the content for the page.
*
*/

var main;

var groups;
var categories;

var categorieFilter = "";
var newFilter = true;
var filterlist = [];
var activeFilters = [];
var filterDataElement;

var language = document.getElementsByTagName("html")[0].getAttribute("lang");
//language = "en";

var contentMessage = {
  "waiting_download": {
    "en":"Waiting for files to download.",
    "nl":"Wacht op het downloaden van de bestanden.",
  },
  "parse_error":{
    "en":"Parsing error file is not valid.",
    "nl":"Bestand bevat fouten.",
  },
  "Loading":{
    "en":"Loading",
    "nl":"Laden",
  },
  "parsing":{
    "en":"parsing",
    "nl":"analyseren",
  },
  "New":{
    "en":"New",
    "nl":"Nieuw",
  },
  "More_Info":{
    "en":"More Info",
    "nl":"Meer Info",
  },
  "Featured":{
    "en":"Featured",
    "nl":"Uitgelicht",
  },
  "Filter_on":{
    "en":"Filter on",
    "nl":"Filter op",
  },
  "No_object_found":{
    "en":"No object found",
    "nl":"Geen object gevonden",
  }
};

var toLoad = 1;
var loaded = 0;
var toparse = 1;
var parsed = 0;
var loadingStatus = contentMessage.waiting_download[language];

var mainCheck = false;

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
        loadingStatus = contentMessage.parse_error[language];
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
      parseCategories();
      drawFilterButtons();
      drawFeaturedList();
      addMoreFilters();
      drawGroupList(categorieFilter);
    }
}

function redraw(){
  if(activeFilters.length == 0){
    drawFeaturedList();
  }
  drawGroupList(categorieFilter);
}

function escapeQuotes(string) {
    string = string.replace(/{/g, "(");
    string = string.replace(/}/g, ")");
    return string.replace(/\"/g, "'");
}

function updateLoader() {
    document.getElementById("groupList").innerHTML = "<h2>"+ contentMessage.Loading[language] +"<img src=\"img/ionicons/load-d.svg\" width=\"30\" alt=\".\"/></h2><p>Downloading: " + loaded + "/" + toLoad + "</p><p>Parsing: " + parsed + "/" + toparse + "</p><p>Status: " + loadingStatus + "</p>";
}

function parseCategories(){
  categories = main.categories;
}

function drawFeaturedList(){
  var output = "";
  parsed = 0;
  loadingStatus = contentMessage.parsing[language] + "...";
  updateLoader();

  groups = main.groups;
  output += drawGroups(groups, true);

  document.getElementById("featuredList").innerHTML = output;
}

function drawGroupList(categorieFilter) {
  var output = "";
  parsed = 0;
  loadingStatus = contentMessage.parsing[language] + "...";
  updateLoader();

  groups = main.groups;
  output += drawGroups(groups, false, categorieFilter);

  document.getElementById("groupList").innerHTML = output;
}

function drawGroups(groups, featured, categorieFilter) {
  var output = "";
  var filteredgroups = groups;

  // Apply filters
  for (var i = 0; i < activeFilters.length; i++) {
    filterDataElement = activeFilters[i].filter_data;
    filteredgroups = $.map(filteredgroups, activeFilters[i].filter);
  }

  // Resort List
  filteredgroups.sort(compareCreationDateReverse);

  for (var i = 0; i < filteredgroups.length; i++) {
    var group = filteredgroups[i];
    if(featured){
      if(group.featured == true){
        output += drawFeaturedGroup(group);
      }
      continue;
    }
    output += drawGroup(group);
  }
  return output;
}

function compareCreationDateReverse(a,b) {
  if (a.creationDate > b.creationDate)
    return -1;
  if (a.creationDate < b.creationDate)
    return 1;
  return 0;
}

function drawGroup(group){
  var output = "";

  creationDate = new Date(group.creationDate);
  var diffWeeksAgo = getWeeksAgo(creationDate);
  var newBadge = "";
  if(diffWeeksAgo <= 4){
    newBadge = `<span class="badge badge-primary">${contentMessage.New[language]}</span>`;
  }
  var headerImg = "";
  if(group.logo != ""){
    headerImg = `<img class="card-img-top" src="${main.imgpath}/${group.logo}" alt="">`;
  }

  output += `<div class="col-sm-12 col-md-6 col-xl-4">
              <div class="card">
                ${headerImg}
                <div class="card-body">
                  <h3 class="card-title">${group.name} ${newBadge}</h3>
                  <p class="card-text">${group.description_short[language]}</p>
                  <div>${drawCategoryBadge(group.category)} ${drawTagBadge(group.tags)}</div>
                  ${drawGroupModalButton(group)}
                </div>
              </div>
            </div>`;

  return output;
}

function drawGroupModalButton(group){
  var output = "";
  output += `<button class="card-link btn btn-light" type="button" data-toggle="modal" data-target="#groepinfoModel"
             data-group='${JSON.stringify(group).replace(/'/g, "\\'")}'>${contentMessage.More_Info[language]}</button>`;
  return output;
}

/*
${drawCategoryBadge("Sport")} ${drawCategoryBadge("Cultuur")}
${drawCategoryBadge("Politiek")} ${drawCategoryBadge("Religie")}
${drawCategoryBadge("Business")} ${drawCategoryBadge("Onderwijs")}
${drawCategoryBadge("Onderzoek")} ${drawCategoryBadge("Creatie")}
${drawCategoryBadge("Evenementen")} ${drawCategoryBadge("Hulpverlening en Ondersteuning")}
${drawCategoryBadge("Andere")}
*/

function drawFeaturedGroup(group){
  var output = "";

  creationDate = new Date(group.creationDate);
  var diffWeeksAgo = getWeeksAgo(creationDate);
  var newBadge = "";
  if(diffWeeksAgo <= 4){
    newBadge = `<span class="badge badge-light">${contentMessage.New[language]}</span>`;
  }
  var headerImg = "";
  if(group.logo != ""){
    headerImg = `<img class="card-img-top" src="${main.imgpath}/${group.logo}" alt="">`;
  }

  output += `<div class="col-sm-12 col-md-6 col-xl-4">
              <div class="card text-white bg-primary">
                <div class="card-header">${contentMessage.Featured[language]}</div>
                ${headerImg}
                <div class="card-body">
                  <h3 class="card-title">${group.name} ${newBadge}</h3>
                  <p class="card-text">${group.description_short[language]}</p>
                  <div>${drawCategoryBadge(group.category)}${drawTagBadge(group.tags)}</div>
                  ${drawGroupModalButton(group)}
                </div>
              </div>
            </div>`;

  return output;
}

function drawCategoryBadge(categoryID){
  var output = "";
  category = findCategory(categoryID);
  if(category == null){
    return "";
  }
  var style = `color:${category.color}; background-color:${category.bgcolor};`;
  output += `<span class="badge" style="${style}">${category.name[language]}</span>`;
  return output;
}

function drawTagBadge(tags){
  var output = "";
  for (var i = 0; i < tags.length; i++) {
    output += drawCategoryBadge(tags[i]) + " ";
  }
  return output;
}


function getWeeksAgo(date) {
    var today = new Date(Date.now());
    var oneWeek = 24 * 60 * 60 * 1000 * 7; // hours*minutes*seconds*milliseconds
    return Math.floor(Math.abs((today.getTime() - date.getTime()) / (oneWeek)));
}

//--------------Filters----------

function addMoreFilters(){
  var filteritem = {
    "value":"new",
    "display_text":contentMessage.New[language],
    "display":`<div>${contentMessage.New[language]}</div>`,
    "filter":function(group){
      creationDate = new Date(group.creationDate);
      var diffWeeksAgo = getWeeksAgo(creationDate);
      if(diffWeeksAgo <= 4){return group;}
    },
    "badge":`<button type="button" class="btn btn-light filter-new" onclick="removeFilter('new');">
    <span class="badge badge-primary">${contentMessage.New[language]}</span>
    <img src="img/ionicons/close-circled.svg" width="20"></button>`,
    "filter_data":"",
    "ID":"new"
  }
  filterlist.push(filteritem);
}

function findCategory(categoryID){
  for(var i = 0; i < categories.length; i++){
    if(categories[i].ID == categoryID){
      return categories[i];
    }
  }
  return null;
}

function drawFilterButtons(){
  var output = "";
  var categoryButtons = "";
  for(var i = 0; i < categories.length; i++){
    var category = categories[i];
    categoryButtons += `<button type="button" class="dropdown-item"
    onclick="triggerFilter('${category.ID}');">${drawCategoryBadge(category.ID)}</button>`;
    filterID = `category-${category.name}`;

    var filteritem = {
      "value":category.name[language],
      "display_text":`${category.name[language]}`,
      "display":`<div>${category.name[language]}</div>`,
      "filter":function(group){if(group.category == filterDataElement){return group;}},
      "badge":`<button type="button" class="btn btn-light filter-category" onclick="removeFilter('${filterID}');">${drawCategoryBadge(category.ID)}
      <img src="img/ionicons/close-circled.svg" width="20"></button>`,
      "filter_data":category.ID,
      "ID":filterID
    }
    filterlist.push(filteritem);
  }
  output += `<div class="btn-toolbar mb-12" role="toolbar" aria-label="FilterToolbar">
    <div class="btn-group" role="group" aria-label="CategoryFilter">
      <div class="input-group" id="filterbox">
        <input type="text" class="form-control typeahead" placeholder="${contentMessage.Filter_on[language]} ..." aria-label="FilterField">
      </div>
      <div id="filterActive">
      </div>
    </div>
  </div>`;
  document.getElementById("filterCategory").innerHTML = output;

  $('#filterbox .typeahead').typeahead({
    hint: true,
    highlight: true,
    minLength: 1
  },
  {
    name: 'filter',
    source: function(query, process) {
      var substrRegex = new RegExp(query, 'i');
      var results = $.map(filterlist, function(item) {
        if (substrRegex.test(item.value)) {
          return item;
        }
      });
      process(results);
    },
    display: function(item) {
      return item.display_text;
    },
    templates: {
      empty: function(){return `<div class="empty-message">${contentMessage.No_object_found[language]}</div>`},
      suggestion: function(item){
        return item.display;
      }
    }
  });
  $('#filterbox .typeahead').bind('typeahead:select', function(ev, item) {
    //console.log('Selection: ' + item.display_text);
    activeFilters.push(item);
    $('#filterbox .typeahead').typeahead('val','');
    drawFilterBadges();
    redraw();
  });
}

function drawFilterBadges(){
  var output = "";
  for(var i = 0; i < activeFilters.length; i++){
    output += activeFilters[i].badge;
  }
  document.getElementById("filterActive").innerHTML = output;
}

function removeFilter(filterID){
  for(var i = 0; i < activeFilters.length; i++){
    if(activeFilters[i].ID == filterID){
      activeFilters.splice(i, 1);
      break;
    }
  }
  drawFilterBadges();
  redraw();
}
