$(function () {

    /**
    * obsługa chinczyka
     */
    gameHandle = new (function gameHandle() {

        var $this = this;

        var allFields = 40,
            homeFields = 4,
            playersOrder = [],
            gameStatus = false,
            msg = {
                el: {
                    container: $('.infoMsg'),
                    content: $('.msg')
                },
                text: {
                    _GAME_STARTED: "Gra rozpoczęta",
                    _NOT_ENOUGHT_PLAYERS: "wybierz przynajmniej 2 graczy",
                    _ALL_PLAYERS_CHOSEN: "Wybrano wszystkich graczy",
                    _JUST_CHOSEN_PLAYER: "Wybrano juz tego gracza",
                    _DICE_MOVE: "Rzuć kością",
                    __NXT_PLAYER: "Następny gracz"
                }
            },
            currentPlayerId = 0,
            currentPlayerColor,
            startFields = {
                red: 1,
                blue: 11,
                green: 21,
                yellow: 31
            },
            dice;



        /******************************************************************************************************
        *******************************************************************************************************
        PODSTAWOWE
        *******************************************************************************************************
        ******************************************************************************************************/

        this.removePlayer = function(player) {
            if (gameStatus == false) {
                var elInArray = playersOrder.indexOf(player);
                playersOrder.splice(elInArray, 1);
                $this.createPlayerFigures(playersOrder);
            }
        };



        this.disableChosePlayers = function() {
            $('.playerFigures .close').hide();
        };



        this.setCurrents = function(arg) {
            if (arg == false) {
                currentPlayerId = 0;
            }else{
                var count = playersOrder.length - 1;
                if (currentPlayerId == count) {
                    currentPlayerId = 0;
                }else{
                    currentPlayerId++;
                }
            }
            currentPlayerColor = playersOrder[currentPlayerId];

        };



        this.pickPlayers = function(obj) {
            if (gameStatus == false) {
                var playerColor = obj.attr('start-color');

                if (playersOrder.length == 4) {
                    $this.msgHandler(true, msg.text._ALL_PLAYERS_CHOSEN);
                }

                if (playersOrder.indexOf(playerColor) === -1) {
                    playersOrder.push(playerColor);
                }else{
                    $this.msgHandler(true, msg.text._JUST_CHOSEN_PLAYER);                    
                }

                $this.createPlayerFigures(playersOrder);
            }
        };



        this.countPlayers = function(){
            var count = playersOrder.length;
            if (count > 1) {
                return true;
            }else{
                return false;
            }
        };



        this.createPlayerFigures = function(colorsArray) {
            var colors = colorsArray;
            $('.figuresContainer').html('');

            $.each(colors, function( index, value ){
                var playerFigures = document.createElement("DIV");
                var att = document.createAttribute("order");
                att.value = index + 1;
                playerFigures.setAttributeNode(att);
                playerFigures.className = "playerFigures " + value;
                var dateString = "<span class='close fa fa-close' close="+ value +"></span><div class='figure' player="+ value +" figure='1'></div><div class='figure' player="+ value +" figure='2'></div><div class='figure' player="+ value +" figure='3'></div><div class='figure' player="+ value +" figure='4'></div>";
                playerFigures.innerHTML = dateString;
                document.querySelector(".figuresContainer").appendChild(playerFigures);
            });
            
        };



        this.startGame = function() {
            gameStatus = true;
            $this.disableChosePlayers();
            $this.msgHandler(true, msg.text._GAME_STARTED);
            $('body').addClass('black');
            $this.runDice(true);
            $this.pickFirstPlayer();
        };




        this.disableMovePlayerFigures = function(){
            $('body .figure[player="'+currentPlayerColor+'"]').removeClass('animation');
        };



        this.actionBtn = function(show, change){
            if (change == true) {
                $('.actionBtn').hide().removeClass('btnStart').addClass('nxtPlayer').text(msg.text.__NXT_PLAYER);
            };
            if (show == true) {
                $('.actionBtn').show();
            }else{
                $('.actionBtn').hide();
            }
        };



        this.msgHandler = function(show, text) {
            if (show == true) {
                if (msg.el.container.hasClass('show')) {

                $( "body" )
                    .queue( "steps", function( next ) {
                        msg.el.container.removeClass('show')
                        setTimeout(function() {
                        next();
                        }, 200);
                    } )
                    .queue( "steps", function( next ) {
                        msg.el.content.text(text);
                        setTimeout(function() {
                        next();
                        }, 200);
                    } )
                    .queue( "steps", function( next ) {
                        msg.el.container.addClass('show');
                        setTimeout(function() {
                        next();
                        }, 200);
                    } )
                    .dequeue( "steps" );

                }else{
                    msg.el.content.text(text);
                    msg.el.container.addClass('show');
                }
            }else{
                    msg.el.container.removeClass('show');
            }
        };






        /******************************************************************************************************
        *******************************************************************************************************
        ROZSZERZONE
        *******************************************************************************************************
        ******************************************************************************************************/






        this.createVirtualMove = function(moveType, fieldNumber, attack) {

            var vs = document.createElement("DIV");
            vs.className = "virtualShadow";
            switch (moveType) {
                case 'field':
                    if (attack == true) {
                        vs.className = "virtualShadow attack";
                    }
                    document.querySelector('.fieldsArea .field[field-number="'+fieldNumber+'"]').appendChild(vs);
                    break;
                case 'home':
                    document.querySelector('.fieldsArea .field[home="'+currentPlayerColor+'"][home-number="'+fieldNumber+'"]').appendChild(vs);
                    break;
                case false:
                    $('.fieldsArea .field .virtualShadow').remove();
                    break;
            }

        };




        this.pickFirstPlayer = function() {
            $this.setCurrents(false);
            $this.actionBtn(false, true);
            $this.msgHandler(true, msg.text._DICE_MOVE);
            $this.markCurrentPlayerFigures();
        };

        this.markCurrentPlayerFigures = function() {
            if (currentPlayerId == -1) {
                return false;
            }
            $('body').find('.playerFigures').removeClass('scale');
            $('body').find('.playerFigures.'+playersOrder[currentPlayerId]).addClass('scale');
        };




        this.runDice = function(onof) {
            $('.dice').removeClass('show').removeClass('animation');
            if (onof == true) {
                $('.dice').addClass('show').addClass('animation');
                $('.dice .result').attr('dice-result', '');
            }else if (onof == false) {
                $('.dice').addClass('show');
            }
        };



        this.checkFieldBusy = function(){
            // sprawdzanie pola startowego
            var figuresOnBoard = $('.field[field-number] .figure[player="'+currentPlayerColor+'"]').length;
            var figuresInHome = $('.field[home-number] .figure[player="'+currentPlayerColor+'"]').length;

            if ( dice == 1 || dice == 6) {
                var field = $('.field[field-number="'+startFields[currentPlayerColor]+'"]').find('.figure');
                if (field.length == 0 ) {
                    $('.playerFigures.'+currentPlayerColor).find('.figure').addClass('animation');
                }
                else if (field.length != 0 && field.attr('player') != currentPlayerColor) 
                {
                    $('.playerFigures.'+currentPlayerColor).find('.figure').addClass('animation');   
                }
            }else{
                if (figuresOnBoard == 0 && figuresInHome == 0) {
                    $this.actionBtn(true);
                    
                };
            }

            // sprawdzanie pozostalych pol
            if (figuresOnBoard > 0) 
            {
                $('.field[field-number] .figure[player="'+currentPlayerColor+'"]').each(function(index, el){
                    var beforeMove = $(this).attr('field');
                    var afterMove = parseInt(beforeMove) + parseInt(dice);
                    if (afterMove > allFields) 
                    {
                        // koncowy ruch jest większy niż liczba pol na planszy (moze byc tez wieksza niz liczba pol razem z matecznikiem)
                        if (startFields[currentPlayerColor] == 1) 
                        {
                            var inHomeNumer = afterMove - allFields;
                            if (inHomeNumer < 5) 
                            {
                                // wyrzucona liczba przesunelaby pionek na pole które jest juz na mecie
                                var myFigures = $('.field[home-number="'+inHomeNumer+'"]').find('.figure');
                                if (myFigures.length == 0)
                                {
                                    $(this).addClass('animation');
                                    $this.createVirtualMove('home', inHomeNumer);
                                }
                            }
                        }else{

                            afterMove = afterMove - allFields;
                            // koncowy ruch miesci się w obrębie 40 pol na planszy
                            var otherFigure = $('.field[field-number="'+afterMove+'"]').find('.figure');
                            if (otherFigure.length == 0) 
                            {
                                // koncowy ruch wypada na pole na którym nie stoi zaden pionek innego gracza
                                $(this).addClass('animation');
                                $this.createVirtualMove('field', afterMove);
                            }
                            else if (otherFigure.length != 0) 
                            {
                                if (otherFigure.attr('player') != currentPlayerColor) 
                                {
                                    $(this).addClass('animation');
                                    $this.createVirtualMove('field', afterMove, true);
                                }
                            }
                        }
                    }
                    else
                    {
                        // koncowy ruch miesci się w obrębie 40 pol na planszy
                        if (beforeMove < startFields[currentPlayerColor] && afterMove >= startFields[currentPlayerColor])
                        {
                            console.log(1);
                            var inHomeNumer = afterMove - (startFields[currentPlayerColor] - 1);
                            if (inHomeNumer < 5) 
                            {
                                // wyrzucona liczba przesunelaby pionek na pole które jest juz na mecie
                                var myFigures = $('.field[home-number="'+inHomeNumer+'"]').find('.figure');
                                if (myFigures.length == 0)
                                {
                                    $(this).addClass('animation');
                                    $this.createVirtualMove('home', inHomeNumer);
                                }
                            }
                        }
                        else
                        {

                            var otherFigure = $('.field[field-number="'+afterMove+'"]').find('.figure');
                            if (otherFigure.length == 0) 
                            {
                                // koncowy ruch wypada na pole na którym nie stoi zaden pionek innego gracza
                                $(this).addClass('animation');
                                $this.createVirtualMove('field', afterMove);
                            }
                            else if (otherFigure.length != 0) 
                            {
                                if (otherFigure.attr('player') != currentPlayerColor) 
                                {
                                    $(this).addClass('animation');
                                    $this.createVirtualMove('field', afterMove, true);
                                }
                            }
                        }
                    }
                });
            }
            if (figuresInHome > 0) 
            {
                // w mateczniku znajdują się juz pionki gracza który wykonuje akurat ruch
                $('.field[home-number] .figure[player="'+currentPlayerColor+'"]').each(function(index, el){
                    var nowHomeField = $(this).attr('home-field');
                    var futureHomeField = parseInt(nowHomeField) + parseInt(dice);
                    if ($('.field[home-number="'+futureHomeField+'"]').length != 0) 
                    {
                        var myFigures = $('.field[home-number="'+futureHomeField+'"]').find('.figure');
                        if (myFigures.length == 0)
                        {
                            $(this).addClass('animation');
                            $this.createVirtualMove('home', futureHomeField);
                        }
                    }
                });

            }
        };




        this.moveFigureToStart = function(number){
            var otherFigure = $('.field[field-number="'+startFields[currentPlayerColor]+'"]').find('.figure');
            if (otherFigure.length != 0 && otherFigure.attr('player') != currentPlayerColor) 
            {
                $this.killEnemy(otherFigure);
            }
            var thisFigure = $('.playerFigures .figure.animation[player="'+currentPlayerColor+'"][figure="'+number+'"]').attr({
                'field': startFields[currentPlayerColor],
                'sum-dice': 1
            });
            thisFigure.appendTo('.fieldsArea .field[field-number="'+startFields[currentPlayerColor]+'"]').trigger("winnerSensor");
            $this.disableMovePlayerFigures();
            $this.runDice(false);
            $this.actionBtn(true);
        };



        this.moveFigureOnBoard = function(figureNumber){
            var movedFigure = $('.field[field-number]').find('.figure[player="'+currentPlayerColor+'"][figure="'+figureNumber+'"]');
            var beforeMove = movedFigure.attr('field');
            var afterMove = parseInt(beforeMove) + parseInt(dice);

            if (afterMove > allFields) 
            {
                // koncowy ruch jest większy niż liczba pol na planszy (moze byc tez wieksza niz liczba pol razem z matecznikiem)
                if (startFields[currentPlayerColor] == 1) 
                {                
                    // pole startowe jest rowne 1 czyli gracz czerwony
                    var inHomeNumer = afterMove - allFields;
                    if (inHomeNumer < 5) 
                    {
                        movedFigure.removeAttr('field');
                        movedFigure.attr('home-field', inHomeNumer);
                        movedFigure.appendTo('.fieldsArea .field[home="'+currentPlayerColor+'"][home-number="'+inHomeNumer+'"]').trigger("winnerSensor");
                        $this.disableMovePlayerFigures();
                    }
                }
                else
                {
                    afterMove = afterMove - allFields;
                    var otherFigure = $('.field[field-number="'+afterMove+'"]').find('.figure');

                    if (otherFigure.length != 0 && otherFigure.attr('player') != currentPlayerColor) 
                    {
                        $this.killEnemy(otherFigure);
                    }

                    movedFigure.attr('field', afterMove);
                    movedFigure.appendTo('.fieldsArea .field[field-number="'+afterMove+'"]');
                    
                    $this.disableMovePlayerFigures();
                }
            }
            else
            {
                if (beforeMove < startFields[currentPlayerColor] && afterMove >= startFields[currentPlayerColor])
                {
                    var inHomeNumer = afterMove - (startFields[currentPlayerColor] - 1);
                    if (inHomeNumer < 5) 
                    {
                        movedFigure.removeAttr('field');
                        movedFigure.attr('home-field', inHomeNumer);
                        movedFigure.appendTo('.fieldsArea .field[home="'+currentPlayerColor+'"][home-number="'+inHomeNumer+'"]').trigger("winnerSensor");
                        $this.disableMovePlayerFigures();
                    }
                }
                else
                {                
                    var otherFigure = $('.field[field-number="'+afterMove+'"]').find('.figure');


                    if (otherFigure.length != 0 && otherFigure.attr('player') != currentPlayerColor) 
                    {
                        $this.killEnemy(otherFigure);
                    }

                    movedFigure.attr('field', afterMove);
                    movedFigure.appendTo('.fieldsArea .field[field-number="'+afterMove+'"]');
                    
                    $this.disableMovePlayerFigures();
                }
                
            }
            $this.runDice(false);
            $this.actionBtn(true);

        };


        this.moveFigureInHome = function(figureNumber){
            var movedFigure = $('.field[home-number]').find('.figure[player="'+currentPlayerColor+'"][figure="'+figureNumber+'"]');
            var beforeMove = movedFigure.attr('home-field');
            var afterMove = parseInt(beforeMove) + parseInt(dice);
            if ($('.field[home="'+currentPlayerColor+'"][home-number="'+afterMove+'"]').length > 0) {
                movedFigure.attr('home-field', afterMove);
                movedFigure.appendTo('.fieldsArea .field[home="'+currentPlayerColor+'"][home-number="'+afterMove+'"]').trigger("winnerSensor");
                $this.disableMovePlayerFigures();
            }

        };


        this.killEnemy = function(enemy){
            var enemyColor = enemy.attr('player');
            enemy.removeAttr('field');
            enemy.appendTo('.playerFigures.'+enemyColor);
        };




        this.rollTheDice = function(min, max) {
            dice = Math.floor(Math.random() * (max - min + 1)) + min;
            $('.dice .result').attr('dice-result', dice);
                $this.checkFieldBusy();
                $this.runDice(false);                
        };

















        /*******************************************************************************************************
        DOCUMENT READY
        *******************************************************************************************************/


        jQuery(document).ready(function ($) {
            $('.field[start-color]').on('click', function(){
                $this.pickPlayers($(this));
            });

            $(document).on('click', '.btnStart', function(){
                if($this.countPlayers() == true){
                    $this.startGame();
                }else{
                    $this.msgHandler(true, msg.text._NOT_ENOUGHT_PLAYERS);
                }
            }); 

            $(document).on('click', '.playerFigures .close', function(){
                var closedPlayer = $(this).attr('close');
                $this.removePlayer(closedPlayer);
            }); 

            $(document).on('click', '.dice.show.animation', function(){
                if ($(this).hasClass('animation')) {
                    $this.rollTheDice(1,6);
                    // $this.runDice(false);

                };
            });

            $(document).on('click', '.playerFigures .figure.animation', function(){
                var figureNumber = $(this).attr('figure');
                $this.moveFigureToStart(figureNumber);
                $this.createVirtualMove(false);
            });

            $(document).on('click', '.fieldsArea .field[field-number] .figure.animation', function(){
                var attr = $(this).attr('field');
                if (typeof attr !== typeof undefined && attr !== false) {
                    var figureNumber = $(this).attr('figure');
                    $this.moveFigureOnBoard(figureNumber);
                    $this.createVirtualMove(false);
                }
            });
            $(document).on('click', '.fieldsArea .field[home-number] .figure.animation', function(){
                // kliknięty pionek w mateczniku (ma juz attr home-field)
                var attr = $(this).attr('home-field');
                if (typeof attr !== typeof undefined && attr !== false) {
                    var figureNumber = $(this).attr('figure');
                    $this.moveFigureInHome(figureNumber);
                    $this.createVirtualMove(false);
                }
            });

            $(document).on('click', '.nxtPlayer', function(){
                $this.setCurrents(true);
                $this.markCurrentPlayerFigures();
                $this.runDice(true);
                $this.actionBtn(false);
            });


            $(".fieldsArea").on("winnerSensor", function(event){
                var countWinnerFigures = $(this).find('.field[home="'+currentPlayerColor+'"] .figure').length;
                if (countWinnerFigures == 4) {
                    $('body').removeClass('black').addClass('win');
                };
            });






        });


        return this;
    });



});