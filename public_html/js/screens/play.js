game.PlayScreen = me.ScreenObject.extend({
    /**
     *  action to perform on state change
     */
    onResetEvent: function() {
        // reset the score
        game.data.score = 0;
//The level where the player starts 
        me.levelDirector.loadLevel("level04_1");

        this.resetPlayer(0, 400);

        me.input.bindKey(me.input.KEY.RIGHT, "right");
        me.input.bindKey(me.input.KEY.LEFT, "left");
        me.input.bindKey(me.input.KEY.UP, "up");

        // add our HUD to the game world
        this.HUD = new game.HUD.Container();
        me.game.world.addChild(this.HUD);
    },
    /**
     *  action to perform when leaving this screen (state change)
     */
    onDestroyEvent: function() {
        // remove the HUD from the game world
        me.game.world.removeChild(this.HUD);
    },
    //The game restarts once the ENTER key is pressed
    resetPlayer: function() {
        var player = me.pool.pull("mario", 0, 200, {});
        me.game.world.addChild(player, 5);
    }
});
