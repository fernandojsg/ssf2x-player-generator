var game = new Phaser.Game(550, 550, Phaser.CANVAS, 'container', { preload: preload, create: create, update: update });
game.preserveDrawingBuffer = true;

nameOffsetTop = 230;
titleOffsetTop = -240;

function Text(id, position, scale, fontName) {
  this.id = id;
  this.font = null;
  this.position = position;
  this.fontName = fontName;
  this.setupFont(fontName);
  this.setScale(scale);
  this.currentStyle = 0;
}

Text.prototype = {
  nextStyle: function(){
    if (this.currentStyle < this.numStyles - 1) {
      this.currentStyle++;
      this.font.updateOffset(0, this.size);
    }
  }, 
  prevStyle: function(){
    if (this.currentStyle > 0) {
      this.currentStyle--;
      this.font.updateOffset(0, -this.size);
    }
  }, 
  setScale: function(scale) {
    this.image.scale.x = scale;
    this.image.scale.y = scale;
  },
  loadFont: function(f) {
    this.fontName = f;
    game.load.image(this.id, 'assets/fonts/8x8/' + f + '.png', true);
    game.load.start();
  },
  setText: function(text) {
    this.text = this.font.text = text;
  },
  setupFont: function(fontImageId) {
    if (game.cache.getImage(fontImageId).width === 1520)
    {
        this.size = 16;
    }
    else
    {
        this.size = 8;
    }
    
    this.numStyles = game.cache.getImage(fontImageId).height / this.size;

    this.currentStyle = 0;

    if (this.image)
    {
        this.image.destroy();
        this.font.destroy();
    }

    this.font = game.add.retroFont(fontImageId, this.size, this.size, Phaser.RetroFont.TEXT_SET1);
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

  // Phaser.Canvas.setSmoothingEnabled(game.context, false);
  Phaser.Canvas.setImageRenderingCrisp(game.canvas);

  game.load.image('Street Fighter II (Capcom)', 'assets/fonts/8x8/Street Fighter II (Capcom).png');
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

  game.load.shader('scanlines', 'assets/shaders/scanlines.frag');
  game.load.shader('scanlines-simple', 'assets/shaders/scanlines-simple.frag');
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
  app.texts[cacheKey].setupFont(cacheKey);
}

var flagSprite;
var background;
function create() {
    game.load.onFileComplete.add(fileComplete, this);

    background = game.add.sprite(0,0, 'background-Blanka');
    background.anchor.set(0.5);
    background.position.set(100, 220);
    background.smoothed = false;
    background.tint = Phaser.Color.hexToRGB('#27339f');

    characterSprite = game.add.sprite(0,0, 'Vega-lp');
    characterSprite.scale.setTo(2.33, 3);
    characterSprite.smoothed = false;

    flagSprite = game.add.sprite(game.world.centerX, 80, 'spain');
    flagSprite.scale.setTo(0.5, 0.5);
    flagSprite.anchor.set(0.5);
    flagSprite.smoothed = false;

    app.texts.name = new Text('name', {x: game.world.centerX, y: game.world.centerY - nameOffsetTop}, 4, 'Street Fighter II (Capcom)');
    app.texts.description = new Text('description', {x: game.world.centerX, y: game.world.centerY - titleOffsetTop}, 2, 'Street Fighter II (Capcom)');

    game.stage.backgroundColor = '#272323';

    app.changeCharacter();

    scanlineFilter = new Phaser.Filter(game, null, game.cache.getShader('scanlines'));
    //scanlineFilter = new Phaser.Filter(game, null, game.cache.getShader('scanlines-simple'));
    game.world.filters = [scanlineFilter];

    scanlineFilter.uniforms.resolution.value.x = game.canvas.width;
    scanlineFilter.uniforms.resolution.value.y = game.canvas.height;
  
    scanlineFilter.uniforms.enabled = { type: '1i', value: app.scanlines ? 1 : 0 };



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

var scanlineFilter;
function update() {
  
  characterSprite.position.x = app.transforms.character.position.x;
  let offset = this.character === 'Thawk' ? 30 : 50;
  characterSprite.position.y = game.world.height - characterSprite.height / 2 - offset;

  characterSprite.position.y = app.transforms.character.position.y;

  characterSprite.scale.setTo(app.transforms.character.scale * 2.33, app.transforms.character.scale * 3);
  if (app.flip) {
    characterSprite.scale.x *= -1;
  }



  background.scale.setTo(app.transforms.background.scale * 2.33, app.transforms.background.scale * 3);

  background.position.set(app.transforms.background.position.x, app.transforms.background.position.y);

  app.texts.name.image.scale.set(app.transforms.name.scale, app.transforms.name.scale);
  app.texts.name.image.position.set(app.transforms.name.position.x, app.transforms.name.position.y);
  app.texts.name.font.text = app.name;


  app.texts.description.image.scale.set(app.transforms.description.scale, app.transforms.description.scale);
  app.texts.description.image.position.set(app.transforms.description.position.x, app.transforms.description.position.y);
  //app.texts.name.image.position.set(app.transforms.name.position.x, app.transforms.name.position.y);
  app.texts.description.font.text = app.title; 

  
  /*
  var graphics = game.add.graphics(game.canvas.width, game.canvas.height);
  */
 /*
var graphics = game.add.graphics(game.canvas.width, game.canvas.height);
 
    background.crop(crop);
    graphics.beginFill(0xFF3300);
    graphics.lineStyle(2, 0x0000FF, 1);
    angle = 100;
    graphics.drawRoundedRect(-550, -550, 550, 550, angle);
    graphics.endFill();  
    */
}

var ctx = null;

var characterSprite;

var app = new Vue({
  el: '#app',
  data: {
    title: 'I\'m a real street fighter',
    color: 'old1',
    character: 'Ryu',
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
      'spain',
      'brasil',
      'catalunya',
      'navarra',
      'aragon',
      'andalucia',
      'castillaleon'
    ],
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
      'DJ': 'deejay.jpg',
      'Boxer': 'boxer.gif',
      'Boxer2': 'boxer.jpg',
      'Chunli': 'chunli.png',
      'Ryu': 'ryu.png',
      'Solid color': 'solid',
      'Blanka': 'sf2st-blanka.gif',
      'Dictator': 'ssf2x-dictator.gif',
      'Sagat': 'ssf2x-sagat.gif',
      'World0': 'Ssf2t-world.gif',
      'World': 'Ssf2t-world-final.gif',
      'Zangief': 'zangief.png',
      'Vega': 'vega.png',
      'Honda': 'honda.gif'
    },
    selected: 'name',
    background: 'Blanka',
    backgroundTint: '#27339f',
    scanlines: false,
    transforms: {
      name: {
        //position: {x: game.world.centerX, y: game.world.centerY - nameOffsetTop},
        position: {x: 275, y: 275 - nameOffsetTop},
        scale: 4
      },
      background: {
        position: {x: 100, y: 224},
        scale: 1
      },
      character: {
        position: {x: 275, y: 200},
        scale: 1
      },
      description: {
        //game.world.centerX, y: game.world.centerY - titleOffsetTop
        position: {x: 275, y: 275 - titleOffsetTop},
        scale: 2
      }
    },
    texts: {
      name: {},
      description: {},
    }
  },
  methods: {
    changeCharacter: function () {
      characterSprite.loadTexture(this.character + '-' + this.color);
      characterSprite.anchor.set(0.5);
      
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
      app.texts.name.font.text = this.name;
    },
    updateTitle: function () {
      app.texts.description.font.text = this.title;
    },
    nextFont: function(font) {
      var pos = (this.fontNames.indexOf(font.fontName) + 1) % this.fontNames.length
      font.loadFont(this.fontNames[pos]);
    },
    prevFont: function(font) {
      var pos = (this.fontNames.indexOf(font.fontName) - 1) % this.fontNames.length
      font.loadFont(this.fontNames[pos]);
    },
    nextStyle: function(font) {
      font.nextStyle();
    },
    prevStyle: function(font) {
      font.prevStyle();
    },
    changeFontName: function() {
      app.texts.name.loadFont(app.texts.name.fontName);
    },
    changeFontTitle: function() {
      app.texts.description.loadFont(app.texts.description.fontName);
    },
    changeBackground: function () {
      if (this.background === 'Solid color') {
        background.alpha = 0;
        game.stage.backgroundColor = this.backgroundTint;
      } else {
        background.alpha = 1;
        background.loadTexture('background-' + this.background);
        background.smoothed = false;
        background.anchor.set(0.5);
        let y = 120;
        if (background.height - y < game.canvas.height) {
          y = Math.abs(game.canvas.height - background.height);
        }
        background.position.set(0, -y);  
      }
    },
    changeBackgroundColorTint: function () {
      background.tint = Phaser.Color.hexToRGB(this.backgroundTint);
      game.stage.backgroundColor = this.backgroundTint;
    },
    flipHCharacter: function () {
      this.flip = !this.flip;
    },
    changeScanlines: function () {
      scanlineFilter.uniforms.enabled.value = this.scanlines ? 1 : 0;
    },
    nextColor: function () {
      this.color = (this.colors.indexOf(this.color) + 1) % this.colors.length;
      console.log(this.color);
    },
    savePicture: function () {
      
      let width = game.canvas.width;
      let height = game.canvas.height;
      
      var bmd = game.make.bitmapData(width, height);
      Phaser.Canvas.setSmoothingEnabled(bmd.context, false);
      Phaser.Canvas.setImageRenderingCrisp(bmd.canvas);
  
      bmd.draw(game.canvas, 0, 0, width, height);
  
      var image = game.canvas.toDataURL("image/png");
      bmd.canvas.toBlob(blob => {
        saveAs(blob, `${this.name}-${this.character}_${this.color}.png`);
      });    
    }
  }
});