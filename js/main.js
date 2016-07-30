var KEYS = [49, 50, 51, 52, 53, 54, 55, 56, 57];

var GROUPS = {
  'twice' : {
    'members': ['Nayeon','Jeongyeon','Momo','Sana','Jihyo','Mina','Dahyun','Chaeyoung','Tzuyu'],
    'colors' : ['orange','green','red','blue','purple','violet','pink','cyan','yellow'],
  },
  'nsbz' : {
    'members': ['Pat','Brian'],
    'colors' : ['red','blue']
  },
  'kvs' : {
    'members': ['Kyle', 'Anthony','Viktor', 'Seth'],
    'colors' : ['blue','red','yellow','green']
  },
};

var COLORS = ['red','blue','yellow','green','orange','pink','purple','violet', 'cyan', 'grey','black'];

var active = 'kvs';
var lastMember = [];
var decrease = false;
var finish = false;
var totalPercentage = 0;
var keyPress = null;

/**
* @description Member Class
* @param {string} member
* @param {string} color
*/
var Member = function(member, color){
  this.start = 0;
  this.end = 0;
  this.duration = [];
  this.total = 0;
  this.name = member;
  this.color = color;
  this.percentage = 0;
};

// All Members
var allMembers = [];

/**
* @description Populates allMembers array with Member
*/
function populateAllMembers() {
  for (var i = 0; i < GROUPS[active].members.length; i++){
    allMembers.push(new Member(GROUPS[active].members[i],GROUPS[active].colors[i]));
  }
}

// Call populateAllMembers
populateAllMembers();

/**
* @description Shows and recolor boxes in HTML
*/
function populateBoxes() {
  // Hide all boxes
  $('.box').hide();
  // Remove all colors
  removeColors();
  // For each Member
  for (var i = 0; i < allMembers.length; i++){
    // Show Box
    var target = '.box' + (i + 1);
    $(target).show();
    // Recolor boxes
    $(target).addClass(allMembers[i].color);
    // Write Name
    target = '.box' + (i + 1) + ' .box-name';
    $(target).text(allMembers[i].name);
    // Color Bars (in progress bar)
    target = '.bar' + (i + 1);
    $(target).addClass(allMembers[i].color);
  }
}

// Call populateBoxes
populateBoxes();

/**
* @description Records Starting pressing time
* @param {number} t
*/
function recordStart(t){
  var member = allMembers[t];
  // Record timestamp
  member.start = Date.now();
  // Update what member is singing
  $('#who').text(member.name + ' is singing.');
}

/**
* @description Calculate Duraion based on Stopping pressing time
* @param {number} t
*/
function recordStop(t){
  var member = allMembers[t];
  // Stop timestamp
  member.end = Date.now();
  // Calculate duration
  member.duration.push(Math.floor(((member.end - member.start) / 1000) * 100) / 100);
  // if decrease is off
  if (!decrease){
    // Update Total, adding
    member.total += member.duration[member.duration.length - 1];
  } else {
    // Update Total, decreasing
    member.total -= member.duration[member.duration.length - 1];
    if(member.total < 0) member.total = 0;
    toggleDecrease('#decrease');
  }
  // Write HTML
  $('.timestamp' + (t+1)).text(member.total);
  // Update Progress Bar
  updateProgress();
  // Update LastMember
  lastMember.push(t);
  console.log('Last Member Array: ', lastMember);
}

/**
* @description Activate mousedown, runs recordStart, active mouseup, runs recordStop
*/
$('.box').on('vmousedown', function(){
  var target = parseInt($(this).attr('class').match(/\d+/)[0]) - 1;
  recordStart(target);
}).on('vmouseup', function(){
  var target = parseInt($(this).attr('class').match(/\d+/)[0]) - 1;
  recordStop(target);
});

// TO-DO: It doesnt work properly
window.onkeydown = function(e) {
  // Assign target
  var target = KEYS.indexOf(e.keyCode);
  // Stop if target is not found
  if (target === -1) return;
  // If target is within allMembers length
  if (target < allMembers.length - 1) {
    recordStart(target);
    keyPress = e.keyCode;
  }
};

// TO-DO: It doesnt work properly
window.onkeyup = function(e) {
  // If key up is different than previous key down, stop
  if (e.keyCode !== keyPress) return;
  // Assign target
  var target = KEYS.indexOf(e.keyCode);
  recordStop(target);
  // Reset keyPress
  keyPress = null;
};

// @description : Remove any colors from all .box divs
function removeColors(){
 //remove any color class
 for(var c = 0; c < COLORS.length; c++){
  $('.box').removeClass(COLORS[c]);
  $('.bar').removeClass(COLORS[c]);
 }
}

function reset() {
  allMembers = [];
  populateAllMembers();
  $('.timestamp').text(0);
  finish = false;
  $('.bar').width('0%');
  lastMember = [];
}

function toggleDecrease(btn){
  // Toggle Class
  $(btn).toggleClass('btn-danger-on');
  // Toggle decrease
  decrease = !decrease;
  // Toggle Button test
  $(btn).text(function(){
    return (decrease) ? 'Decrease ON' : 'Decrease';
  });
}

function calculateTotals() {
  var allTotals = [];
  var total = 0;
  var percentages = [];
  totalPercentage = 0;
  //Populate allTotals
  for(var i = 0; i < allMembers.length; i++){
    allTotals.push(allMembers[i].total);
  }
  //Calculate total
  for(var j=0; j < allTotals.length; j++){
    total += allTotals[j];
  }
  //Populate Percentages
  for(var k = 0; k < allTotals.length; k++){
    // Calculate percentage
    var per = 100 * allTotals[k] / total;
    if (isNaN(per)) per = 0;
    per = Math.floor(per);
    // Update Member's percentage
    allMembers[k].percentage = per;
    // Add per to totalPercentage
    totalPercentage += per;
  }
}

function updateProgress(){
  // Calculate returns array with allTotals.length, and per
  calculateTotals();
  // Calculate fullTotal
    for(var n = 0; n < allMembers.length; n++){
      // Resize Bar on HTML
      var target = '.bar' + (n + 1);
      $(target).width(allMembers[n].percentage + '%');
    }
}

function finishDistribuition(){
  // Only if Finish is False
  if(!finish){
    calculateTotals();
    for(var m = 0; m < allMembers.length; m++){
      // Write Percentage on HTML
      var target = '.timestamp' + (m + 1);
      $(target).text(allMembers[m].percentage + '%');
    }
    // Write totalPercentage on #who
    $('#who').text('TOTAL: '+ totalPercentage +'%');
    // Change Finish
    finish = true;
  } else {
    // Show Seconds instead of percentages
    for(var l = 0; l < allMembers.length; l++){
      var target2 = '.timestamp' + (l + 1);
      $(target2).text(allMembers[l].total);
    }
    finish = false;
  }
}

/* ==========================================================================
   MAIN BUTTONS
   ========================================================================== */
$('#reset').on('click', function(){
    reset();
});

$('#remove').on('click', function(){
  // If lastMember is empty, stop function
  if(lastMember.length === 0) return;
  // Get Duration from lastMember and remove from total
  var lm = lastMember[lastMember.length - 1];
  var member = allMembers[lm];
  console.log('Removing ' + member.duration[member.duration.length - 1] + 's from '+ member.name);
  member.total -= member.duration[member.duration.length - 1];
  // Remove it from array
  member.duration.pop();
  // Write HTML
  $('.timestamp' + (lm + 1)).text(member.total);
  // Clear last Member
  lastMember.pop();
  // Update Progress Bar
  updateProgress();
});

$('#decrease').on('click', function(){
  toggleDecrease('#decrease');
});

$('#finish').on('click', function(){
  finishDistribuition();
});

/* ==========================================================================
   NAV TABS
   ========================================================================== */

$('.nav-tabs li a').on('click', function(){
  // Remove active
  $('.nav-tabs li').removeClass('active');
  // Add active class
  $(this).addClass('active');
  // Get href
  active = $(this).attr('href').slice(1);
  // Reset Members
  reset();
  // Populate Boxes
  populateBoxes();
});
