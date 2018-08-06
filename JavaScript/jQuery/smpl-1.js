$(function () {

    var depositOptions = (function () {
        var validGoals = ["profit", "period", "regular", "flexible"];
        var validMoneyback = ["1day", "2days"];

        var goal = '';
        var duration = 30;

        var deposits = {
            no1: {
                available: true,
                minDeposit: [1000, 100, 100],
                percents: {
                    30: [13,4,3], // Data structure - 30 days: percents in [UAH, USD, EUR]
                    60: [14,4.5,3.5],
                    90: [16,6.5,4],
                    180: [17,7.5,5],
                    270: [18,8.5,6],
                    370: [19,8.5,7],
                    550: [19,8.5,6.5],
                    740: [19,8.5,6],
                    1110: [19,8.5,6]
                }
            },
            no2: {
                available: true,
                minDeposit: [1000, 100, 100],
                percents: {
                    30: [13,4,3],
                    60: [14,4.5,3.5],
                    90: [16,6.5,4],
                    180: [17,7.5,5],
                    270: [18,8.5,6],
                    370: [19,8.5,7],
                    550: [19,8.5,6.5],
                    740: [19,8.5,6],
                    1110: [19,8.5,6]
                }
            },
            no3: {
                available: true,
                minDeposit: [1000, 100, 100],
                percents: {
                    30: [0,0,0],
                    60: [13.5,4.25,3.25],
                    90: [15.5,6.25,3.75],
                    180: [16.5,7.25,4.75],
                    270: [17.5,8.25,5.75],
                    370: [18.5,8.25,6.75],
                    550: [18.5,8.25,6.25],
                    740: [18.5,8.25,5.75],
                    1110: [18.5,8.25,5.75]
                }
            },
            no4: {
                available: true,
                minDeposit: [1000, 100, 100],
                percents: {
                    30: [0,0,0],
                    60: [0,0,0],
                    90: [15,5.75,3.25],
                    180: [16,6.75,4.25],
                    270: [17,7.75,5.25],
                    370: [18,7.75,6.25],
                    550: [18,7.75,5.75],
                    740: [18,7.75,5,25],
                    1110: [18,7.75,5,25]
                }
            },
            no5: {
                available: true,
                minDeposit: [1000, 100, 100],
                percents: {
                    30: [10,4,2.5],
                    60: [10,4,2.5],
                    90: [10,4,2.5],
                    180: [10,4,2.5],
                    270: [10,4,2.5],
                    370: [10,4,2.5],
                    550: [10,4,2.5],
                    740: [10,4,2.5],
                    1110: [10,4,2.5]
                }
            }
        };

        /* Пробуем обновить процентные ставки значениями из базы */
        $.each([1,2,3,4,5], function (i, depoNum) {
            var idx = 'no' + depoNum;
            if (typeof percentDynamicDefinition[idx] !== "undefined" && percentDynamicDefinition[idx]) {
                deposits[idx].percents = percentDynamicDefinition[idx];
            }
        });

        var refill = false;

        var moneyback = '2days';

        this.setGoal = function (g) {
            if (-1 < $.inArray(g, validGoals)) {
                var old = goal;
                goal = g;

                if (old != goal) {
                    $(depositOptions).trigger('change:goal', goal);
                }
            }
        };

        this.getGoal = function () {
            return goal;
        };

        var stdDurations = {
            'd30': '1 мес',
            'd60': '2 мес',
            'd90': '3 мес',
            'd180': '6 мес',
            'd270': '9 мес',
            'd370': '370 дней',
            'd550': '18 мес',
            'd740': '24 мес'
        };

        this.isStdDuration = function (d) {
            return (undefined != stdDurations['d' + d]);
        };

        this.getStdDuration = function (d) {
            var assumeDays = 740;
            var edgeDays = [30,60,90,180,270,370,550,740].reverse();

            for (var i = 0; i < edgeDays.length; i++) {
                if (edgeDays[i] >= d) {
                    assumeDays = edgeDays[i];
                } else break;
            }

            return assumeDays;
        };

        this.setDuration = function (d) {
            if (!isNaN(d)) {
                var oldDuration = duration;
                duration = Math.abs(parseInt(d, 10));

                if (oldDuration != duration) {
                    $(depositOptions).trigger('change:duration',
                        [duration, ((undefined == stdDurations['d' + duration]) ? false : stdDurations['d' + duration])]);
                }
            }
        };

        this.getDuration = function () {
            return duration;
        };

        this.getDeposits = function () {
            return deposits;
        };

        this.enableDeposit = function (did) {
            var depoId = 'no' + (did + '').replace(/^no/, '');
            if (deposits[depoId]) {
                var oldStatus = deposits[depoId].available;
                deposits[depoId].available = true;

                if (deposits[depoId].available != oldStatus) {
                    $(depositOptions).trigger('change:deposit:availability', depoId);
                }
            }
        };

        this.disableDeposit = function (did) {
            var depoId = 'no' + did;
            if (deposits[depoId]) {
                var oldStatus = deposits[depoId].available;
                deposits[depoId].available = false;

                if (deposits[depoId].available != oldStatus) {
                    $(depositOptions).trigger('change:deposit:availability', depoId);
                }
            }
        };

        this.setRefill = function (r) {
            var old = refill;
            refill = !!r;

            if (old != refill) {
                $(depositOptions).trigger('change:refill', refill);
            }
        };

        this.getRefill = function () {
            return refill;
        };

        this.setMoneyback = function (m) {
            if (-1 < $.inArray(m, validMoneyback)) {
                var old = moneyback;
                moneyback = m;

                if (old != moneyback) {
                    $(depositOptions).trigger('change:moneyback', moneyback);
                }
            }
        };

        this.getMoneyback = function (m) {
            return moneyback;
        };

        var initialAmount = 10000;

        this.getInitialAmount = function () {
            return initialAmount;
        };

        this.setInitialAmount = function (a) {
            if (!isNaN(a)) {
                var old = initialAmount;
                initialAmount = Math.abs(parseInt(a, 10));

                if (old != initialAmount) {
                    $(depositOptions).trigger('change:amount:initial', [initialAmount, 'initial']);
                }
            }
        };

        var desiredAmount = 100000;

        this.getDesiredAmount = function () {
            return desiredAmount;
        };

        this.setDesiredAmount = function (a) {
            if (!isNaN(a)) {
                var old = desiredAmount;
                desiredAmount = Math.abs(parseInt(a, 10));

                if (old != desiredAmount) {
                    $(depositOptions).trigger('change:amount:desired', [desiredAmount, 'desired']);
                }
            }
        };

        var refillAmount = 0;

        this.getRefillAmount = function () {
            return refillAmount;
        };

        this.setRefillAmount = function (a) {
            if (!isNaN(a)) {
                var old = refillAmount;
                refillAmount = Math.abs(parseInt(a, 10));

                if (old != refillAmount) {
                    $(depositOptions).trigger('change:amount:refill', [refillAmount, 'initial']);
                }
            }
        };

        var plowback = 1;

        this.getPlowback = function () {
            return plowback;
        };

        this.setPlowback = function (p) {

            /**
             * 0 - Ежемесячное получение %
             * 1 - Получение % в конце срока
             * 2 - Капитализация %
             */
            p = parseInt(p, 10);

            var old = plowback;
            plowback = ((-1 < $.inArray(p, [0,1,2])) ? p : 0);

            if (old != plowback) {
                $(depositOptions).trigger('change:plowback', plowback);
            }
        };

        var currency = 'uah';

        this.setCurrency = function (c) {
            if (-1 < $.inArray(c, ['uah', 'usd', 'eur'])) {
                var old = currency;
                currency = c;

                if (old != currency) {
                    $(depositOptions).trigger('change:currency', currency);
                }
            }
        };

        return this;
    })();

    var intersectArrays = function(array1, array2) {
        var ai = 0,
            bi = 0,
            result = [];

        while (ai < array1.length && bi < array2.length) {
            if (array1[ai] < array2[bi]) {
                ai++;
            } else if (array1[ai] > array2[bi]) {
                bi++;
            } else {
                result.push(array1[ai]);
                ai++;
                bi++;
            }
        }

        return result;
    };

    var setDepositsAvailability = function () {
        var deposits = [1,2,3,4,5];

        /* вначале деактивируем все виды депозитов */
        $.each(deposits, function (i, did) {
            depositOptions.disableDeposit(did);
        });

        /* на один день размещаем только Свободу */
        if (1 >= depositOptions.getDuration()) {
            deposits = intersectArrays(deposits, [5]);
        }

        /* Капитал и Добробут не допускают пополнение */
        if (depositOptions.getRefill()) {
            deposits = intersectArrays(deposits, [2,4,5]);
        }

        /* По способу получения процентов по вкладу тоже можем что-то выключить*/
        switch (depositOptions.getPlowback()) {
            case 0: deposits = intersectArrays(deposits, [2,3,5]); break;
            case 2: deposits = intersectArrays(deposits, [4]); break;
        }

        /* За один день можно досрочно вернуть только Свободу */
        if ('1day' == depositOptions.getMoneyback()) {
            deposits = intersectArrays(deposits, [5]);
        }

        /* Проверяем ограничения по срокам вкладов */
        var validDepositsByDuration = [];
        var assumeDays = 740;
        var edgeDays = [30,60,90,180,270,370,550,740,1110].reverse();

        for (var i = 0; i < edgeDays.length; i++) {
            if (edgeDays[i] >= depositOptions.getDuration()) {
                assumeDays = edgeDays[i];
            } else break;
        }

        $.each(depositOptions.getDeposits(), function (depoId, depoData) {
            var percents = depoData.percents[assumeDays];
            if (undefined !== percents && $.isArray(percents)) {
                $.each(['uah', 'usd', 'eur'], function (i, curAbbr) {
                    var curIndex = (('eur' == curAbbr) ? 2 : (('usd' == curAbbr) ? 1 : 0));
                    if (0 < percents[curIndex]) {
                        validDepositsByDuration.push(parseInt(depoId.replace(/\D+/g, ''), 10));
                    }
                });
            }
        });

        // Если срок нестандартный, то блокируем все вклады кроме Свобода
        if (-1 == $.inArray(depositOptions.getDuration(), edgeDays)) {
            validDepositsByDuration = [5];
        }

        deposits = intersectArrays(deposits, validDepositsByDuration);

        $.each(deposits, function (i, did) {
            depositOptions.enableDeposit(did);
        });
    };

    var  ul_width = $("#main_banner .inner ul.banners_menu").width();
    var li_width = Math.floor(ul_width/3)-2;
    var li_last_width = ul_width - li_width*2-6;
    $("#main_banner .inner ul.banners_menu li").css("width", li_width);
    $("#main_banner .inner ul.banners_menu li:last").css("width", li_last_width);

    $("#main_banner .inner .banner:first").addClass("current").show();
    $("#main_banner .inner ul.banners_menu li:first").addClass("current").prepend("<div class='arrow'></div>").show();

    $("#footer_banners div.banner:last").css("margin-right", "0px");

    $(".main_menu_popup").each(function() {
        $(this).prepend("<div class='top_arow'></div>");
    });

    if($("#header #sub_menu li.current").size()){
        $("#header #sub_menu li.current").prev().find("a").css("border-right","none");
    }

    $("#main_menu li a").click(function() {
        if($(this).parent().hasClass("corporation")){
            $("#fader").show();
            $(".main_menu_popup").fadeOut();
            $("#popup_"+$(this).parent().attr("class")).css("left", $(this).parent().position().left*1+50).fadeIn();
            return false;
        }
    });

    $("#fader").click(function() {
        $(this).removeClass("dark").fadeOut();
        $(".main_menu_popup").fadeOut();
        $(".popup").fadeOut();
    });

    var next = 0;
    function change_main_banner(current) {
        if(current>-1){
            next = current;

            $("#main_banner .inner .banner.current").removeClass("current").fadeOut("slow", function(){$("#main_banner .inner .banner").eq(next).addClass("current").fadeIn("slow")});
            $("#main_banner .inner ul.banners_menu li.current").removeClass("current").find(".arrow").remove();
            $("#main_banner .inner ul.banners_menu li").eq(next).prepend("<div class='arrow'></div>").addClass("current");

        }else{
            $("#main_banner .inner .banner").each(function(){
                if($(this).hasClass("current")){
                    next = $(this).index()*1 + 1;
                    if($(this).index() == $("#main_banner .inner .banner").size()-1) next = 0;

                    $("#main_banner .inner .banner.current").removeClass("current").fadeOut("slow", function(){$("#main_banner .inner .banner").eq(next).addClass("current").fadeIn("slow")});
                    $("#main_banner .inner ul.banners_menu li.current").removeClass("current").find(".arrow").remove();
                    $("#main_banner .inner ul.banners_menu li").eq(next).prepend("<div class='arrow'></div>").addClass("current");

                }
            });
        }
    };

    $("#main_banner .inner ul.banners_menu li").click(function() {
        $("#main_banner").stopTime('timer_main_banner');
        var current = $(this).index();
        change_main_banner(current);
        return false;
    });

    $("#main_banner").everyTime(14000, 'timer_main_banner', function(i) {
        change_main_banner();
    });

    $(window).blur(function() {
        $("#main_banner").stopTime('timer_main_banner');
    });

    $(window).focus(function() {
        $("#main_banner").stopTime('timer_main_banner');
        $("#main_banner").everyTime(22000, 'timer_main_banner', function(i) {
            change_main_banner();
        });
    });

    $("#block_branches table tr:odd").addClass("light");

    $("#header #search a").click(function() {
        $(this).parent().submit();
        return false;
    });

    $("#search_input a").click(function() {
        $(this).parent().submit();
        return false;
    });

    var default_search = $("#search input").val();
    $("#search input").focus(function() {
        if($(this).val() == default_search){
            $(this).val("").removeClass("empty");
        }
    });
    $("#search input").blur(function() {
        if($(this).val() == ""){
            $(this).val(default_search).addClass("empty");
        }
    });

    var default_search_input = $("#search_input input").val();
    $("#search_input input").focus(function() {
        if($(this).val() == default_search_input){
            $(this).val("").removeClass("empty");
        }
    });
    $("#search_input input").blur(function() {
        if($(this).val() == ""){
            $(this).val(default_search_input).addClass("empty");
        }
    });

    $(".tabs").each(function() {
        $(this).find(".head").find("div:first").addClass("active");
        $(this).find(".content div:eq("+$(this).find(".head div.active").index()+")").removeClass("hidden");
    });

    $(".tabs .head div").click(function() {
        $(this).parent().find("div").removeClass("active");
        $(this).addClass("active");
        $(this).parents(".tabs").find(".content div").addClass("hidden");
        $(this).parents(".tabs").find(".content div:eq("+$(this).parents(".tabs").find(".head div.active").index()+")").removeClass("hidden");
    });

    if($("#list_for_slider").size()){
        var aDepositsCoordsStart = new Array();
        var aDepositsCoordsFinish = new Array();
        var i = 0;
        $("#list_for_slider ul li").each(function() {
            aDepositsCoordsStart[i] = $(this).position().left;
            aDepositsCoordsFinish[i] = $(this).position().left+$(this).width();
            i++;
        });

        $("#list_for_slider ul li").mouseenter(function(){
            var slider_left = $(this).position().left*1+($(this).width()/2)-61-8;
            $("#slider").animate({left: slider_left},200);
            $(this).parent().find("li").removeClass("active");
            $(this).addClass("active");
        });

        var position_coursor_on_slider = 0;
        var is_mouse_dowm_on_slider = false;

        $("#slider").mousedown(function(e) {
            is_mouse_dowm_on_slider = true;
            $(this).css("z-index", "100");
            position_coursor_on_slider = e.pageX-$(this).offset().left;

            // cancel out any text selections
            document.body.focus();

            // prevent text selection in IE
            document.onselectstart = function () { return false; };
            // prevent IE from trying to drag an image
            $('#slider').ondragstart = function() { return false; };

            // prevent text selection (except IE)
            return false;
        });
        $("#slider").mouseup(function() {
            is_mouse_dowm_on_slider = false;
            position_coursor_on_slider = 0;
        });

        $("#slider").mousemove(function(e) {
            if(is_mouse_dowm_on_slider){
                if((e.pageX-$(this).parent().offset().left-position_coursor_on_slider)+3>0 && (e.pageX-$(this).parent().offset().left-position_coursor_on_slider+119)<1020){
                    var new_slider_position = e.pageX-$(this).parent().offset().left-position_coursor_on_slider;
                    $(this).css("left",new_slider_position);

                    for (var j = 0; j < aDepositsCoordsStart.length; j++) {
                        if(new_slider_position+61>aDepositsCoordsStart[j] && new_slider_position+61<aDepositsCoordsFinish[j]){
                            $("#list_for_slider ul li").removeClass("active");
                            $("#list_for_slider ul li").eq(j).addClass("active");
                        }
                    }
                }
            }
        });

        $(document).mouseup(function() {
            is_mouse_dowm_on_slider = false;
            position_coursor_on_slider = 0;

            var slider_left = $("#list_for_slider ul li.active").position().left*1+($("#list_for_slider ul li.active").width()/2)-61-8;
            $("#slider").animate({left: slider_left},200);

        });

        $("#list_for_slider ul li").eq(0).addClass("active");
        var slider_left = $("#list_for_slider ul li.active").position().left*1+($("#list_for_slider ul li.active").width()/2)-61-8;
        $("#slider").animate({left: slider_left},200);
    }

    $("#list_for_slider.deposits ul li").click(function(){
        location.href = $(this).attr("href");
        return false;
    });
    $("#list_for_slider.cards ul li").click(function(){
        location.href = $(this).attr("href");
        return false;
    });
    $("#list_for_slider.moneytransfer ul li").click(function(){
        location.href = $(this).attr("href");
        return false;
    });
    $("#list_for_slider.business ul li").click(function(){
        location.href = $(this).attr("href");
        return false;
    });

    $("#list_for_slider.corporate ul li").click(function(){
        location.href = $(this).attr("href");
        return false;
    });

    $(".show_popup").click(function(){
        $(".popup").hide();

        var heightInner = window.innerHeight || document.documentElement.clientHeight;
        var widthInner = window.innerWidth || document.documentElement.clientWidth;

        $("#"+$(this).attr("popup_id")).css("top", (heightInner  - $("#"+$(this).attr("popup_id")).height())/2+"px");
        $("#"+$(this).attr("popup_id")).css("left", (widthInner  - $("#"+$(this).attr("popup_id")).width())/2+"px");

        $("#fader").addClass("dark").fadeIn();
        $("#"+$(this).attr("popup_id")).fadeIn();
        return false;
    });
    $(".popup_close").click(function(){
        $(this).parents("div.popup").fadeOut();
        $("#fader").removeClass("dark").fadeOut();
        return false;
    });

    if($("input.standart").size()){
        $("input.standart").wrap("<div class='standart'></div>");
    }
    if($("a.submit").size()){
        $("a.submit").wrap("<div class='submit'></div>");
    }

    if($("a.button").size()){
        $("a.button").each(function(){
            $(this).wrap("<div class='"+$(this).attr("class")+"'></div>");
        });
    }

    $("span.checkbox").click(function(){
        $(this).toggleClass("active");
        $(this).next().removeClass("error");
    });
    $("span.checkbox_label").click(function(){
        $(this).prev().toggleClass("active");
        $(this).removeClass("error");
    });


    $("#order a.submit").click(function(){
        var oName = $("#order").find("input[name='name']");
        var oPhone = $("#order").find("input[name='phone']");
        var oAgree = $("#order").find("span.checkbox[checkbox='agree']");

        oAgree.removeClass("error");

        var oNameLabel = $("#order").find("div.input_label[for='name']");
        if(!oNameLabel.find("span.error_message").size()){
            oNameLabel.append("<span class='error_message'></span>");
        }
        var oNameError = oNameLabel.find("span.error_message");
        oNameError.text("");


        var oPhoneLabel = $("#order").find("div.input_label[for='phone']");
        if(!oPhoneLabel.find("span.error_message").size()){
            oPhoneLabel.append("<span class='error_message'></span>");
        }
        var oPhoneError = oPhoneLabel.find("span.error_message");
        oPhoneError.text("");

        var error = false;

        if(oName.val() == "" || oName.val() == oName.attr("default_value")){
            oNameError.text("Не введено имя.");
            error = true;
        }
        if(oPhone.val() == oPhone.attr("default_value") || oPhone.val() == ""){
            oPhoneError.text("Не введен номер телефона.");
            error = true;
        }else{
            var val = parseInt(oPhone.val(), 10);
            if(oPhone.val().length<5 || oPhone.val().length>15 || isNaN(val) || (val != oPhone.val() && ("+"+val != oPhone.val() || "0"+val != oPhone.val()))){

                oPhoneError.text("Неверный формат для номера телефона.");
                error = true;
            }
        }
        if(!oAgree.hasClass("active")){
            $("#order").find("span.checkbox_label[for='agree']").addClass("error");
            error = true;
        }

        if(error){

        }else{
            $.ajax({
                type: "POST",
                url: "/ajax.php",
                data: "action=order&name="+oName.val()+"&phone="+oPhone.val(),
                success: function(msg){
//					$("#order_done_frame").attr("src", "/order/done/");
                }
            });

            $("#order").find(".success").find("span.name").text(oName.val());
            $("#order").find(".success").find("span.phone").text(oPhone.val());

            $("#order").find(".form").addClass("hidden");
            $("#order").find(".success").removeClass("hidden");
        }
        return false;
    });

    $("#order").find("input[name='name']").focus(function(){
        var oNameLabel = $("#order").find("div.input_label[for='name']");
        if(!oNameLabel.find("span.error_message").size()){
            oNameLabel.append("<span class='error_message'></span>");
        }
        var oNameError = oNameLabel.find("span.error_message");
        if($(this).val() == $(this).attr("default_value")){
            $(this).val("");
        }
        oNameError.text("");
    });
    $("#order").find("input[name='name']").blur(function(){
        if($(this).val() == ""){
            $(this).val($(this).attr("default_value"));
            $(this).addClass("default");
        }
    });

    function setSelectionRange2(input, selectionStart, selectionEnd) {
        if (input.setSelectionRange){
            input.focus();
            input.setSelectionRange(selectionStart, selectionStart);
        }else if (input.createTextRange) {
            var range = input.createTextRange();
            range.collapse(true);
            range.moveEnd('character', selectionEnd);
            range.moveStart('character', selectionStart);
            range.select();
        }
    }

    $("#order").find("input[name='phone']").focus(function(){
        var oPhoneLabel = $("#order").find("div.input_label[for='phone']");
        if(!oPhoneLabel.find("span.error_message").size()){
            oPhoneLabel.append("<span class='error_message'></span>");
        }
        var oPhoneError = oPhoneLabel.find("span.error_message");
        oPhoneError.text("");

        $(this).removeClass("default");
        if($(this).val() == $(this).attr("default_value")){
            $(this).val("+380");
            setSelectionRange2($(this).get(0), $(this).val().length, $(this).val().length);
//			$(this).blur();
//			$(this).focus();
//			$(this).select();
        }
    });
    $("#order").find("input[name='phone']").blur(function(){
        if($(this).val() == ""){
            $(this).val($(this).attr("default_value"));
            $(this).addClass("default");
        }
    });

    if($("#product_content ul.tabs").size()){
        var li_width = Math.floor($("#product_content ul.tabs").width()/$("#product_content ul.tabs li").size()-22);
        var summa_width = 0;
        $("#product_content ul.tabs li").each(function(){
            $(this).css("width", li_width);
            var padding_top = Math.floor((35-$(this).find("span").height())/2);
            $(this).css("padding-top", padding_top);
            $(this).css("height", $(this).height()-padding_top);
            summa_width += $(this).width()+22;
        });
        var last_width = $("#product_content ul.tabs").width()-(summa_width-$("#product_content ul.tabs li:last").width());

        $("#product_content ul.tabs li:last").css("width", last_width);

        if($("#product_content ul.tabs li").size()>1){
            $("#product_content ul.tabs li:first").addClass("active");
        }else{
            $("#product_content ul.tabs li:first").addClass("theone");
        }
        $("#product_content div.tab_content").hide();
        $("#product_content div.tab_content:first").show();

        $("#product_content ul.tabs li").click(function(){
            if(!$(this).hasClass("theone")){
                $(this).parent().find("li").removeClass("active");
                $("#product_content div.tab_content").hide();
                $(this).addClass("active");
                $("#product_content div.tab_content").eq($(this).index()).show();
            }
        });
    }

    $("#compare table tr:odd").addClass("light");

    if($("span.currency").size()){
        function compareChangeCurrency(){
            $(".currency_percent").hide();
            $(".currency_percent_"+$("span.currency").filter(".current").attr("currency")).show();
        }

        $("span.currency:first").addClass("current");
        compareChangeCurrency();

        $("span.currency").click(function(){
            $("span.currency").removeClass("current");
            $(this).addClass("current");
            compareChangeCurrency();
        });
    }

    if($("#product_content .tab_content table.group td.separator .inner").size()){
        $("#product_content .tab_content table.group td.separator .inner").each(function(){
            $(this).find("div.arrow").css("top", ($(this).height()-31)/2);
        });
    }

    if($("#footer_block").size()){
        var div_block_max_height = 0;
        $("#footer_block").find("div.block").each(function(){
            if($(this).height()>div_block_max_height) div_block_max_height = $(this).height();
        });
        $("#footer_block").find("div.block").each(function(){
            $(this).css("height",div_block_max_height+30);
        });
        $("#footer_block").css("height", div_block_max_height+40);
    }

    $("#currency_tabs span").click(function(){
        $("#currency_tabs span").removeClass("active");
        $(this).addClass("active");

        $("div.currency_imf").addClass("hidden");
        $("div.currency_ind").addClass("hidden");
        $("div.currency_"+$(this).attr("type")).removeClass("hidden");
    });

    $("#wizard ul.tabs").each(function(){
        $(this).find("li:first").addClass("active");
        $(this).next().show();
    });

    $("#wizard ul.tabs li").click(function() {
        $(this).parent().find("li").removeClass("active");
        $(this).addClass("active");
        $(this).parent().parent().find("div.wizard_tab_content").hide();
        $(this).parent().parent().find("div.wizard_tab_content").filter("."+$(this).attr("tab")).show();;
    });

    $("#wizard_profit ul.tabs li[tab=moneyback]").click(function() {
        var first_deposit = $(this).parents("div.wizard").find("div.wizard_tab_content.moneyback").find("table.deposits").find("tr.row:not(.disabled):first");

        $(this).parents("div.wizard").find("div.wizard_tab_content.moneyback").find("div.wizard_result a.link").attr("href", first_deposit.find("td:first a").attr("href"));
        $(this).parents("div.wizard").find("div.wizard_tab_content.moneyback").find("div.wizard_result a.link").text(first_deposit.find("td:first a").text());

        $(this).parents("div.wizard").find("div.wizard_tab_content.moneyback").find("div.wizard_result .text2 span").text(first_deposit.find("td:eq(2)").text());
    });
    $("#wizard_period ul.tabs li[tab=moneyback]").click(function() {
        var first_deposit = $(this).parents("div.wizard").find("div.wizard_tab_content.moneyback").find("table.period").find("tr.row:not(.disabled):first");

        $(this).parents("div.wizard").find("div.wizard_tab_content.moneyback").find("div.wizard_result a.link").attr("href", first_deposit.find("td:first a").attr("href"));
        $(this).parents("div.wizard").find("div.wizard_tab_content.moneyback").find("div.wizard_result a.link").text(first_deposit.find("td:first a").text());

        $(this).parents("div.wizard").find("div.wizard_tab_content.moneyback").find("div.wizard_result .text2 span").text(first_deposit.find("td:eq(2)").text());
    });
    $("#wizard_regular ul.tabs li[tab=moneyback]").click(function() {
        var first_deposit = $(this).parents("div.wizard").find("div.wizard_tab_content.moneyback").find("table.regular").find("tr.row:not(.disabled):first");

        $(this).parents("div.wizard").find("div.wizard_tab_content.moneyback").find("div.wizard_result a.link").attr("href", first_deposit.find("td:first a").attr("href"));
        $(this).parents("div.wizard").find("div.wizard_tab_content.moneyback").find("div.wizard_result a.link").text(first_deposit.find("td:first a").text());

        $(this).parents("div.wizard").find("div.wizard_tab_content.moneyback").find("div.wizard_result .text2 span").text(first_deposit.find("td:eq(2)").text());
    });
    $("#wizard_flexible ul.tabs li[tab=moneyback]").click(function() {
        var first_deposit = $(this).parents("div.wizard").find("div.wizard_tab_content.moneyback").find("table.deposits").find("tr.row:not(.disabled):first");

        $(this).parents("div.wizard").find("div.wizard_tab_content.moneyback").find("div.wizard_result a.link").attr("href", first_deposit.find("td:first a").attr("href"));
        $(this).parents("div.wizard").find("div.wizard_tab_content.moneyback").find("div.wizard_result a.link").text(first_deposit.find("td:first a").text());

        $(this).parents("div.wizard").find("div.wizard_tab_content.moneyback").find("div.wizard_result .text2 span").text(first_deposit.find("td:eq(2)").text());
    });

    $("#wizard_profit div.wizard_tab_content.refill a.nav.next").click(function() {
        var first_deposit = $(this).parents("div.wizard_tab_content").next().find("table.deposits").find("tr.row:not(.disabled):first");

        $(this).parents("div.wizard_tab_content").next().find("div.wizard_result a.link").attr("href", first_deposit.find("td:first a").attr("href"));
        $(this).parents("div.wizard_tab_content").next().find("div.wizard_result a.link").text(first_deposit.find("td:first a").text());

        $(this).parents("div.wizard_tab_content").next().find("div.wizard_result .text2 span").text(first_deposit.find("td:eq(2)").text());
    });
    $("#wizard_period div.wizard_tab_content.refill a.nav.next").click(function() {

        var first_deposit = $(this).parents("div.wizard_tab_content").next().find("table.period").find("tr.row:not(.disabled):first");

        $(this).parents("div.wizard_tab_content").next().find("div.wizard_result a.link").attr("href", first_deposit.find("td:first a").attr("href"));
        $(this).parents("div.wizard_tab_content").next().find("div.wizard_result a.link").text(first_deposit.find("td:first a").text());

        $(this).parents("div.wizard_tab_content").next().find("div.wizard_result .text2 span").text(first_deposit.find("td:eq(2)").text());
    });
    $("#wizard_regular div.wizard_tab_content.refill a.nav.next").click(function() {
        var first_deposit = $(this).parents("div.wizard_tab_content").next().find("table.regular").find("tr.row:not(.disabled):first");

        $(this).parents("div.wizard_tab_content").next().find("div.wizard_result a.link").attr("href", first_deposit.find("td:first a").attr("href"));
        $(this).parents("div.wizard_tab_content").next().find("div.wizard_result a.link").text(first_deposit.find("td:first a").text());

        $(this).parents("div.wizard_tab_content").next().find("div.wizard_result .text2 span").text(first_deposit.find("td:eq(2)").text());
    });
    $("#wizard_flexible div.wizard_tab_content.refill a.nav.next").click(function() {
        var first_deposit = $(this).parents("div.wizard_tab_content").next().find("table.deposits").find("tr.row:not(.disabled):first");

        $(this).parents("div.wizard_tab_content").next().find("div.wizard_result a.link").attr("href", first_deposit.find("td:first a").attr("href"));
        $(this).parents("div.wizard_tab_content").next().find("div.wizard_result a.link").text(first_deposit.find("td:first a").text());

        $(this).parents("div.wizard_tab_content").next().find("div.wizard_result .text2 span").text(first_deposit.find("td:eq(2)").text());
    });

    var wizard_currency_type = "";
    var wizard_currency_abbr = "";

    $("ul.radio").each(function(){
        $(this).find("li:first").addClass("active");

        $(this).append("<input type='hidden' name='"+$(this).attr("name")+"' id='"+$(this).attr("name")+"' value='"+$(this).find("li.active").attr("val")+"' />");
    });
    $("ul.radio li").click(function(){
        $(this).parent().find("li").removeClass("active");
        $(this).addClass("active");
        $("#"+$(this).parent().attr("name")).val($(this).attr("val"));

        if ('is_moneyback' == $(this).parent().attr("name")) {
            depositOptions.setMoneyback(((1 == $(this).attr("val")) ? '2days' : '1day'));
        }
    });

    wizard_currency_type = $("div.wizard_tab_content ul.radio.currency").find("li.active").attr("val");
    wizard_currency_abbr = $("div.wizard_tab_content ul.radio.currency").find("li.active").attr("abbr");

    $("div.wizard_tab_content div.summa_input.summa div.result span").text(wizard_currency_abbr);

    $("table.deposits").find("span").addClass("hidden");
    $("table.deposits").find("span."+wizard_currency_type).removeClass("hidden");

    $("#wizard_period div.wizard_tab_content ul.radio.currency li, " +
        "#wizard_regular div.wizard_tab_content ul.radio.currency li, " +
        "#wizard_profit div.wizard_tab_content ul.radio.currency li, " +
        "#wizard_flexible div.wizard_tab_content ul.radio.currency li").click(function(){
        wizard_currency_type = $(this).attr("val");
        wizard_currency_abbr = $(this).attr("abbr");

        $("div.wizard_tab_content div.summa_input div.result span, " +
            "div.wizard_tab_content div.refill_input div.result span").text(wizard_currency_abbr);

        $("table.period").find("span").addClass("hidden")
            .find("span."+wizard_currency_type).removeClass("hidden");

        change_profit();
        change_period();
        change_regular();

        $(this).parents("div.wizard_tab_content").parent().find("ul.tabs li.active").find("div.value").text( accounting.formatNumber(wizard_summa, 0, " ") +" "+ wizard_currency_abbr );

        depositOptions.setCurrency(wizard_currency_type);
    });

    /*
     * Переключение возможности пополнения вклада
     */
    $("#wizard_profit   div.wizard_tab_content.refill ul.radio li, " +
        "#wizard_flexible div.wizard_tab_content.refill ul.radio li, " +
        "#wizard_period   div.wizard_tab_content.refill ul.radio li, " +
        "#wizard_regular  div.wizard_tab_content.refill ul.radio li").click(function () {
        depositOptions.setRefill((0 < $(this).attr('val')));
    });

    /*
     * Переключение возможности капитализации процентов
     */
    $("#wizard_profit   div.wizard_tab_content.moneyback ul[name='is_plowback'].radio li, " +
        "#wizard_flexible div.wizard_tab_content.moneyback ul[name='is_plowback'].radio li, " +
        "#wizard_period   div.wizard_tab_content.moneyback ul[name='is_plowback'].radio li, " +
        "#wizard_regular  div.wizard_tab_content.moneyback ul[name='is_plowback'].radio li").click(function () {
        depositOptions.setPlowback($(this).attr('val'));
    });

    /* Твой оптимальный вклад */
    $("div.wizard_tab_content.moneyback ul.radio li").click(function(){
        $(this).parents("div.wizard_tab_content").parent().find("ul.tabs li.active").find("div.value").text( $(this).attr("tab_text") );

        var firstDeposit = $(this).parents("div.wizard_tab_content.moneyback").find("table.deposits").find("tr.row:not(.disabled):first");

        $(this).parents("div.wizard_tab_content.moneyback").find("div.wizard_result a.link").attr("href", firstDeposit.find("td:first a").attr("href"));
        $(this).parents("div.wizard_tab_content.moneyback").find("div.wizard_result a.link").text(firstDeposit.find("td:first a").text());

        $(this).parents("div.wizard_tab_content.moneyback").find("div.wizard_result .text2 span").text(firstDeposit.find("td:eq(2)").text());
    });

    $("table.deposits tr.disabled td a").live("click", function(){
        return false;
    });

    $("a.show_tab").click(function(){
        $(this).parents("div.wizard_tab_content").prev().find("li").removeClass("active");
        $(this).parents("div.wizard_tab_content").prev().find("li[tab="+$(this).attr("tab")+"]").addClass("active");

        $(this).parents("div.wizard_tab_content").hide();
        $(this).parents("div.wizard_tab_content").parent().find("div.wizard_tab_content").filter("."+$(this).attr("tab")).show();
        return false;
    });

    $("a.wizard_type_button").click(function(){
        $("#wizard_start_page").hide();
        $("#wizard_"+$(this).attr("page")).show();

        wizard_currency_type = $("#wizard_"+$(this).attr("page")).find("div.wizard_tab_content ul.radio.currency").find("li.active").attr("val");
        wizard_currency_abbr = $("#wizard_"+$(this).attr("page")).find("div.wizard_tab_content ul.radio.currency").find("li.active").attr("abbr");

        $("#wizard_"+$(this).attr("page")).find("div.wizard_tab_content div.summa_input.summa div.result span").text(wizard_currency_abbr);

        $("#wizard_"+$(this).attr("page")).find("table.deposits").find("span").addClass("hidden");
        $("#wizard_"+$(this).attr("page")).find("table.deposits").find("span."+wizard_currency_type).removeClass("hidden");

        depositOptions.setGoal($(this).attr("page"));

        return false;
    });

    $("#wizard div.wizard_tab_content a.nav.start").click(function(){
        $("div.wizard").hide();
        $("#wizard_start_page").show();

        return false;
    });
    $("#wizard div.wizard_tab_content a.nav.next").click(function(){
        var curent_tab = $(this).parents("div.wizard_tab_content").parent().find("ul.tabs li.active");
        $(curent_tab).removeClass("active");
        $(curent_tab).next().addClass("active");

        $(this).parents("div.wizard_tab_content").hide();
        $(this).parents("div.wizard_tab_content").parent().find("div.wizard_tab_content").filter("."+$(curent_tab).next().attr("tab")).show();

        return false;
    });
    $("#wizard div.wizard_tab_content a.nav.prev").click(function(){
        var curent_tab = $(this).parents("div.wizard_tab_content").parent().find("ul.tabs li.active");
        $(curent_tab).removeClass("active");
        $(curent_tab).prev().addClass("active");

        $(this).parents("div.wizard_tab_content").hide();
        $(this).parents("div.wizard_tab_content").parent().find("div.wizard_tab_content").filter("."+$(curent_tab).prev().attr("tab")).show();
        return false;
    });

    function setSlider (oSlide, summa) {
        $('li', oSlide).each(function () {
            if (summa * 1 <= $(this).attr("val") * 1) {
                var li_position = ($(this).index()-1) * 100;
                var extra_offset = parseInt((summa - $(this).prev().attr("val"))*100/($(this).attr("val") - $(this).prev().attr("val")));

                if (isNaN(li_position) || 0 > li_position) {
                    li_position = 0;
                }

                if (isNaN(extra_offset) || 0 > extra_offset) {
                    extra_offset = 0;
                }

                $(oSlide).find("div.slider").css("left", li_position*1+extra_offset*1-27);

                return false;
            }
        });
    }

    var wizard_summa = 0;
    var wizard_period = 0;

    var wizard_diff_summa_deposit = 0;
    var wizard_diff_summa_summa = 0;
    var wizard_diff_summa = 0;

    var wizard_regular = 0;
    var wizard_regular_period = 0;

    $("ul.slide").each(function(){
        $(this).find("li:last").addClass("last");
        $(this).find("li").each(function(){
            $(this).addClass($(this).attr("color"));

            $(this).html("<div class='labels'>"+$(this).text()+"</div>");
            if($(this).attr("text")) $(this).append("<div class='text'>"+$(this).attr("text")+"</div>");
        });
        $(this).append("<div class='slider'></div>");

        $(this).next().find("input").val(accounting.formatNumber($(this).attr("default_value"), 0, " "));
        setSlider($(this), $(this).attr("default_value"));

        if($(this).parents("div.wizard_tab_content").hasClass("summa")){
            wizard_summa = $(this).attr("default_value");

            $(this).parents("div.wizard_tab_content").parent().find("ul.tabs li[tab=summa]").find("div.value").text( wizard_summa +" "+ wizard_currency_abbr );
        }
        if($(this).parents("div.wizard_tab_content").hasClass("period")){
            wizard_period = $(this).attr("default_value");

            $(this).parents("div.wizard_tab_content").parent().find("ul.tabs li[tab=period]").find("div.value").text( wizard_period +" дней");
        }
        if($(this).parents("div.wizard_tab_content").hasClass("summa2")){
            wizard_diff_summa_deposit = $("#period_summa_1").val().replace(new RegExp(" ",'g'), "");
            wizard_diff_summa_summa = $("#period_summa_2").val().replace(new RegExp(" ",'g'), "");
            wizard_diff_summa = wizard_diff_summa_summa - wizard_diff_summa_deposit;
            if(wizard_diff_summa<0) wizard_diff_summa=0;

            $(this).parents("div.wizard_tab_content").parent().find("ul.tabs li.active").find("div.value").text( accounting.formatNumber(wizard_diff_summa, 0, " ") +" "+ wizard_currency_abbr );

        }
        if($(this).parents("div.wizard_tab_content").hasClass("regular")){
            wizard_regular = $(this).attr("default_value");

            $(this).parents("div.wizard_tab_content").parent().find("ul.tabs li[tab=regular]").find("div.value").text( wizard_regular +" "+ wizard_currency_abbr );
        }
        if($(this).parents("div.wizard_tab_content").hasClass("regular_period")){
            wizard_regular_period = $(this).attr("default_value");

            $(this).parents("div.wizard_tab_content").parent().find("ul.tabs li[tab=regular_period]").find("div.value").text( wizard_regular_period +" дней");
        }
    });

    /* Формула расчета начисления простых процентов без капитализации и пополнения */
    var profitSimpleNoReplenishment = function (startAmt, monthlyPercent, months) {
        return startAmt + startAmt * (1 + monthlyPercent / 100 * months);
    };

    /* Формула расчета начисления сложных процентов (с капитализацией) и без пополнения */
    var profitComplexNoReplenishment = function (startAmt, monthlyPercent, months) {
        return startAmt + startAmt * Math.pow(1 + monthlyPercent / 100, months);
    };

    /* Формула расчета начисления простых процентов c пополнением */
    var profitSimpleWithReplenishment = function (startAmt, monthlyPercent, months, replenishment) {
        var partNo1 = startAmt * (1 + monthlyPercent / 100 * months),
            partNo2 = 0;

        for (var t = 1; t < months; t++) {
            partNo2 += parseFloat(replenishment * (1 + ((monthlyPercent / 100 * 12) * ((months - t) / 12))));
        }

        return startAmt + partNo1 + partNo2;
    };

    /* Формула расчета начисления сложных процентов (с капитализацией) c пополнением */
    var profitComplexWithReplenishment = function (startAmt, monthlyPercent, months, replenishment) {
        var partNo1 = startAmt * Math.pow(1 + monthlyPercent / 100, months),
            partNo2 = 0;

        for (var t = 1; t < months; t++) {
            partNo2 += parseFloat(replenishment * Math.pow(1 + monthlyPercent / 100, months - t));
        }

        return startAmt + partNo1 + partNo2;
    };

    /* Формула расчета продолжительности депозита (в месяцах) для накопления определенной суммы */
    var getDurationToAccumulateAmount = function (startAmt, endAmt, yearlyPercent, isReplenished, replenishAmt)
    {
        return Math.log((endAmt + (isReplenished ? replenishAmt : 0) * 12 / (yearlyPercent / 100)) / (startAmt + (isReplenished ? replenishAmt : 0) * 12 / (yearlyPercent / 100))) / Math.log(1 + (yearlyPercent / 100) / 12);
    };

    var change_profit = function () {
        var startAmt = depositOptions.getInitialAmount(),
            monthlyPercent = 1.5,
            months = depositOptions.getDuration() / 30,
            monthlyReplenishment = depositOptions.getRefillAmount(),
            formula = null,
            formulaArgs = [];

        if (depositOptions.getRefill() && (2 > depositOptions.getPlowback())) {
            formula = profitSimpleWithReplenishment;
            formulaArgs = [startAmt, monthlyPercent, months, monthlyReplenishment];
        } else if (!depositOptions.getRefill() && (2 == depositOptions.getPlowback())) {
            formula = profitComplexNoReplenishment;
            formulaArgs = [startAmt, monthlyPercent, months];
        } else if (depositOptions.getRefill() && (2 == depositOptions.getPlowback())) {
            formula = profitComplexWithReplenishment;
            formulaArgs = [startAmt, monthlyPercent, months, monthlyReplenishment];
        } else {
            formula = profitSimpleNoReplenishment;
            formulaArgs = [startAmt, monthlyPercent, months];
        }

        $("table.deposits.profit").each(function () {
            $(this).find("tr.row").each(function (i, r) {
                formulaArgs[1] = parseFloat($('td.percent span.' + wizard_currency_type, this).text().replace(',', '.')) / 12;

                var profit = formula.apply($, formulaArgs);

                $(this).find('td.profit').text(
                    accounting.formatNumber(profit - startAmt, 0, " ") + ' ' + wizard_currency_abbr
                );

                // Пересчитываем курсы на подборе валют
                var depoNum = i + 1,
                    percentsUah = parseFloat($('td.percent span.uah', this).text().replace(',', '.')) / 12,
                    percentsUsd = parseFloat($('td.percent span.usd', this).text().replace(',', '.')) / 12,
                    percentsEur = parseFloat($('td.percent span.eur', this).text().replace(',', '.')) / 12;

                formulaArgs[1] = percentsUah;
                var profitUah = formula.apply($, formulaArgs);

                formulaArgs[1] = percentsUsd;
                var profitUsd = formula.apply($, formulaArgs);

                formulaArgs[1] = percentsEur;
                var profitEur = formula.apply($, formulaArgs);

                var countEqualRatio = function (ratioStart, profitOriginalCurrency, profitForeignCurrency) {
                    return ratioStart * profitOriginalCurrency / profitForeignCurrency;
                };

                var newRatioUSD = countEqualRatio(currencyRates.usd, profitUah, profitUsd);
                var newRatioEUR = countEqualRatio(currencyRates.eur, profitUah, profitEur);
                $('.wizard_tab_content.currency table.deposits').each(function () {
                    $('tr:eq(' + depoNum + ') > td:eq(1)', this).text(
                        accounting.formatNumber(percentsUah * 12, 2, " ") + '%'
                    );

                    $('tr:eq(' + depoNum + ') > td:eq(2)', this).text(
                        '>' + accounting.formatNumber(newRatioUSD, 2, " ")
                    );

                    $('tr:eq(' + depoNum + ') > td:eq(3)', this).text(
                        '>' + accounting.formatNumber(newRatioEUR, 2, " ")
                    );
                });
            });
        });
    };

    change_profit();

    function PluralNumber(count, arg1, arg2, arg5) {
        var last_digit = count % 10;
        var last_two_digits = count % 100;
        if (last_digit == 1 && last_two_digits != 11) result = arg1;
        else if ((last_digit == 2 && last_two_digits != 12)
            || (last_digit == 3 && last_two_digits != 13)
            || (last_digit == 4 && last_two_digits != 14))
            result = arg2;
        else
            result = arg5;
        return result;
    }

    function change_period(){
        $("table.deposits.period").each(function () {
            $(this).find("tr.row").each(function(){
                var monthsCount = Math.round(getDurationToAccumulateAmount(
                    depositOptions.getInitialAmount(),
                    depositOptions.getDesiredAmount(),
                    parseFloat($(this).find("td.percent span." + wizard_currency_type).text().replace(",", ".")),
                    depositOptions.getRefill(),
                    depositOptions.getRefillAmount()
                ));

                $(this).find("td.period").text(
                    monthsCount + " " + PluralNumber(monthsCount, "месяц", "месяца", "месяцев")
                );
            });
        });
    }
    change_period();

    function change_regular () {
        $("table.deposits.regular").each(function(){
            $(this).find("tr.row").each(function () {
                var percent = parseFloat($(this).find("td.percent span." + wizard_currency_type).text().replace(",", "."));
                var vklad = wizard_regular * 12 / (percent / 100);

                $(this).find("td.regular").text( accounting.formatNumber(vklad, 0, " ")+" "+wizard_currency_abbr );
            });
        });
    }
    change_regular();


    var position_coursor_on_wizard_slider = 0,
        is_mouse_dowm_on_wizard_slider = false,
        activeSlider = null,
        tracMousemove = true,
        sliderEventsCallbackInterval = null;

    $("ul.slide li").live("mousedown",function (e) {
        var new_slider_position = e.pageX-$(this).parent().offset().left - 27;
        activeSlider = $(this).parents("ul.slide").find("div.slider");
        activeSlider.css("left", new_slider_position);

        is_mouse_dowm_on_wizard_slider = true;
        position_coursor_on_wizard_slider = 28;

        var current_li_pos = parseInt((new_slider_position+27+100)/100)-1;

        var current_li = $(this).parents("ul.slide").find("li").eq(current_li_pos);

        var current_li_step = current_li.attr("step");
        var current_li_val = parseInt(current_li.attr("val"), 10);
        var next_li_val = current_li.next().attr("val");

        var count_steps = parseInt((next_li_val-current_li_val)/current_li_step);

        var current_li_offset_left = current_li.offset().left-$(this).parent().offset().left;

        if(current_li_pos+1<current_li.parent().find("li").size()){
            var summa = current_li_val + parseInt((new_slider_position+27-current_li_offset_left)/(100/count_steps))*current_li_step;
        }else{
            var summa = current_li_val;
        }

        $(this).parents("ul.slide").next().find("input").val(accounting.formatNumber(summa, 0, " "));

        if($(this).parents("div.wizard_tab_content").hasClass("summa")){
            wizard_summa = summa;
            $(this).parents("div.wizard_tab_content").parent().find("ul.tabs li.active").find("div.value").text( $("div.wizard_tab_content.summa").find("ul.slide").next().find("input").val() +" "+ wizard_currency_abbr );

            depositOptions.setInitialAmount(summa);

            change_profit();
        }
        if($(this).parents("div.wizard_tab_content").hasClass("period")){
            wizard_period = summa;
            $(this).parents("div.wizard_tab_content").parent().find("ul.tabs li.active").find("div.value").text( $("div.wizard_tab_content.period").find("ul.slide").next().find("input").val() +" дней");

            depositOptions.setDuration(summa);

            $(depositOptions).trigger('changed:duration');

            change_profit();
        }
        if($(this).parents("div.wizard_tab_content").hasClass("regular_period")){
            wizard_period = summa;
            $(this).parents("div.wizard_tab_content").parent().find("ul.tabs li.active").find("div.value").text(summa +" дней");

            depositOptions.setDuration(summa);

            $(depositOptions).trigger('changed:duration');

            change_profit();
        }
        if($(this).parents("div.wizard_tab_content").hasClass("summa2")){
            wizard_diff_summa_deposit = $("#period_summa_1").val().replace(new RegExp(" ",'g'), "");
            wizard_diff_summa_summa = $("#period_summa_2").val().replace(new RegExp(" ",'g'), "");
            wizard_diff_summa = wizard_diff_summa_summa - wizard_diff_summa_deposit;
            if(wizard_diff_summa<0)wizard_diff_summa=0;

            $(this).parents("div.wizard_tab_content").parent().find("ul.tabs li.active").find("div.value").text( accounting.formatNumber(wizard_diff_summa, 0, " ") +" "+ wizard_currency_abbr );

            depositOptions.setDesiredAmount(summa);

            change_period();
        }
        if($(this).parents("div.wizard_tab_content").hasClass("regular")){
            wizard_regular = summa;
            $(this).parents("div.wizard_tab_content").parent().find("ul.tabs li.active").find("div.value").text( $("div.wizard_tab_content.regular").find("ul.slide").next().find("input").val() +" "+ wizard_currency_abbr );

            depositOptions.setRefillAmount(summa);

            change_regular();
        }

    });

    var stopSlider = function () {
        is_mouse_dowm_on_wizard_slider = false;
        position_coursor_on_wizard_slider = 0;

        var eventName = 'changed:';
        if (0 < activeSlider.parents('.period, .regular_period').size()) {
            eventName = 'changed:duration';
        }

        activeSlider = null;

        if (sliderEventsCallbackInterval) {
            window.clearInterval(sliderEventsCallbackInterval);
        }

        $('body')
            .unbind('mousemove', trackSliderMove)
            .unbind('mouseup', stopSlider)
            .unbind('mouseleave');

        $(depositOptions).trigger(eventName);
    };

    $("ul.slide div.slider").bind('mousedown', function (e) {
        e.stopPropagation();

        is_mouse_dowm_on_wizard_slider = true;

        $(this).css("z-index", "100");
        position_coursor_on_wizard_slider = e.pageX-$(this).offset().left;

        // cancel out any text selections
        document.body.focus();

        // prevent text selection in IE
        document.onselectstart = function () { return false; };
        // prevent IE from trying to drag an image
        $('#slider').ondragstart = function() { return false; };

        activeSlider = $(this);

        sliderEventsCallbackInterval = window.setInterval(function () {
            tracMousemove = true;
        }, 150);

        $('body')
            .bind('mousemove', trackSliderMove)
            .bind('mouseup mouseleave', stopSlider);

        // prevent text selection (except IE)
        return false;
    });

    var trackSliderMove = function (e) {
        if (is_mouse_dowm_on_wizard_slider && 0 < activeSlider.size()) {
            var slider = activeSlider;
            if ((e.pageX-slider.parent().offset().left-position_coursor_on_wizard_slider)+27>0 &&
                (e.pageX-slider.parent().offset().left-position_coursor_on_wizard_slider+27)<slider.parent().width()) {

                var new_slider_position = e.pageX-slider.parent().offset().left-position_coursor_on_wizard_slider;
                slider.css("left",new_slider_position);

                var current_li_pos = parseInt((new_slider_position+27+100)/100)-1;

                var current_li = slider.parents("ul.slide").find("li").eq(current_li_pos);

                var current_li_step = current_li.attr("step");
                var current_li_val = parseInt(current_li.attr("val"), 10);
                var next_li_val = current_li.next().attr("val");

                var count_steps = parseInt((next_li_val-current_li_val)/current_li_step);
                var current_li_offset_left = current_li.offset().left-slider.parent().offset().left;

                if (current_li_pos+1<current_li.parent().find("li").size()) {
                    var summa = current_li_val + parseInt((new_slider_position+27-current_li_offset_left)/(100/count_steps))*current_li_step;
                } else {
                    var summa = current_li_val;
                }

                if (tracMousemove) {
                    tracMousemove = false;
                } else {
                    return;
                }

                slider.parents("ul.slide").next().find("input").val(accounting.formatNumber(summa, 0, " "));

                if(slider.parents("div.wizard_tab_content").hasClass("summa")){
                    wizard_summa = summa;
                    depositOptions.setInitialAmount(summa);
                    change_profit();
                }

                if (slider.parents("div.wizard_tab_content").hasClass("period") ||
                    slider.parents("div.wizard_tab_content").hasClass("regular_period")){

                    wizard_period = summa;
                    depositOptions.setDuration(summa);
                    change_profit();
                    change_regular();
                }

                if(slider.parents("div.wizard_tab_content").hasClass("summa2")){
                    wizard_diff_summa_deposit = parseInt($("#period_summa_1").val().replace(new RegExp(" ",'g'), ""), 10);
                    wizard_diff_summa_summa = parseInt($("#period_summa_2").val().replace(new RegExp(" ",'g'), ""), 10);
                    wizard_diff_summa = wizard_diff_summa_summa - wizard_diff_summa_deposit;

                    depositOptions.setInitialAmount(wizard_diff_summa_deposit);
                    depositOptions.setDesiredAmount(wizard_diff_summa_summa);

                    if(wizard_diff_summa<0)wizard_diff_summa=0;

                    slider.parents("div.wizard_tab_content").parent().find("ul.tabs li.active").find("div.value").text( accounting.formatNumber(wizard_diff_summa, 0, " ") +" "+ wizard_currency_abbr );

                    change_period();
                }
                if(slider.parents("div.wizard_tab_content").hasClass("regular")){
                    wizard_regular = summa;
                    slider.parents("div.wizard_tab_content").parent().find("ul.tabs li.active").find("div.value").text( $("div.wizard_tab_content.regular").find("ul.slide").next().find("input").val() +" "+ wizard_currency_abbr );
                    change_regular();
                }
                if(slider.parents("div.wizard_tab_content").hasClass("regular_period")){
                    wizard_regular_period = summa;
                    slider.parents("div.wizard_tab_content").parent().find("ul.tabs li.active").find("div.value").text( wizard_regular_period +" дней");
                    change_profit();
                }

                if (0 < slider.parents("div.refill_input").size()) {
                    depositOptions.setRefillAmount(summa);
                }
            }
        }
    };

    $("ul.slide").next().find("input").focus(function(){
        $(this).val($(this).val().replace(" ", ""));
    });
    $("ul.slide").next().find("input").blur(function () {
        var min = $(this).parents("div.result").prev().find("li:first").attr("val");
        var max = $(this).parents("div.result").prev().find("li:last").attr("val");

        var summa = parseInt($(this).val());
        if(summa < min) summa = min;
        if(summa > max) summa = max;
        $(this).val(accounting.formatNumber(summa, 0, " "));

        setSlider($(this).parents("div.result").prev(), summa);

        if($(this).parents("div.wizard_tab_content").hasClass("summa")){
            wizard_summa = summa;
            depositOptions.setInitialAmount(summa);
            change_profit();
        }
        if($(this).parents("div.wizard_tab_content").hasClass("period")){
            wizard_period = summa;
            change_profit();
        }
        if($(this).parents("div.wizard_tab_content").hasClass("summa2")){
            wizard_diff_summa_deposit = parseInt($("#period_summa_1").val().replace(new RegExp(" ",'g'), ""), 10);
            wizard_diff_summa_summa = parseInt($("#period_summa_2").val().replace(new RegExp(" ",'g'), ""), 10);
            wizard_diff_summa = wizard_diff_summa_summa - wizard_diff_summa_deposit;

            depositOptions.setInitialAmount(wizard_diff_summa_deposit);
            depositOptions.setDesiredAmount(wizard_diff_summa_summa);

            if(wizard_diff_summa<0)wizard_diff_summa=0;

            $(this).parents("div.wizard_tab_content").parent().find("ul.tabs li.active").find("div.value").text( accounting.formatNumber(wizard_diff_summa, 0, " ") +" "+ wizard_currency_abbr );

            change_period();
        }
        if($(this).parents("div.wizard_tab_content").hasClass("regular")){
            wizard_regular = summa;
            $(this).parents("div.wizard_tab_content").parent().find("ul.tabs li.active").find("div.value").text( $("div.wizard_tab_content.regular").find("ul.slide").next().find("input").val() +" "+ wizard_currency_abbr );
            change_regular();
        }
        if($(this).parents("div.wizard_tab_content").hasClass("regular_period")){
            wizard_regular_period = summa;
            $(this).parents("div.wizard_tab_content").parent().find("ul.tabs li.active").find("div.value").text( wizard_regular_period +" дней");
            change_regular();
        }

        if (0 < $(this).parents("div.refill_input").size()) {
            depositOptions.setRefillAmount(summa);
        }
    });

    /**
     * Изменяется продолжительность вклада
     */
    $(depositOptions).on('change:duration', function (e, newDuration, stdDurationLabel) {

        /** Пересчитываем проценты */
        var assumeDays = 740;
        var edgeDays = [30,60,90,180,270,370,550,740,1110].reverse();

        for (var i = 0; i < edgeDays.length; i++) {
            if (edgeDays[i] >= newDuration) {
                assumeDays = edgeDays[i];
            } else break;
        }

        $.each(depositOptions.getDeposits(), function (depoId, depoData) {
            var percents = depoData.percents[assumeDays];
            if (undefined !== percents && $.isArray(percents)) {
                $.each(['uah', 'usd', 'eur'], function (i, curAbbr) {
                    var curIndex = (('eur' == curAbbr) ? 2 : (('usd' == curAbbr) ? 1 : 0));
                    $('td.percent.deposit' + depoId + ' > span.' + curAbbr).text(
                        accounting.formatNumber(percents[curIndex], 2, " ")
                    );
                });
            }
        });

        var tabValueContainer = $('li[tab="period"] div.value, li[tab="regular_period"] div.value');

        if (false === stdDurationLabel) {
            tabValueContainer.text(newDuration + ' дней');
        } else {
            tabValueContainer.text(stdDurationLabel);
        }

        setDepositsAvailability();
    });

    /**
     * Изменяется возможность выбора определенного депозита
     */
    $(depositOptions).on('change:deposit:availability', function (event, depoId) {
        var deposits = depositOptions.getDeposits();
        if (deposits[depoId]) {
            var rows = $("table.deposits tr.row[deposit_id='" + depoId.replace(/\D+/g, '') + "']");
            if (false == deposits[depoId].available) {
                rows.addClass('disabled');
            } else {
                rows.removeClass('disabled');
            }
        }
    });

    /**
     * Изменяется возможность пополнения вклада
     */
    $(depositOptions).on('change:refill', function (event, refill) {
        $("li[tab='refill']").find("div.value").text((refill ? 'буду пополнять' : 'не буду пополнять'));

        setDepositsAvailability();

        var refillSliderControls = $('.refill_input');
        if (refill) {
            refillSliderControls.css('visibility', 'visible');
        } else {
            refillSliderControls.css('visibility', 'hidden');
        }

        change_profit();
        change_period();
        change_regular();
    });

    /**
     * Изменяется режим получения вклада
     */
    $(depositOptions).on('change:moneyback', function (event, moneyback) {
        setDepositsAvailability();
    });

    /**
     * Изменяется изначальная сумма депозита или желаемая сумма к получению
     */
    var onAmountChange = function (event, amt, type) {
        if ($('#wizard_period').is(':visible') &&
            depositOptions.getInitialAmount() > depositOptions.getDesiredAmount()) {

            alert('Неверно указана ' + (('initial' == type) ? 'сумма вклада' : 'желаемая сумма'));

            $('#period_summa_1').val('10000').blur();
            $('#period_summa_2').val('100000').blur();
        }
    };
    $(depositOptions).on('change:amount:initial', onAmountChange);
    $(depositOptions).on('change:amount:desired', onAmountChange);
    $(depositOptions).on('change:amount:initial', function (e, amt) {
        $('li[tab="summa"] div.value').text(
            accounting.formatNumber(amt, 0, " ") + ' ' + wizard_currency_abbr
        );
    });

    $(depositOptions).on('change:amount:refill', function (event, amt, type) {
        if (depositOptions.getRefill()) {
            change_profit();
            change_period();
            change_regular();
        }
    });

    /**
     * Изменяется возможность капитализации процентов по вкладу
     */
    $(depositOptions).on('change:plowback', function (event, plowback) {
        setDepositsAvailability();
        change_profit();

        /* Отмечаем активный чекбокс на всех вкладках */
        $("ul[name='is_plowback'].radio li, " +
            "ul[name='is_plowback'].radio li, " +
            "ul[name='is_plowback'].radio li, " +
            "ul[name='is_plowback'].radio li").removeClass('active');
        $("ul[name='is_plowback'].radio li[val='" + plowback + "'], " +
            "ul[name='is_plowback'].radio li[val='" + plowback + "'], " +
            "ul[name='is_plowback'].radio li[val='" + plowback + "'], " +
            "ul[name='is_plowback'].radio li[val='" + plowback + "']").addClass('active');
    });

    depositOptions.setDuration(90);
    depositOptions.setRefillAmount(1000);

    $(depositOptions).on('changed:duration', function () {
        if ('flexible' != depositOptions.getGoal()) {
            var actualDuration = depositOptions.getDuration();
            var stdDuration = depositOptions.getStdDuration(actualDuration);
            if (actualDuration != stdDuration) {
                depositOptions.setDuration(stdDuration);
                setSlider($(".wizard_tab_content.period ul.slide"), stdDuration);
                setSlider($(".wizard_tab_content.regular_period ul.slide"), stdDuration);
            }
        }
    });

    $(depositOptions).on('change:currency', function (event, currency) {
        $('span.uah, span.usd, span.eur').hide();
        $('span.' + currency).show();

        $("#wizard_period div.wizard_tab_content ul.radio.currency li, " +
            "#wizard_regular div.wizard_tab_content ul.radio.currency li, " +
            "#wizard_profit div.wizard_tab_content ul.radio.currency li, " +
            "#wizard_flexible div.wizard_tab_content ul.radio.currency li").removeClass('active');
        $("#wizard_period div.wizard_tab_content ul.radio.currency li[val='" + currency + "'], " +
            "#wizard_regular div.wizard_tab_content ul.radio.currency li[val='" + currency + "'], " +
            "#wizard_profit div.wizard_tab_content ul.radio.currency li[val='" + currency + "'], " +
            "#wizard_flexible div.wizard_tab_content ul.radio.currency li[val='" + currency + "']").addClass('active');

        $(':hidden[name="wizard_summa_currency"]').val(currency);
    });

    $(depositOptions).on('change:goal', function (e, goal) {
        if ('period' == goal) {
            depositOptions.setDuration(370);
        }
    });

});
