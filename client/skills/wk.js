/* by rafælcastrocouto */
/*jslint browser: true, white: true, sloppy: true, vars: true */
/*global game, $, alert, console */

game.skills.wk = {
  stun: {
    cast: function (skill, source, target) {
      var wk = source;
      var stun = skill.data('stun duration');
      var dot = skill.data('dot duration');
      if(game.status === 'turn') {
          game.states.table.animateCast(skill, target, game.states.table.playerCemitery);
      }
      wk.damage(skill.data('damage'), target, skill.data('damage type'));
      wk.addStun(target, stun);
      target.on('turnend.wk-stun', this.dot).data('wk-stun', {
        duration: stun + dot,
        source: source,
        skill: skill
      });
    },
    dot: function (event, eventdata) {
      var target = eventdata.target;
      var data = target.data('wk-stun');
      var source = data.source;
      var skill = data.skill;
      var dotduration = skill.data('dot duration');
      var duration = data.duration;
      var speed;
      if(duration > 0) {
        if(duration === dotduration) {
          source.addBuff(target, skill.data('buff'), dotduration);
          speed = target.data('speed') - 1;
          target.data('current speed', speed);
        }
        if(duration <= dotduration) { source.damage(skill.data('dot'), target, skill.data('damage type')); }
        data.duration -= 1;
        target.data('wk-stun', data);
      } else {
        speed = target.data('speed') + 1;
        target.data('current speed', speed);
        target.removeBuff('wk-stun');
        target.off('turnend.wk-stun');
        target.data('wk-stun', null);
      }
    }
  },
  lifesteal: {
    passive: function (skill, source) {
      var side = source.data('side');
      var team = $('.card.heroes.'+side);
      team.on('attack.wk-lifesteal', this.attack);
      team.data('wk-lifesteal', skill);
      source.addBuff(team, skill.data('buff'));
      source.on('die.wk-lifesteal', this.die);
      source.on('reborn.wk-lifesteal', this.reborn);
    },
    attack: function (event, eventdata) {
      var source = eventdata.source;
      var target = eventdata.target;
      var damage = source.data('current damage');
      var skill = source.data('wk-lifesteal');
      var bonus = skill.data('percentage') / 100;
      source.heal(damage * bonus);
    },
    die: function (event, eventdata) {
      var source = eventdata.target;
      var side = source.data('side');
      var team = $('.card.heroes.'+side);
      team.removeBuff('wk-lifesteal');
      team.off('attack.wk-lifesteal');
      team.data('wk-lifesteal', null);
    },
    reborn: function (event, eventdata) {
      var source = eventdata.target;
      var skill = source.data('wk-lifesteal');
      var side = source.data('side');
      var team = $('.card.heroes.'+side);
      source.addBuff(team, skill.data('buff'));
      team.on('attack.wk-lifesteal', this.attack);
      team.data('wk-lifesteal', skill);
    }
  },
  crit: {
    passive: function (skill, source) {
      source.addBuff(source, skill.data('buff'));
      source.on({
        'attack.wk': this.attack,
        'afterattack.wk': this.afterattack
      }).data('wk-crit', skill);
    },
    attack: function (event, eventdata) {
      var source = eventdata.source;
      var target = eventdata.target;
      var skill = source.data('wk-crit');
      var damage = source.data('current damage');
      var chance = skill.data('chance') / 100;
      var bonus = skill.data('percentage') / 100;
      if(game.random() < chance) {
        game.audio.play('crit');
        damage *= bonus;
        source.data({
          'crit': true,
          'currentdamage': damage
        });
      }
    },
    afterattack: function (event, eventdata) {
      var source = eventdata.source;
      source.data('current damage', source.data('damage'));
    }
  },
  ult: {
    passive: function (skill, source) {
      source.on('die.wk-ult', this.die);
      source.data('wk-ult-skill', skill);
    },
    die: function (event, eventdata) {
      var wk = eventdata.target;
      var spot = eventdata.spot;
      var skill = wk.data('wk-ult-skill');
      $('#'+spot).addClass('cript');
      wk.on('turnstart.wk-ult', game.skills.wk.ult.resurrect).data('wk-ult', {
        skill: skill,
        spot: spot,
        duration: skill.data('delay')
      });
      game.map.inRange(spot, game.map.getRange(skill.data('aoe range')), function (neighbor) {
        var otherside = 'enemy';
        var side = wk.data('side');
        if(side === 'enemy') { otherside = 'player'; }
        var card = neighbor.find('.card.'+otherside);
        if(card.length) {
          wk.addBuff(card, skill.data('buff'));
          var speed = card.data('speed') - 1;
          card.data('current speed', speed);
          card.on('turnstart.wk-ult', game.skills.wk.ult.turnstart);
          card.data('wk-ult', skill.data('duration'));
        }
      });
      wk.off('die.wk-ult');
    },
    resurrect: function (event, eventdata) {
      var wk = eventdata.target;
      var data = wk.data('wk-ult');
      var skill = data.skill;
      var spot = data.spot;
      var duration = data.duration;
      var side = wk.data('side');
      if(duration > 0) {
        data.duration -= 1;
        wk.data('wk-ult', data);
      } else {
        $('#'+spot).removeClass('cript');
        wk.reborn(spot).data('wk-ult', null);
        wk.off('turnstart.wk-ult');
      }
    },
    turnstart: function (event, eventdata) {
      var target = eventdata.target;
      var duration = target.data('wk-ult');
      if(duration > 0) {
        duration -= 1;
        target.data('wk-ult', duration);
      } else {
        var speed = target.data('current speed') + 1;
        target.data('current speed', speed);
        target.off('turnstart.wk-ult');
        target.data('wk-ult', null);
        target.removeBuff('wk-ult');
      }
    }
  }
};