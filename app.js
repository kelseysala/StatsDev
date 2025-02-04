"use strict";

/*
Author: Kelsey Sala
DONE:
- Ability to create matches
- Ability to define starting lineup for each set
- Ability to track set specific statistics like timeouts, substitutions, offensive/defensive stats, etc.
- View of current rotation positions by player
- Summary of team statistics at the end of a match
TODO:
- Summarize individual match stats
- Summarize individual and team stats across matches
- Add an undo function - every thing should be a vbStat object, type=homeSub/awaySub/homeTO/awayTo/pointFor/pointAgainst/libIn/LibOut/etc.
- Choose between Phoenix 14UG vs 15UG vs 16UG vs 18UB
- Implement a shared back-end so you can synchronize saved matches back to a central server so data isn't siloed on a single device
- Likely going to remove Toggle Server, and Minus Points buttons with an Undo button
META-DETAILS:
- Under 500 lines of JavaScript
- Under 100 lines of CSS
- Under 150 lines of HTML
*/

var vbMatch;
var vbSet;
var vbSetCount = 1;
var vbStats = [];

function VolleyballMatch(matchId) {
  this.matchId      = matchId;
  this.awayTeamName = "";
  this.sets         = [];
}

function VolleyballSet(posName1, posName2, posName3, posName4, posName5, posName6, libName, firstServe) {
  this.homeScore = 0;
  this.awayScore = 0;

  this.homeSubs = 0;
  this.awaySubs = 0;

  this.homeTimeouts = 0;
  this.awayTimeouts = 0;

  this.homeStats = [];
  this.awayStats = [];

  this.posName1 = posName1;
  this.posName2 = posName2;
  this.posName3 = posName3;
  this.posName4 = posName4;
  this.posName5 = posName5;
  this.posName6 = posName6;
  this.libName  = libName;
  
  this.firstServe      = firstServe;
  if (this.firstServe === "Home") {
    this.hasCurrentServe = true;
  } else {
    this.hasCurrentServe = false;
  }
};

document.getElementById('addStat').addEventListener('click', () => {
  document.getElementById('manageSetTbl').hidden = true;
  document.getElementById('rotationsTbl').hidden = true;

  document.getElementById('addHomeStat').hidden = false;

  document.getElementById('statPlayer').innerHTML = getRosterComboBoxOptions();
});

document.getElementById('backoutStat').addEventListener('click', () => {
  document.getElementById('statPlayer').value = "Blank";
  document.getElementById(  'statType').value = "Blank";

  document.getElementById('addHomeStat').hidden = true;

  document.getElementById('manageSetTbl').hidden = false;
  document.getElementById('rotationsTbl').hidden = false;
});

document.getElementById('submitStat').addEventListener('click', () => {
  const vbStat = new Object();
  vbStat.statPlayer = document.getElementById('statPlayer').value;
  vbStat.statType   = document.getElementById(  'statType').value;
  vbStats.push(vbStat);

  console.log("stat submitted: '" + vbStat.statPlayer + "' - '" + vbStat.statType + "' - '" + vbStats.length + "'");

  document.getElementById('statPlayer').value = "Blank";
  document.getElementById(  'statType').value = "Blank";

  document.getElementById('addHomeStat').hidden = true;

  document.getElementById('manageSetTbl').hidden = false;
  document.getElementById('rotationsTbl').hidden = false;
});

document.getElementById('addSub').addEventListener('click', () => {
  document.getElementById('manageSetTbl').hidden = true;
  document.getElementById('rotationsTbl').hidden = true;

  document.getElementById('addSubPopupTbl').hidden = false;
  initializeSubComboBoxes();
});

function initializeSubComboBoxes() {
  document.getElementById('homeSub1').innerHTML = getRosterComboBoxOptions();
  document.getElementById('homeSub2').innerHTML = getRosterComboBoxOptions();
  document.getElementById('homeSub3').innerHTML = getRosterComboBoxOptions();
  document.getElementById('homeSub4').innerHTML = getRosterComboBoxOptions();
  document.getElementById('homeSub5').innerHTML = getRosterComboBoxOptions();
  document.getElementById('homeSub6').innerHTML = getRosterComboBoxOptions();
}

document.getElementById('addAwaySub').addEventListener('click', () => {
  vbSet.awaySubs++;
  document.getElementById('subsAway').innerHTML = "Away Subs: " + vbSet.awaySubs;

  document.getElementById('addSubPopupTbl').hidden = true;

  document.getElementById('manageSetTbl').hidden = false;
  document.getElementById('rotationsTbl').hidden = false;
});

function addHomeSub(positionNum, playerName) {
  vbSet.homeSubs++;
  document.getElementById('subsHome').innerHTML = "Home Subs: " + vbSet.homeSubs;

  document.getElementById('addSubPopupTbl').hidden = true;

  document.getElementById('manageSetTbl').hidden = false;
  document.getElementById('rotationsTbl').hidden = false;
}

document.getElementById('addHomeSub1').addEventListener('click', () => {
  var subName1 = document.getElementById('homeSub1').value;
  if (!(subName1 === "")) {
    document.getElementById('position1Name').innerHTML = subName1;
    addHomeSub(1, subName1);
  } else {
    alert("You must enter a name");
  }
  document.getElementById('homeSub1').value = "";
});

document.getElementById('addHomeSub2').addEventListener('click', () => {
  var subName2 = document.getElementById('homeSub2').value;
  if (!(subName2 === "")) {
    document.getElementById('position2Name').innerHTML = subName2;
    addHomeSub(2, subName2);
  } else {
    alert("You must enter a name");
  }
  document.getElementById('homeSub2').value = "";
});

document.getElementById('addHomeSub3').addEventListener('click', () => {
  var subName3 = document.getElementById('homeSub3').value;
  if (!(subName3 === "")) {
    document.getElementById('position3Name').innerHTML = subName3;
    addHomeSub(3, subName3);
  } else {
    alert("You must enter a name");
  }
  document.getElementById('homeSub3').value = "";
});

document.getElementById('addHomeSub4').addEventListener('click', () => {
  var subName4 = document.getElementById('homeSub4').value;
  if (!(subName4 === "")) {
    document.getElementById('position4Name').innerHTML = subName4;
    addHomeSub(4, subName4);
  } else {
    alert("You must enter a name");
  }
  document.getElementById('homeSub4').value = "";
});

document.getElementById('addHomeSub5').addEventListener('click', () => {
  var subName5 = document.getElementById('homeSub5').value;
  if (!(subName5 === "")) {
    document.getElementById('position5Name').innerHTML = subName5;
    addHomeSub(5, subName5);
  } else {
    alert("You must enter a name");
  }
  document.getElementById('homeSub5').value = "";
});

document.getElementById('addHomeSub6').addEventListener('click', () => {
  var subName6 = document.getElementById('homeSub6').value;
  if (!(subName6 === "")) {
    document.getElementById('position6Name').innerHTML = subName6;
    addHomeSub(6, subName6);
  } else {
    alert("You must enter a name");
  }
  document.getElementById('homeSub6').value = "";
});

document.getElementById('addTimeoutHome').addEventListener('click', () => {
  vbSet.homeTimeouts++;
  document.getElementById('timeoutsHome').innerHTML = "Home TOs: " + vbSet.homeTimeouts;
});

document.getElementById('addTimeoutAway').addEventListener('click', () => {
  vbSet.awayTimeouts++;
  document.getElementById('timeoutsAway').innerHTML = "Away TOs:" + vbSet.awayTimeouts;
});

document.getElementById('startMatch').addEventListener('click', () => {
  document.getElementById('startMatchTbl').hidden = false;
  document.getElementById(     'mainMenu').hidden = true;
  vbStats = [];
  initializeLineUp();
});

function initializeLineUp() {
  document.getElementById('posName1').innerHTML = getRosterComboBoxOptions();
  document.getElementById('posName2').innerHTML = getRosterComboBoxOptions();
  document.getElementById('posName3').innerHTML = getRosterComboBoxOptions();
  document.getElementById('posName4').innerHTML = getRosterComboBoxOptions();
  document.getElementById('posName5').innerHTML = getRosterComboBoxOptions();
  document.getElementById('posName6').innerHTML = getRosterComboBoxOptions();
  document.getElementById('libName') .innerHTML = getRosterComboBoxOptions();
}

function getRosterComboBoxOptions() {
  const roster16UG = [ "Piper", "Avery", "Laurel", "May", "Penn", "Gabby", "Haylie", "Vayda", "Aaliyah", "Isla", "Leah", "Chloe" ];

  var rosterComboBoxOptions = "<option value='Blank'></option>";
  for (var i = 0; i < roster16UG.length; i++) {
    rosterComboBoxOptions += "<option value='" + roster16UG[i] + "'>" + roster16UG[i] + "</option>";
  }
  return rosterComboBoxOptions;
}

document.getElementById('browseMatches').addEventListener('click', () => {
  // TBD
  alert("This feature is not yet implemented. Stay tuned.");
});

document.getElementById('exportMatchStats').addEventListener('click', () => {
  // TBD
  alert("This feature is not yet implemented. Stay tuned.");
});

document.getElementById('checkForUpdates').addEventListener('click', () => {
  // TBD
  alert("This feature is not yet implemented. Stay tuned.");
});

document.getElementById('goToMainMenu').addEventListener('click', () => {
  document.getElementById('startMatchTbl').hidden = true;
  document.getElementById(     'mainMenu').hidden = false;

  document.getElementById('awayTeamName').value = "";
});

document.getElementById('submitOpTeamName').addEventListener('click', () => {
  vbMatch = new VolleyballMatch(Date.now());
  vbMatch.awayTeamName = document.getElementById('awayTeamName').value;

  localStorage.setItem("volleyball:match" + vbMatch.matchId, JSON.stringify(vbMatch));

  document.getElementById(          'startMatchTbl').hidden = true;
  document.getElementById('updateStartingLineupTbl').hidden = false;
});

document.getElementById('goToSetOpTeam').addEventListener('click', () => {
  document.getElementById(          'startMatchTbl').hidden = false;
  document.getElementById('updateStartingLineupTbl').hidden = true;

  initializeLineUp();
});

document.getElementById('setStartingLineup').addEventListener('click', () => {
  vbSet = new VolleyballSet(
    document.getElementById(  'posName1').value, 
    document.getElementById(  'posName2').value, 
    document.getElementById(  'posName3').value, 
    document.getElementById(  'posName4').value, 
    document.getElementById(  'posName5').value, 
    document.getElementById(  'posName6').value, 
    document.getElementById(   'libName').value,
    document.getElementById('firstServe').value
  );
  vbMatch.sets.push(vbSet);

  localStorage.setItem("volleyball:match" + vbMatch.matchId, JSON.stringify(vbMatch));
  document.getElementById('currentServer').innerHTML = document.getElementById('firstServe').value;

  document.getElementById('position1Name').innerHTML = vbSet.posName1;
  document.getElementById('position2Name').innerHTML = vbSet.posName2;
  document.getElementById('position3Name').innerHTML = vbSet.posName3;
  document.getElementById('position4Name').innerHTML = vbSet.posName4;
  document.getElementById('position5Name').innerHTML = vbSet.posName5;
  document.getElementById('position6Name').innerHTML = vbSet.posName6;

  document.getElementById('updateStartingLineupTbl').hidden = true;
  document.getElementById(           'manageSetTbl').hidden = false;
  document.getElementById(           'rotationsTbl').hidden = false;
});

document.getElementById('addPointFor').addEventListener('click', () => {
  var homeScore = parseInt(document.getElementById('homeScore').innerHTML.substring(6)) + 1;
  document.getElementById('homeScore').innerHTML = "Home: " + homeScore;
  if (!vbSet.hasCurrentServe) {
    vbSet.hasCurrentServe = true;
    document.getElementById('currentServer').innerHTML = "Home";
    // rotate
    var tmpPosition1 = document.getElementById('position1Name').innerHTML;
    document.getElementById('position1Name').innerHTML = document.getElementById('position2Name').innerHTML;
    document.getElementById('position2Name').innerHTML = document.getElementById('position3Name').innerHTML;
    document.getElementById('position3Name').innerHTML = document.getElementById('position4Name').innerHTML;
    document.getElementById('position4Name').innerHTML = document.getElementById('position5Name').innerHTML;
    document.getElementById('position5Name').innerHTML = document.getElementById('position6Name').innerHTML;
    document.getElementById('position6Name').innerHTML = tmpPosition1;
  }
});

document.getElementById('addPointAgainst').addEventListener('click', () => {
  var awayScore = parseInt(document.getElementById('awayScore').innerHTML.substring(6)) + 1;
  document.getElementById('awayScore').innerHTML = "Away: " + awayScore;
  if (vbSet.hasCurrentServe) {
    vbSet.hasCurrentServe = false;
    document.getElementById('currentServer').innerHTML = "Away";
  }
});

document.getElementById('minusPointFor').addEventListener('click', () => {
  var homeScore = parseInt(document.getElementById('homeScore').innerHTML.substring(6)) - 1;
  if (homeScore > -1) {
    document.getElementById('homeScore').innerHTML = "Home: " + homeScore;
  }
});

document.getElementById('minusPointAgainst').addEventListener('click', () => {
  var awayScore = parseInt(document.getElementById('awayScore').innerHTML.substring(6)) - 1;
  if (awayScore > -1) {
    document.getElementById('awayScore').innerHTML = "Away: " + awayScore;
  }
});

document.getElementById('toggleServer').addEventListener('click', () => {
  if (vbSet.hasCurrentServe) {
    vbSet.hasCurrentServe = false;
    document.getElementById('currentServer').innerHTML = "Away";
  } else {
    vbSet.hasCurrentServe = true;
    document.getElementById('currentServer').innerHTML = "Home";
  }
});

document.getElementById('endSet').addEventListener('click', () => {
  var homeScore = parseInt(document.getElementById('homeScore').innerHTML.substring(6));
  var awayScore = parseInt(document.getElementById('awayScore').innerHTML.substring(6));

  const vbStat = new Object();

  vbStat.statPlayer = "";

  if (homeScore == awayScore) {
    vbStat.statType = "setsTied";
  } else {
    if (homeScore > awayScore) {
      vbStat.statType = "setsWon";
    } else {
      vbStat.statType = "setsLost";
    }
  }
  vbStats.push(vbStat);

  console.log("stat submitted: '" + vbStat.statPlayer + "' - '" + vbStat.statType + "' - '" + vbStats.length + "'");

  initializeLineUp();

  document.getElementById('homeScore').innerHTML = "Home: 0";
  document.getElementById('awayScore').innerHTML = "Away: 0";

  document.getElementById('timeoutsHome').innerHTML = "Home TOs: 0";
  document.getElementById('timeoutsAway').innerHTML = "Away TOs: 0";

  document.getElementById('subsHome').innerHTML = "Home Subs: 0";
  document.getElementById('subsAway').innerHTML = "Away Subs: 0";

  vbSetCount++;
  document.getElementById('lineupH2').innerHTML = "Lineup for Set " + vbSetCount;

  vbSet = null;

  document.getElementById(           'manageSetTbl').hidden = true;
  document.getElementById(           'rotationsTbl').hidden = true;
  document.getElementById(             'trEndMatch').hidden = false;
  document.getElementById('updateStartingLineupTbl').hidden = false;
});

document.getElementById('dismissStats').addEventListener('click', () => {
  document.getElementById('awayTeamName').value  = "";
  document.getElementById('statsSummary').hidden = true;
  document.getElementById(    'mainMenu').hidden = false;
});

document.getElementById('endMatch').addEventListener('click', () => {
  document.getElementById('homeScore').innerHTML = "Home: 0";
  document.getElementById('awayScore').innerHTML = "Away: 0";

  document.getElementById('timeoutsHome').innerHTML = "Home TOs: 0";
  document.getElementById('timeoutsAway').innerHTML = "Away TOs: 0";

  document.getElementById('subsHome').innerHTML = "Home Subs: 0";
  document.getElementById('subsAway').innerHTML = "Away Subs: 0";

  vbSetCount = 1;
  document.getElementById('lineupH2').innerHTML = "Lineup for Set " + vbSetCount;

  vbSet = null;

  document.getElementById(            'setsWon').innerHTML = getTeamStatSummary('setsWon');
  document.getElementById(           'setsLost').innerHTML = getTeamStatSummary('setsLost');
  document.getElementById(           'setsTied').innerHTML = getTeamStatSummary('setsTied');
  document.getElementById(      'serveReceive3').innerHTML = getTeamStatSummary('serveReceive3');
  document.getElementById(      'serveReceive2').innerHTML = getTeamStatSummary('serveReceive2');
  document.getElementById(      'serveReceive1').innerHTML = getTeamStatSummary('serveReceive1');
  document.getElementById('serveReceiveShanked').innerHTML = getTeamStatSummary('serveReceiveShanked');
  document.getElementById(         'attackKill').innerHTML = getTeamStatSummary('attackKill');
  document.getElementById(          'attackDug').innerHTML = getTeamStatSummary('attackDug');
  document.getElementById(      'attackBlocked').innerHTML = getTeamStatSummary('attackBlocked');
  document.getElementById(         'attackMiss').innerHTML = getTeamStatSummary('attackMiss');
  document.getElementById(              'pass3').innerHTML = getTeamStatSummary('pass3');
  document.getElementById(              'pass2').innerHTML = getTeamStatSummary('pass2');
  document.getElementById(              'pass1').innerHTML = getTeamStatSummary('pass1');
  document.getElementById(              'shank').innerHTML = getTeamStatSummary('shank');
  document.getElementById(         'serviceAce').innerHTML = getTeamStatSummary('serviceAce');
  document.getElementById(          'serviceIn').innerHTML = getTeamStatSummary('serviceIn');
  document.getElementById(         'serviceOut').innerHTML = getTeamStatSummary('serviceOut');
  document.getElementById(        'serviceLine').innerHTML = getTeamStatSummary('serviceLine');

  document.getElementById(             'trEndMatch').hidden = true;
  document.getElementById('updateStartingLineupTbl').hidden = true;
  document.getElementById(           'statsSummary').hidden = false;
});

function getTeamStatSummary(statName) {
  var statSummary = 0;
  for (var j = 0; j < vbStats.length; j++) {
    if (vbStats[j].statType === statName) {
      statSummary++;
    }
  }
  return statSummary;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/StatsDev/service-worker.js').then((registration) => {
    console.log('Service Worker registered with scope:', registration.scope);
  }).catch((error) => {
    console.log('Service Worker registration failed:', error);
  });
}
