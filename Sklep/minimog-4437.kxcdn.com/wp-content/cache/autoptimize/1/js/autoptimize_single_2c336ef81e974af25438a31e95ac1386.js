'use strict';
(function($) {
    var woosc_timer = 0;
    $(function() {
        woosc_load_color();
        woosc_change_count('first');
        woosc_check_buttons();
        woosc_hide_empty();
        woosc_hide_similarities();
        woosc_highlight_differences();
        if (woosc_vars.open_bar === 'yes') {
            woosc_load_bar('first');
        }
        $('.woosc-settings-fields').sortable({
            handle: '.label',
            update: function(event, ui) {
                woosc_save_settings();
            },
        });
    });
    $(document).on('click touch', '.woosc_table .woosq-btn, .woosc_table .woosq-link', function(e) {
        woosc_close_table();
        e.preventDefault();
    });
    $(document).on('click touch', '.woosc-table-settings', function() {
        $('.woosc-settings').toggleClass('open');
    });
    $(document).on('click touch', '.woosc-bar-share', function() {
        $('.woosc-share').toggleClass('open');
        $('.woosc-share-content').addClass('woosc-loading');
        var data = {
            action: 'woosc_share',
        };
        jQuery.post(woosc_vars.ajax_url, data, function(response) {
            $('.woosc-share-content').html(response).removeClass('woosc-loading');
        });
    });
    $(document).on('click touch', '#woosc_copy_url, #woosc_copy_btn', function(e) {
        woosc_copy_to_clipboard('#woosc_copy_url');
    });
    $(document).on('click touch', '.woosc-bar-search', function() {
        $('.woosc-search').toggleClass('open');
    });
    $(document).on('click touch', '.woosc-popup', function(e) {
        if ($(e.target).closest('.woosc-popup-content').length === 0) {
            $(this).toggleClass('open');
        }
    });
    $(document).on('keyup', '#woosc_search_input', function() {
        if ($('#woosc_search_input').val() !== '') {
            if (woosc_timer != null) {
                clearTimeout(woosc_timer);
            }
            woosc_timer = setTimeout(woosc_search, 300);
            return false;
        }
    });
    $(document).on('click touch', '.woosc-item-add', function() {
        var product_id = $(this).attr('data-id');
        $('.woosc-search').toggleClass('open');
        woosc_add_product(product_id);
        woosc_load_bar();
        woosc_load_table();
        woosc_open_table();
    });
    $(document).on('click touch', '.woosc-popup-close', function() {
        $(this).closest('.woosc-popup').toggleClass('open');
    });
    $(document).on('woovr_selected', function(e, selected) {
        var id = selected.attr('data-id');
        var pid = selected.attr('data-pid');
        if (id > 0) {
            $('.woosc-btn-' + pid).removeClass('woosc-btn-added woosc-added').attr('data-id', id);
        } else {
            $('.woosc-btn-' + pid).removeClass('woosc-btn-added woosc-added').attr('data-id', pid);
        }
    });
    $(document).on('found_variation', function(e, t) {
        var product_id = $(e['target']).attr('data-product_id');
        $('.woosc-btn-' + product_id).removeClass('woosc-btn-added woosc-added').attr('data-id', t.variation_id);
        if (woosc_vars.button_text_change === 'yes') {
            $('.woosc-btn-' + product_id).html(woosc_vars.button_text);
        }
    });
    $(document).on('reset_data', function(e) {
        var product_id = $(e['target']).attr('data-product_id');
        $('.woosc-btn-' + product_id).removeClass('woosc-btn-added woosc-added').attr('data-id', product_id);
        if (woosc_vars.button_text_change === 'yes') {
            $('.woosc-btn-' + product_id).html(woosc_vars.button_text);
        }
    });
    $(document).on('click touch', '.woosc-bar-remove', function() {
        var r = confirm(woosc_vars.remove_all);
        if (r == true) {
            woosc_remove_product('all');
            woosc_load_bar();
            woosc_load_table();
        }
    });
    $(document).on('click touch', '.woosc-btn', function(e) {
        var id = $(this).attr('data-id');
        var pid = $(this).attr('data-pid');
        var product_id = $(this).attr('data-product_id');
        if (typeof pid !== typeof undefined && pid !== false) {
            id = pid;
        }
        if (typeof product_id !== typeof undefined && product_id !== false) {
            id = product_id;
        }
        if ($(this).hasClass('woosc-btn-added woosc-added')) {
            if (woosc_vars.click_again === 'yes') {
                woosc_remove_product(id);
                woosc_load_bar();
                woosc_load_table();
            } else {
                if ($('.woosc-bar-items').hasClass('woosc-bar-items-loaded')) {
                    woosc_open_bar();
                } else {
                    woosc_load_bar();
                }
                if (!$('.woosc-table-items').hasClass('woosc-table-items-loaded')) {
                    woosc_load_table();
                }
            }
        } else {
            $(this).addClass('woosc-btn-adding woosc-adding');
            woosc_add_product(id);
            woosc_load_bar();
            woosc_load_table();
        }
        if (woosc_vars.open_table === 'yes') {
            woosc_toggle_table();
        }
        e.preventDefault();
    });
    $(document).on('click touch', '#woosc-area .woosc-bar-item-remove, #woosc-area .woosc-remove', function(e) {
        var product_id = $(this).attr('data-id');
        $(this).parent().addClass('removing');
        woosc_remove_product(product_id);
        woosc_load_bar();
        woosc_load_table();
        woosc_check_buttons();
        e.preventDefault();
    });
    $(document).on('click touch', '.woosc-page .woosc-remove', function(e) {
        e.preventDefault();
        var product_id = $(this).attr('data-id');
        woosc_remove_product(product_id);
        location.reload();
    });
    $(document).on('click touch', '.woosc-bar-btn', function() {
        woosc_toggle_table();
    });
    $(document).on('click touch', function(e) {
        if (((woosc_vars.click_outside === 'yes') || ((woosc_vars.click_outside === 'yes_empty') && (parseInt($('.woosc-bar').attr('data-count')) === 0))) && ($(e.target).closest('.wpc_compare_count').length === 0) && ($(e.target).closest('.woosc-popup').length === 0) && ($(e.target).closest('.woosc-btn').length === 0) && ($(e.target).closest('.woosc-table').length === 0) && ($(e.target).closest('.woosc-bar').length === 0) && ($(e.target).closest('.woosc-menu-item a').length === 0) && ((woosc_vars.open_button === '') || ($(e.target).closest(woosc_vars.open_button).length === 0))) {
            woosc_close();
        }
    });
    $(document).on('click touch', '#woosc-table-close', function() {
        woosc_close_table();
    });
    if (woosc_vars.open_button !== '') {
        $(document).on('click touch', woosc_vars.open_button, function(e) {
            if ((woosc_vars.open_button_action === 'open_page') && (woosc_vars.page_url !== '') && (woosc_vars.page_url !== '#')) {
                window.location.href = woosc_vars.page_url;
            } else {
                e.preventDefault();
                woosc_toggle();
            }
        });
    }
    $(document).on('change', '.woosc-settings-field', function() {
        woosc_save_settings();
    });
    $(document).on('change', '#woosc_highlight_differences', function() {
        $('.woosc-settings').toggleClass('open');
        woosc_highlight_differences();
    });
    $(document).on('change', '#woosc_hide_similarities', function() {
        $('.woosc-settings').toggleClass('open');
        woosc_hide_similarities();
    });
    $(document).on('click touch', '.woosc-menu-item a', function(e) {
        if (woosc_vars.menu_action === 'open_popup') {
            e.preventDefault();
            if ($('.woosc-bar-items').hasClass('woosc-bar-items-loaded')) {
                woosc_open_bar();
            } else {
                woosc_load_bar();
            }
            if (!$('.woosc-table-items').hasClass('woosc-table-items-loaded')) {
                woosc_load_table();
            }
            woosc_open_table();
        }
    });

    function woosc_search() {
        $('.woosc-search-result').html('').addClass('woosc-loading');
        woosc_timer = null;
        var data = {
            action: 'woosc_search',
            keyword: $('#woosc_search_input').val(),
        };
        $.post(woosc_vars.ajax_url, data, function(response) {
            $('.woosc-search-result').html(response).removeClass('woosc-loading');
        });
    }

    function woosc_set_cookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = 'expires=' + d.toUTCString();
        document.cookie = cname + '=' + cvalue + '; ' + expires + '; path=/';
    }

    function woosc_get_cookie(cname) {
        var name = cname + '=';
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return decodeURIComponent(c.substring(name.length, c.length));
            }
        }
        return '';
    }

    function woosc_get_products() {
        var cookie_products = woosc_get_cookie_products();
        if (woosc_get_cookie(cookie_products) != '') {
            return woosc_get_cookie(cookie_products);
        } else {
            return '';
        }
    }

    function woosc_save_products() {
        var cookie_products = woosc_get_cookie_products();
        var products = [];
        $('.woosc-bar-item').each(function() {
            var pid = $(this).attr('data-id');
            if (pid !== '') {
                products.push(pid);
            }
        });
        var products_str = products.join();
        woosc_set_cookie(cookie_products, products_str, 7);
        woosc_load_table();
    }

    function woosc_save_settings() {
        var fields = [];
        var cookie_fields = 'woosc_fields';
        if (woosc_vars.user_id !== '') {
            cookie_fields = 'woosc_fields_' + woosc_vars.user_id;
        }
        $('.woosc-settings-field').each(function() {
            var _val = $(this).val();
            if ($(this).prop('checked')) {
                fields.push(_val);
                $('.woosc_table .tr-' + _val).removeClass('tr-hide');
            } else {
                $('.woosc_table .tr-' + _val).addClass('tr-hide');
            }
        });
        woosc_set_cookie(cookie_fields, fields.join(','), 7);
        woosc_load_table();
    }

    function woosc_add_product(product_id) {
        var count;
        var limit = false;
        var limit_notice = woosc_vars.limit_notice;
        var cookie_products = woosc_get_cookie_products();
        if (woosc_get_cookie(cookie_products) !== '') {
            var products = woosc_get_cookie(cookie_products).split(',');
            if (products.length < woosc_vars.limit) {
                products = $.grep(products, function(value) {
                    return value != product_id;
                });
                products.unshift(product_id);
                var products_str = products.join();
                woosc_set_cookie(cookie_products, products_str, 7);
            } else {
                limit = true;
                limit_notice = limit_notice.replace('{limit}', woosc_vars.limit);
            }
            count = products.length;
        } else {
            woosc_set_cookie(cookie_products, product_id, 7);
            count = 1;
        }
        woosc_change_count(count);
        $(document.body).trigger('woosc_added', [count]);
        if (limit) {
            $('.woosc-btn[data-id="' + product_id + '"]').removeClass('woosc-btn-adding woosc-adding');
            alert(limit_notice);
        } else {
            $('.woosc-btn[data-id="' + product_id + '"]').removeClass('woosc-btn-adding woosc-adding').addClass('woosc-btn-added woosc-added');
            if (woosc_vars.button_text_change === 'yes') {
                $('.woosc-btn[data-id="' + product_id + '"]').html(woosc_vars.button_text_added);
                $(document.body).trigger('woosc_change_button_text', [product_id, woosc_vars.button_text_added]);
            }
        }
    }

    function woosc_remove_product(product_id) {
        var count = 0;
        var cookie_products = woosc_get_cookie_products();
        if (product_id !== 'all') {
            if (woosc_get_cookie(cookie_products) != '') {
                var products = woosc_get_cookie(cookie_products).split(',');
                products = $.grep(products, function(value) {
                    return value != product_id;
                });
                var products_str = products.join();
                woosc_set_cookie(cookie_products, products_str, 7);
                count = products.length;
            }
            $('.woosc-btn[data-id="' + product_id + '"]').removeClass('woosc-btn-added woosc-added');
            if (woosc_vars.button_text_change === 'yes') {
                $('.woosc-btn[data-id="' + product_id + '"]').html(woosc_vars.button_text);
                $(document.body).trigger('woosc_change_button_text', [product_id, woosc_vars.button_text]);
            }
        } else {
            if (woosc_get_cookie(cookie_products) != '') {
                woosc_set_cookie(cookie_products, '', 7);
                count = 0;
            }
            $('.woosc-btn').removeClass('woosc-btn-added woosc-added');
            if (woosc_vars.button_text_change === 'yes') {
                $('.woosc-btn').html(woosc_vars.button_text);
                $(document.body).trigger('woosc_change_button_text', ['all', woosc_vars.button_text]);
            }
        }
        woosc_change_count(count);
        $(document.body).trigger('woosc_removed', [count]);
    }

    function woosc_check_buttons() {
        var cookie_products = woosc_get_cookie_products();
        if (woosc_get_cookie(cookie_products) != '') {
            var products = woosc_get_cookie(cookie_products).split(',');
            $('.woosc-btn').removeClass('woosc-btn-added woosc-added');
            if (woosc_vars.button_text_change === 'yes') {
                $('.woosc-btn').html(woosc_vars.button_text);
                $(document.body).trigger('woosc_change_button_text', ['all', woosc_vars.button_text]);
            }
            products.forEach(function(entry) {
                $('.woosc-btn-' + entry).addClass('woosc-btn-added woosc-added');
                if (woosc_vars.button_text_change === 'yes') {
                    $('.woosc-btn-' + entry).html(woosc_vars.button_text_added);
                    $(document.body).trigger('woosc_change_button_text', [entry, woosc_vars.button_text_added]);
                }
            });
        }
    }

    function woosc_load_bar(open) {
        var data = {
            action: 'woosc_load_bar',
            products: woosc_get_products(),
        };
        $.post(woosc_vars.ajax_url, data, function(response) {
            if ((woosc_vars.hide_empty === 'yes') && ((response == '') || (response == 0))) {
                $('.woosc-bar-items').removeClass('woosc-bar-items-loaded');
                woosc_close_bar();
                woosc_close_table();
            } else {
                if ((typeof open == 'undefined') || ((open === 'first') && (woosc_vars.open_bar === 'yes'))) {
                    $('.woosc-bar-items').html(response).addClass('woosc-bar-items-loaded');
                    woosc_open_bar();
                }
            }
        });
    }

    function woosc_open_bar() {
        $('#woosc-area').addClass('woosc-area-open-bar');
        $('.woosc-bar').addClass('woosc-bar-open');
        $('.woosc-bar-items').sortable({
            handle: 'img',
            update: function(event, ui) {
                woosc_save_products();
            },
        });
        $(document.body).trigger('woosc_bar_open');
    }

    function woosc_close_bar() {
        $('#woosc-area').removeClass('woosc-area-open-bar');
        $('.woosc-bar').removeClass('woosc-bar-open');
        $(document.body).trigger('woosc_bar_close');
    }

    function woosc_load_table() {
        $('.woosc-table-inner').addClass('woosc-loading');
        var data = {
            action: 'woosc_load_table',
            products: woosc_get_products(),
        };
        $.post(woosc_vars.ajax_url, data, function(response) {
            $('.woosc-table-items').html(response).addClass('woosc-table-items-loaded');
            if ($(window).width() >= 768) {
                if ((woosc_vars.freeze_column === 'yes') && (woosc_vars.freeze_row === 'yes')) {
                    $('#woosc_table').tableHeadFixer({
                        'head': true,
                        left: 1
                    });
                } else if (woosc_vars.freeze_column === 'yes') {
                    $('#woosc_table').tableHeadFixer({
                        'head': false,
                        left: 1
                    });
                } else if (woosc_vars.freeze_row === 'yes') {
                    $('#woosc_table').tableHeadFixer({
                        'head': true
                    });
                }
            } else {
                if (woosc_vars.freeze_row === 'yes') {
                    $('#woosc_table').tableHeadFixer({
                        'head': true
                    });
                }
            }
            if (woosc_vars.scrollbar === 'yes') {
                $('.woosc-table-items').perfectScrollbar({
                    theme: 'wpc'
                });
            }
            $('.woosc-table-inner').removeClass('woosc-loading');
            woosc_hide_empty();
            woosc_hide_similarities();
            woosc_highlight_differences();
        });
    }

    function woosc_open_table() {
        $('#woosc-area').addClass('woosc-area-open-table');
        $('.woosc-table').addClass('woosc-table-open');
        $('.woosc-bar-btn').addClass('woosc-bar-btn-open');
        if (woosc_vars.bar_bubble === 'yes') {
            $('.woosc-bar').removeClass('woosc-bar-bubble');
        }
        if (!$.trim($('.woosc-table-items').html()).length) {
            woosc_load_table();
        }
        $(document.body).trigger('woosc_table_open');
    }

    function woosc_close_table() {
        $('#woosc-area').removeClass('woosc-area-open woosc-area-open-table');
        $('.woosc-table').removeClass('woosc-table-open');
        $('.woosc-bar-btn').removeClass('woosc-bar-btn-open');
        if (woosc_vars.bar_bubble === 'yes') {
            $('.woosc-bar').addClass('woosc-bar-bubble');
        }
        $(document.body).trigger('woosc_table_close');
    }

    function woosc_toggle_table() {
        if ($('.woosc-table').hasClass('woosc-table-open')) {
            woosc_close_table();
        } else {
            woosc_open_table();
        }
    }

    function woosc_open() {
        $('#woosc-area').addClass('woosc-area-open');
        woosc_load_bar();
        woosc_load_table();
        woosc_open_bar();
        woosc_open_table();
        $(document.body).trigger('woosc_open');
    }

    function woosc_close() {
        $('#woosc-area').removeClass('woosc-area-open');
        woosc_close_bar();
        woosc_close_table();
        $(document.body).trigger('woosc_close');
    }

    function woosc_toggle() {
        if ($('#woosc-area').hasClass('woosc-area-open')) {
            woosc_close();
        } else {
            woosc_open();
        }
        $(document.body).trigger('woosc_toggle');
    }

    function woosc_load_color() {
        var bg_color = $('#woosc-area').attr('data-bg-color');
        var btn_color = $('#woosc-area').attr('data-btn-color');
        $('.woosc-table').css('background-color', bg_color);
        $('.woosc-bar').css('background-color', bg_color);
        $('.woosc-bar-btn').css('background-color', btn_color);
    }

    function woosc_change_count(count) {
        if (count === 'first') {
            var products = woosc_get_products();
            if (products != '') {
                var products_arr = products.split(',');
                count = products_arr.length;
            } else {
                count = 0;
            }
        }
        $('.woosc-menu-item').each(function() {
            if ($(this).hasClass('menu-item-type-woosc')) {
                $(this).find('.woosc-menu-item-inner').attr('data-count', count);
            } else {
                $(this).addClass('menu-item-type-woosc').find('a').wrapInner('<span class="woosc-menu-item-inner" data-count="' + count + '"></span>');
            }
        });
        $('#woosc-area').attr('data-count', count);
        $('.woosc-bar').attr('data-count', count);
        $(document.body).trigger('woosc_change_count', [count]);
    }

    function woosc_hide_empty() {
        $('.woosc_table > tbody > tr').each(function() {
            var $tr = $(this);
            var _td = 0;
            var _empty = true;
            $tr.children('td').each(function() {
                if ((_td > 0) && ($(this).html().length > 0)) {
                    _empty = false;
                    return false;
                }
                _td++;
            });
            if (_empty) {
                $tr.addClass('tr-empty').remove();
            }
        });
    }

    function woosc_highlight_differences() {
        if ($('#woosc_highlight_differences').prop('checked')) {
            $('.woosc_table > tbody > tr').each(function() {
                var $tr = $(this);
                var _td = 0;
                var _val = $(this).children('td').eq(1).html();
                var _differences = false;
                $tr.children('td:not(.td-placeholder)').each(function() {
                    if ((_td > 1) && ($(this).html() !== _val)) {
                        _differences = true;
                        return false;
                    }
                    _td++;
                });
                if (_differences) {
                    $tr.addClass('tr-highlight');
                }
            });
        } else {
            $('.woosc_table tr').removeClass('tr-highlight');
        }
    }

    function woosc_hide_similarities() {
        if ($('#woosc_hide_similarities').prop('checked')) {
            $('.woosc_table > tbody > tr').each(function() {
                var $tr = $(this);
                var _td = 0;
                var _val = $(this).children('td').eq(1).html();
                var _similarities = true;
                $tr.children('td:not(.td-placeholder)').each(function() {
                    if ((_td > 1) && ($(this).html() !== _val)) {
                        _similarities = false;
                        return false;
                    }
                    _td++;
                });
                if (_similarities) {
                    $tr.addClass('tr-similar');
                }
            });
        } else {
            $('.woosc_table tr').removeClass('tr-similar');
        }
    }

    function woosc_copy_to_clipboard(el) {
        el = (typeof el === 'string') ? document.querySelector(el) : el;
        if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
            var editable = el.contentEditable;
            var readOnly = el.readOnly;
            el.contentEditable = true;
            el.readOnly = true;
            var range = document.createRange();
            range.selectNodeContents(el);
            var selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            el.setSelectionRange(0, 999999);
            el.contentEditable = editable;
            el.readOnly = readOnly;
        } else {
            el.select();
        }
        document.execCommand('copy');
        alert(woosc_vars.copied_text.replace('%s', el.value));
    }

    function woosc_get_cookie_products() {
        return woosc_vars.user_id !== '' ? 'woosc_products_' + woosc_vars.user_id : 'woosc_products';
    }
})(jQuery);