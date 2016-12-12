var model = {

    KEYSCODE: [49, 50, 51, 52, 53, 54, 55, 56, 57, 81, 87, 69, 82, 84],

    KEYFACE: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "Q", "W", "E", "R", "T"],

    COLORS: ['dirt', 'brown', 'orange', 'yellow', 'yellowgreen', 'green', 'forest', 'teal', 'cyan', 'navy', 'blue', 'violet', 'blueviolet', 'purple', 'pink', 'hotpink', 'red', 'grey', 'mediumgrey', 'black'],
    
};

/**
 * @description Member Class
 * @param {string} name
 * @param {string} color
 * @param {string} index
 * @param {string} keycode
 * @param {string} keyface
 */
var Member = function(name, color, index, keycode, keyface) {
    this.name = name;
    this.color = ko.observable(color);
    this.index = index;

    this.keycode = keycode;
    this.keyface = keyface;

    this.boxStart = ko.observable(0);
    this.boxEnd = ko.observable(0);
    this.keyStart = ko.observable(0);
    this.keyEnd = ko.observable(0);

    this.duration = ko.observableArray([]);
    this.total = ko.observable(0);
    this.percentage = ko.observable(0);
};

var Result = function(data){
    this.name = data.name;
    this.color = data.color();
    this.index = ko.observable(data.index);
    this.total = data.total();
    this.percentage = ko.observable(data.percentage());
    this.rank = ko.observable(0);
    this.finalpercentage = ko.observable(0);
    this.relativePercentage = ko.observable(0); // relative to the longest member
}

var Template = function(index, name, members, colors){
    this.index = index;
    this.name = name;
    this.members = members;
    this.colors = colors;
};

var ViewModel = function() {
    var self = this;

    /*  --------------
        INITIATE APP FUNCTIONS
        -------------- */

    this.init = function() {
        self.loadLocalStorage();
        self.populateAvailableSets();
    };

    /*  --------------
        OBSERVABLES
        -------------- */

    this.displaySets = ko.observable(false);
    this.availableSets = ko.observableArray([]);
    this.currentSet = ko.observable();
    this.currentBand = ko.observableArray([]);
    this.boxSize = ko.observable('box-md');
    this.lastMember = ko.observableArray([]);
    this.log = ko.observableArray([]);
    this.currentSinger = ko.observable('Select a Preset or Create a new band.');
    this.finish = ko.observable(false);
    this.decrease = ko.observable(false);
    this.log = ko.observableArray([]);
    this.totalPercentage = ko.observable(0);

    this.displayResults = ko.observable(false);
    this.resultsArray = ko.observableArray([]);

    this.allowedKeys = ko.observableArray([]);

    this.customBands = ko.observableArray([]);
    this.loadedBands = ko.observableArray([]);

    this.progressBarWidth = $('.progress').width();

    /*  --------------
        RESET APP FUNCTIONS
        -------------- */

    this.reset = function() {
        console.log('Resetting...');
        // reset Members
        for(var i = 0; i < self.currentBand().length; i++) {
            var member = self.currentBand()[i];
                member.duration([]);
                member.total(0);
                member.percentage(0);
        }
        // Log
        self.log([]);
        // currentSinger
        self.currentSinger('?');
        // lastMember
        self.lastMember([]);
        // totalPercentage
        self.totalPercentage(0);
        // finish
        self.finish(false);
        // progressBar
        self.updateProgressBar();
        // hide modal
        self.displayResults(false);
        // allowedKeys
        self.populateAllowedKeys();
    };

    /*  --------------
        LOAD LOCAL STORAGE 
        -------------- */

    this.loadLocalStorage = function() {
        if (typeof(Storage) !== 'undefined') {
            var localData = window.localStorage;
            console.log(localData);
            var parsedData = []
            for(var i = 0; i < localData.length; i++) {
                parsedData.push(localData.getItem("key"));
            }
            console.log(parsedData);
                //var cityNumber, locationNumber;
                //for(var i = 0; i < localData.length - 1; i++) {
                    //cityNumber = Number(localData.key(i)[0]);
                    //locationNumber = Number(localData.key(i)[1]);
                //}
        } else {
            alert('No browser Web Storage support. No data will be saved.');
        }

    };

    //window.localStorage.clear();

    /*  --------------
        TOP MENU FUNCTIONS 
        -------------- */

    this.createSet = function() {
        console.log('Create Set');
        self.setName('');
        self.customMembers([]);
        self.addColorToColorPickerPalette();
        self.displaySetCreator(!self.displaySetCreator());
    };

    this.saveSet = function() {
        console.log('Save Set');
        // Gather self.customBands
        var band = self.customBands();
        var i, keyprefix, j, key;
        console.log(band);
        // Save items
        for (i = 0; i < band.length; i++) {            
            keyprefix = band[i].name;
            keyprefix = keyprefix.replace(/\s/g,'_');
            keyprefix = keyprefix.toLowerCase();
            // Save Set
            window.localStorage.setItem('key', keyprefix);
            window.localStorage.setItem(keyprefix, band[i].name);
            for (j = 0; j < band[i].members.length; j++) {
                key = keyprefix + 'member' + j;
                console.log(key);
                window.localStorage.setItem(key, band[i].members[j]);
                key = keyprefix + 'color' + j;
                console.log(key);
                window.localStorage.setItem(key, band[i].colors[j]);
            }
        }
    };

    // Shows/Hides Set Menu
    this.toggleSets = function() {
        self.displaySets(!self.displaySets());
        self.displaySetCreator(false);
    };

    // Populate availableSets() with database and localStorage
    this.populateAvailableSets = function() {
        // Clear availableSets();
        self.availableSets([]);
        // Iterate through DATABASE
        for(var i = 0; i < DATABASE.length; i++){
            // Push temp to availableSets
            self.availableSets.push(DATABASE[i]);
        }
        // TODO: Load localStorage

        for(var i = 0; i < self.customBands().length; i++){
            // Push temp to availableSets
            self.availableSets.push(self.customBands()[i]);
        }
        console.log(self.availableSets());
    };

    this.selectSet = function(data) {
        // Hide Set Menu
        self.displaySets(false);
        // Update currentSet
        self.currentSet(data);
        // Reset app
        self.reset();
    };

    /*  --------------
        LINE DISTRUBUTION FUNCTIONALITY 
        -------------- */

    // Populates currentBand whenever currentSet is changed
    this.currentSet.subscribe(function(data){
        // Clear currentSet
        self.currentBand([]);
        // Loop through members
        for(var i = 0; i < data.members.length; i++){
            // Get keyboard key
            var key = [model.KEYSCODE[i], model.KEYFACE[i]];
            // Push new Member sending name, color and index information
            self.currentBand.push( new Member(data.members[i], data.colors[i], i, key[0], key[1]));
        }
        self.updateBoxSize();
        self.addClasses();
        self.addColorsToProgressBar();
    });

    // Define size of boxes based on number of members
    this.updateBoxSize = function() {
        var qt = self.currentBand().length;
        if (qt <= 2 || qt === 4) {
            self.boxSize('box-lg');
        } else if (qt === 3 || qt >= 5 && qt <= 9) {
            self.boxSize('box-md');
        } else if (qt >= 10 && qt <= 12){
            self.boxSize('box-sm');
        } else {
            self.boxSize('box-xs');
        }
    };

    // Add classes to boxes (unique class, size and color)
    this.addClasses = function() {
        var data = self.currentBand();
        for(var i = 0; i < data.length; i++){
            var classes = 'bar bar' + i + ' ' + data[i].color(); // e.g.: bar bar1
            $('.bar' + i).removeClass().addClass(classes);
        }
    };

    // Add classes to progressBar
    this.addColorsToProgressBar = function() {
        var data = self.currentBand();
        for(var i = 0; i < data.length; i++){
            var classes = 'box box' + i + ' ' + self.boxSize() + ' ' + data[i].color(); // e.g.: box box1 box-lg red
            $('.box' + i).removeClass().addClass(classes);
        }
    };

    // When a Box is clicked
    this.recordStart = function(data, e) {
        // Stop Script if finish() is true
        if(self.finish()) return;
        // Record start timestamp
        data.boxStart(Date.now());
        // Update what member is singing
        if (!self.decrease()) {
            self.currentSinger(data.name + ' is singing.');
        } else {
            self.currentSinger(data.name + ' is having time decreased.');
        }
    };
    
    // When a Box is released
    this.recordStop = function(data) {
        // Stop Script if finish() is true
        if(self.finish()) return;
        // Record end timestamp
        data.boxEnd(Date.now());
        // Calculate duration
        data.duration.push(Math.floor(((data.boxEnd() - data.boxStart()) / 1000) * 100) / 100);
        // if decrease is off
        if (!self.decrease()) {
            // Update Total, adding last item from duration array
            data.total(data.total() + data.duration()[data.duration().length - 1]);
            // Update what member is singing
            self.currentSinger(data.name + ' was the last member to sing.');
        } else {
            // Update Total, decreasing last item from duration array
            data.total(data.total() - data.duration()[data.duration().length - 1]);
            // Remove last item from duration array
            data.duration.pop();
            // If for any reason total is less than 0
            if (data.total() < 0 || isNaN(data.total())) data.total(0);
            // Update what member is singing
            self.currentSinger('Time was decreased from ' + data.name + '.');
        }
        // Fix 2 decimal only total
        data.total(self.fixDecimals(data.total(), 2));
        // Update Progress Bar
        self.updateProgressBar();
        // Add to Log
        self.log.unshift(data.name);
        // If this was a decrease:
        if (self.decrease()) {
            // Add line-through
            $('.log span:first-child').addClass('log-decreased');
            // Turn off decrease if on
            self.toggleDecrease();
        } else {
            // Update LastMember
            self.lastMember.push(data);
        }
    };

    this.populateAllowedKeys = function() {
        // Clear allowedKeys()
        self.allowedKeys([]);
        // Populate
        for (var i = 0; i < self.currentBand().length; i++) {
            self.allowedKeys.push(self.currentBand()[i].keycode);
        }
    };

    this.removeLast = function() {
        console.log('Removing last...');
        // Stop Script if finish() is true
        if(self.finish()) return;

        var lastMember = self.lastMember();
        // If lastMember is empty, stop function
        if (lastMember.length === 0) return;
        // Get Duration from lastMember and remove from total
        var member = lastMember[lastMember.length - 1];
        var decrease = member.duration()[member.duration().length - 1];
        member.total(member.total() - decrease);
        // Remove it from array
        member.duration.pop();
        // Remove from Log
        self.log.shift();
        // Clear last Member and from allMembers
        self.lastMember.pop();
        // Update Progress Bar
        self.updateProgressBar();
    };

    this.toggleDecrease = function() {
        $('#decrease').toggleClass('on');
        self.decrease(!self.decrease());
    }

    this.updateProgressBar = function() {
        // Calculate totals
        self.calculateTotals();
        // Resize Bars
        for (var n = 0; n < self.currentBand().length; n++) {
            // Resize Bar on HTML
            var target = '.bar' + n;
            // Animate
            var unit = self.progressBarWidth / 100;
            var size = self.currentBand()[n].percentage() * unit;
            $(target).animate({
                'width': size
            }, 500);
            // Fix if it didn't work
            $(target).css('width', self.currentBand()[n].percentage() + 'px');
        }
    };

    this.calculateTotals = function() {
        var allTotals = [];
        var total = 0;
        var percentages = [];
        var totalPercentage = 0;
        var per, i;
        //Populate allTotals
        for (i = 0; i < self.currentBand().length; i++) {
            allTotals.push(self.currentBand()[i].total());
        }
        //Calculate absolute total
        for (i = 0; i < allTotals.length; i++) {
            total += allTotals[i];
        }
        //Populate Percentages
        for (i = 0; i < allTotals.length; i++) {
            // Calculate percentage
            per = 100 * allTotals[i] / total;
            if (isNaN(per)) per = 0;
            // Update Member's percentage
            self.currentBand()[i].percentage(per);
            // Add per to totalPercentage
            totalPercentage += per;        
        }
        // Update totalPercentage
        self.fixDecimals(totalPercentage, 0);
        self.totalPercentage(totalPercentage);
    };

    this.finishDistribution = function() {
        // Toggle finish()
        self.finish(!self.finish());

        // If finish() is true
        if(self.finish()) {
            // Clear resultsArray()
            self.resultsArray([]);
            // Declare variables
            var allPercentages = [];
            var allTotals = [];
            var i, per, highestPercentage;

            // Populate results() and allPercentages
            for (i = 0; i < self.currentBand().length; i++) {
                self.resultsArray.push(new Result(self.currentBand()[i]));
                allPercentages.push( self.currentBand()[i].percentage());
                allTotals.push( self.currentBand()[i].total());
            }

            // Get Ranks
            var sorted = allTotals.slice().sort(function(a, b) {
                return b - a;
            });
            var ranks = allTotals.slice().map(function(v) {
                return sorted.indexOf(v) + 1;
            });

            // Write Ranks
            for (i = 0; i < self.resultsArray().length; i++) {
                self.resultsArray()[i].rank(ranks[i]);
            }

            // Calculate Highest Percentage
            highestPercentage = Math.max(...allPercentages);

            // Calculate Relative Percentage
            for (i = 0; i < self.resultsArray().length; i++) {
                per = (Math.floor((self.resultsArray()[i].percentage()) * 10)) / 10;
                if (per > 0) {
                    // Calculate Relative Percentage
                    relativePercentage = (100 * per) / highestPercentage;
                    relativePercentage = self.fixDecimals(relativePercentage, 0);
                    // Push Relative percentage
                    self.resultsArray()[i].relativePercentage(relativePercentage);
                    // Push percentage
                    per = self.fixDecimals(per, 1);
                    self.resultsArray()[i].percentage(per);
                }
            }
            // Rearrange resultsArray
            self.resultsArray.sort(function (a, b) {
                return parseFloat(a.rank()) - parseFloat(b.rank());
            });

            // All Colors to result bars
            for(i = 0; i < self.resultsArray().length; i++){
                // Change index
                self.resultsArray()[i].index(i);
                // Add index classes
                var classes = 'result result' + i; // e.g.: result result1
                $('.result' + i).removeClass().addClass(classes);
                // Add color classes
                classes = 'result-bar ' + self.resultsArray()[i].color;
                $('.result' + i + ' .result-bar').removeClass().addClass(classes);
            }

            // Update result bar Sizes
            for (i = 0; i < self.resultsArray().length; i++) {
                var target = '.result' + i + ' .result-bar';
                // Animate
                var size = self.resultsArray()[i].relativePercentage() + '%';
                $(target).animate({
                    'width': size
                }, 500);
                // Fix if it didn't work
                $(target).css('width', self.resultsArray()[i].relativePercentage() + '%');
            }
            // Show Modal
            self.displayResults(true);
        } else {
            // Hide Modal
            self.displayResults(false);
        }
    };

    this.closeResults = function() {
        // Hide Modal
        self.displayResults(false);
        // Unfinish
        self.finish(false);
    }

    // Fix 2 decimal only total
    this.fixDecimals = function(num, decimals) {
        if(decimals == undefined) decimals = 2;
        return Number(num.toFixed(decimals));
    };

    this.getData = function(i) {
        return self.currentBand()[i];
    }

    /*  --------------
    KEYPRESS 
    -------------- */

    this.permission = true;

    $(window).on('keydown', function(e){
        if (event.repeat != undefined) {
            self.permission = !event.repeat;
        }
        if (!self.permission) return;
        self.permission = false;
        // Assign target
        var i = self.allowedKeys().indexOf(e.keyCode);
        // If key is not allowed, stop code
        if (i === -1) return;
        var data = self.getData(i);
        self.recordStart(data);  
    });

    $(window).on('keyup', function(e){
        // Assign target
        var i = self.allowedKeys().indexOf(e.keyCode);
        // If key is not allowed, stop code
        if (i === -1) return;
        var data = self.getData(i);
        self.recordStop(data);
        self.permission = true;
    });

    /*  --------------
    CREATOR
    -------------- */

    this.displaySetCreator = ko.observable(false);
    this.colorPickerPalette = ko.observableArray();
    this.customMembers = ko.observableArray([]);
    this.setName = ko.observable();
    this.memberName = ko.observable();
    this.memberColor = ko.observable();
    this.memberColorSelection = ko.observable();
    this.numberOfCustomMembers = ko.observable(0);

    this.addColorToColorPickerPalette = function(){
        self.colorPickerPalette([]);
        for(var i = 0; i < model.COLORS.length; i++) {
            this.colorPickerPalette.push(model.COLORS[i]);
        }
        // All Colors to color picker
        for(var i = 0; i < self.colorPickerPalette().length; i++){
            // Add index classes
            var classes = 'colorpickerbox picker' + i + ' ' + self.colorPickerPalette()[i]; // e.g.: colorpickerbox picker1 red
            $('#picker' + i).removeClass().addClass(classes);
        }
    }

    this.selectCustomColor = function(data) {
        self.memberColor(data);
        $('.colorpickerbox').removeClass('color-selected');
        var index = model.COLORS.indexOf(data);
        $('.picker' + index).addClass('color-selected');
    }

    this.addCustomMember = function(data) {
        if(self.customMembers().length === 15) {
            alert('Maximum Number of Members. Confirm set or remove members.');
            return;
        }
        // If missing Member Name, add numbered name
        if(!self.memberName()) {
            var number = self.customMembers().length + 1;
            self.memberName('Member ' +  number);
        }
        // If missing Color, select random color
        if(!self.memberColor()) {
            var color = self.colorPickerPalette()[0];
            self.memberColor(color);
        }
        // Remove Color from options
        var colorToHide = self.colorPickerPalette().indexOf(self.memberColor());
        $('.picker' + colorToHide).hide();
        // Add Member to customMembers
        var index = self.customMembers().length;
        //Member = function(name, color, index, keycode, keyface);
        self.customMembers.push( new Member(self.memberName(), self.memberColor(), index, model.KEYSCODE[index], model.KEYFACE[index]));
        // Clear memberName and memberColor
        self.memberName('');
        self.memberColor('');
        $('.colorpickerbox').removeClass('color-selected');
        // update color picker boxes
        self.colorPickerPalette.valueHasMutated();
    }

    this.customMembers.subscribe(function(){
        self.numberOfCustomMembers(self.customMembers().length);
    });

    this.removeCustomMember = function(data) {
        self.customMembers.splice(data.index, 1);
        //TO-DO: Add color back to colorPickerPallete
        console.log(data);
        //self.colorPickerPalette.push(color);
        // Update colorPickerPalette
        var colorToShow = self.colorPickerPalette().indexOf(data.color());
        console.log(colorToShow);
        $('.picker' + colorToShow).show();
    }

    this.confirmSet = function() {
        // If there's no name
        if(!self.setName()) {
            alert("You must define a set name");
            return;
        }
        // If there's no members
        if(self.customMembers().length == 0) {
            alert("You need at least one member in the set");
            return;
        }
        // Build Set
        var index = DATABASE.length + self.customBands().length; //it wont be database in the future
        var name = self.setName();
        var members = [];
        var colors = [];
        for (var i = 0; i < self.customMembers().length; i++){
            members.push(self.customMembers()[i].name);
            colors.push(self.customMembers()[i].color());
        }

        self.customBands.push( new Template(index, name, members, colors));

        self.populateAvailableSets();

        self.selectSet(self.availableSets[self.availableSets().length - 1]);
        // Hide creator
        self.displaySetCreator(false);
    }

    /*  --------------
    CALL INIT()
    -------------- */

    self.init();
}

// Apply Bindings to View
$(document).ready(function(){
    ko.applyBindings(new ViewModel());
});