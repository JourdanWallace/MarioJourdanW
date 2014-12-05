//TODO
game.PlayerEntity = me.Entity.extend({
   init: function(x, y, settings){
       this._super(me.Entity, "init", [x, y, {
          image: "FR",
          spritewidth: "64",
          spriteheight: "64",
          width: 64,
          height: 64,
          getShape: function (){
              return (new me.Rect(0, 0, 64, 64)).toPolygon();
           }
       }]);
      // This code allows the character to walk, and when the button is not pressed, the player is not walking    
       this.renderable.addAnimation("idle", [39]);
       this.renderable.addAnimation("smallWalk", [143, 144, 145, 146, 147, 148, 149, 150, 151], 80);
      // This tells the player to stand still if it is not walking
       this.renderable.setCurrentAnimation("idle");
       // Allows the character to move and how fast
       this.body.setVelocity(5, 20);
       // Tells the screen to follow the player as it moves
       me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
   },
   
   update: function(delta) {
       // Checks if the left key is pressed
       if(me.input.isKeyPressed("left")) {
           this.flipX(true);
           this.body.vel.x -= this.body.accel.x * me.timer.tick;
       }
       
       // Tells the code if the left key is  pressed, do not go right
       else if(me.input.isKeyPressed("right")){
           this.flipX(false);
           this.body.vel.x += this.body.accel.x * me.timer.tick;
           
        } else {
            this.body.vel.x = 0;
        }

            this.body.update(delta);
            me.collision.check(this, true, this.collideHandler.bind(this), true);

        if (this.body.vel.x !== 0) {
            if (!this.renderable.isCurrentAnimation("smallWalk")) {
                this.renderable.setCurrentAnimation("smallWalk");
                this.renderable.setAnimationFrame();
            }
        } else {
            this.renderable.setCurrentAnimation("idle");
        }

        
        
        this._super(me.Entity, "update", [delta]);
        return true;
    },
    
    collideHandler: function(response) {
        
    }


});

/*
 * ---------------------------------------------------------------------------
 * ------Tells the character what to do when it collides with something------- 
 * ---------------------------------------------------------------------------
 */


game.LevelTrigger = me.Entity.extend({
   init: function(x, y, settings){
       this._super(me.Entity, 'init', [x, y, settings]);
       this.body.onCollision = this.onCollision.bind(this);
       this.level = settings.level;
   },
   
   onCollision: function(){
       this.body.setCollisionMask(me.collision.types.NO_OBJECT);
       me.levelDirector.loadLevel(this.level);
       me.state.current().resetPlayer();
   } 
    
});

/*
 * ###########################################################################
 * Developing the bad guys height and width and telling thhe code that it's alive
 * ###########################################################################
 */

game.BadGuy = me.Entity.extend ({
    init: function(x, y, settings){
        this._super(me.Entity, "init", [x, y, {
          image: "slime",
          spritewidth: "60",
          spriteheight: "28",
          width: 60,
          height: 28,
          getShape: function (){
              return (new me.Rect(0, 0, 60, 28)).toPolygon();
           }
       }]);
   
       this.spritewidth = 60;
       var width = settings.width;
       x = this.pos.x;
       this.startX = x;
       this.endX = x + width - this.spritewidth;
       this.pos.x = x + width - this.spritewidth;
       this.updateBounds();
       
       this.alwaysUpdate = true;
       
       this.walkLeft = false;
       this.alive = true;
       this.type = "badguy";
       
       // this.renderable.addAnimation("run", [0, 1, 2], 80);
       // this.renderable.setCurrentAnimation("run");
       // makes the bad guy able to move
       this.body.setVelocity(4, 6);
   
   
    },
    
    update: function(delta){
        this.body.update(delta);
        me.collision.check(this, true, this.collideHandler.bind(this), true);  
        
        if(this.alive){
            if(this.walkLeft && this.pos.x <= this.startX){
                this.walkLeft = false;
            }else if(!this.walkLeft && this.pos.x >= this.endX) {
                this.walkLeft = true;
            }
            this.flipX(!this.walkLeft);
            this.body.vel.x += (this.walkLeft) ? -this.body.accel.x * me.timer.tick : this.body.accel.x * me.timer.tick;
            
        }else{
            me.game.world.removeChild(this);
        }
        
        this._super(me.Entity, "update", [delta]);
        return true;
    },
    
    collideHandler: function(){
        
    }
    
});
