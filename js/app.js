const model = {
			cards: ["#000080",
					"#FFA500",
					"#00FFFF",
					"#00FF00",
					"#FFFF00",
					"#FF0000",
					"#C0C0C0",
					"#800080"],
			cells: [],
			previousCard: null,
			locked: false,
			elapsedTime: 0,
			matches: 0,
			timer: null,
			clicks: 0
}; 

const view = {

	buildBoard: function(){

		const board = $("#board")
		for(let i = 0; i < 4; i++){
			let row = $(`<div class="row"><div>`);
			for(let j = 0; j < 4; j++){
				let cell = $(`<div class="cell face-down" id="${i.toString() + ' ' + j.toString()}"></div>`)
				cell.appendTo(row);
			}

			row.appendTo(board);
		}
	},

	flipCard: function(card){

		if (card.hasClass('face-down')){
			card.css("background-color", ctrl.getCard(card));
		}
		else{
			card.css("background-color", "#000000");
		}
		card.toggleClass('face-down');

	},

	removeCard: function (card){

		card.css("background-color", "#FFFFFF");

	},

	updateTimer: function (){

		let minutes = Math.floor(model.elapsedTime / 60);
		let seconds = model.elapsedTime % 60;

		minutes = '00' + minutes.toString();
		seconds = '00' + seconds.toString();

		minutes = minutes.slice(-2);
		seconds = seconds.slice(-2);

		$("#timer").html(minutes + ":" + seconds + ' ');

	},

	updateStars: function (){

		let res = "***";
		let stars = 3 - Math.floor(model.clicks/32);
		if (stars < 0){
			stars = 0;
		}
		$("#stars").html(res.slice(0,stars) + ' ');

	},

	updateMoves: function (){
		let moves = Math.floor(model.clicks/2);
		$("#moves").html(moves);

	},

	clearBoard: function () {

		$('.removed').removeClass('removed');
		$('.cell').addClass('face-down');
		$('.cell').css('background-color', '#000000')
		
	}
}


const ctrl = {

	shuffle: function (a) {
		//copied from stackoverflow

    	for (let i = a.length - 1; i > 0; i--) {
       	 	const j = Math.floor(Math.random() * (i + 1));
        	[a[i], a[j]] = [a[j], a[i]];
    	}
    	return a;

	},

	incrementTime: function (){

		model.elapsedTime++;
		view.updateTimer();

	},

	startTimer: function (){

		if (model.timer !== null){
			clearInterval(model.timer);
			model.elapsedTime = 0;
		}

		model.timer = setInterval(ctrl.incrementTime, 1000);

	},

	stopTimer: function () {

		clearInterval(model.timer);

	},

	initConfig(){

		model.clicks = 0;
		model.cells = [];
		model.locked = false;
		model.previousCard = null;

		ctrl.startTimer();

		view.updateStars();
		view.updateMoves();
		view.clearBoard();

	},

	deal: function (){

		let shuffled = ctrl.shuffle(model.cards.concat(model.cards));
		while (shuffled.length > 0){
			model.cells.push(shuffled.splice(0,4));
		}
	},

	newGame: function (){

		ctrl.initConfig();
		ctrl.deal()

	},

	getCard: function (card){

		[y,x] = card.attr('id').split(' ');
		return model.cells[y][x];

	},

	cardsMatch: function (first, second){

		return ctrl.getCard(first) === ctrl.getCard(second);

	},

	isSecondFlippedCard: function (){

		return model.previousCard !== null;

	},

	gameComplete: function () {

		ctrl.stopTimer();
		view.displayCompletionModal();

	},

	incrementClicks: function () {

		model.clicks++;
		view.updateMoves();
		view.updateStars();

	},

	clickEventHandler: function(event){

		const target = $(event.target);

		if (target.hasClass("cell") && 
			target.hasClass("face-down") && 
			!target.hasClass("removed") &&
			!model.locked){

			view.flipCard(target);
			ctrl.incrementClicks();

			if (ctrl.isSecondFlippedCard()){
				
				//prevent more than two cards from being 
				//clicked/displayed at one time.
				model.locked = true;

				const firstCard = model.previousCard;
				model.previousCard = null
				
				setTimeout(function(firstCard) {
					if (ctrl.cardsMatch(target, firstCard)){
						
						view.removeCard(target);
						view.removeCard(firstCard);
						
						model.matches++;
						
						if (model.matches >= 8){
							ctrl.gameComplete();
						}
					}
					else{
						
						view.flipCard(target);
						view.flipCard(firstCard);
					}
					
					model.locked = false;
				}, 750, firstCard)
			}
			else {
				model.previousCard = target;
			}
		}

	},

	run: function() {
		$('#board').on("click", ctrl.clickEventHandler)
		$('#new-game').on("click", ctrl.newGame)

		view.buildBoard();
		ctrl.newGame();

	}
}

ctrl.run();
