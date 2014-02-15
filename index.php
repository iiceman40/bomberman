<html lang="en">
	<head>
		<title>Bomberman</title>
		<meta http-equiv="content-type" content="text/html; charset=UTF-8">
		
		<script type="text/javascript" src="js/vendor/jquery-min.js"></script>
		<script src="js/vendor_menu/ko-300.js"></script>
		<script src="js/bomberman.menu.js"></script>

		<script src="//netdna.bootstrapcdn.com/bootstrap/3.1.0/js/bootstrap.min.js"></script>

		<link href="//netdna.bootstrapcdn.com/bootstrap/3.1.0/css/bootstrap.min.css" rel="stylesheet">
		<link href="//netdna.bootstrapcdn.com/bootswatch/3.1.0/slate/bootstrap.min.css" rel="stylesheet">
		<link rel="stylesheet" type="text/css" href="css/style.css" />
	</head>
	<body>
		<div class="container">
			<div class="row">
				<div class="col-sm-12">
					<h1>Bomberman <small>pre Alpha v0.1</small></h1>
				</div>
			</div>
			<div class="row">
				<div class="col-sm-6 player player0">
					<span data-bind="ifnot: players()[0].active">
						<button class="btn-primary playerBtn" data-bind="click: function(data, event) { togglePlayer(0, data, event) }">
							<span class="glyphicon glyphicon-plus"></span>
						</button>
					</span>
					<span data-bind="if: players()[0].active">
						<button class="btn-danger playerBtn" data-bind="click: function(data, event) { togglePlayer(0, data, event) }">
							<img src="images/bman_v2.svg" class="bman-head" />
						</button>
						<a href="#loginModal" class="login" data-toggle="modal" data-bind="click: function(data, event) { setCurrentPlayer(0, data, event) }">
							<span class="glyphicon glyphicon-log-in" data-bind="visible: !players()[0].loggedin()" data-tooltip="tooltip" data-placement="left" title="Login or Sign Up"></span>
							<span class="glyphicon glyphicon-user" data-bind="visible: players()[0].loggedin()" data-tooltip="tooltip" data-placement="left" title="Edit profile"></span>
						</a>
						<span class="form-group">
							<input class="playerName form-control" data-bind="value: players()[0].name, hasfocus: players()[0].name.focused" />
						</span>
					</span>
				</div>
				<div class="col-sm-6 player player1">
					<span data-bind="ifnot: players()[1].active">
						<button class="btn-primary playerBtn pull-right" data-bind="click: function(data, event) { togglePlayer(1, data, event) }">
							<span class="glyphicon glyphicon-plus"></span>
						</button>
					</span>
					<span data-bind="if: players()[1].active">
						<button class="btn-success playerBtn pull-right" data-bind="click: function(data, event) { togglePlayer(1, data, event) }">
							<img src="images/bman_v1.svg" class="bman-head" />
						</button>
						<a href="#loginModal" class="login" data-toggle="modal" data-bind="click: function(data, event) { setCurrentPlayer(1, data, event) }">
							<span class="glyphicon glyphicon-log-in" data-bind="visible: !players()[1].loggedin()" data-tooltip="tooltip" data-placement="left" title="Login or Sign Up"></span>
							<span class="glyphicon glyphicon-user" data-bind="visible: players()[1].loggedin()" data-tooltip="tooltip" data-placement="left" title="Edit profile"></span>
						</a>
						<span class="form-group">
							<input class="playerName form-control" data-bind="value: players()[1].name, hasfocus: players()[1].name.focused" />
						</span>
					</span>
				</div>
			</div>
			<div class="row">
				<div class="col-sm-6 player player2">
					<span data-bind="ifnot: players()[2].active">
						<button class="btn-primary playerBtn" data-bind="click: function(data, event) { togglePlayer(2, data, event) }">
							<span class="glyphicon glyphicon-plus"></span>
						</button>
					</span>
					<span data-bind="if: players()[2].active">
						<button class="btn-warning playerBtn" data-bind="click: function(data, event) { togglePlayer(2, data, event) }">
							<img src="images/bman_v3.svg" class="bman-head" />
						</button>
						<a href="#loginModal" class="login" data-toggle="modal" data-bind="click: function(data, event) { setCurrentPlayer(2, data, event) }">
							<span class="glyphicon glyphicon-log-in" data-bind="visible: !players()[2].loggedin()" data-tooltip="tooltip" data-placement="left" title="Login or Sign Up"></span>
							<span class="glyphicon glyphicon-user" data-bind="visible: players()[2].loggedin()" data-tooltip="tooltip" data-placement="left" title="Edit profile"></span>
						</a>
						<span class="form-group">
							<input class="playerName form-control" data-bind="value: players()[2].name, hasfocus: players()[2].name.focused" />
						</span>
					</span>
				</div>
				<div class="col-sm-6 player player3">
					<span data-bind="ifnot: players()[3].active">
						<button class="btn-primary playerBtn pull-right" data-bind="click: function(data, event) { togglePlayer(3, data, event) }">
							<span class="glyphicon glyphicon-plus"></span>
						</button>
					</span>
					<span data-bind="if: players()[3].active">
						<button class="btn-info playerBtn pull-right" data-bind="click: function(data, event) { togglePlayer(3, data, event) }">
							<img src="images/bman_v4.svg" class="bman-head" />
						</button>
						<a href="#loginModal" class="login" data-toggle="modal" data-bind="click: function(data, event) { setCurrentPlayer(3, data, event) }">
							<span class="glyphicon glyphicon-log-in" data-bind="visible: !players()[3].loggedin()" data-tooltip="tooltip" data-placement="left" title="Login or Sign Up"></span>
							<span class="glyphicon glyphicon-user" data-bind="visible: players()[3].loggedin()" data-tooltip="tooltip" data-placement="left" title="Edit profile"></span>
						</a>
						<span class="form-group">
							<input class="playerName form-control" data-bind="value: players()[3].name, hasfocus: players()[3].name.focused" />
						</span>
					</span>
				</div>
			</div>

			<div class="play-menu">
				<form action="game.php" method="get" id="startGame">
					<!-- Game Options Start -->
					<input type="hidden" name="numberOfPlayers" data-bind="value: numberOfPlayers()" />
					<input type="hidden" name="matchesToWin" data-bind="value: matchesToWin()" />
					<input type="hidden" name="sound" data-bind="value: sound()" />

					<div data-bind="if: players()[0].active"><input type="hidden" name="namePlayer0" data-bind="value: players()[0].name" /></div>
					<div data-bind="if: players()[1].active"><input type="hidden" name="namePlayer1" data-bind="value: players()[1].name" /></div>
					<div data-bind="if: players()[2].active"><input type="hidden" name="namePlayer2" data-bind="value: players()[2].name" /></div>
					<div data-bind="if: players()[3].active"><input type="hidden" name="namePlayer3" data-bind="value: players()[3].name" /></div>
					<!-- Game Options End -->
					<button type="submit" data-bind="visible: numberOfPlayers() > 0" class="play-button btn-default">
						<span class="glyphicon glyphicon-play"></span><br/>
						<span data-bind="text: numberOfPlayers"></span> Player(s)
					</button>
				</form>
				<span class="option wins" data-bind="click: addMatchesToWin" data-toggle="tooltip" data-placement="top" title="Number of matches to win for victory">
					<span class="glyphicon glyphicon-glass"></span> <span class="matchesToWin" data-bind="text: matchesToWin()"></span>
				</span>
				<span class="option sound" data-bind="click: toggleSound" data-toggle="tooltip" data-placement="left" title="Sound on/off">
					<span class="glyphicon" data-bind="css: {'glyphicon-volume-down': sound, 'glyphicon-volume-off': !sound()}"></span>
				</span>

			</div>


		</div>

		<!-- modal for login -->
		<div class="modal fade" id="loginModal">
			<div class="modal-dialog">
				<div class="modal-content">
					<div data-bind="template: { name: getModalTemplate }"></div>

				</div><!-- /.modal-content -->
			</div><!-- /.modal-dialog -->
		</div><!-- /.modal -->

		<!-- Templates -->
		<script type="text/html" id="loginsignup-template">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
				<h4 class="modal-title align-center">Please Log In, or Sign Up</h4>
			</div>
			<div class="modal-body">
				<div class="row">
					<div class="col-xs-6 col-sm-6 col-md-6">
						<a href="#" class="btn btn-lg btn-primary btn-block">Facebook</a>
					</div>
					<div class="col-xs-6 col-sm-6 col-md-6">
						<a href="#" class="btn btn-lg btn-primary btn-block">Google</a>
					</div>
				</div>
				<div class="login-or">
					<hr class="hr-or">
					<div class="span-or align-center">or</div>
				</div>
				<iframe id="remember" name="remember" class="hidden" src="blank.php"></iframe>
				<form role="form" target="remember" method="post" autocomplete="on" id="loginForm">
					<div class="form-group">
						<label for="inputEmail">Email address</label>
						<input data-bind="value: email" type="email" class="form-control" id="inputEmail">
					</div>
					<div class="form-group">
						<a class="pull-right" href="#">Forgot password?</a>
						<label for="inputPassword">Password</label>
						<input data-bind="value: password" type="password" class="form-control" id="inputPassword">
					</div>
					<input type="hidden" data-bind="value: currentPlayer" />
					<button type="submit" class="hidden"></button>
				</form>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-default" data-dismiss="modal"><span class="glyphicon glyphicon-remove"></span> Close</button>
				<button data-bind="click: signup" type="button" class="btn btn-primary" id="signUpBtn"><span class="glyphicon glyphicon-pencil"></span> Sign Up</button>
				<button data-bind="click: login" type="button" class="btn btn-info" id="logInBtn"><span class="glyphicon glyphicon-log-in"></span> Log In</button>
			</div>
		</script>
		<script type="text/html" id="profile-template">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
				<h4 class="modal-title align-center">Your Profile</h4>
			</div>
			<div class="modal-body">
				<div class="row">
					<div class="col-sm-5">
						Current Player Name:
					</div>
					<div class="col-sm-7">
						<input type="text" class="form-control" data-bind="value: players()[currentPlayer()].name" /><br/>
					</div>
				</div>
				<div class="row">
					<div class="col-sm-5">
						Email:
					</div>
					<div class="col-sm-7">
						<input type="text" class="form-control" data-bind="value: players()[currentPlayer()].email" /><br/>
					</div>
				</div>
				<div class="row">
					<div class="col-sm-5">
						Change Password:
					</div>
					<div class="col-sm-7">
						<input type="password" class="form-control" id="setNewPassword" placeholder="Enter new password" /><br>
						<input type="password" class="form-control" id="confirmNewPassword" placeholder="Confirm the new password" /><br>

					</div>
				</div>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-default pull-left" data-dismiss="modal"><span class="glyphicon glyphicon-log-out"></span> Log Out</button>
				<button type="button" class="btn btn-default" data-dismiss="modal"><span class="glyphicon glyphicon-remove"></span> Close</button>
				<button data-bind="" type="button" class="btn btn-primary" id="saveProfile"><span class="glyphicon glyphicon-save"></span> Save Changes</button>
			</div>
		</script>
	</body>
</html>