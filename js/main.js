var keys = [49, 50, 51, 52, 53, 54, 55, 56, 57];
var twice = ['Nayeon','Jeongyeon','Momo','Sana','Jihyo','Mina','Dahyun','Chaeyoung','Tzuyu'];
var pressed = {};
var num = 0;
var duration = 0;
var done = false;

$('.box1').mousedown(function(){
  console.log('DOWN');
}).mouseup(function(){
  console.log('UP');
});




window.onkeydown = function(e) {
  if (pressed[e.which]) return;
  pressed[e.which] = e.timeStamp;
  num = parseInt(keys.indexOf(e.which)+1);
  console.log(twice[num-1]+' singing...')
};

window.onkeyup = function(e) {
  if (!pressed[e.which]) return;
  var duration = (e.timeStamp - pressed[e.which]) / 1000;
  duration = Math.floor(duration * 100) / 100;
  // Key "e.which" was pressed for "duration" seconds
  if(num > 0 && done === false){
    run(num, duration);
  }

  pressed[e.which] = 0;
};

function run(num, duration){
  // Update H3
  $('#key').text(num);
  //Create Target ID
  var target = '#box' + num;
  //Collect Previous Div Value
  var prev = $(target).text();
  prev = Number(prev);
  prev = Math.floor(prev * 100) / 100;
  //
  var totalTime = prev + duration;
  $(target).text(totalTime);
}


$('#reset').on('click', function(){
  for(var i = 1; i <= 9; i++){
    var target = '#box' + i;
    $(target).text(0);
    done = false;
  }
});

$('#calculate').on('click', function(){
  if(done === false){
      var totals = [];
      //Populate Totals
      for(var i = 1; i <= 9; i++){
        var target = '#box' + i;
        totals.push(Number($(target).text()));
      }
      //Calculate Total
      var total = 0;
      for(var j=0; j < totals.length; j++){
        total += totals[j];
      }
      console.log('TOTAL = ',total);
      var percentages = [];
      //Populate Percentages
      for(var k = 0; k < totals.length; k++){
        var per = 100 * totals[k] / total;
        per = Math.floor(per);
        var target = '#box' + (k + 1);
        $(target).text(per + '%');
        console.log(twice[k], per, '%');
      }
    }
  done = true;
});
