var methods = {
    freeze: function(term){
        FREEZE = true;
        term.echo('scene is now frozen');
    },
    unfreeze: function(term){
        FREEZE = false;
        term.echo('scene is no longer frozen');
    },
    help: function(term){
        for(var method in methods){
            if(method !== 'help' && methods.hasOwnProperty(method)){
                term.echo(' - ' + method);
            }
        }
    },
    pick: function(term, args){
        console.log(args);
        if(args.length === 0 || isNaN(args[0]) || Number(args[0]) < 1 || Number(args[0]) > 200){
            term.echo('pick command requires a number between 1 and 200');
        } else {
            var num = Number(args[0]) - 1;
            birds[num].chosen = true;
            term.echo('you have picked bird number ' + num);
        }
           
    }

};

function init(){
    $(function($, undefined) {
        $('#terminal').terminal(function(command, term) {
            var commandArr = command.split(' ');
            command = commandArr.shift();
            if(methods[command]){
                methods[command](term, commandArr);
            } else if (command !== '') {
                try {
                    var result = window.eval(command);
                    if (result !== undefined) {
                        term.echo(new String(result));
                    }
                } catch(e) {
                    term.error(new String(e));
                    term.echo('type help for a list of available functions');
                }
            } else {
                term.echo('');
            }
        }, {
            greetings: 'xmOs v0.1',
            name: 'js_demo',
            height: 200,
            prompt: 'xmOs_user> '
        });
    });
}

$(document).ready(function(){
    init();
});
