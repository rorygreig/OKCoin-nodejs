(function() {
	var SocketClient = require('ws');

	var url = "wss://real.okcoin.com:10440/websocket/okcoinapi";

	var ws = new SocketClient(url);

	var _event_handlers = Object();
	var _tag = 1;
	var _result_handlers = Object();
	var _idle_ping_timer_id = null;

	module.exports = OKCoin = (function(){
		function OKCoin(user_id, password, api_key, onConnect){
			this.user_id = user_id;
			this.password = password;
			this.api_key = api_key;

			/*
			 * add authentication function to event handlers
			 */
			_event_handlers["Welcome"] =  function(msg){
				console.log("Authenticating");
				authenticate(user_id, password, api_key, msg.nonce, function(){
					onConnect();
				});
			};

			/*
			 * set up websocket connection
			 */
			ws.on('open', function(data){
				console.log('websocket connected to: ' + url);
			});

			/*
			 * On each message call the relevant event handler
			 */
			ws.on('message', function (data, flags) {
				var msg = JSON.parse(data);
				if(msg !== undefined){
					console.log("\nReceived Message:")
					if(msg.error_code !== undefined && msg.error_code > 0){
						console.log('error: ');
						console.log( msg );
					} else {
						//call result handler function based on tag
						if(msg.tag !== undefined){
							handleResult(msg);
						}

						//call event handler function if this is a notification
						if(msg.notice !== undefined){
							handleNotification(msg);
						}
					}
				}
			});
		}

		function _do_request(request, callback){
			console.log("\nSending Request:")
			console.log(request);
			var tag = request.tag;
			ws.send(JSON.stringify(request), function(err){ if(err) throw(err); });
			_result_handlers[tag] = callback;
			_reset_idle_ping_timer();
			_tag++;
		};

		function _reset_idle_ping_timer() {
			if (_idle_ping_timer_id) {
				clearTimeout(_idle_ping_timer_id);
			}
			_idle_ping_timer_id = setTimeout(function () {
				console.log("\nSending ping request to keep connection open");
				_do_request({ }, function () { });
			}, 45000);
		};

		function handleNotification(msg){
			var handler = _event_handlers[msg.notice];
			if(handler !== undefined){
				handler(msg);
			} else {
				console.log("No handler function for event: '" + msg.notice + "'");
			}
		}

		function handleResult(msg){
			var handler = _result_handlers[msg.tag];
			if(handler !== undefined && typeof(handler) === "function"){
				handler(msg);
				delete _result_handlers[msg.tag];
			}
		}

		/*
		 * Authenticates as the specified user with the given authentication cookie
		 * and passphrase.
		 */
		function authenticate(user_id, password, cookie, callback) {

			var request = {
				  "tag": _tag,
					"method": "Authenticate",
					"user_id": Number(user_id),
					"cookie": cookie,
					"nonce": btoa(client_nonce),
					"signature": [ btoa(signature.r), btoa(signature.s)]
			};

			_do_request(request, function(result){
				console.log("Successfully authenticated user: " + user_id);
				callback(result);
			});
		};

		/*
		* add a listener for a message notice, to be called when this
		* message is received
		*/
		OKCoin.prototype.addEventListener = function(notice, handler){
			_event_handlers[notice] = handler;
		}



		return OKCoin;

	})();

}).call(this);
