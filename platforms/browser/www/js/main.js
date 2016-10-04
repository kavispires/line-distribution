var model = {

    KEYS: [49, 50, 51, 52, 53, 54, 55, 56, 57], // key function not implemented

    COLORS: ['red', 'blue', 'yellow', 'green', 'orange', 'pink', 'purple', 'black','cyan', 'violet', 'grey', 'navy', 'teal','forest','hotpink','blueviolet','brown',],

    GROUPS: {
        'none': {
            'members': ['?'],
            'colors': ['grey']
        },
        'nsbz': {
            'members': ['Pat', 'Brian'],
            'colors': ['red', 'blue']
        },
        'kvs': {
            'members': ['Kyle', 'Anthony', 'Viktor', 'Seth'],
            'colors': ['blue', 'red', 'yellow', 'green']
        },
        'ga': {
            'members': ['Nadine', 'Cheryl', 'Kimberly', 'Sarah', 'Nicola'],
            'colors': ['orange', 'red', 'pink', 'yellow', 'cyan']
        },
        'gg': {
            'members': ['Taeyeon', 'Sunny', 'Tiffany', 'Hyoyeon', 'Yuri', 'Sooyong', 'Yonna', 'Seohyun'],
            'colors': ['orange', 'purple', 'pink', 'green', 'red', 'cyan', 'yellow', 'teal']
        },
        'twice': {
            'members': ['Nayeon', 'Jeongyeon', 'Momo', 'Sana', 'Jihyo', 'Mina', 'Dahyun', 'Chaeyoung', 'Tzuyu'],
            'colors': ['orange', 'green', 'red', 'blue', 'purple', 'violet', 'pink', 'cyan', 'yellow'],
        },
        'sqz': {
            'members': ['Leo', 'Bryan', '3J', 'Bobak', 'Zack', 'Nathan', 'JQ', 'Sypher', 'Nicky', 'Robbie'],
            'colors': ['teal', 'violet', 'orange', 'red', 'navy', 'green', 'yellow', 'purple', 'pink', 'grey']
        },
        'superjunior': {
            'members': ['Leeteuk', 'Heechul', 'Hankyung', 'Yesung', 'Kangin', 'Shindong', 'Sungmin', 'Eunhyuk', 'Donghae', 'Siwon', 'Ryeowook', 'Kyuhyun'],
            'colors': ['yellow', 'orange', 'navy', 'red', 'violet', 'pink', 'purple', 'cyan', 'blue', 'teal', 'green', 'grey']
        },
        'kaliens': {
          'members': ['Kalvin','Andy','Vincent','Sammy','Max','Leroy','Isaac','Sunny','Ike','Ethan','Gareth','Valentino','Alex','Shela','Drob'],
          'colors': ['green','purple','blueviolet','yellow','hotpink','blue','red','orange','pink','teal','grey','forest','brown','cyan','black'],
        },
        'custom': {
          'members': [],
          'colors': []
        }
    },
    // Initial Information

    lastMember: [],
    decrease: false,
    finish: false,
    totalPercentage: 0,
    keyPress: null,
    allMembers: [],
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
};

var viewModel = {
    init: function() {
        // Populate AllMembers
        this.populateAllMembers();
        // Assign Colors to Custom
        model.GROUPS.custom.colors = this.shuffleArray(model.COLORS);
    },

    /**
     * @description Populates allMembers array with Member
     */
    populateAllMembers: function() {
        var that = model.GROUPS[model.active];
        for (var i = 0; i < that.members.length; i++) {
            model.allMembers.push(new Member(that.members[i], that.colors[i]));
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

    toggleDecrease: function() {
        model.decrease = !model.decrease;
    },

    updateActive: function(group) {
        model.active = group;
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
        model.GROUPS.custom.members.push(member);
    },

    updateCustomStatus: function(boolean) {
        model.custom = boolean;
    },

    updateProgressWitdh: function(width) {
        model.progressWidth = width;
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

    removeLastMember: function() {
        model.lastMember.pop();
    },

};

var view = {
    /**
     * @description Initiates App
     */
    init: function() {
        $('.sets').hide();
        viewModel.init();
        viewModel.updateProgressWitdh($('.progress').width());
        this.populateBoxes();
    },

    /**
     * @description Shows and recolor boxes and progress bar in HTML
     */
    populateBoxes: function() {
        var allMembers = viewModel.getAllMembers();
        var colors = viewModel.getColors();

        // Hide all boxes
        $('.box').hide();
        // Remove all colors from bar
        for (var c = 0; c < colors.length; c++) {
            $('.box').removeClass(colors[c]);
            $('.bar').removeClass(colors[c]);
        }
        // For each Member
        var target;
        var name;
        for (var i = 0; i < allMembers.length; i++) {
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
        $('.box').removeClass('box-sm box-md box-lg');
        var qt = allMembers.length;
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
    },

    /**
     * @description Records Starting pressing time
     * @param {number} m
     */
    recordStart: function(m) {
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
        var btn = "#decrease";
        // Toggle Class
        $(btn).toggleClass('btn-danger-on');
        // Toggle decrease
        viewModel.toggleDecrease();
        // Toggle Button test
        btn = "#decrease .nav-text";
        $(btn).text(function() {
            return (decrease) ? 'Decrease ON' : 'Decrease';
        });
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
        var per;
        //Populate allTotals
        for (var i = 0; i < allMembers.length; i++) {
            allTotals.push(allMembers[i].total);
        }
        //Calculate total
        for (var j = 0; j < allTotals.length; j++) {
            total += allTotals[j];
        }
        //Populate Percentages
        for (var k = 0; k < allTotals.length; k++) {
            // Calculate percentage
            per = 100 * allTotals[k] / total;
            if (isNaN(per)) per = 0;
            // Update Member's percentage
            allMembers[k].percentage = per;
            // Add per to totalPercentage
            totalPercentage += per;
        }

        viewModel.updateTotalPercentage(totalPercentage);
    },

    finishDistribuition: function() {
        var finish = viewModel.getFinish();
        var allMembers = viewModel.getAllMembers();
        var totalPercentage = viewModel.getTotalPercentage();
        var targetTS, targetRank, number, per;
        // Only if Finish is False
        if (!finish) {
            this.calculateTotals();

            var allMembersTotals = [];
            // Populate ranking array
            for (var o = 0; o < allMembers.length; o++) {
                allMembersTotals.push(allMembers[o].total);
            }
            // Get Ranking positions
            var sorted = allMembersTotals.slice().sort(function(a, b) {
                return b - a;
            });
            var ranks = allMembersTotals.slice().map(function(v) {
                return sorted.indexOf(v) + 1;
            });

            for (var m = 0; m < allMembers.length; m++) {
                // Write Percentage on HTML
                number = m + 1;
                targetTS = '.timestamp' + number;
                targetRank = '.box' + number + ' .box-key';
                per = (Math.floor((allMembers[m].percentage) * 10)) / 10;
                if (per > 0) {
                    $(targetRank).text(ranks[m]);
                    $(targetTS).text('[' + per + '%]');
                } else {
                    $(targetRank).text('-');
                    $(targetTS).text('-');
                }
            }
            // Write totalPercentage on #who
            $('#who').text('TOTAL: ' + totalPercentage + '%');
            // Change Finish
            viewModel.updateFinish(true);
        } else {
            // Show Seconds instead of percentages
            for (var l = 0; l < allMembers.length; l++) {
                number = l + 1;
                targetTS = '.timestamp' + number;
                targetRank = '.box' + number + ' .box-key';
                $(targetTS).text(allMembers[l].total);
                $(targetRank).text(number);
            }
            viewModel.updateFinish(false);
        }
    },

    removeLast: function() {
        var lastMember = viewModel.getLastMember();
        var allMembers = viewModel.getAllMembers();

        // If lastMember is empty, stop function
        if (lastMember.length === 0) return;
        // Get Duration from lastMember and remove from total
        var lm = lastMember[lastMember.length - 1];
        var member = allMembers[lm];
        console.log('Removing ' + member.duration[member.duration.length - 1] + 's from ' + member.name);
        member.total -= member.duration[member.duration.length - 1];
        // Remove it from array
        member.duration.pop();
        // Write HTML
        $('.timestamp' + (lm + 1)).text(member.total);
        // Remove last span in log
        $('.log').find(':first-child').remove();
        // Clear last Member
        viewModel.removeLastMember();
        // Update Progress Bar
        this.updateProgress();
    },

    customize: function() {
      var custom = viewModel.getCustomStatus();
      var allMembers = viewModel.getAllMembers();

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

view.init();

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
$('.set-tab').on('click', function() {
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

// Keyboard triggers

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
