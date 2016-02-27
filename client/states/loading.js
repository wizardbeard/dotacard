game.states.loading = {
  build: function () {
    this.box = $('<div>').appendTo(this.el).addClass('box');
    this.logo = $('<div>').appendTo(this.box).addClass('logo slide');
    this.title = $('<img>').appendTo(this.logo).attr({alt: 'DOTA', src: 'img/title.png'}).addClass('h1');
    this.subtitle = $('<img>').appendTo(this.logo).attr({alt: 'CARD', src: 'img/subtitle.png'}).addClass('h2');
    this.h2 = $('<p>').appendTo(this.box).addClass('loadtext').html('<span class="loader loading"></span><span class="message">Checking for updates</span><span class="progress"></span>');
  },
  start: function () {
    game.message.html('<b>ALERT</b>: This game is in development and bugs may (will) happen.</a>');
    game.utils();
    game.events();
    game.timeout(400, game.load.start);
  }
};