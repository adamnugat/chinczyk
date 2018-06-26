// var ReaderHandle = function readerHandle() {
$(function () {

    ReaderHandle = new (function readerHandle() {

        var $this = this;

        var windowSets = {
            height: null,
            width: null,
            edgesPx: 20,
            mobilePcResolution: 1024,
            pcOrMobile: null,
        };

        var references = {
            topMenu: null,
            topMenuButtons: null, // w tej zmiennej zapisana referencja do przyciskow z pc / mobile
        };

        var htmlEl = {
            $body:          $('body'),
            $page:          $('.page'),
            $readerArea:    $('.readerArea'),
            $readerAreaJS:  $('.readerArea')[0],
            $paper:         $('#paper'),
            $paperJS:       $('#paper')[0],
            $pagerInput:    $('.bottomBar .typePageInput'),
            $loader:        $('.loader'),
            $loaderNumber:  $('.loader .pageNumber > span'),
            pc: {
                topMenu: $('.topBar'),
                topMenuChild: $('.topBar a.item')
            },
            mobile: {
                topMenu: $('.mobileToolsBar'),
                topMenuChild: $('.mobileToolsBar > div')
            }
        };

        var panzoomObj = {
            opts:{
                increment: 0.1,
                maxScale: 5,
                minScale: 0.6,
                contain: 'invert',
                $zoomIn: $('.mobileToolsBar').find('div[option="zoomIn"]'),
                $zoomOut: $('.mobileToolsBar').find('div[option="zoomOut"]')
            },
            matrix: [1,0,0,1,0,0],
        };


        // var image = new Image();
        //     image.src = $('.readerArea img').attr("src");


        var paper = {
            width: null,
            height: null,
            fitClass: null,
            fitType: null,
            scrollDirection: null,
            startScale: 1,
            scale: 1,
        };

        var readerArea = {
            height: null,
        };

        var plusMinus = {
            classes : ['size1', 'size2', 'size3', 'size4', 'size5'],
            currentIndex : 2
        };


        var bookInfo = {
            countPages: null,
            paginateOffset: null,
            currentPage: null,
            pagesArray: [
                '1.png', '11.png', '12.png', '13.png', '14.png', '15.png', '16.png'
            ]
        };

        var myCookies = {
            lastReadPage: null
        };

        var messages = {
            element: $('.errorMessage > span'),
            buffor: null,
            LAST_PAGE: 'to jest ostatnia strona',
            FIRST_PAGE: 'to jest pierwsza strona',
            NUMBER_FAIL: 'nie ma takiej strony'
        };

        /***************************************************************************/
        /************************** FUNKCJE VALIDUJACE *****************************/
        /***************************************************************************/

        var validation = {
        // pojedyncza cyfra z zakresu 1-9
            isNumber: function (str) {
                var pattern = /^([1-9]+[0-9]*?|)$/;
                return pattern.test(str);
            },
        };




        /***********************************************************
            ustawienie podstawowych zmiennych:
            - parametrów okna przegladarki
        ***********************************************************/
        this.setBasicVariables = function() {
            $this.setWindowProperties();
            $this.setFitType();
            $this.recognizePcOrMobile();
            $this.setPcOrMobileButtonsReferences();
        };
        this.setWindowProperties = function() {
            windowSets.height = $(window).height();
            windowSets.width = $(window).width();
        };
        this.setPaperProperties = function() {
            paper.width = htmlEl.$paper.width();
            paper.height = htmlEl.$paper.height();
            readerArea.height = htmlEl.$readerArea.height();

            // paper.centerPointX = paper.width / 2;
            // paper.centerPointY = paper.height / 2;
            // paper.zoomedPointX = paper.scale * paper.width / 2;
            // paper.zoomedPointY = paper.scale * paper.height / 2;
            // paper.diffX = paper.zoomedPointX - paper.centerPointX;
            // paper.diffY = paper.zoomedPointY - paper.centerPointY;

            // paper.lewa = paper.zoomedPointX - paper.centerPointX;
            // paper.prawa = windowSets.width - (paper.width * paper.scale) + paper.diffX;
            // paper.gora = paper.zoomedPointY - paper.centerPointY;
            // paper.dol = readerArea.height - (paper.height * paper.scale) + paper.diffY;
            // if (paper.scale < 1) {
            //     // paper.dol = Math.abs(paper.dol);
            // }
        };
        this.setFitType = function() {
            if (htmlEl.$readerArea.hasClass('fitHeight')) {
                paper.fitType = 'height';
                paper.fitClass = 'fitHeight';
            }else if(htmlEl.$readerArea.hasClass('fitWidth')){
                paper.fitType = 'width';
                paper.fitClass = 'fitWidth';
            }
             $('.mobileToolsBar > div[option="'+ paper.fitClass +'"]').addClass('active');
        };
        this.recognizePcOrMobile = function(){
            if (windowSets.width <= windowSets.mobilePcResolution) {
                htmlEl.$body.removeClass('pc');
                htmlEl.$body.addClass('mobile');
                windowSets.pcOrMobile = 'mobile';
            }else{
                htmlEl.$body.removeClass('mobile');
                htmlEl.$body.addClass('pc');
                windowSets.pcOrMobile = 'pc';
            }
        };
        this.setPcOrMobileButtonsReferences = function(){
            if (windowSets.width <= windowSets.mobilePcResolution) {
                references.topMenuButtons = htmlEl.mobile.topMenuChild;
                references.topMenu = htmlEl.mobile.topMenu;
                panzoomObj.opts.$zoomIn = references.topMenu.find('div[option="zoomIn"]');
                panzoomObj.opts.$zoomOut = references.topMenu.find('div[option="zoomOut"]');
            }else{
                references.topMenuButtons = htmlEl.pc.topMenuChild;
                references.topMenu = htmlEl.pc.topMenu;
                panzoomObj.opts.$zoomIn = references.topMenu.find('a[option="zoomIn"]');
                panzoomObj.opts.$zoomOut = references.topMenu.find('a[option="zoomOut"]');
            }
        };

        /***********************************************************
            załadowanie COOKIES użytkownika
        ***********************************************************/
        this.loadCookies = function() {

        };

        /***********************************************************
            wczytanie ksiązki i jej właściwości
        ***********************************************************/
        this.loadBookSettings = function() {
            bookInfo.currentPage = myCookies.lastReadPage || 1;
            bookInfo.countPages = bookInfo.pagesArray.length;

            $this.openBookOnPage(bookInfo.currentPage);
            $this.setNumbersOnPager();
        };

        /***********************************************************
            wczytywanie odpowiedniej strony ksiązki
        ***********************************************************/
        this.openBookOnPage = function(page) {
            switch (page) {
                case '+':
                    if (bookInfo.currentPage < bookInfo.pagesArray.length - 1) {
                        bookInfo.currentPage ++;
                    }else{
                        messages.buffor = true;
                        $this.showErrorMessage(messages.LAST_PAGE);
                    }
                    break;
                case '-':
                    if (bookInfo.currentPage > 0) {
                        bookInfo.currentPage --;
                    }else{
                        messages.buffor = true;
                        $this.showErrorMessage(messages.FIRST_PAGE);
                    }
                    break;
                case '--':
                    if (bookInfo.currentPage !== 0) {
                        bookInfo.currentPage = 0;
                    }
                    break;
                case '++':
                    if (bookInfo.currentPage !== bookInfo.pagesArray.length - 1) {
                        bookInfo.currentPage = bookInfo.pagesArray.length - 1;
                    }
                    break;
                default:
                    bookInfo.currentPage = page - 1;
            }

            $this.activeDisactivePagerButtons();

            htmlEl.$paper.attr('src', 'images/pages/'+bookInfo.pagesArray[bookInfo.currentPage]);
            $this.pageImagesLoaderHandle();

            htmlEl.$pagerInput.val(bookInfo.currentPage + 1);
            htmlEl.$loaderNumber.text(bookInfo.currentPage + 1);

            htmlEl.$paper.panzoom("setMatrix", [paper.scale, 0, 0, paper.scale, 0, 0]);

        };

        /***********************************************************
            ustawienie pagera
        ***********************************************************/
        this.setNumbersOnPager = function() {
            $('.countPages').text(bookInfo.countPages);
        };

        /***********************************************************
            dezaktywacja, aktywacja strzałek paginatora
        ***********************************************************/
        this.activeDisactivePagerButtons = function() {
            if (bookInfo.currentPage == 0) {
                $('.bottomBar span[function="prev"]').removeClass('active');
                $('.bottomBar span[function="next"]').addClass('active');
            }else if (bookInfo.currentPage == bookInfo.pagesArray.length - 1) {
                $('.bottomBar span[function="next"]').removeClass('active');
                $('.bottomBar span[function="prev"]').addClass('active');
            }else{
                $('.bottomBar span[function]').addClass('active');
            }
        };



        /***********************************************************
            resetowanie skali dokumentu
        ***********************************************************/
        this.resetScale = function(){
            htmlEl.$paper.panzoom("reset");
            $this.setMyMatrix('reset');
            paper.scale = paper.startScale;
            htmlEl.$paper.panzoom("setMatrix", [paper.scale, 0, 0, paper.scale, 0, 0]);
        };

        /***********************************************************
            ustawianie tablicy matrix (tablica skali i przesunięcia elementu dla pluginu PANZOOM)
        ***********************************************************/
        this.setMyMatrix = function(attr, vall){
            switch (attr) {
                case 'zoom':
                    panzoomObj.matrix[0] = vall;
                    panzoomObj.matrix[3] = vall;
                    break;
                case ('x'):
                    panzoomObj.matrix[5] = vall;
                    break;
                case ('y'):
                    panzoomObj.matrix[4] = vall;
                    break;
                case ('reset'):
                    panzoomObj.matrix = [1,0,0,1,0,0];
                    break;
            }
        };




        /***********************************************************
            obsługa pojedynczego kliknięcia
        ***********************************************************/
        this.singleTapHandle = function(x){
            var xRight = windowSets.width - windowSets.edgesPx;
            if(x <= windowSets.edgesPx)
            {
                // lewa krawedz kliknieta
                $this.nextPrevPage('prev');
            }
            else if(x > windowSets.edgesPx && x < xRight)
            {
                // kliknięty obszar poza krawędziami 
                // -> otwórz menu podręczne
                if (!htmlEl.$page.hasClass('showMobileAdds')) {
                    $('.topBar .bookTitle').removeClass('hide');
                }else{
                    $('.topBar .bookTitle').addClass('hide');
                }
                htmlEl.$page.toggleClass('showMobileAdds');
            }
            else if(x >= xRight)
            {
                // prawa krawedz kliknieta
                $this.nextPrevPage('next');
            }
        };


        /***********************************************************
            obsługa kliknięcia powodującego przełączenie następnej/poprzedniej strony
        ***********************************************************/
        this.nextPrevPage = function(arg){
            if (arg == 'prev')
            {
                $this.quickShowNxtPrevButton(arg);
                $this.openBookOnPage('-');
            }
            else if (arg == 'next')
            {
                $this.quickShowNxtPrevButton(arg);
                $this.openBookOnPage('+');
            }
        };


        /***********************************************************
            efekt kliknięcia na poprzednia/nastepną stronę
        ***********************************************************/
        this.quickShowNxtPrevButton = function(classs){
            var classType;
            if (classs == 'prev')
            {
                classType = 'prevPage run-slide-left';
            }
            else if (classs == 'next')
            {
                classType = 'nxtPage run-slide-right';
            }
            var newdiv = document.createElement("DIV");
            newdiv.className = classType ;
            document.querySelector(".readerArea").appendChild(newdiv);
            setTimeout(function() {
                $('.nxtPage, .prevPage').remove();
            }, 600);
        };


        /***********************************************************
            efekt wyswietlania komunikatu o błędzie
        ***********************************************************/
        this.showErrorMessage = function(message){
            $('.errorMessage').remove();
            var newdiv = document.createElement("DIV");
            newdiv.className = 'errorMessage error-slide-top' ;
            var dateString = "<span>"+message+"</span>";
            newdiv.innerHTML = dateString;
            document.querySelector(".readerArea").appendChild(newdiv);
        };



        /***********************************************************
            rozróżnienie czy przesunięcie palcem ma przejść do nxt/prev strony czy nie
        ***********************************************************/
        this.verifySwipePage = function(deltaX, finishX){
            var xRight = windowSets.width - windowSets.edgesPx;
            var startPoint = finishX - deltaX;
            if(startPoint <= windowSets.edgesPx)
            {
                // swipe w prawą strone (tzn. ze chce przejść do poprzedniej strony)
                $this.nextPrevPage('prev');
            }
            else if(startPoint >= xRight)
            {
                // swipe w lewą strone (tzn. ze chce przejść do nastepnej strony)
                $this.nextPrevPage('next');
            }

        };

        this.pageImagesLoaderHandle = function(){
            htmlEl.$paper.imagesLoaded()
            .done( function( instance ) {
                $this.setPaperProperties();
                    htmlEl.$loader.stop( true, true ).fadeOut(1000);
            })
            .progress( function( instance, image ) {
            if (messages.buffor == true) {
                messages.buffor = null;
            }else{
                htmlEl.$loader.stop( true, true ).fadeIn();
                return true;
            }
            });

        };






        /***********************************************************
        ************************************************************
            DOCUMENT
            READY
        ************************************************************
        ***********************************************************/
        jQuery(document).ready(function ($) {

            $this.setBasicVariables();
            $this.loadBookSettings();

            // inicjalizacja pluginu do skalowania i przesuwania
            htmlEl.$paper = htmlEl.$paper.panzoom(panzoomObj.opts);
            
            htmlEl.$paper.parent().on('mousewheel.focal', function( e ) {
                var delta = e.delta || e.originalEvent.wheelDelta;
                var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
                htmlEl.$paper.panzoom('zoom', zoomOut, {
                    increment: 0.1,
                    animate: false,
                    focal: e
                });
            });


            /************************************************************
                PANZOOM - POWIĘKSZANIE/POMNIEJSZANIE (+/-)
            ************************************************************/
            htmlEl.$paper.on('panzoomzoom', function(e, panzoom, scale, opts) {
                paper.scale = scale;
                panzoomObj.matrix = htmlEl.$paper.panzoom("getMatrix");
                $this.setMyMatrix('zoom', paper.scale);
                $this.setPaperProperties();
                console.log(paper.scale);

            });


            /************************************************************
                PANZOOM - RESET
            ************************************************************/
            htmlEl.$paper.on('panzoomreset', function(e, panzoom, matrix) {
            });


            /************************************************************
                PANZOOM - PRZESUWANIE
            ************************************************************/        
            htmlEl.$paper.on('panzoompan', function(e, panzoom, x, y) {
                    panzoomObj.matrix = htmlEl.$paper.panzoom("getMatrix");
                    // console.log(panzoomObj.matrix);
                    if (paper.scrollDirection != null) {
                        if (panzoomObj.matrixMemory == null) {
                            switch (paper.scrollDirection) {
                                case 'vertical':
                                    break;
                                case 'horizontal':
                                    break;
                            }
                        }
                    }

            });
            htmlEl.$paper.on('panzoomstart', function(e, panzoom, event, touches) {
                //OBSLUGA DODATKOWYCH PRZYCISKOW
            });





            /************************************************************
                HAMMER JS - obsluga
                - powielone zdarzenia singletap/doubletap/swipe dla kartki i obszaru czytnika
                ze względu na to, że gryzą się z pluginem panzoom
            ************************************************************/
            var hammerSwipePaper = new Hammer.Manager(htmlEl.$paperJS, {
                recognizers: [[Hammer.Swipe,{ velocity: 0.1 }],]
            });
            var hammerSwipeContainer = new Hammer.Manager(htmlEl.$readerAreaJS, {
                recognizers: [[Hammer.Swipe,{ velocity: 0.1 }],]
            });
            var mcManagerOnPaper = new Hammer.Manager(htmlEl.$paperJS);
            var mcManagerOnArea = new Hammer.Manager(htmlEl.$readerAreaJS);


            /********* single/double click on #paper *********/
            mcManagerOnPaper.add( new Hammer.Tap({ event: 'doubletap', taps: 2 }) );
            mcManagerOnPaper.add( new Hammer.Tap({ event: 'singletap' }) );
            mcManagerOnPaper.get('doubletap').recognizeWith('singletap');
            mcManagerOnPaper.get('singletap').requireFailure('doubletap');

            mcManagerOnPaper.on("singletap doubletap", function(ev) {
                if(ev.type == 'singletap'){
                    $this.singleTapHandle(ev.center.x);

                }else if(ev.type == 'doubletap'){
                    $this.resetScale();
                    $this.setPaperProperties();
                }
            });


            /********* single/double click on .readerArea *********/
            mcManagerOnArea.add( new Hammer.Tap({ event: 'doubletap', taps: 2 }) );
            mcManagerOnArea.add( new Hammer.Tap({ event: 'singletap' }) );
            mcManagerOnArea.get('doubletap').recognizeWith('singletap');
            mcManagerOnArea.get('singletap').requireFailure('doubletap');

            mcManagerOnArea.on("singletap doubletap", function(ev) {
                if(ev.type == 'singletap'){
                    $this.singleTapHandle(ev.center.x);

                }else if(ev.type == 'doubletap'){
                    $this.resetScale();
                    $this.setPaperProperties();
                }
            });


            /******* swipe #paper *******/
            // hammerSwipePaper.on("swipeleft", function(ev) {
            //     $this.verifySwipePage(ev.deltaX, ev.center.x);
            // });
            // hammerSwipePaper.on("swiperight", function(ev) {
            //     $this.verifySwipePage(ev.deltaX, ev.center.x);
            // });

            /******* swipe .readerArea *******/
            // hammerSwipeContainer.on("swipeleft", function(ev) {
            //     $this.verifySwipePage(ev.deltaX, ev.center.x);
            // });
            // hammerSwipeContainer.on("swiperight", function(ev) {
            //     $this.verifySwipePage(ev.deltaX, ev.center.x);
            // });





            // ukrywanie paska z tytułem ksiązki
            setTimeout(function() {
                // $('.page').addClass('hideTitleBar');
                $('.topBar .bookTitle').addClass('hide');
                // $this.setPaperProperties();

            }, 3000);


            $('.leftBar .item[reference-panel]').on('click', function(){
                var ref = $(this).attr('reference-panel');

                if (!$('.extendPanel[id="'+ ref +'"]').hasClass('show')) {
                    $('.extendPanel').removeClass('show');
                    $('.extendPanel[id="'+ ref +'"]').addClass('show');
                }else{
                    $('.extendPanel').removeClass('show');
                }
            });




            /***********************************************************
                >> PC <<
                PLUSMINUS - powiększanie podglądu stron 
            ***********************************************************/

            $('#pagesList .plusMinus > div').on('click', function(){
                var container = $('.pagesList');

                if($(this).hasClass('plus'))
                {
                    if($plusMinus.currentIndex != 4){
                        plusMinus.currentIndex ++;
                    }
                }
                else if($(this).hasClass('minus'))
                {
                    if(plusMinus.currentIndex != 0){
                        plusMinus.currentIndex --;
                    }
                }
                container.removeClass('size1 size2 size3 size4 size5');
                container.addClass(plusMinus.classes[plusMinus.currentIndex]);
            });










            /***********************************************************
                >> MOBILE <<
                OBSŁUGA PRZYCISKÓW MENU PODRĘCZNEGO
            ***********************************************************/
            references.topMenuButtons.on('click', function(e){
                var group = $(this).attr('group'),
                    option = $(this).attr('option');

                if (group == 'fit')
                {
                    $(this).siblings().removeClass('active');
                    $(this).addClass('active');
                    $('.readerArea').removeClass('fitHeight fitWidth');
                    $('.readerArea').addClass(option);
                    $this.setFitType();
                    $this.resetScale();
                    // console.log($('#paper').width());
                    // console.log($('#paper').height());
                    // var tyty = htmlEl.$paper.panzoom("getMatrix");
                    // console.log(tyty);
                }
                else if (group == 'list')
                {
                    if (!$(this).hasClass('active')) {
                        $(this).addClass('active');
                        $('.pagesListArea').addClass('show');
                    }else{
                        $(this).removeClass('active');
                        $('.pagesListArea').removeClass('show');
                    }
                }

                $this.setPaperProperties();

                return false;
            });
            /***********************************************************
                >> MOBILE <<
                OBSŁUGA PRZYCISKU BLOKOWANIA SCROLLOWANIA W WYBRANYM KIERUNKU
            ***********************************************************/
            $('.mobileToolsBar > span').on('click', function(e){
                switch (paper.scrollDirection) {
                    case null:
                        $(this).addClass('vertical');
                        paper.scrollDirection = 'vertical';
                        break;
                    case ('vertical'):
                        $(this).addClass('horizontal');
                        paper.scrollDirection = 'horizontal';
                        break;
                    case ('horizontal'):
                        $(this).removeClass('vertical horizontal');
                        paper.scrollDirection = null;
                        break;
                }

            });


            /***********************************************************
                >> MOBILE <<
                OBSŁUGA PRZYCISKÓW PAGINATORA I POLA INPUT
            ***********************************************************/
            $('.bottomBar span').on('click', function(e){
                if($(this).hasClass('next') && $(this).hasClass('active')){
                    $this.openBookOnPage('+');
                }
                if($(this).hasClass('prev') && $(this).hasClass('active')){
                    $this.openBookOnPage('-');
                }
                if($(this).hasClass('last') && $(this).hasClass('active')){
                    $this.openBookOnPage('++');
                }
                if($(this).hasClass('first') && $(this).hasClass('active')){
                    $this.openBookOnPage('--');
                }
            });

            htmlEl.$pagerInput.on("click", function () {
                $(this).select();
            }).keyup(function( e ){
                var thisValue = $(this).val();
                if(event.keyCode == 13) {
                    var input = validation.isNumber(thisValue);
                    if (input === true && thisValue > 0 && thisValue <= bookInfo.countPages) {
                        $this.openBookOnPage(thisValue);
                    }
                }
            });


        });





        jQuery(window).on('resize', function ($) {
            $this.setWindowProperties();
            $this.recognizePcOrMobile();
            $this.setPcOrMobileButtonsReferences();

        });




        return this;
    });



});


// $(document).on('ready', function(){
//     newReaderHandler = new ReaderHandle();
// });



