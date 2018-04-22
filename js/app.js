"use strict";

const model = {
			cards: ['#000080',
					'#FFA500',
					'#00FFFF',
					'#00FF00',
					'#FFFF00',
					'#FF0000',
					'#C0C0C0',
					'#800080'],
			cells: [],
			previousCard: null,
			locked: false,
			elapsedTime: 0,
			matches: 0,
			timer: null,
			clicks: 0,
			stars: 3
}; 

const view = {

	buildBoard: function(){

		const board = $('#board');
		for(let i = 0; i < 4; i++){
			const row = $('<div class="row"><div>');
			for(let j = 0; j < 4; j++){
				const cell = $(`<div class="cell face-down" id="${i.toString() + ' ' + j.toString()}"></div>`);
				cell.appendTo(row);
			}

			row.appendTo(board);
		}
	},

	flipCard: function(card){

		const backgroundColor = card.hasClass('face-down') ? ctrl.getCard(card) : '#000000';
		card.css('background-color', backgroundColor);

		card.toggleClass('face-down');

	},

	removeCard: function (card){

		card.css('background-color', '#FFFFFF');

	},

	updateTimer: function (){

		let minutes = Math.floor(model.elapsedTime / 60);
		let seconds = model.elapsedTime % 60;

		minutes = '00' + minutes.toString();
		seconds = '00' + seconds.toString();

		minutes = minutes.slice(-2);
		seconds = seconds.slice(-2);

		$('#timer').html(minutes + ':' + seconds);

	},

	updateStars: function (){

		let res = '&#9734&#9734&#9734';
		 model.stars = 3 - Math.floor(model.clicks/24);
		if (model.stars < 0){
			model.stars = 0;
		}
		$("#stars").html(res.slice(0,model.stars*6));

	},

	updateMoves: function (){
		const moves = Math.floor(model.clicks/2);
		$('#moves').html(moves + ' Moves');

	},

	clearBoard: function () {

		$('.removed').removeClass('removed');
		$('.cell').addClass('face-down');
		$('.cell').css('background-color', '#000000');

	},

	displayModal: function (content) {
		$('#modal-content').html(content);
		$('#modal-background').css('display', 'block');
		$('#modal-box').css('display', 'block');
		
		$('#modal-background').on('click', function () {
			$('#modal-background').css('display', 'none');
			$('#modal-box').css('display', 'none');
		});
	}
};

const ctrl = {

	shuffle: function (array) {

		for (let i = 1; i < array.length; i++){
			const j = Math.floor(Math.random() * i);
		  	[array[i], array[j]] = [array[j], array[i]];
		}

    	return array;

	},

	incrementTime: function (){

		model.elapsedTime++;
		view.updateTimer();

	},

	startTimer: function (){

		clearInterval(model.timer);

		model.elapsedTime = 0;

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
		model.matches = 0;

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

		const content = `You have completed the game in ${model.elapsedTime} seconds and received ${model.stars} stars.  Do you want to play again?`;

		setTimeout(view.displayModal(content), 100);

	},

	incrementClicks: function () {

		model.clicks++;
		view.updateMoves();
		view.updateStars();

	},

	clickEventHandler: function(event){

		const target = $(event.target);

		if (target.hasClass('cell') && 
			target.hasClass('face-down') && 
			!target.hasClass('removed') &&
			!model.locked){

			view.flipCard(target);
			ctrl.incrementClicks();

			if (ctrl.isSecondFlippedCard()){
				
				//prevent more than two cards from being 
				//clicked/displayed at one time.
				model.locked = true;

				const firstCard = model.previousCard;
				model.previousCard = null;
				
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

				}, 750, firstCard);
			}
			else {
				model.previousCard = target;
			}
		}

	},

	run: function() {
		$('#board').on('click', ctrl.clickEventHandler);
		$('.new-game').on('click', ctrl.newGame);

		view.buildBoard();
		ctrl.newGame();

	}
};

ctrl.run();
