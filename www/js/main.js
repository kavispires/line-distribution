var model = {

    KEYSCODE: [49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 81, 87, 69, 82, 84],

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
};

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

    this.appCanBeInitiated = false;
    
    this.displayHome = ko.observable(true);

    this.displayMain = ko.observable(false);
    this.displaySets = ko.observable(false);
    this.availableSets = ko.observableArray([]);
    this.currentSet = ko.observable();
    this.currentBandName = ko.observable('');
    this.currentBand = ko.observableArray([]);
    this.boxSize = ko.observable('box-md');
    this.lastMember = ko.observableArray([]);
    this.log = ko.observableArray([]);
    this.currentSinger = ko.observable('Select a Preset or Create a new band.');
    this.finish = ko.observable(false);
    this.decrease = ko.observable(false);
    this.log = ko.observableArray([]);
    this.totalPercentage = ko.observable(0);

    this.displayCoreApplication = ko.observable(true);
    this.displayResults = ko.observable(false);
    this.resultsArray = ko.observableArray([]);

    this.allowedKeys = ko.observableArray([]);

    this.customBands = ko.observableArray([]);
    this.loadedBands = ko.observableArray([]);
    this.changesToBeSaved = ko.observable(false);

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
            console.log('Loading LocalStorage...');
            var localData = window.localStorage.getItem('linedistribution');
            // Stop code if no localStorage was previously saved.
            if (localData === null) {
                console.log('Nothing to load.');
                return;
            }
            var index, index1, index2;
            // Clear loadedBands
            self.loadedBands([]);
            var loadMembers = function(newBand) {
                // If localData Code for band '&b&' is not the first thing in string and it has a member '&m&'
                if (localData.indexOf('&b&') !== 0 && localData.indexOf('&m&') != -1) {
                    // Remove '&m&'
                    localData = localData.substring(3, localData.length);
                    // Push member to members
                    index = localData.indexOf('&c&');
                    newBand.members.push(localData.substring(0, index));
                    localData = localData.substring(index, localData.length);
                    // Remove '&c&'
                    localData = localData.substring(3, localData.length);
                    // Find index of next element
                    index1 = localData.indexOf('&m&');
                    index2 = localData.indexOf('&b&');
                    if (index1 != -1 && index2 != -1 && index1 < index2) {
                        index = index1;
                    } else if (index1 != -1 && index2 != -1 && index1 > index2) {
                        index = index2;
                    } else if (index1 != -1 && index2 == -1) {
                        index = index1;
                    } else {
                        index = localData.length;
                    }
                    newBand.colors.push(localData.substring(0, index));
                    localData = localData.substring(index, localData.length);
                    console.log('Adding Member:', newBand.members[newBand.members.length - 1], '(', newBand.colors[newBand.colors.length - 1],')');
                    // Run loadMembers again
                    loadMembers(newBand);
                } else {
                    console.log('Members have been loaded.');
                }
            };

            var loadBand = function() {
                // If localData Code for band '&b&'
                if (localData.indexOf('&b&') != -1) {
                    console.log('=== NEW BAND ===');
                    // Create empty band object
                    var newBand = {};
                    // Band Name
                    /// Remove '&b&'
                    localData = localData.substring(3, localData.length);
                    /// Search for next && and return index
                    index = localData.indexOf('&m&');
                    /// Add bandName and remove it from string
                    newBand.name = localData.substring(0, index);
                    localData = localData.substring(index, localData.length);
                    console.log('Band Name:', newBand.name);
                    //console.log(localData);
                    // Create members and colors arrays
                    newBand.members = [];
                    newBand.colors = [];
                    // Run loadMembers
                    loadMembers(newBand);

                    // Add band to self.loadedBands
                    self.loadedBands.push(newBand);
                    // Run loadBand again
                    loadBand();
                } else {
                    self.appCanBeInitiated = true;
                    console.log('Loading LocalStorage complete.');
                }
            };
            // Run loadBand for the first time
            loadBand();
        } else {
            self.alert('alert', 'No browser Web Storage support. No save features will be available.');
            //alert('No browser Web Storage support. No save features will be available.');
        }
    };

    this.toggleWindow = function(active) {
        console.log(active);
        // Hide Sets
        self.displaySets(false);
        // Show only active
        active == 'displayMain' ? self.displayMain(true) : self.displayMain(false);
        active == 'displaySetCreator' ? self.displaySetCreator(true) : self.displaySetCreator(false);
        active == 'displaySetEditor' ? self.displaySetEditor(true) : self.displaySetEditor(false);
        active == 'displayHome' ? self.displayHome(true) : self.displayHome(false);
        // TO-DO: Hide Modals

        if(active == undefined) self.displayHome(true);
    }

    /*  --------------
        TOP MENU FUNCTIONS 
        -------------- */

    this.createSet = function() {
        console.log('Create Set');
        self.setName('');
        self.customMembers([]);
        self.addColorToColorPickerPalette();
        // Toggle windows
        self.toggleWindow('displaySetCreator');
    };

    this.editSets = function() {
        console.log('Edit Sets');
        if (self.customBands().length > 0) {
            var confirmEdit = confirm("Sets will be saved before continuing.");
        }
        if (confirmEdit) self.saveSet();
        // Toggle windows
        self.toggleWindow('displaySetEditor');
    }

    this.saveSet = function() {
        // Close sets if opened
        self.displaySets(false);
        // Check if there's anything to be saved
        if (self.customBands().length === 0 && self.changesToBeSaved() == false) {
            self.alert('alert', "Nothing to save. Create a custom Band before saving it.");
            return;
        }
        console.log('Saving Sets...');
        var i, j, k;
        // Gather self.customBands
        var band = self.customBands();
        // Add loadedBands to band
        for (k = 0; k < self.loadedBands().length; k++) {
            band.push(self.loadedBands()[k]);
        }
        var savefile = '';
        // Get previously linedistribution saved file, if any
        //if (loadData !== null && loadData !== undefined) savefile = loadData;
        // Save items
        for (i = 0; i < band.length; i++) {
            // Add Band Name          
            savefile += '&b&' + band[i].name;
            // For each item in the band
            for (j = 0; j < band[i].members.length; j++) {
                savefile += '&m&' + band[i].members[j];
                savefile += '&c&' + band[i].colors[j];
            }     
        }
        // Save string '&&name&&member&&color&&member&&color...'
        window.localStorage.setItem('linedistribution', savefile);
        // Rerun loadSets
        self.loadLocalStorage();
        // Clear custom bands
        self.customBands([]);
        // Unallow Save
        self.changesToBeSaved(false);
        // Repopulate available sets
        self.populateAvailableSets();
        // Alert
        self.alert('alert', 'Save complete!');
    };

    // Shows/Hides Set Menu
    this.toggleSets = function() {
        self.displaySets(!self.displaySets());
    };

    // Populate availableSets() with database and localStorage
    this.populateAvailableSets = function() {
        // Clear availableSets();
        self.availableSets([]);
        var i;
        // Iterate through DATABASE
        for(i = 0; i < DATABASE.length; i++){
            // Push temp to availableSets
            self.availableSets.push(DATABASE[i]);
        }
        // Iterate through loadedBands
        for(i = 0; i < self.loadedBands().length; i++){
            // Push temp to availableSets
            self.availableSets.push(self.loadedBands()[i]);
        }

        // Iterate through unsaved customBands
        for(i = 0; i < self.customBands().length; i++){
            // Push temp to availableSets
            self.availableSets.push(self.customBands()[i]);
        }
    };

    this.selectSet = function(data) {
        // Toggle windows
        self.toggleWindow('displayMain');
        // Display coreApplication
        self.displayCoreApplication(true);
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
        // Update current band name
        self.currentBandName(data.name);
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
    };

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
            self.displayCoreApplication(false);
        } else {
            // Hide Modal
            self.displayResults(false);
            self.displayCoreApplication(true);
        }
    };

    this.closeResults = function() {
        // Hide Modal
        self.displayResults(false);
        self.displayCoreApplication(true);
        // Unfinish
        self.finish(false);
    };

    // Fix 2 decimal only total
    this.fixDecimals = function(num, decimals) {
        if(decimals === undefined) decimals = 2;
        return Number(num.toFixed(decimals));
    };

    this.getData = function(i) {
        return self.currentBand()[i];
    };

    /*  --------------
    KEYPRESS 
    -------------- */

    this.permission = true;

    $(window).on('keydown', function(e){
        if (event.repeat !== undefined) {
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
    this.availableColors = [];
    this.customMembers = ko.observableArray([]);
    this.setName = ko.observable();
    this.memberName = ko.observable();
    this.memberColor = ko.observable();
    this.memberColorSelection = ko.observable();
    this.numberOfCustomMembers = ko.observable(0);
    this.confirmEdit = ko.observable('');

    this.addColorToColorPickerPalette = function(){
        var i;
        self.colorPickerPalette([]);
        for(i = 0; i < model.COLORS.length; i++) {
            self.colorPickerPalette.push(model.COLORS[i]);
            self.availableColors.push(model.COLORS[i]);
        }
        // All Colors to color picker
        for(i = 0; i < self.colorPickerPalette().length; i++){
            // Add index classes
            var classes = 'colorpickerbox picker' + i + ' ' + self.colorPickerPalette()[i]; // e.g.: colorpickerbox picker1 red
            $('#picker' + i).removeClass().addClass(classes);
        }
    };

    this.selectCustomColor = function(data) {
        self.memberColor(data);
        $('.colorpickerbox').removeClass('color-selected');
        var index = model.COLORS.indexOf(data);
        $('.picker' + index).addClass('color-selected');
    };

    this.addCustomMember = function(data) {
        if(self.customMembers().length === 15) {
            self.alert('alert', 'Maximum Number of Members. Confirm set or remove members.');
            return;
        }
        // If missing Member Name, add numbered name
        if(!self.memberName()) {
            var number = self.customMembers().length + 1;
            self.memberName('Member ' +  number);
        }
        // If missing Color, select random color
        if(!self.memberColor()) {
            var color = self.availableColors[0];
            self.memberColor(color);
        }
        // Hide Color from palette
        var colorToHide = self.colorPickerPalette().indexOf(self.memberColor());
        $('.picker' + colorToHide).hide();
        // Remove Color from available
        self.availableColors.splice(self.availableColors.indexOf(self.memberColor()), 1);
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
    };

    this.customMembers.subscribe(function(){
        self.numberOfCustomMembers(self.customMembers().length);
    });

    this.removeCustomMember = function(data) {
        // TO-DO: Colors are not removed correctly when buttons are not clicked in order, from left to right
        // Get color index
        var thisColor = self.colorPickerPalette().indexOf(data.color());  
        // Update colorPickerPalette
        $('.picker' + thisColor).show();
        // Update available colors
        self.availableColors.splice(thisColor, 0, data.color());
        // Remove member
        self.customMembers.splice(data.index, 1);
    };

    this.confirmSet = function() {
        // If there's no name
        if(!self.setName()) {
            self.alert('alert', "You must define a set name");
            return;
        }
        // If there's no members
        if(self.customMembers().length === 0) {
            self.alert('alert', "You need at least one member in the set");
            return;
        }
        // If this is Set Edit, remove it from loadedBands first
        if (self.confirmEdit().length > 0) {
            var remainingBands = $.grep(self.loadedBands(), function(e){ 
                return e.name != self.confirmEdit(); 
            });
            self.loadedBands(remainingBands);
            self.confirmEdit('');
        }
        // Build Set
        var index = DATABASE.length + self.loadedBands().length + self.customBands().length;
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
        self.toggleWindow();
    };

    /*  --------------
    EDITOR
    -------------- */

    this.displaySetEditor = ko.observable(false);

    this.editCustomBand = function(data) {
        console.log('Edit Set');
        // Close editor
        self.displaySetEditor(false);
        // Clear customMembers
        self.customMembers([]);
        // Build color palette
        self.addColorToColorPickerPalette();
        // Set Name
        self.setName(data.name);
        // Set member colored buttons
        for (var i = 0; i < data.members.length; i++) {
            // Add member
            self.customMembers.push( new Member(data.members[i], data.colors[i], i, model.KEYSCODE[i], model.KEYFACE[i]));
            // Hide Color from palette and for available observable
            var colorToHide = self.colorPickerPalette().indexOf(data.colors[i]);
            $('.picker' + colorToHide).hide();
            self.availableColors.splice(self.availableColors.indexOf(data.colors[i]), 1);
        }
        // 
        self.confirmEdit(data.name);
        // Open creator
        self.displaySetCreator(true);
    };

    this.deleteCustomBand = function(data) {
        var areYouSure = confirm('Are you sure you want to delete ' + data.name + ' custom band?');
        if(areYouSure) {
            // Remove Band
            var remainingBands = $.grep(self.loadedBands(), function(e){ 
                return e.name != data.name; 
            });
            self.loadedBands(remainingBands);
            // Allow save
            self.changesToBeSaved(true);
        }
    };

    this.closeEdit = function() {
        self.displaySetEditor(false);
        self.displayHome(true);
    }

    /*  --------------
        ALERT MODAL 
        -------------- */

    this.displayAlert = ko.observable(false);
    this.alertMessage = ko.observable('');
    this.displayAlertNavOk = ko.observable(false);
    this.displayAlertNavOpt = ko.observable(false);

    this.alert = function(type, msg) {
        self.displayAlert(true);
        if(type == 'alert') {
            self.alertMessage(msg);
            self.displayAlertNavOk(true);
        }
        // return true or false; if type warn=true
    }

    this.alertOK = function() {
        self.displayAlert(false);
    }

    /*  --------------
    CALL INIT()
    -------------- */

    self.init();
};

// Apply Bindings to View
$(document).ready(function(){
    ko.applyBindings(new ViewModel());
});