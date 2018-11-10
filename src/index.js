var game = new Phaser.Game(550, 550, Phaser.CANVAS, 'afm', { preload: preload, create: create, update: update });

nameOffsetTop = 230;
titleOffsetTop = -240;

function Text(id, position, scale, fontName) {
  this.id = id;
  this.font = null;
  this.position = position;
  this.setupFont(fontName);
  this.setScale(scale);
}

Text.prototype = {
  setScale: function(scale) {
    this.image.scale.x = scale;
    this.image.scale.y = scale;
  },
  zoomIn: function() {
    if (zoomTween && zoomTween.isRunning) {
      return;
    }

    zoomTween = game.add.tween(this.image.scale).to( { x: this.image.scale.x + 1, y: this.image.scale.y + 1 }, 250, Phaser.Easing.Linear.None, true);
  },
  zoomOut: function() {
    if (zoomTween && zoomTween.isRunning) {
      return;
    }

    if (this.image.scale.x > 1) {
      zoomTween = game.add.tween(this.image.scale).to( { x: this.image.scale.x - 1, y: this.image.scale.y - 1 }, 250, Phaser.Easing.Linear.None, true);
    }
  },
  loadFont: function(f) {
    game.load.image(this.id, 'assets/fonts/8x8/' + f + '.png', true);
    game.load.start();
  },
  setText: function(text) {
    this.text = this.font.text = text;
  },
  setupFont: function(fontName) {
    this.fontName = fontName;
    if (game.cache.getImage(fontName).width === 1520)
    {
        size = 16;
    }
    else
    {
        size = 8;
    }
    
    styles = game.cache.getImage(fontName).height / size;

    this.currentStyle = 0;

    if (this.image)
    {
        this.image.destroy();
        this.font.destroy();
    }

    this.font = game.add.retroFont(fontName, size, size, Phaser.RetroFont.TEXT_SET1);
    this.font.align = Phaser.RetroFont.ALIGN_CENTER;
    this.font.multiLine = true;
    this.font.autoUpperCase = false;
    this.font.customSpacingX = currentSpacingX;
    this.font.customSpacingY = currentSpacingY;
    this.font.buildRetroFontText();

    this.image = game.add.image(this.position.x, this.position.y, this.font);
    this.image.scale.set(4);
    this.image.anchor.set(0.5);
    this.image.smoothed = false;
  }
}

function preload() {

  Phaser.Canvas.setSmoothingEnabled(game.context, false);
  Phaser.Canvas.setImageRenderingCrisp(game.canvas);

  game.load.image('defaultFont', 'assets/fonts/8x8/Street Fighter II (Capcom).png');
  Object.keys(app.characters).forEach(name => {
    app.colors.forEach(color => {
      var imageName = name + '-' + color;
      game.load.image(imageName, `assets/characters/${imageName}.gif`);
    });
  });
  
  for (let bgname in app.backgrounds) {
    let path = app.backgrounds[bgname];
    game.load.image('background-' + bgname, `assets/backgrounds/${path}`);
  }

  app.flags.forEach(name => {
    game.load.image(name, `assets/flags/${name}.png`);
  });
}

var font = null;
var image = null;
var size = 8;
var styles = 1;
var currentStyle = 0;
var currentSpacingX = 0;
var currentSpacingY = 0;
var zoomTween = null;
var lastTint = 0;

function fileComplete(progress, cacheKey) {
  if (cacheKey === 'name') {
    nameText.setupFont(cacheKey);
  } else if (cacheKey === 'description') {
    descriptionText.setupFont(cacheKey);
  }
}

var nameText, descriptionText;
var flagSprite;
var background;
function create() {

    game.load.onFileComplete.add(fileComplete, this);

    background = game.add.sprite(0,-80, 'background-Blanka');
    background.scale.setTo(2.33, 3);
    background.smoothed = false;

    var c = Phaser.Color.getColor(1,1,0);
    background.tint = c;

    characterSprite = game.add.sprite(0,0, 'Vega-lp');
    characterSprite.scale.setTo(2.33, 3);
    characterSprite.smoothed = false;

    flagSprite = game.add.sprite(game.world.centerX, 80, 'spain');
    flagSprite.scale.setTo(0.5, 0.5);
    flagSprite.anchor.set(0.5);
    flagSprite.smoothed = false;

    nameText = new Text('name', {x: game.world.centerX, y: game.world.centerY - nameOffsetTop}, 4, 'defaultFont');
    descriptionText = new Text('description', {x: game.world.centerX, y: game.world.centerY - titleOffsetTop}, 2, 'defaultFont');

    game.stage.backgroundColor = '#272323';

    app.changeCharacter();


    /*
    var graphics = game.add.graphics(game.canvas.width, game.canvas.height);
    graphics.beginFill(0xFF3300);
    graphics.lineStyle(1, 0xffd900);
    graphics.moveTo(50, 390);
    graphics.lineTo(300, 390);
    graphics.endStroke();
    */

/*
    var backspace = game.input.keyboard.addKey(Phaser.Keyboard.BACKSPACE);
    backspace.onDown.add(deleteChar, this);

    var space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    space.onDown.add(addSpace, this);

    var newline = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    newline.onDown.add(addNewLine, this);

    var upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    upKey.onDown.add(nextStyle, this);

    var downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    downKey.onDown.add(prevStyle, this);

    var leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    leftKey.onDown.add(prevFont, this);

    var rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    rightKey.onDown.add(nextFont, this);

    game.input.keyboard.addCallbacks(this, null, null, keyPress);
*/
}

function removeTint() {

    image.tint = 16777215;

}

function updateTint(color) {

    var rgb = color.toRgb();
    var c = Phaser.Color.getColor(rgb.r, rgb.g, rgb.b);

    if (lastTint !== c)
    {
        image.tint = c;
        lastTint = c;
    }

}

function addSpacing() {

    font.customSpacingX++;
    font.buildRetroFontText();
    currentSpacingX = font.customSpacingX;

}

function removeSpacing() {

    if (font.customSpacingX > 0)
    {
        font.customSpacingX--;
        font.buildRetroFontText();
        currentSpacingX = font.customSpacingX;
    }

}

function addLineHeight() {

    font.customSpacingY++;
    font.buildRetroFontText();
    currentSpacingY = font.customSpacingY;

}

function removeLineHeight() {

    if (font.customSpacingY > 0)
    {
        font.customSpacingY--;
        font.buildRetroFontText();
        currentSpacingY = font.customSpacingY;
    }

}

function nextStyle() {

    if (currentStyle < (styles - 1))
    {
        currentStyle++;
        font.updateOffset(0, size);
        //$('#currentStyle').text('< ' + (currentStyle + 1));
    }

}

function prevStyle() {

    if (currentStyle > 0)
    {
        currentStyle--;
        font.updateOffset(0, -size);
        //$('#currentStyle').text('< ' + (currentStyle + 1));
    }

}

function update() {
  nameText.font.text = app.name;
  descriptionText.font.text = app.title;
}

/*
function savePicture() {

    var bmd = game.make.bitmapData(image.width, image.height);

    Phaser.Canvas.setSmoothingEnabled(bmd.context, false);
    Phaser.Canvas.setImageRenderingCrisp(bmd.canvas);

    bmd.draw(image, 0, 0, image.width, image.height);

    bmd.canvas.toBlob(function(blob) {
        saveAs(blob, "arcade-font-writer.png");
    });

    ga('send', 'event', 'font', 'save', 'text', font.text);

}

/*
$(function() {
    //$('#font').change(
        function() {
            loadFont($("#font option:selected").text());
            //$('#fontTitle').text($("#font option:selected").text());
        }
    );

    nextFont = function () {

        if (!game.load.isLoading)
        {
            //$('option:selected', 'select').removeAttr('selected').next('option').attr('selected', 'selected');
            loadFont($("#font option:selected").text());
            //$('#fontTitle').text($("#font option:selected").text());
        }

    }

    prevFont = function () {

        if (!game.load.isLoading)
        {
            //$('option:selected', 'select').removeAttr('selected').prev('option').attr('selected', 'selected');
            loadFont($("#font option:selected").text());
            //$('#fontTitle').text($("#font option:selected").text());
        }

    }

    //$('#zoomIn').click(zoomIn);
    //$('#zoomOut').click(zoomOut);

    //$('#addSpacing').click(addSpacing);
    //$('#removeSpacing').click(removeSpacing);

    //$('#addLineHeight').click(addLineHeight);
    //$('#removeLineHeight').click(removeLineHeight);

    $("#currentStyle").click(function(event) {
        prevStyle();
        event.preventDefault();
        document.onselectstart = function() { return false; };
        event.target.ondragstart = function() { return false; };
        return false;
    });

    $("#totalStyles").click(function(event) {
        nextStyle();
        event.preventDefault();
        document.onselectstart = function() { return false; };
        event.target.ondragstart = function() { return false; };
        return false;
    });

    //$('#savePNG').click(savePicture);


    $("#picker").spectrum({
        color: "#272323",
        showAlpha: false,
        localStorageKey: "afm.background",
        showPalette: true,
        showSelectionPalette: true,
        clickoutFiresChange: true,
        showButtons: true,
        preferredFormat: "hex",
        palette: [
            ["rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(102, 102, 102)",
            "rgb(204, 204, 204)", "rgb(217, 217, 217)","rgb(255, 255, 255)"],
            ["rgb(152, 0, 0)", "rgb(255, 0, 0)", "rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)",
            "rgb(0, 255, 255)", "rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", "rgb(255, 0, 255)"], 
            ["rgb(230, 184, 175)", "rgb(244, 204, 204)", "rgb(252, 229, 205)", "rgb(255, 242, 204)", "rgb(217, 234, 211)", 
            "rgb(208, 224, 227)", "rgb(201, 218, 248)", "rgb(207, 226, 243)", "rgb(217, 210, 233)", "rgb(234, 209, 220)", 
            "rgb(221, 126, 107)", "rgb(234, 153, 153)", "rgb(249, 203, 156)", "rgb(255, 229, 153)", "rgb(182, 215, 168)", 
            "rgb(162, 196, 201)", "rgb(164, 194, 244)", "rgb(159, 197, 232)", "rgb(180, 167, 214)", "rgb(213, 166, 189)", 
            "rgb(204, 65, 37)", "rgb(224, 102, 102)", "rgb(246, 178, 107)", "rgb(255, 217, 102)", "rgb(147, 196, 125)", 
            "rgb(118, 165, 175)", "rgb(109, 158, 235)", "rgb(111, 168, 220)", "rgb(142, 124, 195)", "rgb(194, 123, 160)",
            "rgb(166, 28, 0)", "rgb(204, 0, 0)", "rgb(230, 145, 56)", "rgb(241, 194, 50)", "rgb(106, 168, 79)",
            "rgb(69, 129, 142)", "rgb(60, 120, 216)", "rgb(61, 133, 198)", "rgb(103, 78, 167)", "rgb(166, 77, 121)",
            "rgb(91, 15, 0)", "rgb(102, 0, 0)", "rgb(120, 63, 4)", "rgb(127, 96, 0)", "rgb(39, 78, 19)", 
            "rgb(12, 52, 61)", "rgb(28, 69, 135)", "rgb(7, 55, 99)", "rgb(32, 18, 77)", "rgb(76, 17, 48)"]
        ],
        move: function(color) {
            game.stage.backgroundColor = color.toHexString();
        },
        change: function(color) {
            game.stage.backgroundColor = color.toHexString();
        }
    });

});
*/


var characterSprite;

var app = new Vue({
  el: '#app',
  data: {
    title: 'I\'m a real street fighter',
    color: 'lp',
    character: 'Vega',
    characters: {
      //'Akuma': 'Akuma',
      'Blanka': 'Blanka',
      'Balrog': 'Boxer',
      'Cammy': 'Cammy',
      'Chunli': 'Chunli',
      'Vega': 'Claws',
      'Mbison': 'Dictator',
      'Deejay': 'Deejay',      
      'Dhalsim': 'Dhalsim',
      'Feilong': 'Feilong',
      'Guile': 'Guile',
      'Ehonda': 'Honda',
      'Ken': 'Ken',
      'Ryu': 'Ryu',
      'Sagat': 'Sagat',
      'Thawk': 'T.Hawk',
      'Zangief': 'Zangief'
    },
    colors: [
      'lp', 'mp', 'hp',
      'lk', 'mk', 'hk',
      'start', 'hold',
      'old1', 'old2'
    ],
    flags: [
      'france',
      'italy',
      'spain'
    ],
    fontName: 'Soldam (Data East)',
    flag: 'spain',
    fontNames: [
      '1943 (Capcom)',
      'ATASCII',
      'Aero Fighters (Kaneko)',
      'Afterburner (Sega)',
      'Arabian Magic (Capcom)',
      'ArkArea (UPL)',
      'ArmoredWarriors (Capcom)',
      'Art of Fighting 2 (SNK)',
      'Assault (Namco)',
      'Asterix (Konami)',
      'Aurail (Sega)',
      'Avengers (Capcom)',
      'Batsugun (Toaplan)',
      'Battle Bakraid (Eighting)',
      'BattleCircuit (Capcom)',
      'BioShipPaladin (UPL)',
      'Black Tiger (Capcom)',
      'Blazing Star (Yumekobo)',
      'Blood Warrior (Kaneko)',
      'Bonanza Bros (Sega)',
      'Boogie Wings (Data East)',
      'Boulder Dash (Data East)',
      'Bubble Memories Alien (Taito)',
      'Bubble Symphony (Taito)',
      'Cameltry (Taito)',
      'Captain Sky Hawk (RARE)',
      'Chiki Chiki Boys (Capcom)',
      'Cotton (Sega + Success)',
      'Cybattler (Jaleco)',
      'Dance Dance Revolution (Konami)',
      'Dangerous Seed (Namco)',
      'Dimahoo (Raizing)',
      'DoDonPachi (Cave)',
      'Don Doko Don (Taito)',
      'Dragon Breed (Irem)',
      'Dragon Saber (Namco)',
      'Dragon Spirit (Namco)',
      'Dynamite Dux (Sega)',
      'Edward Randy (DataEast)',
      'Fantasy Zone (Sega)',
      'Final Star Force (Tecmo)',
      'Flak Attack (Konami)',
      'Flying Shark (Taito)',
      'Gaiapolis (Konami)',
      'Gain Ground (Sega)',
      'Garou Densetsu (SNK)',
      'Ghosts n Goblins (Capcom)',
      'Ghouls n Ghosts (Capcom)',
      'Gondomania (Data East)',
      'Gradius 2 (Konami)',
      'Gradius 3 (Konami)',
      'Gradius 4 (Konami)',
      'Gradius',
      'Guardians (Banpresto)',
      'Gun.Smoke (Capcom)',
      'GunBuster (Taito)',
      'GunNail (NMK)',
      'Gyruss (Konami)',
      'Hacha Mecha Fighter (NMK)',
      'Hat Trick Hero 95 (Taito)',
      'Image Fight (IREM)',
      'Kaiser Knuckle (Taito)',
      'Ketsui (Cave)',
      'Kiki Kaikai (Taito)',
      'King of Fighters 2000 (SNK)',
      'King of Fighters 2001 (SNK)',
      'King of Fighters 2002 (SNK)',
      'King of Fighters 2003 (SNK)',
      'King of Fighters 97 (SNK)',
      'King of Fighters 97 Italic (SNK)',
      'Kirameki Star Road (Taito)',
      'Klax (Atari)',
      'Klax Alternate (Atari)',
      'Last Blade 2 (SNK)',
      'Last Duel (Capcom)',
      'Last Resort (SNK)',
      'Legendary Wings (Capcom)',
      'Light Bringer (Capcom)',
      'Major Title (IREM)',
      'Mars Matrix (Capcom)',
      'Metal Warriors (Konami)',
      'Monster Mauler (Konami)',
      'Mutant Night (UPL)',
      'Namco Classic Gradient',
      'Namco Classic',
      'Nebulas Ray (Namco)',
      'Ninja Gaiden (Tecmo)',
      'Ninja Masters (ADK)',
      'Ninja Spirit (IREM)',
      'Outfoxies (Namco)',
      'Pachinko Sexy Reaction 2 (Sammy)',
      'Panic Bomber (Hudson)',
      'Parodius (Konami)',
      'Pickford Brothers',
      'Pulstar (Aicom)',
      'Puzzle Bobble (Taito)',
      'Quake (id)',
      'R Type (Irem)',
      'R Type LEO (Irem)',
      'Raiden Fighters (Seibu)',
      'Rapid Hero (MTC)',
      'RayForce (Taito)',
      'Robotron (Williams)',
      'Rumba Lumber (Taito)',
      'SDI (Sega)',
      'Salamander 2 (Konami)',
      'Samurai Shodown 2 (SNK)',
      'Samurai Shodown 3 (SNK)',
      'ShadowDancer (Sega)',
      'Shinobi (Sega)',
      'Sky Fox (Nichibutsu)',
      'Sky Soldier (SNK)',
      'Snow Bros (Toaplan)',
      'Soldam (Data East)',
      'Solomons Key (Tecmo)',
      'Special (Capcom)',
      'Speed Rumbler (Capcom)',
      'Street Fighter II (Capcom)',
      'Street Fighter Zero 3 (Capcom)',
      'Super Mario Bros 3 (Nintendo)',
      'Super Street Fighter 2 (Capcom)',
      'Tatakae Big Fighter (Nichibutsu)',
      'Terra Force (Nichibutsu)',
      'Tetris (Sega)',
      'The Simpsons (Konami)',
      'Thunder Dragon (NMK)',
      'Time Pilot 84 (Konami)',
      'Time Soldiers (ADK)',
      'Top Ranking Stars (Taito)',
      'Truxton (Toaplan)',
      'Twin Cobra (Toaplan)',
      'Twin Cobra II (Taito)',
      'Twin Qix (Taito)',
      'Typhoon (Konami)',
      'UN Squadron (Capcom)',
      'Victory Road (SNK)',
      'Waku Waku 7 (Sunsoft)',
      'Willow (Capcom)',
      'Wonder Boy (Sega)',
      'Xexex (Konami)'
    ],
    name: 'name',
    backgrounds: {
      'Blanka': 'sf2st-blanka.gif',
      'Dictator': 'ssf2x-dictator.gif',
      'Sagat': 'ssf2x-sagat.gif'
    },
    background: 'Sagat'
  },
  methods: {
    changeCharacter: function () {
      characterSprite.loadTexture(this.character + '-' + this.color);
      characterSprite.anchor.set(0.5);
      characterSprite.position.x = game.world.centerX;
      let offset = this.character === 'Thawk' ? 30 : 50;
      characterSprite.position.y = game.world.height - characterSprite.height / 2 - offset;
      
      characterSprite.smoothed = false;  
    },
    changeFlag: function () {
      if (this.flag === 'none') {
        flagSprite.visible = false;
      } else {
        flagSprite.loadTexture(this.flag);
        flagSprite.smoothed = false;
        flagSprite.visible = true;  
      }
    },
    updateName: function () {
      nameText.font.text = this.name;
      //image.position.y = game.world.centerY - 200;
    },
    updateTitle: function () {
      descriptionText.font.text = this.title;
      //image.position.y = game.world.centerY - 200;
    },
    zoomIn: function () {
      nameText.zoomIn();
    },
    zoomOut: function () {
      nameText.zoomOut();
    },
    changeFont: function() {
      nameText.loadFont(this.fontName);
    },
    changeBackground: function () {
      background.loadTexture('background-' + this.background);
      background.smoothed = false;
    },
    flipHCharacter: function () {
      characterSprite.scale.x *= -1;
    }
  }
});