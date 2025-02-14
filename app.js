"use strict";

/*
AUTHOR: Kelsey Sala

DONE:
- Ability to create matches
- Choose between Phoenix 14UG vs 15UG vs 16UG vs 18UB
- Ability to define starting lineup for each set
- Ability to track set specific statistics like timeouts, substitutions, offensive/defensive stats, etc.
- View of current rotation positions by player
- Summary of team statistics at the end of a match
- Ability to undo
- Make "Serving Team" and "Lineup" mandatory (only Libero optional input)

TODO:
- Add "Confirm Lineup" button
- Add "Add Player to Roster" feature
- Add "Back" button to Add Sub page
- Summarize individual match stats
- Summarize individual and team stats across matches
- Implement a shared back-end so you can synchronize saved matches back to a central server so data isn't siloed on a single device
- Add Content-Security-Policy - https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid
- Add in Sign up/in with Google button [Client ID: 487376527490-4mleqjfmj1qcbu0pi43isc9e5jnl69o7.apps.googleusercontent.com from https://console.developers.google.com/auth/clients]
- Verify OAuth token server-side: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
<script src="https://accounts.google.com/gsi/client" async></script>
<div id="g_id_onload"
     data-client_id="487376527490-4mleqjfmj1qcbu0pi43isc9e5jnl69o7.apps.googleusercontent.com"
     data-context="signup"
     data-ux_mode="redirect"
     data-login_uri="https://wmvl.com/index.pl?class=Login&method=View"
     data-auto_prompt="false">
</div>

<div class="g_id_signin"
     data-type="standard"
     data-shape="pill"
     data-theme="outline"
     data-text="signin_with"
     data-size="large"
     data-logo_alignment="left">
</div>
*/

let vbMatch;
let vbSet;
let vbSetCount = 1;
let vbStats = [];
let activeRoster;
let matchStarted;
let homeTeam;
let awayTeam;

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

function getRotationPositions() {
  let rotationArr = [];
  rotationArr.push(document.getElementById('position1Name').innerHTML);
  rotationArr.push(document.getElementById('position2Name').innerHTML);
  rotationArr.push(document.getElementById('position3Name').innerHTML);
  rotationArr.push(document.getElementById('position4Name').innerHTML);
  rotationArr.push(document.getElementById('position5Name').innerHTML);
  rotationArr.push(document.getElementById('position6Name').innerHTML);
  return rotationArr;
}

function setRotationPositions(rotationArr) {
  document.getElementById('position6Name').innerHTML = rotationArr.pop();
  document.getElementById('position5Name').innerHTML = rotationArr.pop();
  document.getElementById('position4Name').innerHTML = rotationArr.pop();
  document.getElementById('position3Name').innerHTML = rotationArr.pop();
  document.getElementById('position2Name').innerHTML = rotationArr.pop();
  document.getElementById('position1Name').innerHTML = rotationArr.pop();
}

function getStateForStat(statName, statPlayer) {
  let vbStat = new Object();

  vbStat.matchStart    = matchStarted;
  vbStat.homeTeam      = homeTeam;
  vbStat.awayTeam      = awayTeam;
  vbStat.setNumber     = vbSetCount;
  vbStat.servingTeam   = getCurrentServer();
  vbStat.homeTimeouts  = getHomeTimeouts();
  vbStat.awayTimeouts  = getAwayTimeouts();
  vbStat.homeSubs      = getHomeSubs();
  vbStat.awaySubs      = getAwaySubs();
  vbStat.rotations     = getRotationPositions();
  vbStat.homeScore     = getHomeScore();
  vbStat.awayScore     = getAwayScore();
  vbStat.statTimestamp = (new Date()).toISOString();
  vbStat.statType      = statName;
  vbStat.statPlayer    = statPlayer;

  console.log("stat submitted: '" + JSON.stringify(vbStat) + "'\n");
  // add capture of match start date, set number, serving-team, timeout counts, sub counts, and player rotations
  return vbStat;
}

function addHomeSub(positionNum, playerName) {
  setHomeSubs(getHomeSubs() + 1);

  vbStats.push(getStateForStat("addHomeSub", ""));

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

function setServingTeam(servingTeam) {
  document.getElementById('currentServer').innerHTML = servingTeam;
}

function setCurrentServer(servingTeam) {
  document.getElementById('currentServer').innerHTML = servingTeam;
}

function formatDate(d) {
  return (d.split('T'))[0];
}

function viewStats(k) {
  const matchDetails = JSON.parse(localStorage.getItem(k));

  let setsWon  = 0;
  let setsLost = 0;
  let setsTied = 0;

  for (let i = 0; i < matchDetails.length; i++) {
    if (matchDetails[i].statType === "setsWon") {
      setsWon++;
    }
    if (matchDetails[i].statType === "setsLost") {
      setsLost++;
    }
    if (matchDetails[i].statType === "setsTied") {
      setsTied++;
    }
  }

  // TODO: clean up the use of vbStats
  vbStats = matchDetails;

  let xAttackValues   = [ "Kill Shots", "Dug Up", "Blocked", "Hit Out" ];
  let yAttackValues   = [ getTeamStatSummary('attackKill'), getTeamStatSummary('attackDug'), getTeamStatSummary('attackBlocked'), getTeamStatSummary('attackMiss') ];
  let attackBarColors = [ "red", "green","blue","orange" ];

  new Chart("attackChart2", {
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

  let xPassingValues   = [ '3-Pass', '2-Pass', '1-Pass', 'Shank' ];
  let yPassingValues   = [ getTeamStatSummary('pass3'), getTeamStatSummary('pass2'), getTeamStatSummary('pass1'), getTeamStatSummary('shank') ];
  let passingBarColors = [ "red", "green","blue","orange" ];

  new Chart("passingChart2", {
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

  let xServingValues   = [ 'Ace', 'Served In', 'Served Out', 'Line Violation' ];
  let yServingValues   = [ getTeamStatSummary('serviceAce'), getTeamStatSummary('serviceIn'), getTeamStatSummary('serviceOut'), getTeamStatSummary('serviceLine') ];
  let servingBarColors = [ "red", "green","blue","orange" ];

  new Chart("servingChart2", {
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

  let xReceivingValues   = [ '3-Receive', '2-Receive', '1-Receive', 'Shank' ];
  let yReceivingValues   = [ getTeamStatSummary('serveReceive3'), getTeamStatSummary('serveReceive2'), getTeamStatSummary('serveReceive1'), getTeamStatSummary('serveReceiveShanked') ];
  let receivingBarColors = [ "red", "green","blue","orange" ];

  new Chart("receivingChart2", {
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

  document.getElementById('viewMatchDetailsHeader').innerHTML = formatDate(matchDetails[0].matchStart) + " - " + matchDetails[0].homeTeam + " vs " + matchDetails[0].awayTeam;

  document.getElementById( 'viewSetsWon').innerHTML = setsWon;
  document.getElementById('viewSetsLost').innerHTML = setsLost;
  document.getElementById('viewSetsTied').innerHTML = setsTied;

  document.getElementById(          'matchList').hidden = true;
  document.getElementById('viewMatchDetailsTbl').hidden = false;
}


function dismissBrowseMatches() {
  document.getElementById('matchList').hidden = true;
  document.getElementById('mainMenu').hidden = false;
}

function isStartingLineupInvalid() {
  let lineUp = [];
  lineUp.push(document.getElementById('posName1').value);
  lineUp.push(document.getElementById('posName2').value);
  lineUp.push(document.getElementById('posName3').value);
  lineUp.push(document.getElementById('posName4').value);
  lineUp.push(document.getElementById('posName5').value);
  lineUp.push(document.getElementById('posName6').value);
  lineUp.push(document.getElementById( 'libName').value);
  for (let x = 0; x < lineUp.length; x++) {
    for (let y = 0; y < lineUp.length; y++) {
      if (x != y) {
        if (lineUp[x] === lineUp[y]) {
          return true;
        }
      }
    }
  }

  if (document.getElementById('firstServe').value === "Blank") { return true; }
  if (document.getElementById(  'posName1').value === "Blank") { return true; }
  if (document.getElementById(  'posName2').value === "Blank") { return true; }
  if (document.getElementById(  'posName3').value === "Blank") { return true; }
  if (document.getElementById(  'posName4').value === "Blank") { return true; }
  if (document.getElementById(  'posName5').value === "Blank") { return true; }
  if (document.getElementById(  'posName6').value === "Blank") { return true; }
  
  return false;
}

document.getElementById('dismissMatchDetails').addEventListener('click', () => {
  document.getElementById('viewMatchDetailsTbl').hidden = true;
  document.getElementById(          'matchList').hidden = false;
});

document.getElementById('undoLastAction').addEventListener('click', () => {
  let lastStat = vbStats.pop();
  if (lastStat.statType === "setStarted") {
    console.log("nothing to undo - set is in initial state");
    vbStats.push(lastStat);
  } else {
    console.log("update UI to reflect state before last action wrt score, serving-team, timeouts, subs, and player rotation");
    if (lastStat.statType === "addTimeoutAway") {
      setAwayTimeouts(getAwayTimeouts() - 1);
    }
    if (lastStat.statType === "addTimeoutHome") {
      setHomeTimeouts(getHomeTimeouts() - 1);
    }
    if (lastStat.statType === "addAwaySub") {
      setAwaySubs(getAwaySubs() - 1);
    }
    if (lastStat.statType === "addHomeSub") {
      setHomeSubs(getHomeSubs() - 1);

      let priorStat = vbStats.pop();
      setRotationPositions(priorStat.rotations.slice());
      vbStats.push(priorStat);
    }
    if (lastStat.statType === "addPointFor") {
      setHomeScore(getHomeScore() - 1);

      let priorStat = vbStats.pop();
      setRotationPositions(priorStat.rotations.slice());
      setServingTeam(priorStat.servingTeam);
      vbStats.push(priorStat);
    }
    if (lastStat.statType === "addPointAgainst") {
      setAwayScore(getAwayScore() - 1);
      let priorStat = vbStats.pop();
      setServingTeam(priorStat.servingTeam);
      vbStats.push(priorStat);
    }
  }
});

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
  vbStats.push(getStateForStat(document.getElementById('statType').value, document.getElementById('statPlayer').value));

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

  vbStats.push(getStateForStat("addAwaySub", ""));

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

  vbStats.push(getStateForStat("addTimeoutHome", ""));
});

document.getElementById('addTimeoutAway').addEventListener('click', () => {
  setAwayTimeouts(getAwayTimeouts() + 1);

  vbStats.push(getStateForStat("addTimeoutAway", ""));
});

document.getElementById('startMatch').addEventListener('click', () => {
  document.getElementById('startMatchTbl').hidden = false;
  document.getElementById(     'mainMenu').hidden = true;

  vbStats = [];

  document.getElementById('homeRoster').value = "Blank";
});

let matchListTemplate = "";
document.getElementById('browseMatches').addEventListener('click', () => {
  if (matchListTemplate === "") {
    matchListTemplate = document.getElementById('matchList').innerHTML;
  }
  let matchListHtml = matchListTemplate;
  for (let w = 0; w < localStorage.length; w++) {
    const matchStats = JSON.parse(localStorage.getItem(localStorage.key(w)));
    matchListHtml += "<tr><td>" + formatDate(matchStats[0].matchStart) + "</td><td>" + matchStats[0].homeTeam + "</td><td>" + matchStats[0].awayTeam + "</td><td><button onclick=\"viewStats('" + localStorage.key(w) + "')\">View</button></td></tr>";
  }
  matchListHtml += "<tr><td colspan='4'><button onclick='dismissBrowseMatches()'>Back</button></td></tr></table>";

  document.getElementById('mainMenu').hidden = true;

  document.getElementById('matchList').innerHTML = matchListHtml;

  document.getElementById('matchList').hidden = false;
  // hide main menu
});

document.getElementById('checkForUpdates').addEventListener('click', () => {
  caches.delete('content-cache');
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
  if (isStartingLineupInvalid()) {
    // Validation Failed
    alert("One or more mandatory fields is missing or you have the same player in two positions.");
  } else {
    // Validation Succeeded
    setCurrentServer(document.getElementById('firstServe').value);

    document.getElementById('position1Name').innerHTML = document.getElementById('posName1').value;
    document.getElementById('position2Name').innerHTML = document.getElementById('posName2').value;
    document.getElementById('position3Name').innerHTML = document.getElementById('posName3').value;
    document.getElementById('position4Name').innerHTML = document.getElementById('posName4').value;
    document.getElementById('position5Name').innerHTML = document.getElementById('posName5').value;
    document.getElementById('position6Name').innerHTML = document.getElementById('posName6').value;

    if (vbSetCount == 1) {
      matchStarted = (new Date()).toISOString();
      homeTeam = document.getElementById("homeRoster").value;
      awayTeam = document.getElementById("awayTeamName").value;
      vbStats.push(getStateForStat("matchStarted", ""));
    }
    vbStats.push(getStateForStat("setStarted", ""));

    document.getElementById('updateStartingLineupTbl').hidden = true;
    document.getElementById(           'manageSetTbl').hidden = false;
    document.getElementById(           'rotationsTbl').hidden = false;
  }
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

  vbStats.push(getStateForStat("addPointFor", ""));
});

document.getElementById('addPointAgainst').addEventListener('click', () => {
  let awayScore = getAwayScore();
  setAwayScore(awayScore + 1);
  if (getCurrentServer() === "Home") {
    setCurrentServer("Away");
  }

  vbStats.push(getStateForStat("addPointAgainst", ""));
});

document.getElementById('endSet').addEventListener('click', () => {
  let homeScore = getHomeScore();
  let awayScore = getAwayScore();

  if (homeScore == awayScore) {
    vbStats.push(getStateForStat("setsTied", ""));
  } else {
    if (homeScore > awayScore) {
      vbStats.push(getStateForStat("setsWon", ""));
    } else {
      vbStats.push(getStateForStat("setsLost", ""));
    }
  }

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
  vbStats.push(getStateForStat("endMatch", ""));
  // save copy of vbStats array values to localStorage.
  window.localStorage.setItem("matchId:" + vbStats[0].matchStart, JSON.stringify(vbStats));

  setHomeScore(0);
  setAwayScore(0);

  setHomeTimeouts(0);
  setAwayTimeouts(0);

  setHomeSubs(0);
  setAwaySubs(0);

  vbSetCount = 1;

  document.getElementById('lineupH2').innerHTML = "Lineup for Set " + vbSetCount;

  let statTypes = [ 'setsWon', 'setsLost', 'setsTied' ]; //, 'serveReceive3', 'serveReceive2', 'serveReceive1', 'serveReceiveShanked', 'attackKill', 'attackDug', 'attackBlocked', 'attackMiss', 'pass3', 'pass2', 'pass1', 'shank', 'serviceAce', 'serviceIn', 'serviceOut', 'serviceLine' ];
  for (let x = 0; x < statTypes.length; x++) {
    document.getElementById(statTypes[x]).innerHTML = getTeamStatSummary(statTypes[x]);
  }

  let xAttackValues   = [ "Kill Shots", "Dug Up", "Blocked", "Hit Out" ];
  let yAttackValues   = [ getTeamStatSummary('attackKill'), getTeamStatSummary('attackDug'), getTeamStatSummary('attackBlocked'), getTeamStatSummary('attackMiss') ];
  let attackBarColors = [ "red", "green","blue","orange" ];

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

  let xPassingValues   = [ '3-Pass', '2-Pass', '1-Pass', 'Shank' ];
  let yPassingValues   = [ getTeamStatSummary('pass3'), getTeamStatSummary('pass2'), getTeamStatSummary('pass1'), getTeamStatSummary('shank') ];
  let passingBarColors = [ "red", "green","blue","orange" ];

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

  let xServingValues   = [ 'Ace', 'Served In', 'Served Out', 'Line Violation' ];
  let yServingValues   = [ getTeamStatSummary('serviceAce'), getTeamStatSummary('serviceIn'), getTeamStatSummary('serviceOut'), getTeamStatSummary('serviceLine') ];
  let servingBarColors = [ "red", "green","blue","orange" ];

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

  let xReceivingValues   = [ '3-Receive', '2-Receive', '1-Receive', 'Shank' ];
  let yReceivingValues   = [ getTeamStatSummary('serveReceive3'), getTeamStatSummary('serveReceive2'), getTeamStatSummary('serveReceive1'), getTeamStatSummary('serveReceiveShanked') ];
  let receivingBarColors = [ "red", "green","blue","orange" ];

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

document.getElementById('exportToCSV').addEventListener('click', () => {
  let filename = "matchId_" + vbStats[0].matchStart + ".csv";
  let csvString = "Match Start Date,Home Team,Away Team,Set,Serving Team,Home Timeouts,Away Timeouts,Home Subs,Away Subs,Home Score,Away Score,Stat Timestamp,Stat Type,Stat Player\n";
  for (let n = 0; n < vbStats.length; n++) {
    csvString += vbStats[n].matchStart + "," + vbStats[n].homeTeam + "," + vbStats[n].awayTeam + "," + vbStats[n].setNumber + "," + vbStats[n].servingTeam + "," + vbStats[n].homeTimeouts + "," + vbStats[n].awayTimeouts + "," + vbStats[n].homeSubs + "," + vbStats[n].awaySubs + "," + vbStats[n].homeScore + "," + vbStats[n].awayScore + "," + vbStats[n].statTimestamp + "," + vbStats[n].statType + "," + vbStats[n].statPlayer + "\n";
  }

  let blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  if (navigator.msSaveBlob) { // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    let link = document.createElement("a");
    if (link.download !== undefined) { // feature detection
      // Browsers that support HTML5 download attribute
      let url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
});

document.getElementById('exportMatchStats').addEventListener('click', () => {
  let filename = "allMatches_" + (new Date()).toISOString() + ".csv";
  let csvString = "Match Start Date,Home Team,Away Team,Set,Serving Team,Home Timeouts,Away Timeouts,Home Subs,Away Subs,Home Score,Away Score,Stat Timestamp,Stat Type,Stat Player\n";

  for (let w = 0; w < localStorage.length; w++) {
    vbStats = JSON.parse(localStorage.getItem(localStorage.key(w)));
    for (let n = 0; n < vbStats.length; n++) {
      csvString += vbStats[n].matchStart + "," + vbStats[n].homeTeam + "," + vbStats[n].awayTeam + "," + vbStats[n].setNumber + "," + vbStats[n].servingTeam + "," + vbStats[n].homeTimeouts + "," + vbStats[n].awayTimeouts + "," + vbStats[n].homeSubs + "," + vbStats[n].awaySubs + "," + vbStats[n].homeScore + "," + vbStats[n].awayScore + "," + vbStats[n].statTimestamp + "," + vbStats[n].statType + "," + vbStats[n].statPlayer + "\n";
    }
  }
  let blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  if (navigator.msSaveBlob) { // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    let link = document.createElement("a");
    if (link.download !== undefined) { // feature detection
      // Browsers that support HTML5 download attribute
      let url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/StatsDev/service-worker.js').then((registration) => {
    console.log('Service Worker registered with scope:', registration.scope);
  }).catch((error) => {
    console.log('Service Worker registration failed:', error);
  });
}
