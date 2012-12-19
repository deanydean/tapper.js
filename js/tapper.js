/**
 * Tapper.js
 */
require(["dojo/ready", "dojo/dom", "dojo/on", "dojo/topic",
         "dojo/_base/window", "dojo/_base/event" ],
        function(ready, dom, on, topic, win, events){

    function cleanState(){
        return {
            count: 0,
            bpm: 0,
            lastTap: 0,
            bpmAcc: 0,
            taps: []
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

        setTimeout(function(){
            bpmCalc(rate);
        }, 20);

        clearTimeout(state.reset);
        state.reset = setTimeout(function(){
            topic.publish("reset");
        }, 5000);

        events.stop(evt);
    }

    function bpmCalc(rate){
        state.bpmAcc+=rate;
        state.taps.push(rate);
        
        state.bpm = Math.round(state.bpmAcc/state.taps.length);

        topic.publish("tap");
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

        on(win.body(), "touchpress", tap);
        on(win.body(), "mouseup", tap);
        on(win.body(), "keydown", tap);

        topic.subscribe("tap", countTap);
        topic.subscribe("reset", reset);
    });
});
