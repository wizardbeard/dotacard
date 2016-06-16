var game = {
  staticHost: 'http://rafaelcastrocouto.github.io/dotacard/client/',
  dynamicHost: 'http://dotacard.herokuapp.com/',
  container: $('.game-container'),
  loader: $('<span>').addClass('loader'),
  message: $('<span>').addClass('message').html('<b>ALERT</b>: This game is in pre-alpha and bugs may (will) happen.</a>'),
  triesCounter: $('<small>').addClass('triescounter'),
  timeToPick: 25,
  timeToPlay: 30,
  waitLimit: 300,
  connectionLimit: 120,
  dayLength: 12,
  deadLength: 8,
  width: 9,
  height: 6,
  tries: 0,
  seed: 0,
  seed: 0,
  id: null,
  timeoutArray: [],
  skills: {},
  data: {}, //json {buffs, heroes, skills, ui, units}
  mode: '', //online, tutorial, campain
  currentData: {}, // moves data
  currentState: 'noscript', //unsupported, load, log, menu, options, choose, table
  start: function () {
    if (window.JSON &&
        window.localStorage &&
        window.btoa && window.atob &&
        window.XMLHttpRequest) {
      if (game.debug) {
        game.staticHost = '';
        game.dynamicHost = '';
      }
      game.utils();
      game.events.build();
      game.history.hash = localStorage.getItem('state');
      game.topbar = $('<div>').addClass('topbar').append(game.loader, game.message, game.triesCounter);
      game.states.changeTo('loading');
    } else game.states.changeTo('unsupported');
  },
  db: function (send, cb) {
    if (typeof send.data !== 'string') {
      send.data = JSON.stringify(send.data);
    }
    $.ajax({
      async: true,
      type: 'GET',
      url: game.dynamicHost + 'db',
      data: send,
      timeout: 4000,
      complete: function (receive) {
        var data;
        if (receive.responseText) {
          data = JSON.parse(receive.responseText);
        }
        if (cb) {
          cb(data || {});
        }
      }
    });
  },
  random: function () {
    game.seed += 1;
    return parseFloat('0.' + Math.sin(game.seed).toString().substr(6));
  },
  setMode: function (mode) {
    game.mode = mode;
    if (mode) game[mode].build();
    localStorage.setItem('mode', mode);
  },
  clear: function () {
    if (game.mode && game[game.mode].clear) game[game.mode].clear();
    if (game.states[game.currentState].clear) game.states[game.currentState].clear();
  },
  confirm: function (cb) {
    swal({
      title: game.data.ui.leave,
      type: 'warning',
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonText: game.data.ui.yes,
      cancelButtonText: game.data.ui.no,
    }).then(cb);
  },
  error: function (cb) {
    swal({
      title: game.data.ui.error,
      text: game.data.ui.reload,
      type: 'error',
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonText: game.data.ui.yes,
      cancelButtonText: game.data.ui.no,
    }).then(cb);
  },
  reset: function () {
    game.error(function(confirmed) { 
      if (confirmed) {
        game.setMode('');
        location.reload(true);
      }
    });
  }
};
