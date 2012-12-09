/**
 * Tapper.js
 */
require(["dojo/ready", "dojo/dom", "dojo/on", "dojo/topic",
         "dojo/_base/window", "dojo/_base/event" ],
        function(ready, dom, on, topic, win, events){

    // How large a number of taps are we averaging?
    var COUNTS = 10;

    function cleanState(){
        return {
            count: 0,
            bpm: 0,
            lastTap: 0
        };
    }

    var state = cleanState(); 

    function tap(evt){
        if(state.lastTap == 0){
            state.lastTap = new Date().getTime();
            return;
        }

        var now = new Date().getTime();
        var rate = 60/((now-state.lastTap)/1000);
        state.lastTap = now;

        if(state.count < COUNTS)
            state.count++;

        state.bpm = Math.round(((state.bpm*(state.count-1))+rate)/state.count);

        topic.publish("tap");

        clearTimeout(state.reset);
        state.reset = setTimeout(function(){
            topic.publish("reset");
        }, 5000);

        events.stop(evt);
    }

    function countTap(){
        var bpm = dom.byId("bpm");

        if(bpm)
            bpm.innerHTML = state.bpm; 
    }

    function reset(){
        state = cleanState();

        var bpm = dom.byId("bpm");
        if(bpm)
            bpm.innerHTML = "###";
    }

    ready(function(){
        var tapButton = dom.byId("tapper");

        on(win.body(), "touchrelease", tap);
        on(win.body(), "mouseup", tap);
        on(win.body(), "keypress", tap);

        topic.subscribe("tap", countTap);
        topic.subscribe("reset", reset);
    });
});
