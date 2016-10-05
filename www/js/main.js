var model = {

    KEYS: [49, 50, 51, 52, 53, 54, 55, 56, 57], // key function not implemented

    COLORS: ['red', 'blue', 'yellow', 'green', 'orange', 'pink', 'purple', 'black','cyan', 'violet', 'grey', 'navy', 'teal','forest','hotpink','blueviolet','brown',],

    GROUPS: [],
    
    // Initial Information

    allMembers: [],
    lastMember: [],
    log: '',
    result: '',
    decrease: false,
    finish: false,
    totalPercentage: 0,
    keyPress: null,
    active: 'none',
    custom: false,
    progressWidth: 0,

};

/**
 * @description Member Class
 * @param {string} member
 * @param {string} color
 */
var Member = function(member, color) {
    this.start = 0;
    this.end = 0;
    this.duration = [];
    this.total = 0;
    this.name = member;
    this.color = color;
    this.percentage = 0;
    this.rank = 0;
    this.finalpercentage = 0;
    this.relativePercentage = 0;
};

var viewModel = {
    init: function() {
        // Popualate GROUPS
        model.GROUPS = DATABASE;
        console.log(model.GROUPS);
        // Populate AllMembers
        this.populateAllMembers();
        // Assign Colors to Custom
        model.GROUPS[1].colors = this.shuffleArray(model.COLORS);
    },

    /**
     * @description Populates allMembers array with Member
     */
    populateAllMembers: function() {
        var group = $.grep(model.GROUPS, function(e) {
            return e.id == model.active;
        });
        //var that = model.GROUPS[model.active];
        console.log('that',group);
        console.log(group[0].members.length);
        for (var i = 0; i < group[0].members.length; i++) {
            model.allMembers.push(new Member(group[0].members[i], group[0].colors[i]));
        }
    },

    shuffleArray: function(arr) {
      var j, x, i;
      var array = arr;
      for (i = array.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = array[i - 1];
        array[i - 1] = array[j];
        array[j] = x;
      }
      return array;
    },

    getAllMembers: function() {
        return model.allMembers;
    },

    getMember: function(m) {
        return model.allMembers[m];
    },

    getLastMember: function() {
        return model.lastMember;
    },

    getActive: function() {
        return model.active;
    },

    getColors: function() {
        return model.COLORS;
    },

    getDecrease: function() {
        return model.decrease;
    },

    getFinish: function() {
        return model.finish;
    },

    getTotalPercentage: function() {
        return model.totalPercentage;
    },

    getCustomStatus: function() {
        return model.custom;
    },

    getProgressWidth: function() {
        return model.progressWidth;
    },

    getLog: function() {
        return model.log;
    },

    getGroups: function() {
        return model.GROUPS;
    },

    toggleDecrease: function() {
        model.decrease = !model.decrease;
    },

    updateActive: function(group) {
        model.active = group;
    },

    updateMemberPercentage: function(i, per) {
        model.allMembers[i].percentage = per;
    },

    updateTotalPercentage: function(t) {
        model.totalPercentage = t;
    },

    updateLastMember: function(member) {
        model.lastMember.push(member);
    },

    updateFinish: function(boolean) {
        model.finish = boolean;
    },

    updateCustom: function(member) {
        model.GROUPS[1].members.push(member);
    },

    updateCustomStatus: function(boolean) {
        model.custom = boolean;
    },

    updateProgressWitdh: function(width) {
        model.progressWidth = width;
    },

    updateMemberTotal: function(i, t) {
        model.allMembers[i].total = t;
    },

    updateAllMembersMemberRank: function(i,r,p,rp) {
        model.allMembers[i].rank = r;
        model.allMembers[i].finalpercentage = p;
        model.allMembers[i].relativePercentage = rp;
    },

    updateLog: function(log) {
        model.log = log;
    },

    clearAllMembers: function() {
        model.allMembers = [];
    },

    clearCustomMembers: function() {
        model.GROUPS.custom.members = [];
    },

    clearLastMember: function() {
        model.lastMember = [];
    },

    removeLastMember: function(i) {
        model.lastMember.pop();
        model.allMembers[i].duration.pop();
    },

    decreaseLastFromMemberTotal: function(i, time) {
        model.allMembers[i].total -= time;
    }
};

var view = {
    /**
     * @description Initiates App
     */
    init: function() {
        $('.sets').hide();
        $('.results').hide();
        viewModel.init();
        viewModel.updateProgressWitdh($('.progress').width());
        this.populateSetsMenu();
        this.populateBoxes();
    },

    populateSetsMenu: function() {
        var $sets = $('.sets');
        var groups = viewModel.getGroups();

        $sets.html('');

        for (var i = 1; i < groups.length; i++) {
            $sets.append('<li class="set-tab" id="' + groups[i].id + '">' + groups[i].name + ' [' + groups[i].members.length + ']</li>');
        }
       
    },

    /**
     * @description Shows and recolor boxes and progress bar in HTML
     */
    populateBoxes: function() {
        var allMembers = viewModel.getAllMembers();
        var colors = viewModel.getColors();
        var i, target, name, qt

        // Hide all boxes
        $('.box').hide();
        // Remove all colors from bar
        for (i = 0; i < colors.length; i++) {
            $('.box').removeClass(colors[i]);
            $('.bar').removeClass(colors[i]);
        }
        // For each Member
        for (i = 0; i < allMembers.length; i++) {
            // Show Box
            target = '.box' + (i + 1);
            $(target).show();
            // Recolor boxes
            $(target).addClass(allMembers[i].color);
            // Write Name
            target = '.box' + (i + 1) + ' .box-name';
            name = allMembers[i].name;
            // Trim name
            if(name.length > 8){
              name = name.replace(/ /g,'').slice(0,8);
            }
            $(target).text(name);
            // Color Bars (in progress bar)
            target = '.bar' + (i + 1);
            $(target).addClass(allMembers[i].color);
        }
        // Add Size
        $('.box').removeClass('box-xs box-sm box-md box-lg');

        qt = allMembers.length;
        if (qt <= 2 || qt === 4) {
            $('.box').addClass('box-lg');
        } else if (qt === 3 || qt >= 5 && qt <= 9) {
            $('.box').addClass('box-md');
        } else if (qt >= 10 && qt <= 12){
            $('.box').addClass('box-sm');
        } else {
            $('.box').addClass('box-xs');
        }
    },

    reset: function() {
        viewModel.clearAllMembers();
        viewModel.clearLastMember();
        viewModel.populateAllMembers();
        viewModel.updateFinish(false);
        this.populateBoxes();

        $('.timestamp').text(0);
        $('.bar').width('0%');
        $('#who').text('?');
        $('.log').text('');
        $('.results').hide('fast');
    },

    /**
     * @description Records Starting pressing time
     * @param {number} m
     */
    recordStart: function(m) {
        // Stop Scrit if Finish is true
        var finish = viewModel.getFinish();
        if (finish) return;

        var member = viewModel.getMember(m);

        // Record timestamp
        member.start = Date.now();
        // Update what member is singing
        $('#who').text(member.name + ' is singing.');
    },

    /**
     * @description Calculate Duraion based on Stopping pressing time
     * @param {number} t
     */
    recordStop: function(m) {
        var finish = viewModel.getFinish();
        if (finish) return;
        // Only proceed code if finish isn't clicked


        var member = viewModel.getMember(m);
        var decrease = viewModel.getDecrease();

        // Stop timestamp
        member.end = Date.now();
        // Calculate duration
        member.duration.push(Math.floor(((member.end - member.start) / 1000) * 100) / 100);
        // if decrease is off
        if (!decrease) {
            // Update Total, adding
            member.total += member.duration[member.duration.length - 1];
        } else {
            // Update Total, decreasing
            member.total -= member.duration[member.duration.length - 1];
            if (member.total < 0) member.total = 0;
            this.toggleDecreaseButton(decrease);
        }
        viewModel.updateMemberTotal(m, member.total);
        // Write HTML
        $('.timestamp' + (m + 1)).text(member.total);
        // Update Progress Bar
        this.updateProgress();
        // Update LastMember
        viewModel.updateLastMember(m);
        // Add to Log
        $('.log').prepend('<span> | ' + member.name + '</span>');
    },

    toggleDecreaseButton: function(decrease) {
        // Stop Scrit if Finish is true
        var finish = viewModel.getFinish();
        if (finish) return;

        var btn = "#decrease";
        // Toggle Class
        $(btn).toggleClass('red');
        // Toggle decrease
        viewModel.toggleDecrease();
        // Toggle Button
        $("#decrease .nav-text").text('Decrease');
    },

    updateProgress: function() {
        var allMembers = viewModel.getAllMembers();
        var progressWidth = viewModel.getProgressWidth();

        // Calculate returns array with allTotals.length, and per
        this.calculateTotals();
        // Calculate fullTotal
        for (var n = 0; n < allMembers.length; n++) {
            // Resize Bar on HTML
            var target = '.bar' + (n + 1);
            // Animate
            var unit = progressWidth / 100;
            var size = allMembers[n].percentage * unit;
            $(target).animate({
                'width': size
            }, 500);
            // Fix if it didn't work
            $(target).css('width', allMembers[n].percentage + 'px');
        }
        // quick-fix
        $('.bar13').css('width', '0.1%');
    },

    calculateTotals: function() {
        var allMembers = viewModel.getAllMembers();

        var allTotals = [];
        var total = 0;
        var percentages = [];
        var totalPercentage = 0;
        var per, i;
        //Populate allTotals
        for (i = 0; i < allMembers.length; i++) {
            allTotals.push(allMembers[i].total);
        }
        //Calculate total
        for (i = 0; i < allTotals.length; i++) {
            total += allTotals[i];
        }
        //Populate Percentages
        for (i = 0; i < allTotals.length; i++) {
            // Calculate percentage
            per = 100 * allTotals[i] / total;
            if (isNaN(per)) per = 0;
            // Update Member's percentage
            allMembers[i].percentage = per;
            viewModel.updateMemberPercentage(i, per);
            // Add per to totalPercentage
            totalPercentage += per;        
        }

        viewModel.updateTotalPercentage(totalPercentage);
    },

    finishDistribuition: function() {
        var finish = viewModel.getFinish();
        var allMembers = viewModel.getAllMembers();
        var totalPercentage = viewModel.getTotalPercentage();
        var $finishButton = $('#finish .nav-text');
        var i, targetTS, targetRank, number, per, perMax, relative;
        // Only if Finish is False
        if (!finish) {
            this.calculateTotals();

            var allMembersTotals = [];
            var allMemmbersPercentages = [];

            // Populate ranking array and percantage array
            for (i = 0; i < allMembers.length; i++) {
                allMembersTotals.push(allMembers[i].total);
                per = (Math.floor((allMembers[i].percentage) * 10)) / 10;
                allMemmbersPercentages.push(per);
            }

            // Save log temporarily
            var log = $('.log').html();
            viewModel.updateLog(log);
            $('.log').text('');

            // Get Ranking positions
            var sorted = allMembersTotals.slice().sort(function(a, b) {
                return b - a;
            });
            var ranks = allMembersTotals.slice().map(function(v) {
                return sorted.indexOf(v) + 1;
            });

            // Calculate Highest Percentage
            perMax = Math.max(...allMemmbersPercentages);

            for (i = 0; i < allMembers.length; i++) {
                
                per = (Math.floor((allMembers[i].percentage) * 10)) / 10;

                // Write Results on Boxes
                number = i + 1;
                targetTS = '.timestamp' + number;
                targetRank = '.box' + number + ' .box-key';
                if (per > 0) {
                    $(targetRank).text(ranks[i]);
                    $(targetTS).text('[' + per + '%]');
                } else {
                    $(targetRank).text('-');
                    $(targetTS).text('-');
                }

                // Calculate Relative Percentage
                relative = (100 * per) / perMax;


                // Populate final Member Rank to object
                viewModel.updateAllMembersMemberRank(i,ranks[i],per,relative);
            }

            $('.results').show('fast');
            this.writeResultsModal();

            // Write totalPercentage on #who
            $('#who').text('TOTAL: ' + totalPercentage + '%');
            // Change Finish
            viewModel.updateFinish(true);
        } else {
            view.populateBoxes();
            // Show Seconds instead of percentages
            for (i = 0; i < allMembers.length; i++) {
                number = i + 1;
                targetTS = '.timestamp' + number;
                targetRank = '.box' + number + ' .box-key';
                $(targetTS).text(allMembers[i].total);
                $(targetRank).text(number);
            }
            viewModel.updateFinish(false);
            // Rewrite log
            var log = viewModel.getLog();
            $('.log').html(log); 
            // Hide Restuls Modal
            $('.results').hide('fast');
        }
        // Update Finish Button
        finish = viewModel.getFinish();
        if(finish) {
            $finishButton.text('Undo Finish');
        } else {
            $finishButton.text('Finish');
        }

    },

    writeResultsModal: function() {
        var allMembers = viewModel.getAllMembers();
        var i, rankhtml, size;
        console.log('Modal', allMembers);

        // Clear Results HTML
        $('.results').html('');

        // Sort all members
        allMembers.sort(function (a, b) {
            return parseFloat(a.rank) - parseFloat(b.rank);
        });

        for (i = 0; i < allMembers.length; i++) {
            rankhtml = '<div class="result result' + (i + 1) +'">';
            rankhtml += '<div class="result-bar ' + allMembers[i].color + '">.</div><div class="result-info">';
            rankhtml += '<span class="position">#' + allMembers[i].rank + '</span> ';
            rankhtml += '<span class="name">' + allMembers[i].name + '</span> ';
            rankhtml += '<span class="percentage">[' + allMembers[i].finalpercentage + '%]</span> ';
            rankhtml += '<span class="timestamp">[' + allMembers[i].total + 's]</span></div></div>';

            // Write on HTML
            $('.results').append(rankhtml);

            size = allMembers[i].relativePercentage + '%';
            //Resize Color bar
            $('.result' + (i + 1) + ' .result-bar').animate({
                'width': size
            }, 2000);
        }

    },

    removeLast: function() {
        // Stop Scrit if Finish is true
        var finish = viewModel.getFinish();
        if (finish) return;

        var lastMember = viewModel.getLastMember();
        var allMembers = viewModel.getAllMembers();

        // If lastMember is empty, stop function
        if (lastMember.length === 0) return;
        // Get Duration from lastMember and remove from total
        var lm = lastMember[lastMember.length - 1];
        var member = allMembers[lm];
        var decrease = member.duration[member.duration.length - 1];
        
        member.total -= decrease;
        viewModel.decreaseLastFromMemberTotal(lm, decrease);
        // Remove it from array
        member.duration.pop();
        // Write HTML
        $('.timestamp' + (lm + 1)).text(member.total);
        // Remove last span in log
        $('.log').find(':first-child').remove();
        // Clear last Member and from allMembers
        viewModel.removeLastMember(lm);
        // Update Progress Bar
        this.updateProgress();
    },

    customize: function() {
      var custom = viewModel.getCustomStatus();
      var allMembers = viewModel.getAllMembers();

      // Hide modal if its exposed
      $('.results').hide();

      // First Time
      if (!custom){
        viewModel.updateCustomStatus(true);
        viewModel.updateActive('custom');
        viewModel.clearAllMembers();
        this.addMember();  
      // Other Times
      } else {
        if(allMembers.length < 15){
          this.addMember();
        } else {
          var remove = confirm("Your custom band has the maximum 12 members. Restart?");
          if(remove){
            viewModel.clearAllMembers();
            viewModel.clearCustomMembers();
            allMembers = viewModel.getAllMembers();
            this.addMember();  
          }
        }
      }
    },

    addMember: function() {
      var add = prompt("Add Member:", "Member name (max. 8 characters)");
      viewModel.updateCustom(add);
      view.populateBoxes();
      view.reset();
    }

};

$(document).ready(function(){
    view.init();
});


/* ==========================================================================
   USER INPUT
   ========================================================================== */

// TOP MENU: CREATE

$('#menu-create').on('click', function(){
    view.customize();
});

// TOP MENU: SETS

// Toogles Sets Menu
$('#menu-sets').on('click', function() {
    $('.sets').slideToggle("slow");
});

// Active Set Menu Item
$('.sets').on('click', '.set-tab', function() {
    // Hides Results if opened
    $('.results').hide('fast');
    // Toogle Sets Menu
    $('.sets').slideToggle("slow");
    // Remove active from all set-tab elements
    $('.set-tab').removeClass('active');
    // Add active class
    $(this).addClass('active');
    // Get href
    viewModel.updateActive($(this).attr('id'));
    // Reset Members
    view.reset();
});

// APP NAVIGATION

$('#reset').on('click', function() {
    view.reset();
});

$('#remove').on('click', function() {
    view.removeLast();
});

$('#decrease').on('click', function() {
    view.toggleDecreaseButton(decrease);
});

$('#finish').on('click', function() {
    view.finishDistribuition();
});

// MEMBER BUTTONS

/**
 * @description Activate mousedown, runs recordStart, active mouseup, runs recordStop
 */
$('.box').on('vmousedown', function() {
    var target = parseInt($(this).attr('class').match(/\d+/)[0]) - 1;
    view.recordStart(target);
}).on('vmouseup', function() {
    var target = parseInt($(this).attr('class').match(/\d+/)[0]) - 1;
    view.recordStop(target);
}).bind('taphold', function(e) {
    e.preventDefault();
    return false;
});


$('.boxes *').bind('taphold', function(event, ui) {
    event.preventDefault();
});







// TO-DO

/*// Keyboard triggers

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
*/