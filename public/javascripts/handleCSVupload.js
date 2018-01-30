//Global variable for storing the csv data
var data;

/*
//Function is called when the csv file is loaded in from the localLoad.ejs page.
//Here the uploaded file is grabbed from the html page and passed into a local //variable. papa parse is then used to parse the data into an array.
//header is turned off so that the array values are numerical. If it were set
//to on then the file would be parsed as an object not an array. On success
//the data is passed into sessionstorage.
*/
function loadCSVLocal() {
  //Grab the file from the html dom system
  var file = document.getElementById('csv-file').files[0];

  Papa.parse(file, {
    //header: true,
    dynamicTyping: true,
    error: function(error) { //error callback
      SomethingWentWrong(error);
    },
    complete: function(results) { //success call back
      data = results.data;
      success();
    }
  });

  //Message if there is success
  function success() {
    //Data is stored in the browser storage and can be retrieved and used on
    //other html pages
    console.log(data);
    sessionStorage.setItem('parsedCSVData', JSON.stringify(data));

    //Clean up webpage and notify of success
    var toRemove = document.getElementById('formGroup');
    document.getElementById('localLoadLabel').remove();
    toRemove.remove();
    var continueButton = document.getElementById('continueToVirtual');
    continueButton.innerHTML = '<a href="/VRWorld" class="btn btn-success" role="button">Continue</a> ';
    var message = document.getElementById('successMessage');
    message.innerHTML = '<div class="alert alert-success"><strong>Success!</strong> ';
  }

  //Message if there is an error
  function SomethingWentWrong(error) {
    console.log(error);

    //display error info on the webpage
    var message = document.getElementById('successMessage');
    message.innerHTML = '<div class="alert alert-danger"><strong>Error!</strong> ';
  }
}


/*
//Function is called when the csv file is loaded in from the urlLoad.ejs page.
//Here the uploaded file is grabbed from the html page and passed into a local
//variable. papa parse is then used to parse the data into an array.
//header is turned off so that the array values are numerical. If it were set
//to on then the file would be parsed as an object not an array. On success
//the data is passed into sessionstorage.
*/
function loadCSVremote() {
  //Grab the file from the html dom system
  var url = document.getElementById('csvURL').value;

  Papa.parse(url, {
    download: true,
    //header: true,
    dynamicTyping: true,
    error: function(error) { //error callback
      SomethingWentWrong(error);
    },
    complete: function(results) { //success call back
      data = results.data;
      success();
    }
  });

  //Message if there is success
  function success() {
    //Data is stored in the browser storage and can be retrieved and used on
    //other html pages
    sessionStorage.setItem('parsedCSVData', JSON.stringify(data));

    //Clean up webpage and notify of success
    var toRemove = document.getElementById('urlBar');
    toRemove.remove();
    var continueButton = document.getElementById('continueToVirtual');
    continueButton.innerHTML = '<a href="/VRWorld" class="btn btn-success" role="button">Continue</a> ';
    var message = document.getElementById('successMessage');
    message.innerHTML = '<div class="alert alert-success"><strong>Success!</strong> ';
  }

  //Message if there is an error
  function SomethingWentWrong(error) {
    console.log(error);

    //display error info on the webpage
    var message = document.getElementById('successMessage');
    message.innerHTML = '<div class="alert alert-danger"><strong>Error!</strong> Wrong URL?</div> ';
  }
}


function thisIsATest() {
  return data;
}
