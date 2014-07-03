$(document).ready(function(){
	console.log('ready');

	loggedinPlayers = [];

	// tooltips
	$('.option').tooltip();
	$('body').tooltip({
		selector: "[data-tooltip=tooltip]",
		container: "body"
	});

	$('.bg-font1').animate({
		'margin-left': '-6000px'
	}, 100000, "linear");
	$('.bg-font2').css('margin-left','-6000px').animate({
		'margin-left': '0px'
	}, 100000, "linear");
	$('.bg-font3').animate({
		'margin-left': '-6000px'
	}, 120000, "linear");
	// TODO find a nice way to loop/reset the animation

	/*
	 * View Model
	 */
	var vm;
	var playerModel = function(data){
		var thisPlayer = this;

		this.active = ko.observable(data.active);
		this.loggedin = ko.observable(data.loggedin);
		this.email = ko.observable();
		this.name = ko.observable(data.name);
		this.name.focused = ko.observable();

		this.name.focused.subscribe(function(newValue) {
			console.log(newValue);
			console.log(thisPlayer.loggedin());
			if(!newValue && thisPlayer.loggedin()) {
				$.post( "ajax/setname.php",{ "username": thisPlayer.name, "email": thisPlayer.email}).done(function( data ) {
					console.log( data );
					result = $.parseJSON( data );
					if( result.success == true){

					} else console.log(result.msg);
				});
			}
		});

	};
	var playerArray = [
		new playerModel({name: 'Angry', active: true, loggedin: false}),
		new playerModel({name: 'Cute', active: false, loggedin: false}),
		new playerModel({name: 'Weird', active: false, loggedin: false}),
		new playerModel({name: 'Sad', active: false, loggedin: false})
	]

	var ViewModel = function(players) {
		var self = this;

		// Data
		this.email = ko.observable();
		this.password = ko.observable();
		this.matchesToWin = ko.observable(3);
		this.sound = ko.observable(true);
		this.players = ko.observableArray(players);
		this.currentPlayer = ko.observable();
		this.currentModalTemplate = ko.observable('loginsignup-template');

		this.numberOfPlayers = ko.computed(function() {
			return ko.utils.arrayFilter(self.players(), function(player) {
				return player.active();
			}).length;
		});

		// Operations
		this.getModalTemplate = function(){
			return self.currentModalTemplate();
		}
		// options
		this.toggleSound = function(){
			if( this.sound() ) this.sound(false);
			else this.sound(true);
		}
		this.addMatchesToWin = function(){
			this.matchesToWin(this.matchesToWin()+1);
			if( this.matchesToWin() > 7 )
				this.matchesToWin(1);
		};

		this.togglePlayer = function(playerId){
			if( !players[playerId].active() ) players[playerId].active(true);
			else players[playerId].active(false);
			console.log(players[playerId].active());
		};

		this.setCurrentPlayer = function(playerId){
			self.currentPlayer(playerId);
			if( players[playerId].loggedin() )
				self.currentModalTemplate('profile-template');
			else
				self.currentModalTemplate('loginsignup-template');
		}

		this.signup = function(){
			$("#loginForm").submit();
			if( self.email!=undefined && self.password!=undefined )
				$.post( "ajax/signup.php",{ "username": self.email, "email": self.email, "password": self.password}).done(function( data ) {
					console.log( data );
					result = $.parseJSON( data );
					if( result.success == true){
						$('#loginModal').modal('hide');
						self.players()[0].name(self.email());
						self.players()[0].loggedin(true);
					} else alert(result.msg);
				});
			else console.log('Please fill out password and email.')
		};

		this.login = function(){
			$("#loginForm").submit();
			if( self.email!=undefined && self.password!=undefined )
				$.post( "ajax/login.php",{"email": self.email, "password": self.password}).done(function( data ) {
					console.log( data );
					result = $.parseJSON( data );
					if( result.success == true){
						$('#loginModal').modal('hide');
						self.players()[self.currentPlayer()].name(result.username);
						self.players()[self.currentPlayer()].email(result.email);
						self.players()[self.currentPlayer()].loggedin(true);

						if($.inArray(result.email,loggedinPlayers) == -1 ){
							loggedinPlayers.push(result.email);
							playerString = JSON.stringify(loggedinPlayers);
							localStorage.setItem("bombermanPlayers", playerString);
							console.log(localStorage.getItem("bombermanPlayers"));
						}
					} else alert(result.msg);
				});
			else console.log('Please fill out password and email.')
		};
		// todo check if local storage is available and set players as loggedin and active
		playerString = localStorage.getItem("bombermanPlayers");
		loggedinPlayers = $.parseJSON(playerString);
		console.log(loggedinPlayers);

	};
	ko.applyBindings( new ViewModel( playerArray ) );
});
