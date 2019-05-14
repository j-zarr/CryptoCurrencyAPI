//only clicked button should be highlighted
$('button').on('click keyup', function (event) {

    //unless click search when no value entered- keep previous button selected- 
    //(so will display coins if type in search field as noted in later functions)
    if ($(this).text() === "Search" && $('#searchInput').val().length < 1) {
        return;
    }
    else {
        $('button').removeClass('selected');
        $(this).addClass('selected');
    }
    if (event.keyCode === 9) { //tab key should also highlight selected button
        $('button').removeClass('selected');
        $(this).addClass('selected');
    }
    $('#searchInput').on('keyup', function (event) {
        if (event.keyCode === 9) {
            $('button').removeClass('selected');
        }
    });
    $('#search').on('keyup', function (event) {
        if (event.keyCode === 9) {
            $('button').removeClass('selected');
            $('#search').addClass('selected');
        }
    });
    $('.switch').on('keyup', function (event) {
        if (event.keyCode === 9) {
            $('#search').removeClass('selected');
        }
    });
});

//trigger search button if press enter from input field
$('#searchInput').on('keyup', function (event) {
    if (event.keyCode === 13) {

        if ($('#searchInput').val() === "") {
            return;
        }
        else {
            $('#search').addClass('selected')
                .trigger('click');
        }
    }
});


// function to display coins from get request
function displayCoins() {
    $('.loadIcon').show();

    const coinsAPI = "https://api.coingecko.com/api/v3/coins/list";

    $.get(coinsAPI, function (response) {
        let objCoins = response;
        // let objCoins = JSON.parse(JSON.stringify(response));
        const partialCoins = objCoins.slice(400, 500);

        let coinsHTML = `<div class="cardsContainer">`;

        $.each(partialCoins, function (i, coin) {
            coinsHTML += `<div class="card">
                                <label class="switch" title="select for live reports">
                                  <input type="checkbox" class="checkbox" name=${coin.name.replace(/\s+/g, '-').toLowerCase()} onchange="toggleSelected(event)">
                                  <span class="slider round"></span>
                                </label>
                                <p class="id">${coin.id}</p>
                                <p class="symbol uppercase">${coin.symbol}</p>
                                <p class="name">${coin.name.toLowerCase()}</p> 
                                <div class="expander"></div>
                                <button class="infoBtn" name=${coin.id} onclick="showInfo(event)">More Info</button>
                              </div>`;
        });

        coinsHTML += '</div>'

        $('.loadIcon').fadeOut();
        $('#results').hide().html(coinsHTML).fadeIn(2000);

    });
}

//display coins on page load
$('document').ready(function () {
    displayCoins();

});

// display coins when home button clicked
$('#home').click(function () {
    displayCoins();
});



//more info button clicked  
function showInfo(event) {

    $('#searchInput').val('');

    $('.loadIcon').show();

    let id = event.target.name;
    let infoAPI = "https://api.coingecko.com/api/v3/coins/" + id;


    //retrieve from session storage if within 2 minutes or less (instead of new get request)
    let today = new Date();
    let time = (today.getHours() * 60 * 60) + (today.getMinutes() * 60) + today.getSeconds();
    let obj;
    let storageObj;

    for (let i = 0; i < sessionStorage.length; i++) {
        if (sessionStorage.length > 0 && sessionStorage.key(i) === id) {

            let getInfo = JSON.parse(sessionStorage.getItem(id).replace(/(\r\n)/g, ''));

            //Only if less 2 minutes or less passed since requested info,  load from sessionStorage
            if (time - getInfo.time <= 120) {
                $('.loadIcon').hide();
                $(event.target).parent().find('.expander').html(getInfo.infoCard);
                $(event.target).parent().find('.infoBtn').hide();

                return;
            }
        }
    }


    //if info not in session storage, continue with get request

    $.get(infoAPI, function (response) {
        let stringInfo = JSON.stringify(response);
        let replacedInfo = stringInfo.replace(/(\r\n)/g, '');
        //.replace(/"https/g, "'https")
        //  .replace(/">/g, "'>");
        let info = JSON.parse(replacedInfo);

        let infoCard =
            `<div class="infoCard">
                                     <p class="coinImgContainer"><img id="logo" src=${info.image.small}></p>
                                     <p class="price ils"><span style="font-size:25px;"> &#8362 </span> ${info.market_data.current_price.ils}</p>
                                     <p class="price usd"><span style="font-size:20px;"> &#36 </span> ${info.market_data.current_price.usd}</p>
                                     <p class="price eur"><span style="font-size:20px;"> &#8364 </span>  ${info.market_data.current_price.eur}</p> 
                                     <button class="backBtn" onclick="goBack(event)">Back</button>
                                     </div>`;


        $('.loadIcon').hide();
        //expand info + hide info button                
        $(event.target).parent().find('.expander').html(infoCard);
        $(event.target).parent().find('.infoBtn').hide();

        //set sessionStorage
        obj = {
            time,
            infoCard
        }
        storageObj = JSON.stringify(obj);
        sessionStorage.setItem(id, storageObj);

    });//end get cb
}//end showInfo function

//when click back button return to main card
function goBack(event) {
    $(event.target).parent().parent().parent().find('.infoBtn').show();
    $(event.target).parent().parent().parent().find('.expander').html('');
}



// search field button clicked 
$(".searchArea").on('click', 'button', function () {

    //if no value entered alert user
    if ($('#searchInput').val() === "") {

        alert("No coin entered, please enter a coin to search.")
        $(this).removeClass('selected');
        $('#searchInput').focus();
        return;

    } else if ($('#searchInput').val().length > 1) {
        $(this).addClass('selected');
    }

    $('.loadIcon').show();

    //allow user to search by coin name or symbol
    $('.cardsContainer').each(function () {
        $('.card').hide();
        $('.symbol').removeClass('uppercase');
        $('.symbol').addClass('lowercase');

        let searchVal = $('#searchInput').val().toLowerCase();
        $('div:contains("' + searchVal + '")').fadeIn(2000);
        $('.symbol').removeClass('lowercase');
        $('.symbol').addClass('uppercase');
        $('#search').removeClass('selected');
        $('#searchInput').val("").focus();

        if ($('div:contains("' + searchVal + '")').length < 1) {
            $('.symbol').removeClass('lowercase');
            $('.symbol').addClass('uppercase');
            alert('Coin not in database. Try searching another coin or scroll to see available coins.');
            if (($('.cardsContainer')).is(':visible')) {
                $('.card').show();
            } else {
                $('.card').fadeIn(2000);
            }
            $('#search').removeClass('selected');
            $('#searchInput').focus();
        }
    });

    $('.loadIcon').hide();

}); //end cb


//  if user wants to search from about/live reports page, display coins so accessible, if user starts to type in input field
//  + clear input value when click About/LR buttons (added in event callback functions)
$('#searchInput').on('input', function () {
    if ($('.card')[0]) {
        return;
    }
    $('#about').removeClass('selected');
    $('#reports').removeClass('selected');
    displayCoins();
});


//about button clicked
$("#about").click(function () {

    //if user typed input value but clicked about button instead of search, clears search field.
    $('#searchInput').val('');

    $('.loadIcon').show();

    let photo = document.createElement("IMG");
    photo.setAttribute("src", "./images/photo.jpg");
    photo.setAttribute("id", "myPhoto");

    const about =
        `<div class="wrapper">
   <div class="aboutContainer">
   <br>
    <p id="name"> ג'ולי ענזרות </p>
    <div id="hr2"><hr></div>
    <ul> In this project I built a Single Page Application to request information on cryptocurrency, applying knowledge in the following areas:</ul>
      <li>HTML 5</li>
      <li>CSS</li>
      <li>Bootstrap</li>
      <li>JavaScript</li>
      <li>jQuery</li>
      <li>Ajax</li>
      <li>External APIs</li>
    </div>
    </div>`;

    $('.loadIcon').hide();
    $('#results').hide().html(about).fadeIn(2000);
    $('#name').prepend(photo);

    //if click reports in middle, make coins accesible
    $('#reports').click(function (e) {
        if ($('.aboutContainer')[0]) {
            e.stopImmediatePropagation();
            alert('To select coins for reports click the Home button');
            $('#reports').removeClass('selected');
            $('#about').addClass('selected');
            return;
            //      if ($('#lineChart')[0]){
            //          return;
            //     }
            //      displayCoins();
        }
    })
});


//array used with toggle, modal, and report functions
let coinArr = [];

//toggles checked
function toggleSelected(event) {

    if ($(event.target).prop('checked')) {
        coinArr.push((event.target).name);

        //if uncheck remove from array
        $(event.target).on('change', function () {
            if ($(event.target).prop('checked') === false) {

                let unchecked = (event.target).name;
                let idx = coinArr.indexOf(unchecked);

                if (idx > -1) {
                    coinArr.splice(idx, 1);
                }
            }
        });
    }

    //in case click About in the middle, reset toggles
    $('button').click(function () {
        if ($(this).text() === 'About') {
            coinArr.length = 0;
            $('.checkbox').prop('checked') === false;
        }
    });


    let modalBox =
        `<div class="modalContainer">
                <div class="modal">
                     <div class="modalHeader"><p>Maximum 5 coins per report!</p></div>
                     <br>
                     <p> To return to main menu, click "Cancel". </p>
                     <p> To <span style="color:red;">remove </span> one or more coins from the list below, 
                     check the box and click "Save changes".</p>
                     <br>
                     <p> Once you click "Cancel"/"Save changes" you will be redirected to the main page
                      where you can make additional changes and/or request live reports. </p>
                     <hr>
                     <div class="selectedCoins"> </div>
                     <hr>
                     <div class="modalBtns"><button id="cancelBtn" onclick="cancelModal()"> Cancel </button> <button id="saveBtn" onclick="updateList()"> Save changes</button></div>
                     </div>
                   </div>
                </div>`;


    if (coinArr.length > 5) {
        coinArr.pop();
        $(event.target).prop('checked', false);
        $('#results').append(modalBox);
    }


    let coinList = `<div class="coinList">
                    <ul>`;

    $.each(coinArr, function (i, item) {
        coinList +=
            `<li class="selectionList keep"><input type="checkbox" class="removeCheckbox" onchange="removeFromList(event)">${item}</li>`;
    });

    coinList += `</ul>
                 </div>`;


    $(".selectedCoins").html(coinList);

}//end main function


//remove modal when cancel button clicked
function cancelModal() {
    $(".modalContainer").remove();
}


//modal box input
function removeFromList(event) {
    if ($(event.target).prop('checked') === true) {
        $(event.target).parent().removeClass('keep');
        $(event.target).parent().addClass('remove');
    }

    else if ($(event.target).prop('checked') === false) {
        $(event.target).parent().removeClass('remove');
        $(event.target).parent().addClass('keep');
    }

}





//coins marked for removal to be removed from array, untoggle from main page, and remove modal when "save changes" clicked
function updateList() {

    $('li.remove').each(function (i, item) {
        let checkedToRemove = $(item).text();

        let idx = coinArr.indexOf(checkedToRemove);

        if (idx > -1) {
            coinArr.splice(idx, 1);
        }

        //untoggle 
        $.each($('.checkbox'), function () {
            if ($(this).attr('name') === checkedToRemove) {
                $(this).prop('checked', false);
            }

        }); //end innerloop   


    }); //end outerloop  

    //remove modal
    $(".modalContainer").remove();


}//end main function




//live reports clicked
$('#reports').click(function () {

    $('#searchInput').val('');
    loadReports();
});


function loadReports() {

    //if already on live report chart page/about page, return   
    if ($('#lineChart')[0] || $('.aboutContainer')[0]) {
        return;
    }

    //if no toggles selected, alert user and return
    if (coinArr.length < 1) {

        alert('No coins selected. To select coins for reports, use the toggle button for the desired coins below.')
        $('#reports').removeClass('selected');
        $('.loadIcon').hide();
        return;
    }

    $('.loadIcon').show();

    let compareArr = [];
    let coinsForReport = '';
    let finalCoinsForReport = '';

    //get query string for end of url based on symbol attached to specific toggle
    $('.checkbox').each(function () {
        if ($(this).prop('checked') === true) {

            let symbol = $(this).parent().parent().find($('.symbol')).text().toUpperCase();
            compareArr.push(symbol); //to use to compare with coins not in API , for note in chart

            coinsForReport += symbol
            if (coinArr.length > 1) {
                coinsForReport += ',';
                finalCoinsForReport = coinsForReport.substring(0, coinsForReport.length - 1);
            } else if (coinArr.length = 1) {
                finalCoinsForReport += coinsForReport;
            }
        }
    });//end loop
    finalCoinsForReport += '&tsyms=USD';
    const reportsAPI = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=' + finalCoinsForReport;


    let coinLabelArr = [];
    let priceDPsArr = [];
    let timeArr = [];


    let responseArr = []; //array to compare with coinArr for coins not in API
    
    //fields for chart
    let dataPoints1 = [];
    let dataPoints2 = [];
    let dataPoints3 = [];
    let dataPoints4 = [];
    let dataPoints5 = [];

    let coin1 = '';
    let coin2 = '';
    let coin3 = '';
    let coin4 = '';
    let coin5 = '';
    let note = '';


    //set interval to send get request every 2 seconds
    let interval = setInterval(twoSeconds, 2000);

    function twoSeconds() {
        //on each get reset array
        coinLabelArr.length = 0;
        priceDPsArr.length = 0;
        responseArr.length = 0;


        $.get(reportsAPI, function (response) {
            let responseDetails = response;
            // let responseDetails = JSON.parse(JSON.stringify(response));

            $.each(responseDetails, function (i, price) {

                 // account for error message
                if (i === 'Response') {   
                    let j = responseDetails.Message;
                    let stringA = j.substring(0, 20);
                    let stringB = j.substring(42);
                    let message = stringA + ': ' + stringB;
                    coinLabelArr.push('', '', '', '', '');
                    price.USD = '';
                    note = message;
                }

                //account for coins not found in API (empty object returned)                        
                responseArr.push(i);
                if (note.length > 1 ){
                    return;
                } else {
                    if (compareArr.length > responseArr.length) {
                        let noData = [];
                        for (let x = 0; x < compareArr.length; x++) {
                            if (responseArr.indexOf(compareArr[x]) === -1) {
                                noData.push(compareArr[x]);
                                note = `Data not availabe for:  ${noData} `;
                            }
                        }
                    }
                }

                coinLabelArr.push(i);
                priceDPsArr.push(price.USD);

                //add coin details to chart 
                coin1 = coinLabelArr[0];
                dataPoints1.push(priceDPsArr[0]);
                if (coinLabelArr.length > 1) {
                    coin2 = coinLabelArr[1];
                    dataPoints2.push(priceDPsArr[1]);
                }
                if (coinLabelArr.length > 2) {
                    coin3 = coinLabelArr[2];
                    dataPoints3.push(priceDPsArr[2]);
                }
                if (coinLabelArr.length > 3) {
                    coin4 = coinLabelArr[3];
                    dataPoints4.push(priceDPsArr[3]);
                }
                if (coinLabelArr.length > 4) {
                    coin5 = coinLabelArr[4];
                    dataPoints5.push(priceDPsArr[4]);
                }

            }); //end of loop


            //create time labels for chart
            let today = new Date();
            let reportsTime = today.toLocaleTimeString();
            //let reportsTime = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            timeArr.push(reportsTime);
            if (timeArr.length > 20) {
                timeArr.splice(0, 1);
            }


            let canvas = `<section><canvas id="lineChart"></canvas></section>`
            $('#results').html(canvas); //add to DOM


            //build chart
            new Chart($('#lineChart'), {
                type: 'line',
                data: {
                    labels: timeArr,
                    datasets: [{
                        data: dataPoints1,
                        label: coin1,
                        backgroundColor: "#1A237E",
                        borderColor: "#1A237E",
                        fill: false
                    }, {
                        data: dataPoints2,
                        label: coin2,
                        backgroundColor: "#3F51B5",
                        borderColor: "#3F51B5",
                        fill: false
                    }, {
                        data: dataPoints3,
                        label: coin3,
                        backgroundColor: "#42A5F5",
                        borderColor: "#42A5F5",
                        fill: false
                    }, {
                        data: dataPoints4,
                        label: coin4,
                        backgroundColor: "#DAF7A6",
                        borderColor: "#DAF7A6",
                        fill: false
                    }, {
                        data: dataPoints5,
                        label: coin5,
                        backgroundColor: '#FFC300',
                        borderColor: '#FFC300',
                        fill: false
                    },
                    {
                        label: note,
                        backgroundColor: 'white',
                        borderColor: 'white',
                        fill: false
                    }]
                },
                options: {
                    events: ['mousemove'], // this is needed to fire onHover 
                    onHover: (event, chartElement) => {
                        event.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
                    },
                    animation: {
                        duration: 0
                    },
                    tooltips: {
                        mode: 'point',
                    },
                    layout: {
                        padding: {
                            left: 50,
                            right: 50,
                            top: 20,
                            bottom: 20,
                        }
                    },
                    title: {
                        display: true,
                        text: 'Live Reports',
                        fontColor: 'black',
                        fontSize: '20',
                    },
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            fontColor: 'black',
                            fontStyle: "bold",
                            filter: function (item, data) {
                                return item.text !== ''
                            }
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false,

                    scales: {
                        yAxes: [{
                            ticks: {
                                fontColor: 'white',
                                beginAtZero: false,
                                min: '-1000',
                                max: '7000',
                                stepSize: '1000',
                                fontSize: '14',
                                callback: function (value) {
                                    return '$' + value;
                                }
                            },
                            scaleLabel: {
                                display: true,
                                labelString: 'PRICE IN USD',
                                fontSize: '14',
                                fontColor: 'black',
                                fontStyle: "bold"
                            },
                            gridLines: {
                                display: true,
                                color: 'white',
                                zeroLineColor: 'white'
                            },
                        }],
                        xAxes: [{
                            gridLines: {
                                display: false,
                            },
                            ticks: {
                                fontColor: 'white',
                                fontSize: '14',
                                maxRotation: '45',
                                minRotation: '45',
                                autoSkip: false
                            },
                            scaleLabel: {
                                display: true,
                                labelString: 'TIME (updated every 2 seconds)',
                                fontSize: '14',
                                fontColor: 'black',
                                fontStyle: "bold"
                            }
                        }]
                    }
                }
            }); //end of chart build

            $('.loadIcon').hide();
        });//end of get cb   


        //if click a button or type in search field, clear interval and exit chart
        $('button').click(function () {
            if ($(this).text() !== 'Live Reports') {
                clearInterval(interval);
            }
        });

        $('#searchInput').on('input', function () {
            clearInterval(interval);
        });

    } //end of set interval for get request every 2 seconds


    //reset selection (clear selected coins array), clear all chart arrays  
    coinArr.length = 0;
    //compareArr.length = 0;
    timeArr.length = 0;
    coinLabelArr.length = 0;
    priceDPsArr.length = 0;
    responseArr.length = 0;


}// end of loadReports function
