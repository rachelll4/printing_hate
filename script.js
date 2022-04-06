const productDOM = document.getElementById("datatable_center");
const profileDOM = document.querySelector("#profile-box")

//put current data into global var
var filteredProducts = [];
var cIndex = 0;
var gridSize = 6;
var currentType = ['all'];
var totalDatacards = 0;

class UI {

    displayProductsSmallAllCats(products, type){
        filteredProducts = [];
        cIndex = 0;

        console.log('displayProductsSmallAllCats');

        //build a conditional statement with text
        var conditionalCats = "";
        if(type[0]!='all'){
            for (var i=0; i<type.length; i++){
                console.log('filter: '+type[i]);
                if (i>0){
                    conditionalCats+=' && ';
                }
                conditionalCats += 'product.'+type[i].split(':')[0] +"=="+type[i].split(':')[1];
            }
        }
        console.log('conditionalCats: '+conditionalCats);
        console.log(products)
        for (var product of products){
            if (type[0]=='all' || eval(conditionalCats)){
                var temp_data = `
                <div class = "data-card" data-rowid=${product.rowid}>
                    <span class = "news-name">${product.current_title}</span>
                    <div class="badges">`
                if (product['story_link']!='n'){ temp_data+=`<a class="story-written"href=${product['story_link']}>Story</a>`}
                temp_data+=`</div>
                    <div class="news-setting"> <span style="white-space:nowrap;">${product.city}, ${product.state}</span></div>`

                temp_data+=`<p class="term-text">`
                var first = true;
                if (product.pcf_sensational== "y"){
                    if (!first){temp_data+=`<span style="color: #cd2600;"> &#9679 </span>`}
                    first = false;
                    temp_data+='<span class="single-term">Uses sensational/racist language</span>'
                }
                if (product.pcf_justified_lynching== "y"){
                    if (!first){temp_data+=`<span style="color: #cd2600;"> &#9679 </span>`}
                    first = false;
                    temp_data+='<span class="single-term">Justifies lynching</span>'
                }
                if (product.pcf_guilt_assumption== "y"){
                    if (!first){temp_data+=`<span style="color: #cd2600;"> &#9679 </span>`}
                    first = false;
                    temp_data+='<span class="single-term">Assumes victim guilt</span>'
                }
                if (product.pcf_organizing == "y"){
                    if (!first){temp_data+=`<span style="color: #cd2600;"> &#9679 </span>`}
                    first = false;
                    temp_data+='<span class="single-term">Plays organizing role</span>'
                }

                temp_data+= `</p><p>Learn more and view stories  &#8594</p></div>`;
                filteredProducts.push(temp_data);
            }
        }

        var results="";
        for (var i = 0; i< gridSize && i< filteredProducts.length; i++){
            results += filteredProducts[i]
        }
        productDOM.innerHTML = results;

        var allDatacards = document.getElementsByClassName('data-card');
        for (var i = 0; i< allDatacards.length; i++){
            allDatacards[i].onclick = function() { onClickSeeFullProfile(this); };
        }

        //BUILD DATA SENTENCE
        if (filteredProducts.length == 0){
            document.getElementById("data-sentence").innerHTML="";
            productDOM.innerHTML = '<div id="noDatacardsText">No newspapers match this selection.</div>';
        } else{
            if (document.getElementById('dropbtn').textContent=='Any' || document.getElementById('dropbtn').textContent=='select'){
                document.getElementById("data-sentence").innerHTML="<span style='color:#cd2600;'>Across the nation,</span> "
            }
            else{
                document.getElementById("data-sentence").innerHTML="In <span style='color: #cd2600;'>"+document.getElementById('dropbtn').textContent+",</span> "
            }

            document.getElementById("data-sentence").innerHTML+="the Howard Center identified <span style='color: #cd2600;'>"+filteredProducts.length + "</span> newspaper";
            if (filteredProducts.length != 1){
                document.getElementById("data-sentence").innerHTML+="s";
            }

            var pcfTypes = currentType.filter(function(e) {return e.substr(0,3) == 'pcf'});

            if (pcfTypes.length == 0) {
              document.getElementById("data-sentence").innerHTML+=" with harmful coverage";
            }

            if (pcfTypes.length != 0){
                document.getElementById("data-sentence").innerHTML+=" that"
                for (var i = 0; i < pcfTypes.length; i++){
                    if (i != 0 && i == pcfTypes.length -1){ //not first but is last
                        document.getElementById("data-sentence").innerHTML+=" and "
                    }
                    else if (i != 0){ //else not first
                        document.getElementById("data-sentence").innerHTML+=","
                    }
                    document.getElementById("data-sentence").innerHTML+= {
                        'pcf_sensational' : ' used sensational language',
                        'pcf_justified_lynching' : ' justified lynching',
                        'pcf_guilt_assumption' : ' assumed victim guilt',
                        'pcf_organizing' : ' played an organizing role'
                    }[pcfTypes[i].split(':')[0]];

                }
            }


            document.getElementById("data-sentence").innerHTML+="."


        }

        //hide prev button until it's possible to go backwards
        document.getElementById('arr-prev').style.visibility = 'hidden';
        if (filteredProducts.length > gridSize){
            document.getElementById('arr-next').style.visibility = 'visible';
        }else{
            document.getElementById('arr-next').style.visibility = 'hidden';
        }

    }

}


const ui = new UI();

if (document.body.id == "main"){

    var currentDate = new Date();
    console.log("currentDate = "+ Date.parse(currentDate));
    console.log("timeToRefresh = "+ localStorage.getItem('timeToRefresh'));

    makeRequest('GET', 'newspapers_local_version.json')
    .then(function (jsonReturned) {
        console.log('found the json off the xhr object')
        const products = JSON.parse(jsonReturned);
        localStorage.setItem("newsDataArray", JSON.stringify(products));
        console.log("products loaded and saved");
    })
    .then(function () {
        dynamicSizing(); // CALLS DISPLAY
        window.matchMedia("(max-width: 1000px)").addListener(dynamicSizing);
        console.log("window sizing aligned");
    })
    .then(function () {
        document.getElementById('dropbtn').onclick = function() {onClickShowDropdown()};

        document.getElementById("btnAll").onclick = function() {onClickSortNew(this,'all');};
        document.getElementById("btnSensational").onclick = function() {onClickSortNew(this,'pcf_sensational:"y"');};
        document.getElementById("btnAcceptable").onclick = function() {onClickSortNew(this,'pcf_justified_lynching:"y"');};
        document.getElementById("btnGuilty").onclick = function() {onClickSortNew(this,'pcf_guilt_assumption:"y"');};
        document.getElementById("btnOrganize").onclick = function() {onClickSortNew(this,'pcf_organizing:"y"');};

        document.getElementById('arr-next').onclick = function() {onClickGetNext();};
        document.getElementById('arr-prev').onclick = function() {onClickGetPrev();};

        var allPossibleStates = document.getElementsByClassName('possible-state');
        for (var i = 0; i< allPossibleStates.length; i++){
            allPossibleStates[i].onclick = function() { onClickFindStates(this); };
            console.log('added clicker');
        }
        console.log("all handlers added");
    })
    .catch(function (err) {
      console.error('Augh, there was an error!', err.statusText);
    });

}
else if (document.body.id == "profile"){

    if (!localStorage.getItem('newsDataArray')){
        console.log("no data-- loading in");

        makeRequest('GET', 'newspapers_local_version.json')
        .then(function (jsonReturned) {
            console.log("start 1")
            const products = JSON.parse(jsonReturned);
            console.log("all of products: "+products);
            return products;
        })
        .then(function (products){
            console.log("start 2")
            localStorage.setItem("newsDataArray", JSON.stringify(products));
            console.log('data achieved: '+JSON.parse(localStorage.getItem('newsDataArray')));
            console.log("starting display data");
            var currentNewsData = JSON.parse(localStorage.getItem('newsDataArray'))[window.location.href.split('=')[1]-1];

            populateProfile(currentNewsData);
            console.log("data displayed");
            document.getElementById("back-button").onclick = function() {onClickReturnHome();};
        })
    } else {
        console.log('data achieved: '+JSON.parse(localStorage.getItem('newsDataArray')));

        console.log("starting display data");
        var currentNewsData = JSON.parse(localStorage.getItem('newsDataArray'))[window.location.href.split('=')[1]-1];

        populateProfile(currentNewsData);
        console.log("data displayed");

        document.getElementById("back-button").onclick = function() {onClickReturnHome();};
    }

}



// ####################### enter functions


//populates profile page with specific newspaper data
function populateProfile(currentNewsData){
    console.log("running populate");
    console.log("currentNewsData: " +currentNewsData);

    var result = `
    <div id="newspaper-header" class="padded"><div class="second-underline"><div class="second-underline padded">${currentNewsData.current_title}</div></div>
    </div>
    <div class="container">
        <div class = "row">
            <div class = "col-xl-6 order-12" >
                <div id = "newspaper_info" >
                    <div class = "coverage">`

                        /* if (currentNewsData.story_link != 'n'){
                            result += `<div id = "coverage_link"><a href=${currentNewsData['story_link']}>See our story </a> <span id = "link_arrow" >&#8594;</span></div> `
                        }*/

                        result += `<embed src="https://docs.google.com/gview?url=https://lynching.cnsmaryland.org/lynching_data/pdfs/${currentNewsData.pdf_packet}&embedded=true" width="100%" height="100%" />`






                      /*  result += `<iframe

                          src=${currentNewsData['embed_link']}
                          title="Attorney General letter (Hosted by DocumentCloud)"
                          width="1800"
                          height="905"
                          style="border: 1px solid #aaa; width: 100%; height: 800px; height: calc(100vh - 100px); "
                          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
                        ></iframe> ` */

                    result += `</div>
                </div>
            </div>

            <div class = "col-xl-6">
                <div id = "write-up" >

                    </ul>
                    <div id = "write_up_container" >
                    <p class="inside_box_header"><span class="inside_box_header_title">${currentNewsData.current_title}</span><br>
                    ${currentNewsData.city}, ${currentNewsData.state}<br>`
                    if (currentNewsData.current_site_link != "n") result += `<a href="${currentNewsData.current_site_link}" target="_blank">View Website</a>`
                    result += `</p><hr size="1" width="75%" align="center" noshade style="background-color: #cd2600;">

                        <p>
                            The Howard Center found <span id = "write-up_title"> ${currentNewsData.current_title} </span>
                            coverage of <span class = "write-up_emphasis"> ${currentNewsData.all_victims.split(',').length}</span> lynching  ${(currentNewsData.all_victims.split(',').length == 1) ? "victim": "victims"}.
                        </p>

                        <p>
                            In analysis of relevant news coverage, the Howard Center found that ${(currentNewsData.current_title.startsWith('The')) ? "": "the"} <span id = "write-up_title">${currentNewsData.current_title} </span> :

                            <ul class = "write-up_emphasis">`
                            var no_pcf = true
                            if (currentNewsData.pcf_sensational == 'y'){ no_pcf=false; result += `<li>Used sensational/racist language</li>`}
                            if (currentNewsData.pcf_justified_lynching == 'y'){ no_pcf=false; result += `<li>Justified lynching</li>`}
                            if (currentNewsData.pcf_guilt_assumption == 'y'){ no_pcf=false; result += `<li>Assumed victim guilt</li>`}
                            if (currentNewsData.pcf_organizing == 'y'){ no_pcf=false; result += `<li>Played an organizing role</li>`}
                            if (no_pcf == true){result += `Had no problematic coverage offenses`}
                            result += `</ul>
                        </p>

                        <p>The Howard Center found that ${(currentNewsData.current_title.startsWith('The')) ? "": "the"} <span id = "write-up_title">${currentNewsData.current_title} </span> covered ${(currentNewsData.all_victims.split(',').length == 1) ? "this": "these"} lynching ${(currentNewsData.all_victims.split(',').length == 1) ? "victim": "victims"}:</p>
                        <ul class = write-up_emphasis>`
                        var victims = currentNewsData.all_victims.split(', ')
                        var dates = currentNewsData.all_years.split(', ')
                        for ( var i = 0; i < victims.length; i++){
                            result += `<li>${victims[i]} in ${dates[i]}</li>`
                        }


                        result += `</ul>
                        <hr size="1" width="100%" align="center" noshade style="background-color: #cd2600;">
                        <p>View original newspaper images</p>
                        <ul class="write-up_emphasis">
                          <li> <a href="https://lynching.cnsmaryland.org/lynching_data/pdfs/${currentNewsData.pdf_packet}" target="_blank">View full PDF packet</a></li>`

                        var directLink = currentNewsData.all_direct_links.split(', ')

                        var directNPcomLink = directLink.filter(
                          function(item) {
                              return item.startsWith("https://www.newspapers.com")
                          }
                        )
                        console.log(directNPcomLink)

                        var counter = 0
                        console.log(directNPcomLink.length)
                        for ( var i = 0; i < directNPcomLink.length; i++) {
                                result += `<li> <a href=${directNPcomLink[i]} target="_blank"> Newspapers.com link ${counter+1} </a></li>`
                                counter = counter + 1
                              }





                      result += `</ul>`

                        if (currentNewsData.story_link != 'n'){
                            result += `<div id = "coverage_link"><a href=${currentNewsData['story_link']}>See our story </a> <span id = "link_arrow" >&#8594;</span></div>`
                            }

                        result += `
                    </div>
                </div>
            </div>
        </div>
    </div>`
    profileDOM.innerHTML = result;

}

function makeRequest (method, url) { //'GET', 'json_path'
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };
    xhr.send();
  });
}


function onClickSeeFullProfile(obj){
    window.location.href="full-profile.html?currentID="+obj.dataset.rowid;
}

function onClickSortNew(obj, type){
    console.log('onClickSortNew: '+obj+", "+type+", "+currentType);

    //if it's 'all' then just push type
    if (currentType[0] != 'all' && currentType.indexOf(type) != -1){
        //present, toggle off
        console.log('already here');
        currentType.splice(currentType.indexOf(type),1);
        obj.style.backgroundColor='#1a1b1b';
        obj.style.color='#ededed';
        if (currentType.length == 0){
            currentType = ['all'];
        }
    } else { //not present, so push
        if(type=='all'){ //all button pushed
            currentType = currentType.filter(function(e) {return e.substr(0,3) != 'pcf'}); //does not catch organizing role
            for (var element of document.getElementsByClassName('sortbtn')){
                element.style.backgroundColor = '#1a1b1b';
                element.style.color = '#ededed';
            }
        }
        else{
            var element = document.getElementById('btnAll');
            element.style.backgroundColor = '#1a1b1b';
            element.style.color = '#ededed';
        }

        currentType = currentType.filter(function(e) {return e != 'all'});
        console.log('all or not there, so new type');
        currentType.push(type);
        obj.style.backgroundColor='#cd2600';
        obj.style.color='#ededed';
    }


    console.log("currentType: "+currentType);
    ui.displayProductsSmallAllCats(JSON.parse(localStorage.getItem("newsDataArray")),currentType);

}

/*####################################################*/
function onClickFindStates(obj){
    document.getElementById('dropbtn').textContent = obj.textContent;

    currentType = currentType.filter(function(e) {return e.split(':')[0] != 'state'}); //remove any/all states

    if (obj.textContent == 'Any'){
        if (currentType.length == 0){
            currentType = ['all'];
        }
        document.getElementById('dropbtn').style.backgroundColor='#1a1b1b';
        document.getElementById('dropbtn').style.color='#ededed';
    } else{
        currentType = currentType.filter(function(e) {return e != 'all'});
        currentType.push(("state:'"+obj.textContent+"'"));
        document.getElementById('dropbtn').style.backgroundColor='#cd2600';
        document.getElementById('dropbtn').style.color='#ededed';
    }

    console.log('currentType: '+currentType);
    ui.displayProductsSmallAllCats(JSON.parse(localStorage.getItem("newsDataArray")), currentType);
}


function onClickReturnHome(){
    window.location.href="index.html";
}


function onClickGetPrev(){
    //PREV button will take current index minus TICKER obj or until 0
    //should always be correct number

    console.log("prev!");
    if (cIndex >= gridSize){

        cIndex -= gridSize;
        console.log("index= "+cIndex);

        var results="";

        for (var i = 0; i< gridSize; i++){
            results += filteredProducts[cIndex + i];
        }
        productDOM.innerHTML = results;

        //still have to add handlers for these datacards
        var allDatacards = document.getElementsByClassName('data-card');
        for (var i = 0; i< allDatacards.length; i++){

            console.log("here's a datapoint: "+allDatacards[i]);
            allDatacards[i].onclick = function() { onClickSeeFullProfile(this); };

        }

        //check what buttons to display
        if (cIndex < gridSize){
            document.getElementById('arr-prev').style.visibility = 'hidden';
        }
        if (cIndex < filteredProducts.length - gridSize){
            document.getElementById('arr-next').style.visibility = 'visible';
        }
    }

}


function onClickGetNext(){
    //NEXT button will take current index to next TICKER obj or until length of array
    //if current ID is less than TICKER away from length, take TICKER to end
    console.log("next!");
    if (cIndex <= filteredProducts.length - gridSize){

        cIndex += gridSize;
        console.log("index= "+cIndex);

        var results="";

        for (var i = 0; i< gridSize; i++){
            if(cIndex + i < filteredProducts.length){
                results += filteredProducts[cIndex + i];
            }

        }
        productDOM.innerHTML = results;

        //still have to add handlers for these datacards
        var allDatacards = document.getElementsByClassName('data-card');
        for (var i = 0; i< allDatacards.length; i++){

            console.log("here's a datapoint: "+allDatacards[i]);
            allDatacards[i].onclick = function() { onClickSeeFullProfile(this); };

        }

        //check what buttons to display
        if (cIndex >= gridSize){
            document.getElementById('arr-prev').style.visibility = 'visible';
        }
        if (cIndex >= filteredProducts.length - gridSize){
            document.getElementById('arr-next').style.visibility = 'hidden';
        }
    }
}

/*from w3school---------------------------------------*/
function onClickShowDropdown() {
  document.getElementById("myDropdown").classList.toggle("show");
  console.log("opened");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('#dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    for (var i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

//--------------------------------------------------------


//media query changes gridSize for datatable, straight from w3chools
function dynamicSizing() {
  if (window.matchMedia("(max-width: 1000px)").matches) { // If media query matches
    console.log("make it 3 big");
    gridSize = 3;
    ui.displayProductsSmallAllCats(JSON.parse(localStorage.getItem("newsDataArray")),currentType);
  }
  else {
    console.log("make it 6 big");
    gridSize = 6;
    ui.displayProductsSmallAllCats(JSON.parse(localStorage.getItem("newsDataArray")),currentType);
  }

}
