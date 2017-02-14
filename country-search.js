var dataForSort = [];
var startCountryListFrom = 0;
var countryListTo = 12;
var totalPages = 1;
var currentPage = 1;
var totalCountaries = 0;
var countryListToShow = 0;
var countryListToShowPerPage = 0;

//Enabling Enter to call the function of click of button
$("#searchValue").keyup(function(event){
    if(event.keyCode == 13){
        $("#SearchBtn").click();
    }
});

/* 
* @method: onlyNumber
* @desc: It allows users to enter only positive numbers
* @param: event
*/
$(document).keyup(function(e) {
     if (e.keyCode == 27) { 
        $("#moreInfoModal").hide();
    }
});

/* 
* @method: onlyNumber
* @desc: It allows users to enter only positive numbers
* @param: event
*/
var onlyNumber = function (evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
}

/* 
* @method: onlyAlphabets
* @desc: It allows users to enter only alphabets in search text box
* @param: event and context of the search field
*/

//@feedback : 
// multiple return statements. SIngle exit functions only
// use regex
function onlyAlphabets(e, t) {
    try {
        if (window.event) {
            var charCode = window.event.keyCode;
        }
        else if (e) {
            var charCode = e.which;
        }
        else { 
            return true; 
        }

        if ((charCode > 64 && charCode < 91) || (charCode > 96 && charCode < 123))
            return true;
        else
            return false;
        }
    catch (err) {
        alert(err.Description);
    }
}

/* 
* @method: numberWithCommas
* @desc: It formats the number with comma
* @param: {number} value to be formated 
* @return: {string} formated value with comma
*/
var numberWithCommas = function(value){
    var _numberWithCommas = "";
    if (value) {
        _numberWithCommas = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } else {
        _numberWithCommas = "NA";
    }
    return _numberWithCommas;
};

/* 
* @method: sortData
* @desc: It sorts the data based on asc or desc oredr and number or string
* @param: dataForSort - [Array], sortAscOrder -{boolean}, sortFor {string}
* @return: [Array] - returns sorted array
*/
var sortData = function(sortAscOrder, sortFor) {
    var type = typeof dataForSort[0][sortFor] ;
    type = (type === 'object') ? 'number' : type;

    switch (type) {
        case "string" :
            if (sortAscOrder) {
                dataForSort.sort(function(obj1, obj2) {
                return obj1[sortFor].localeCompare(obj2[sortFor]);
            });
            } else {
                    dataForSort.sort(function(obj1, obj2) {
                    return obj2[sortFor].localeCompare(obj1[sortFor]);
                });
            }
            break;
        case "number" :
            if (sortAscOrder) {
                var sortedDataByName = dataForSort.sort(function(obj1, obj2) {
                return obj1[sortFor] - obj2[sortFor];
            });
            } else {
                    dataForSort.sort(function(obj1, obj2) {
                    return obj2[sortFor] - obj1[sortFor];
                });
            }
            break;
        default : 
            return dataForSort;
    }
    return dataForSort;
};

/*
* @desc: It hides the more info modal on outside click
* @triggerBy : outside more info modal click
*/
$(document).click(function(e) {
    if( e.target.id != 'moreInfoModal') {
    } else {
        $("#moreInfoModal").hide();
    }
});

/* 
* @method: prepareMoreInfoUI
* @desc: It prepares the more info modal UI
* @param: moreInfoData - [Array]
*/
var prepareMoreInfoUI = function(moreInfoData){
    $("#moreInfoModal").show();
    var countryData = moreInfoData[0];
    var countryName = document.getElementById("moreInfoTable").rows[0].cells[0];
    var $table = $("#moreInfoTable");
    countryName.innerHTML = countryData.name.toUpperCase();
    var rows = $table.find('tr');
    rows = rows.splice(1, rows.length);
    for(var row in rows){
        var valueToDisplay = "";
        var $currentRow = $(rows[row]);
        var currentKey = $currentRow.attr("data-keyname");
        var countryRowDetails = $($currentRow.children('td')[1]);
        switch(currentKey){
            case 'currencies':
                valueToDisplay = numberWithCommas(countryData[currentKey]);
                break;
            case 'altSpellings':
                valueToDisplay = countryData[currentKey].join(", ");
                break;
            case 'population':
                valueToDisplay = numberWithCommas(countryData[currentKey]);
                break;
            case 'area':
                valueToDisplay = numberWithCommas(countryData[currentKey]);
                break;
            case 'latlng':
                valueToDisplay = (countryData[currentKey][0]) ? countryData[currentKey][0] + "&#176;" : "NA";
                break;
            case 'latlng':
                valueToDisplay = (countryData[currentKey][1]) ? countryData[currentKey][1] + "&#176;" : "NA";
                break;
            case 'borders':
                valueToDisplay = countryData[currentKey].join(", ");
                break;
            case 'timezones':
                valueToDisplay = countryData[currentKey].join(", ");
                break;
            case 'callingCodes':
                valueToDisplay = (countryData[currentKey][0]) ? "+" + countryData[currentKey][0] : "NA";
                break;
            case 'languages':
                valueToDisplay = countryData[currentKey].join(", ").toUpperCase();
                break;
            default:
                valueToDisplay = (countryData[currentKey]) ? countryData[currentKey] : "NA";
        }
        
        countryRowDetails.html(valueToDisplay);
    }
};

/* 
* @method : getMoreInfo
* @triggerBy : click of search
* @desc : gets data of particular country
*/
var getMoreInfo = function(alpha3Code){
    $.ajax({
        type: 'GET',
        url: "https://restcountries.eu/rest/v1/alpha?codes=" + alpha3Code + "",
        crossDomain: true,
        cache: false,
        timeout: 10000000,
        beforeSend: function () {
            $(".modal").show();
        },
        success: function(data) {
            $(".modal").hide();
            prepareMoreInfoUI(data);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $(".modal").hide();
            alert("Check your internet connection");
        } 
    });
};

/* 
* @method: updateTable
* @desc: It updates the Country list table and appends the updatedTable in the page
* @param: data - [Array], startCountryListFrom -{number}, countryListTo {number}
*/
var updateTable = function(data, startCountryListFrom, countryListTo) {
    var searchInputValue = document.getElementById("searchValue").value;
    var myTable = document.getElementById("countryList");
	var rowCount = myTable.rows.length;
    $(".modal").hide();    
    document.getElementById('resultSummary').innerHTML = "Congratulations!! We have" + " " + data.length + " " + "results for" + " " + '"' + searchInputValue.toUpperCase().bold() + '".';
    $("#resultSummary").removeClass("error-message font-size-55");
    document.getElementById('resultSummary').className += " sucess-message font-size-35";

	for (var x=rowCount-1; x>0; x--) {
		myTable.deleteRow(x);
	}

	$("#tableContainer, #countriesPerPageContainer").show();
	var table = document.getElementById('countryList');
	for (var i = startCountryListFrom; i < countryListTo; i++){
		var tr = document.createElement('tr');

		//Adding Name of the country
		var tdName = document.createElement('td');
		tdName.innerHTML = data[i].name;
		tr.appendChild(tdName);

		//Adding Capital of the country
		var tdCapital = document.createElement('td');
		tdCapital.innerHTML = data[i].capital;
		tr.appendChild(tdCapital);

		//Adding Currency of the country
		var tdCurrency = document.createElement('td');
		tdCurrency.innerHTML = data[i].currencies[0];
		tr.appendChild(tdCurrency);

		//Adding Region of the country
		var tdRegion = document.createElement('td');
		tdRegion.innerHTML = data[i].region;
		tr.appendChild(tdRegion);

		//Adding Population of the country
        var population = numberWithCommas(data[i].population);
		var tdPopulation = document.createElement('td');
		tdPopulation.innerHTML = population;
		tr.appendChild(tdPopulation);

		//Adding Area of the country
        var area = numberWithCommas(data[i].area);
		var tdArea = document.createElement('td');
		tdArea.innerHTML = area;
		tr.appendChild(tdArea);

		//Adding AlphaCode3 of the country
		var tdAlphaCode3 = document.createElement('td');
		tdAlphaCode3.innerHTML = data[i].alpha3Code;
		tr.appendChild(tdAlphaCode3);

		//Adding Calling Code of the country
		var tdCallingCode = document.createElement('td');
        if(data[i].callingCodes[0]) {
            tdCallingCode.innerHTML = "+" + data[i].callingCodes[0];
        } else {
            tdCallingCode.innerHTML = "NA";
        }
		tr.appendChild(tdCallingCode);
		table.appendChild(tr);
	}
    $("#countryList tr:not(:first-child)").on('click', function(){   
        var alpha3Code = $(this).find('td:nth-child(7)').text();
        getMoreInfo(alpha3Code);
    });
    
    document.getElementById("countryList").appendChild(table);
};

/* 
* @method: toggleNavBtn
* @desc: It enables and disable the Next and Previous Buttons based on current page
*/

var toggleNavBtn = function() {
    $("#previousButton").prop('disabled', currentPage == 1);
    $("#nextButton").prop('disabled', currentPage == totalPages);
};

/* 
* @method: navigate
* @desc: It navigates to different Pages by calling updateTable function
* @param: startCountryListFrom - {number}
*/

var navigate = function(startCountryListFrom) {
    var startCountryListFromShow = startCountryListFrom + 1;
    countryListTo = parseInt(startCountryListFrom) + parseInt(countryListToShowPerPage);
    countryListToShow = countryListTo;
    countryListTo = countryListTo > totalCountaries ? totalCountaries : countryListTo;
    countryListToShow = countryListToShow > totalCountaries ? totalCountaries : countryListToShow;
    document.getElementById('pageDetails').innerHTML = "Page - " + currentPage + " of " + totalPages + ".  " + "Showing " + startCountryListFromShow + " - " + countryListToShow + " " + " Countries.";
    toggleNavBtn();
    updateTable(dataForSort, startCountryListFrom, countryListTo);
};

/* 
* @method: goToNextPage
* @desc: It navigates to next page
* @triggerBy : click on next button in navigation bar
*/

var goToNextPage = function() {
    currentPage = currentPage + 1;
    startCountryListFrom = 1 + countryListToShowPerPage*(currentPage - 1);
    navigate(startCountryListFrom);
};

/* 
* @method: goToPreviousPage
* @desc: It navigates to previous page
* @triggerBy : click on previous button in navigation bar
*/

var goToPreviousPage =function() {
    currentPage = currentPage - 1;
    startCountryListFrom = 1 + countryListToShowPerPage*(currentPage - 1);
    navigate(startCountryListFrom);
};

/* 
* @method: goToPage
* @desc: It navigates to clicked page
* @triggerBy : click on page number button in navigation bar
*/

var goToPage =function() {
    var value = parseInt($(this).val());
    currentPage = value;
    startCountryListFrom = countryListToShowPerPage*(value - 1);
    navigate(startCountryListFrom);
};

/* 
* @method: createNavigationButtons
* @desc: It creates buttons for all the pages
* @param: totalPages {number}
* @return: divWithNavigationButtons - div that contains all the buttons for pages
*/
var createNavigationButtons = function(totalPages) {
    var divWithNavigationButtons = document.createElement("span");
    for(j=1; j<=totalPages; j++){
        var buttons = document.createElement('button');
        buttons.className="navigation-buttons";
        buttons.value = j;
        buttons.innerHTML = j;
        buttons.id = j;
        buttons.addEventListener('click', goToPage);
        divWithNavigationButtons.appendChild(buttons);
    }
    return divWithNavigationButtons;
};

/* 
* @method: prepareUI
* @desc: Calculates number of pages and It paints UI of entire page
* @param: data [Array]
* @triggerBy : sucess of ajax call
*/
var prepareUI = function(data, perPageEntries) {
    $("#pageDetails, #countriesPerPageContainer").show(); 
    totalCountaries = data.length;
    var valeInTextBox = (totalCountaries < perPageEntries) ? totalCountaries : perPageEntries;
    $("#countriesPerPage").val(valeInTextBox);
    countryListTo = perPageEntries;
    if(totalCountaries > perPageEntries) {
        $("#buttonContainer").show();
        totalPages = Math.ceil(totalCountaries / perPageEntries);
        document.getElementById('pageDetails').innerHTML = "Page - "+ currentPage + " of " + totalPages + ".  " + "Showing 1 - " + perPageEntries + " Countries.";
    } else {
        document.getElementById('pageDetails').innerHTML = "Page - " + currentPage + "of 1.  " + "Showing 1 - " + totalCountaries + " " + " Countries.";
        $("#buttonContainer").hide();
    }
    var allButtonsToBeAdded = createNavigationButtons(totalPages);
    $('#buttonContainer button:not(:first):not(:last)').remove();
    $("#buttonContainer button:first-child").after(allButtonsToBeAdded);
    perPageEntries = (totalCountaries < perPageEntries) ? totalCountaries : perPageEntries;
    countryListTo = startCountryListFrom + perPageEntries;
    updateTable(data, startCountryListFrom, countryListTo);
};

/* 
* @triggerBy : click of next button
*/
$('#nextButton').on('click', function() {
    goToNextPage();
});

/* 
* @triggerBy : click of previous button
*/
$('#previousButton').on('click', function() {
    goToPreviousPage();
});

/* 
* @triggerBy : click of sort icon
*/
$(".sort").click(function(event){
    $(".modal").show();
    var sortOrder = ($(this).attr('data-sort-asc-order') === "true");
    var sortProperty =  $(this).attr('data-sort-prop');
    var sortedDataByName = sortData(sortOrder, sortProperty);
    setTimeout(function() {
        updateTable(sortedDataByName, startCountryListFrom, countryListTo); 
    }, 500);
});

var decideNumberOfEntriesPerPage = function() {
    currentPage =1;
    toggleNavBtn();
    var perPageEntries = $("#countriesPerPage").val();
    if (perPageEntries =="" || perPageEntries ==0){
        $("#countriesPerPage").val("12");
        perPageEntries = 12;
    } else if(perPageEntries > totalCountaries) {
        $("#countriesPerPage").val(totalCountaries);
        perPageEntries = totalCountaries;
    }
    countryListToShowPerPage = parseInt(perPageEntries);
    prepareUI(dataForSort, countryListToShowPerPage);
};

$("#countriesPerPage").blur(function() {
  decideNumberOfEntriesPerPage();
});


$('#countriesPerPage').bind('keyup', function(event) {
    if ( event.keyCode === 13 ) { 
        decideNumberOfEntriesPerPage();
    }
});

/* 
* @triggerBy : click of search button
* @desc : gets data by ajax call
*/
$('#SearchBtn').on('click', () => {
    $("#tableContainer, #buttonContainer, #pageDetails, #countriesPerPageContainer").hide();
    currentPage = 1;
    totalCountaries = 0;
    countryListToShow = 0;
    startCountryListFrom = 0;
    // countryListToShowPerPage = $("#countriesPerPage").val();
    countryListToShowPerPage = 12;
    $('#resultSummary').text("");
    var searchValue = document.getElementById("searchValue").value;
    if (searchValue == ""){
        document.getElementById('resultSummary').innerHTML = "Please Enter a valid search criteria";
        $("#resultSummary").removeClass("sucess-message font-size-35");
        document.getElementById('resultSummary').className += " error-message font-size-55";
    }else {
        $.ajax({
            type: 'GET',
            url: "https://restcountries.eu/rest/v1/name/" + searchValue + "",
            crossDomain: true,
            cache: false,
            timeout: 10000000,
            beforeSend: function () {
                $(".modal").show();
            },
            success: function(data) {
                dataForSort = data;
                prepareUI(data, countryListToShowPerPage);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                $(".modal, #tableContainer, #buttonContainer, #pageDetails, #countriesPerPageContainer").hide();
                var searchInputValue = document.getElementById("searchValue").value;
                document.getElementById('resultSummary').innerHTML = "Holy guacamole! We don't have country data for" + " " + '"' + searchInputValue.toUpperCase().bold() + '".';
                $("#resultSummary").removeClass("sucess-message font-size-35");
                document.getElementById('resultSummary').className += " error-message font-size-55";
            } 
        });
    }
});

document.onkeydown = checkKey;
function checkKey(e) {
    totalPages = Math.ceil(dataForSort.length / countryListToShowPerPage);
    e = e || window.event;
    if (e.keyCode == '37') {
        $("#searchValue").blur();
        currentPage = (currentPage == 1) ? currentPage : currentPage - 1;
        startCountryListFrom = 1 + countryListToShowPerPage*(currentPage - 1);
        navigate(startCountryListFrom - 1);
    }
    else if (e.keyCode == '39') {
        $("#searchValue").blur();
        currentPage = (currentPage >= totalPages) ? totalPages : currentPage+1;
        startCountryListFrom = 1 + countryListToShowPerPage*(currentPage - 1);
        navigate(startCountryListFrom - 1);
    }
};
/* 
* @desc: It gets triggred when page is ready
*/
$(document).ready(() => {
    $('[data-toggle="tooltip"]').tooltip();
    $("#previousButton").prop('disabled', true);
    $("#searchValue")
        .focus()
        .on("blur", function(evt){
            var searchStr = $(this).val();
            if (searchStr){
                $("#SearchBtn").removeAttr("disabled");
            }else{
                $("#SearchBtn").attr("disabled","disabled");
            }
    });
    ;
});
