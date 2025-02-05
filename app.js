"use strict";

/*
Author: Kelsey Sala
DONE:
- Ability to create matches
- Choose between Phoenix 14UG vs 15UG vs 16UG vs 18UB
- Ability to define starting lineup for each set
- Ability to track set specific statistics like timeouts, substitutions, offensive/defensive stats, etc.
- View of current rotation positions by player
- Summary of team statistics at the end of a match
TODO:
- Summarize individual match stats
- Summarize individual and team stats across matches
- Add an undo function - every thing should be a vbStat object, type=homeSub/awaySub/homeTO/awayTo/pointFor/pointAgainst/libIn/LibOut/etc.
- Implement a shared back-end so you can synchronize saved matches back to a central server so data isn't siloed on a single device
- Likely going to remove Toggle Server, and Minus Points buttons with an Undo button
*/

let vbMatch;
let vbSet;
let vbSetCount = 1;
let vbStats = [];
let activeRoster;

const roster13UG = [ "Azaleiah", "Blerta", "Francesca", "Hannah", "Jasmine", "Madelyn", "Makayla", "Maryam", "Meleigha", "Paytin", "Rea", "Rowan", "Sarah", "Shirley" ];
const roster14UG = [ "Alina", "Arianna Salamatin", "Arianna Bailey", "Ashley", "Ava", "Evelyn", "Gabby", "Halle", "Halo", "Izabella", "Jessica", "Penny", "Rylee" ];
const roster15UG = [ "Alexandria", "April", "Audrina", "Emilia", "Gabriela", "Graye", "Jaidyn", "Nova", "Olivia", "Paisley", "Sarah" ];
const roster16UG = [ "Aaliyah", "Avery", "Chloe", "Gabby", "Haylie", "Isla", "Laurel", "Leah", "May", "Penn", "Piper", "Vayda" ];
const roster18UB = [ "Ben", "Benjamin", "Brady", "Cameron", "Ethan", "Jace", "Jacob", "Konner", "Liam", "Noah", "Samuel", "Santiago" ];

function getHomeTimeouts() {
  return parseInt(document.getElementById('timeoutsHome').innerHTML.substring(10));
}

function getAwayTimeouts() {
  return parseInt(document.getElementById('timeoutsAway').innerHTML.substring(10));
}

function getHomeSubs() {
  return parseInt(document.getElementById('subsHome').innerHTML.substring(11));
}

function getAwaySubs() {
  return parseInt(document.getElementById('subsAway').innerHTML.substring(11));
}

function setHomeTimeouts(homeTimeouts) {
  return document.getElementById('timeoutsHome').innerHTML = "Home TOs: " + homeTimeouts;
}

function setAwayTimeouts(awayTimeouts) {
  return document.getElementById('timeoutsAway').innerHTML = "Away TOs: " + awayTimeouts;
}

function setHomeSubs(subsHome) {
  return document.getElementById('subsHome').innerHTML = "Home Subs: " + subsHome;
}

function setAwaySubs(subsAway) {
  return document.getElementById('subsAway').innerHTML = "Away Subs: " + subsAway;
}

function getAwayScore() {
  return parseInt(document.getElementById('awayScore').innerHTML.substring(6));
}

function setAwayScore(awayScore) {
  document.getElementById('awayScore').innerHTML = "Away: " + awayScore;
}
function getHomeScore() {
  return parseInt(document.getElementById('homeScore').innerHTML.substring(6));
}

function setHomeScore(homeScore) {
  document.getElementById('homeScore').innerHTML = "Home: " + homeScore;
}

function initializeSubComboBoxes() {
  document.getElementById('homeSub1').innerHTML = getRosterComboBoxOptions();
  document.getElementById('homeSub2').innerHTML = getRosterComboBoxOptions();
  document.getElementById('homeSub3').innerHTML = getRosterComboBoxOptions();
  document.getElementById('homeSub4').innerHTML = getRosterComboBoxOptions();
  document.getElementById('homeSub5').innerHTML = getRosterComboBoxOptions();
  document.getElementById('homeSub6').innerHTML = getRosterComboBoxOptions();
}

function addHomeSub(positionNum, playerName) {
  setHomeSubs(getHomeSubs() + 1);

  document.getElementById('addSubPopupTbl').hidden = true;

  document.getElementById('manageSetTbl').hidden = false;
  document.getElementById('rotationsTbl').hidden = false;
}

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
  let rosterComboBoxOptions = "<option value='Blank'></option>";
  for (let i = 0; i < activeRoster.length; i++) {
    rosterComboBoxOptions += "<option value='" + activeRoster[i] + "'>" + activeRoster[i] + "</option>";
  }
  return rosterComboBoxOptions;
}

function getTeamStatSummary(statName) {
  let statSummary = 0;
  for (let j = 0; j < vbStats.length; j++) {
    if (vbStats[j].statType === statName) {
      statSummary++;
    }
  }
  return statSummary;
}

function getCurrentServer() {
  return document.getElementById('currentServer').innerHTML;
}

function setCurrentServer(servingTeam) {
  document.getElementById('currentServer').innerHTML = servingTeam;
}

document.getElementById('addStat').addEventListener('click', () => {
  document.getElementById('manageSetTbl').hidden = true;
  document.getElementById('rotationsTbl').hidden = true;

  document.getElementById('addHomeStatTbl').hidden = false;

  document.getElementById('statPlayer').innerHTML = getRosterComboBoxOptions();
});

document.getElementById('backoutStat').addEventListener('click', () => {
  document.getElementById('statPlayer').value = "Blank";
  document.getElementById(  'statType').value = "Blank";

  document.getElementById('addHomeStatTbl').hidden = true;

  document.getElementById('manageSetTbl').hidden = false;
  document.getElementById('rotationsTbl').hidden = false;
});

document.getElementById('submitStat').addEventListener('click', () => {
  const vbStat = new Object();
  vbStat.statPlayer = document.getElementById('statPlayer').value;
  vbStat.statType   = document.getElementById(  'statType').value;
  vbStat.homeScore  = getHomeScore();
  vbStat.awayScore  = getAwayScore();
  vbStats.push(vbStat);

  console.log("stat submitted: '" + vbStat.statPlayer + "' - '" + vbStat.statType + "' - '" + vbStats.length + "' - homeScore: '" + vbStat.homeScore + "' - awayScore: '" + vbStat.awayScore + "'");

  document.getElementById('statPlayer').value = "Blank";
  document.getElementById(  'statType').value = "Blank";

  document.getElementById('addHomeStatTbl').hidden = true;

  document.getElementById('manageSetTbl').hidden = false;
  document.getElementById('rotationsTbl').hidden = false;
});

document.getElementById('addSub').addEventListener('click', () => {
  document.getElementById('manageSetTbl').hidden = true;
  document.getElementById('rotationsTbl').hidden = true;

  document.getElementById('addSubPopupTbl').hidden = false;
  initializeSubComboBoxes();
});

document.getElementById('addAwaySub').addEventListener('click', () => {
  setAwaySubs(getAwaySubs() + 1);

  document.getElementById('addSubPopupTbl').hidden = true;

  document.getElementById('manageSetTbl').hidden = false;
  document.getElementById('rotationsTbl').hidden = false;
});

document.getElementById('addHomeSub1').addEventListener('click', () => {
  let subName1 = document.getElementById('homeSub1').value;
  if (!(subName1 === "")) {
    document.getElementById('position1Name').innerHTML = subName1;
    addHomeSub(1, subName1);
  } else {
    alert("You must enter a name");
  }
  document.getElementById('homeSub1').value = "";
});

document.getElementById('addHomeSub2').addEventListener('click', () => {
  let subName2 = document.getElementById('homeSub2').value;
  if (!(subName2 === "")) {
    document.getElementById('position2Name').innerHTML = subName2;
    addHomeSub(2, subName2);
  } else {
    alert("You must enter a name");
  }
  document.getElementById('homeSub2').value = "";
});

document.getElementById('addHomeSub3').addEventListener('click', () => {
  let subName3 = document.getElementById('homeSub3').value;
  if (!(subName3 === "")) {
    document.getElementById('position3Name').innerHTML = subName3;
    addHomeSub(3, subName3);
  } else {
    alert("You must enter a name");
  }
  document.getElementById('homeSub3').value = "";
});

document.getElementById('addHomeSub4').addEventListener('click', () => {
  let subName4 = document.getElementById('homeSub4').value;
  if (!(subName4 === "")) {
    document.getElementById('position4Name').innerHTML = subName4;
    addHomeSub(4, subName4);
  } else {
    alert("You must enter a name");
  }
  document.getElementById('homeSub4').value = "";
});

document.getElementById('addHomeSub5').addEventListener('click', () => {
  let subName5 = document.getElementById('homeSub5').value;
  if (!(subName5 === "")) {
    document.getElementById('position5Name').innerHTML = subName5;
    addHomeSub(5, subName5);
  } else {
    alert("You must enter a name");
  }
  document.getElementById('homeSub5').value = "";
});

document.getElementById('addHomeSub6').addEventListener('click', () => {
  let subName6 = document.getElementById('homeSub6').value;
  if (!(subName6 === "")) {
    document.getElementById('position6Name').innerHTML = subName6;
    addHomeSub(6, subName6);
  } else {
    alert("You must enter a name");
  }
  document.getElementById('homeSub6').value = "";
});

document.getElementById('addTimeoutHome').addEventListener('click', () => {
  setHomeTimeouts(getHomeTimeouts() + 1);
});

document.getElementById('addTimeoutAway').addEventListener('click', () => {
  setAwayTimeouts(getAwayTimeouts() + 1);
});

document.getElementById('startMatch').addEventListener('click', () => {
  document.getElementById('startMatchTbl').hidden = false;
  document.getElementById(     'mainMenu').hidden = true;

  vbStats = [];

  document.getElementById('homeRoster').value = "Blank";
});

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
  document.getElementById(  'homeRoster').value = "Blank";
});

document.getElementById('submitOpTeamName').addEventListener('click', () => {
  let selectedRoster = document.getElementById('homeRoster').value;
  if (selectedRoster === "13UG") {
    activeRoster = roster13UG.slice();
  }
  if (selectedRoster === "14UG") {
    activeRoster = roster14UG.slice();
  }
  if (selectedRoster === "15UG") {
    activeRoster = roster15UG.slice();
  }
  if (selectedRoster === "16UG") {
    activeRoster = roster16UG.slice();
  }
  if (selectedRoster === "18UB") {
    activeRoster = roster18UB.slice();
  }
  initializeLineUp();
  document.getElementById('firstServe').value = "Blank";

  document.getElementById(          'startMatchTbl').hidden = true;
  document.getElementById('updateStartingLineupTbl').hidden = false;
});

document.getElementById('goToSetOpTeam').addEventListener('click', () => {
  document.getElementById(          'startMatchTbl').hidden = false;
  document.getElementById('updateStartingLineupTbl').hidden = true;

  initializeLineUp();
});

document.getElementById('setStartingLineup').addEventListener('click', () => {
  setCurrentServer(document.getElementById('firstServe').value);

  document.getElementById('position1Name').innerHTML = document.getElementById('posName1').value;
  document.getElementById('position2Name').innerHTML = document.getElementById('posName2').value;
  document.getElementById('position3Name').innerHTML = document.getElementById('posName3').value;
  document.getElementById('position4Name').innerHTML = document.getElementById('posName4').value;
  document.getElementById('position5Name').innerHTML = document.getElementById('posName5').value;
  document.getElementById('position6Name').innerHTML = document.getElementById('posName6').value;

  document.getElementById('updateStartingLineupTbl').hidden = true;
  document.getElementById(           'manageSetTbl').hidden = false;
  document.getElementById(           'rotationsTbl').hidden = false;
});

document.getElementById('addPointFor').addEventListener('click', () => {
  let homeScore = getHomeScore();
  setHomeScore(homeScore + 1);
  if (getCurrentServer() === "Away") {
    setCurrentServer("Home");
    // rotate
    let tmpPosition1 = document.getElementById('position1Name').innerHTML;
    document.getElementById('position1Name').innerHTML = document.getElementById('position2Name').innerHTML;
    document.getElementById('position2Name').innerHTML = document.getElementById('position3Name').innerHTML;
    document.getElementById('position3Name').innerHTML = document.getElementById('position4Name').innerHTML;
    document.getElementById('position4Name').innerHTML = document.getElementById('position5Name').innerHTML;
    document.getElementById('position5Name').innerHTML = document.getElementById('position6Name').innerHTML;
    document.getElementById('position6Name').innerHTML = tmpPosition1;
  }
});

document.getElementById('addPointAgainst').addEventListener('click', () => {
  let awayScore = getAwayScore();
  setAwayScore(awayScore + 1);
  if (getCurrentServer() === "Home") {
    setCurrentServer("Away");
  }
});

document.getElementById('minusPointFor').addEventListener('click', () => {
  let homeScore = getHomeScore();
  if (homeScore > 0) {
    setHomeScore(homeScore - 1);
  }
});

document.getElementById('minusPointAgainst').addEventListener('click', () => {
  let awayScore = getAwayScore();
  if (awayScore > 0) {
    setAwayScore(awayScore - 1);
  }
});

document.getElementById('toggleServer').addEventListener('click', () => {
  if (getCurrentServer() === "Home") {
    setCurrentServer("Away");
  } else {
    setCurrentServer("Home");
  }
});

document.getElementById('endSet').addEventListener('click', () => {
  let homeScore = getHomeScore();
  let awayScore = getAwayScore();

  let vbStat = new Object();

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
  vbStat.homeScore = getHomeScore();
  vbStat.awayScore = getAwayScore();

  vbStats.push(vbStat);

  console.log("stat submitted: '" + vbStat.statPlayer + "' - '" + vbStat.statType + "' - '" + vbStats.length + "' - homeScore: '" + vbStat.homeScore + "' - awayScore: '" + vbStat.awayScore + "'");

  initializeLineUp();

  setHomeScore(0);
  setAwayScore(0);

  setHomeTimeouts(0);
  setAwayTimeouts(0);

  setHomeSubs(0);
  setAwaySubs(0);

  vbSetCount++;
  document.getElementById('lineupH2').innerHTML = "Lineup for Set " + vbSetCount;
  document.getElementById('firstServe').value = "Blank";

  document.getElementById(           'manageSetTbl').hidden = true;
  document.getElementById(           'rotationsTbl').hidden = true;
  document.getElementById(             'trEndMatch').hidden = false;
  document.getElementById('updateStartingLineupTbl').hidden = false;
});

document.getElementById('dismissStats').addEventListener('click', () => {
  document.getElementById('awayTeamName').value  = "";

  document.getElementById('statsSummaryTbl').hidden = true;
  document.getElementById(       'mainMenu').hidden = false;
});

document.getElementById('endMatch').addEventListener('click', () => {
  setHomeScore(0);
  setAwayScore(0);

  setHomeTimeouts(0);
  setAwayTimeouts(0);

  setHomeSubs(0);
  setAwaySubs(0);

  vbSetCount = 1;

  document.getElementById('lineupH2').innerHTML = "Lineup for Set " + vbSetCount;

  let statTypes = [ 'setsWon', 'setsLost', 'setsTied', 'serveReceive3', 'serveReceive2', 'serveReceive1', 'serveReceiveShanked', 'attackKill', 'attackDug', 'attackBlocked', 'attackMiss', 'pass3', 'pass2', 'pass1', 'shank', 'serviceAce', 'serviceIn', 'serviceOut', 'serviceLine' ];
  for (let x = 0; x < statTypes.length; x++) {
    document.getElementById(statTypes[x]).innerHTML = getTeamStatSummary(statTypes[x]);
  }

  var xAttackValues   = [ "Kill Shots", "Dug Up", "Blocked", "Hit Out" ];
  var yAttackValues   = [ getTeamStatSummary('attackKill'), getTeamStatSummary('attackDug'), getTeamStatSummary('attackBlocked'), getTeamStatSummary('attackMiss') ];
  var attackBarColors = [ "red", "green","blue","orange" ];

  new Chart("attackChart", {
    type: "pie",
    data: {
      labels: xAttackValues,
      datasets: [{
        backgroundColor: attackBarColors,
        data: yAttackValues
      }]
    },
    options: {
      title: {
        display: true,
        text: "Attack Stats"
      }
    }
  });

  var xPassingValues   = [ '3-Pass', '2-Pass', '1-Pass', 'Shank' ];
  var yPassingValues   = [ getTeamStatSummary('pass3'), getTeamStatSummary('pass2'), getTeamStatSummary('pass1'), getTeamStatSummary('shank') ];
  var passingBarColors = [ "red", "green","blue","orange" ];

  new Chart("passingChart", {
    type: "pie",
    data: {
      labels: xPassingValues,
      datasets: [{
        backgroundColor: passingBarColors,
        data: yPassingValues
      }]
    },
    options: {
      title: {
        display: true,
        text: "Passing Stats"
      }
    }
  });

  var xServingValues   = [ 'Ace', 'Served In', 'Served Out', 'Line Violation' ];
  var yServingValues   = [ getTeamStatSummary('serviceAce'), getTeamStatSummary('serviceIn'), getTeamStatSummary('serviceOut'), getTeamStatSummary('serviceLine') ];
  var servingBarColors = [ "red", "green","blue","orange" ];

  new Chart("servingChart", {
    type: "pie",
    data: {
      labels: xServingValues,
      datasets: [{
        backgroundColor: servingBarColors,
        data: yServingValues
      }]
    },
    options: {
      title: {
        display: true,
        text: "Serving Stats"
      }
    }
  });

  var xReceivingValues   = [ 'serveReceive3', 'serveReceive2', 'serveReceive1', 'serveReceiveShanked' ];
  var yReceivingValues   = [ getTeamStatSummary('3-Pass'), getTeamStatSummary('2-Pass'), getTeamStatSummary('1-Pass'), getTeamStatSummary('Shank') ];
  var receivingBarColors = [ "red", "green","blue","orange" ];

  new Chart("receivingChart", {
    type: "pie",
    data: {
      labels: xReceivingValues,
      datasets: [{
        backgroundColor: receivingBarColors,
        data: yReceivingValues
      }]
    },
    options: {
      title: {
        display: true,
        text: "Serve-Receive Stats"
      }
    }
  });

  document.getElementById(             'trEndMatch').hidden = true;
  document.getElementById('updateStartingLineupTbl').hidden = true;
  document.getElementById(        'statsSummaryTbl').hidden = false;
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/StatsDev/service-worker.js').then((registration) => {
    console.log('Service Worker registered with scope:', registration.scope);
  }).catch((error) => {
    console.log('Service Worker registration failed:', error);
  });
}
