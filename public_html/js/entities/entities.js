//Creation of the player
game.PlayerEntity = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, "init", [x, y, {
                image: "FR",
                spritewidth: "64",
                spriteheight: "64",
                width: 64,
                height: 64,
                getShape: function() {
                    return (new me.Rect(0, 0, 64, 64)).toPolygon();
                }
            }]);
        // This code allows the character to walk, and when the button is not pressed, the player is not walking    
        this.renderable.addAnimation("idle", [39]);
        this.renderable.addAnimation("bigIdle", [0]);
        this.renderable.addAnimation("smallWalk", [143, 144, 145, 146, 147, 148, 149, 150, 151], 80);
        this.renderable.addAnimation("bigWalk", [0], 80);
        this.renderable.addAnimation("shrink", [158, 159, 160, 161, 162, 163, 164, 165], 80);
        this.renderable.addAnimation("grow", [166, 167, 168, 169, 170, 171, 172, 173], 80);


        // This tells the player to stand still if it is not walking
        this.renderable.setCurrentAnimation("idle");

        this.big = false;
        // Allows the character to move and how fast
        this.body.setVelocity(5, 20);
        // Tells the screen to follow the player as it moves
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
    },
    update: function(delta) {
        // Checks if the left key is pressed
        if (me.input.isKeyPressed("left")) {
            this.flipX(true);
            this.body.vel.x -= this.body.accel.x * me.timer.tick;
        }

        // Tells the code if the left key is  pressed, do not go right
        else if (me.input.isKeyPressed("right")) {
            this.flipX(false);
            this.body.vel.x += this.body.accel.x * me.timer.tick;

        } else {
            this.body.vel.x = 0;
        }
//If the up key is pressed, the player jumps 
        if (me.input.isKeyPressed("up")) {
            if (!this.body.jumping && !this.body.falling) {
                this.body.jumping = true;
                this.body.vel.y -= this.body.accel.y * me.timer.tick;

            }
        }

        this.body.update(delta);
        me.collision.check(this, true, this.collideHandler.bind(this), true);

        if (!this.big) {
            if (this.body.vel.x !== 0) {
                //Tje player is small so he must stay small until he consumes a mushroom
                if (!this.renderable.isCurrentAnimation("smallWalk") && !this.renderable.isCurrentAnimation("grow") && !this.renderable.isCurrentAnimation("shrink")) {
                    this.renderable.setCurrentAnimation("smallWalk");
                    this.renderable.setAnimationFrame();
                }
            } else {
                this.renderable.setCurrentAnimation("idle");
            }
        } else {
            //the player is now big, so until he collides with an enemy, he will stay big
            if (this.body.vel.x !== 0) {
                if (!this.renderable.isCurrentAnimation("bigWalk") && !this.renderable.isCurrentAnimation("grow") && !this.renderable.isCurrentAnimation("shrink")) {
                    this.renderable.setCurrentAnimation("bigWalk");
                    this.renderable.setAnimationFrame();
                }
            } else {
                this.renderable.setCurrentAnimation("bigIdle");
            }
        }

        this._super(me.Entity, "update", [delta]);
        return true;
    },
    //Telling the player to either live or die based on where the player hits the bad guy
    collideHandler: function(response) {
        var ydif = this.pos.y - response.b.pos.y;
        console.log(ydif);
        if (response.b.type === 'badguy') {
            if (ydif <= -55) {
                response.b.alive = false;
            } else {
                //If the player jumps onto the bad guy, the bad guy dies
                if (this.big) {
                    this.big = false;
                    this.body.vel.y -= this.body.accel.y * me.timer.tick;
                    this.jumping = true;
                } else {
                    me.state.change(me.state.MENU);
                }
            }
            //Telling the player to grow once the player collides with the mushroom
        } else if (response.b.type === "mushroom") {
            this.renderable.setCurrentAnimation("grow", "bigIdle");
            this.big = true;
            me.game.world.removeChild(response.b);
        }

    }


});

/*
 * ---------------------------------------------------------------------------
 * ------Tells the character what to do when it collides with something------- 
 * ---------------------------------------------------------------------------
 */

//The entrance to the next level
game.LevelTrigger = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, settings]);
        this.body.onCollision = this.onCollision.bind(this);
        this.level = settings.level;
    },
    onCollision: function() {
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
//Creation of the bad guy
game.BadGuy = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, "init", [x, y, {
                image: "slime",
                spritewidth: "60",
                spriteheight: "28",
                width: 60,
                height: 28,
                getShape: function() {
                    return (new me.Rect(0, 0, 60, 28)).toPolygon();
                    this.body.setVelocity(4, 6);

                }
            }]);
//Gives the position of the enemy
        this.spritewidth = 60;
        var width = settings.width;
        x = this.pos.x;
        this.startX = x;
        this.endX = x + width - this.spritewidth;
        this.pos.x = x + width - this.spritewidth;
        this.updateBounds();
//This code tells the background which ways to walk
        this.alwaysUpdate = true;

        this.walkLeft = true;
        this.alive = true;
        this.type = "badguy";

        // this.renderable.addAnimation("run", [0, 1, 2], 80);
        // this.renderable.setCurrentAnimation("run");
        // makes the bad guy able to move


    },
    update: function(delta) {
        this.body.update(delta);
        //checking to see if the bad guy is colliding with something
        me.collision.check(this, true, this.collideHandler.bind(this), true);
//Telling what the bad guy is doing if it is still alive
        if (this.alive) {
            if (this.walkLeft && this.pos.x <= this.startX) {
                this.walkLeft = true;
            } else if (!this.walkLeft && this.pos.x >= this.endX) {
                this.walkLeft = true;
            }
            this.flipX(!this.walkLeft);
            this.body.vel.x += (this.walkLeft) ? -this.body.accel.x * me.timer.tick : this.body.accel.x * me.timer.tick;


        } else {
            me.game.world.removeChild(this);
        }

        //see if anything has collided with anything else
        this._super(me.Entity, "update", [delta]);
        return true;
    },
    collideHandler: function() {

    }

});
//The creation of the mushroom
game.Mushroom = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, "init", [x, y, {
                image: "mushroom",
                spritewidth: "64",
                spriteheight: "64",
                //How long the mushroom is
                width: 64,
                //how tall the mushroom is
                height: 64,
                getShape: function() {
                    return (new me.Rect(0, 0, 64, 64)).toPolygon();
                    this.body.setVelocity(1, 6);
                }
                //Checking to see if the mushroom has collided with anything
            }]);
        me.collision.check(this);
        this.type = "mushroom";
    }

});
