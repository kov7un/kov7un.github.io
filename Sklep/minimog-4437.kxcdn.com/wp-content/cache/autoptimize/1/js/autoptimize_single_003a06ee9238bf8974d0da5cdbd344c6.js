'use strict';
(function($) {
    $(function() {
        if (woosw_get_cookie('woosw_key') == '') {
            woosw_set_cookie('woosw_key', woosw_get_key(), 7);
        }
        if ($('.woosw-custom-menu-item').length) {
            woosw_load_count();
        }
    });
    $(document).on('woovr_selected', function(e, selected, variations) {
        var id = selected.attr('data-id');
        var pid = selected.attr('data-pid');
        if (id > 0) {
            $('.woosw-btn-' + pid).attr('data-id', id).removeClass('woosw-btn-added woosw-added');
        } else {
            $('.woosw-btn-' + pid).attr('data-id', pid).removeClass('woosw-btn-added woosw-added');
        }
    });
    $(document).on('found_variation', function(e, t) {
        var product_id = $(e['target']).attr('data-product_id');
        $('.woosw-btn-' + product_id).attr('data-id', t.variation_id).removeClass('woosw-btn-added woosw-added');
    });
    $(document).on('reset_data', function(e) {
        var product_id = $(e['target']).attr('data-product_id');
        $('.woosw-btn-' + product_id).attr('data-id', product_id).removeClass('woosw-btn-added woosw-added');
    });
    $(document).on('click touch', '#woosw_wishlist .woosq-link, #woosw_wishlist .woosq-btn', function(e) {
        woosw_wishlist_hide();
        e.preventDefault();
    });
    $(document).on('click touch', '.woosw-btn', function(e) {
        var $this = $(this);
        var id = $this.attr('data-id');
        var pid = $this.attr('data-pid');
        var product_id = $this.attr('data-product_id');
        if (typeof pid !== typeof undefined && pid !== false) {
            id = pid;
        }
        if (typeof product_id !== typeof undefined && product_id !== false) {
            id = product_id;
        }
        var data = {
            action: 'wishlist_add',
            product_id: id,
        };
        if ($this.hasClass('woosw-added')) {
            if (woosw_vars.button_action_added === 'page') {
                window.location.href = woosw_vars.wishlist_url;
            } else {
                if ($('#woosw_wishlist').hasClass('woosw-loaded')) {
                    woosw_wishlist_show();
                } else {
                    woosw_wishlist_load();
                }
            }
        } else {
            $this.addClass('woosw-adding');
            $.post(woosw_vars.ajax_url, data, function(response) {
                $this.removeClass('woosw-adding');
                response = JSON.parse(response);
                if (woosw_vars.button_action === 'list') {
                    $('#woosw_wishlist').removeClass('woosw-message');
                    if (response['content'] != null) {
                        $('#woosw_wishlist').html(response['content']).addClass('woosw-loaded');
                    }
                    if (response['notice'] != null) {
                        woosw_notice(response['notice']);
                    }
                    woosw_perfect_scrollbar();
                    woosw_wishlist_show();
                } else if (woosw_vars.button_action === 'message') {
                    $('#woosw_wishlist').addClass('woosw-message');
                    var message = '<div class="woosw-popup-inner"><div class="woosw-popup-content"><div class="woosw-popup-content-top"><span class="woosw-popup-close"></span></div><div class="woosw-popup-content-mid"><div class="woosw-popup-content-mid-message">';
                    if (response['image'] != null) {
                        message += '<img src="' + response['image'] + '"/>';
                    }
                    if (response['notice'] != null) {
                        message += '<span>' + response['notice'] + '</span>';
                    }
                    message += '</div></div></div></div>';
                    $('#woosw_wishlist').html(message).removeClass('woosw-loaded');
                    woosw_wishlist_show();
                } else if (woosw_vars.button_action === 'no') {
                    $('#woosw_wishlist').removeClass('woosw-loaded');
                }
                if (response['count'] != null) {
                    woosw_change_count(response['count']);
                }
                if (response['status'] === 1) {
                    $this.addClass('woosw-added').html(woosw_vars.button_text_added);
                }
                $(document.body).trigger('woosw_add', [id]);
            });
        }
        e.preventDefault();
    });
    $(document).on('click touch', '.woosw-item--remove span', function(e) {
        var $this = $(this);
        var key = $this.closest('.woosw-popup-inner').data('key');
        var $this_item = $this.closest('.woosw-item');
        var product_id = $this_item.attr('data-id');
        var data = {
            action: 'wishlist_remove',
            product_id: product_id,
            key: key,
        };
        $this.addClass('woosw-removing');
        $.post(woosw_vars.ajax_url, data, function(response) {
            $this.removeClass('woosw-removing');
            $this_item.remove();
            response = JSON.parse(response);
            if (response['status'] === 1) {
                $('.woosw-btn-' + product_id).removeClass('woosw-added').html(woosw_vars.button_text);
            }
            if (response['content'] != null) {
                $('#woosw_wishlist').html(response['content']).addClass('woosw-loaded');
            }
            if (response['notice'] != null) {
                woosw_notice(response['notice']);
            }
            if (response['count'] != null) {
                woosw_change_count(response['count']);
            }
            $(document.body).trigger('woosw_remove', [product_id]);
        });
        e.preventDefault();
    });
    $(document).on('click touch', '.woosw-empty', function(e) {
        var $this = $(this);
        if (confirm(woosw_vars.empty_confirm)) {
            woosw_popup_loading();
            var key = $this.closest('.woosw-popup-inner').data('key');
            var data = {
                action: 'wishlist_empty',
                key: key,
            };
            $.post(woosw_vars.ajax_url, data, function(response) {
                response = JSON.parse(response);
                if (response['status'] === 1) {
                    $('.woosw-btn').removeClass('woosw-added').html(woosw_vars.button_text);
                }
                if (response['content'] != null) {
                    $('#woosw_wishlist').html(response['content']).addClass('woosw-loaded');
                }
                if (response['notice'] != null) {
                    woosw_notice(response['notice']);
                }
                if (response['count'] != null) {
                    woosw_change_count(response['count']);
                }
                woosw_popup_loaded();
            });
        }
        $(document.body).trigger('woosw_empty', [key]);
        e.preventDefault();
    });
    $(document).on('click touch', '.woosw-popup', function(e) {
        var woosw_content = $('.woosw-popup-content');
        if ($(e.target).closest(woosw_content).length == 0) {
            woosw_wishlist_hide();
            woosw_manage_hide();
        }
    });
    $(document).on('click touch', '.woosw-continue', function(e) {
        var url = $(this).attr('data-url');
        woosw_wishlist_hide();
        if (url !== '') {
            window.location.href = url;
        }
        e.preventDefault();
    });
    $(document).on('click touch', '#woosw_wishlist .woosw-popup-close', function(e) {
        woosw_wishlist_hide();
        e.preventDefault();
    });
    $(document).on('click touch', '#woosw_manage .woosw-popup-close', function(e) {
        woosw_manage_hide();
        e.preventDefault();
    });
    $(document).on('click touch', '.woosw-manage', function(e) {
        e.preventDefault();
        woosw_popup_loading();
        var data = {
            action: 'manage_wishlists',
        };
        $.post(woosw_vars.ajax_url, data, function(response) {
            woosw_wishlist_hide();
            $('#woosw_manage').html(response);
            woosw_manage_show();
            woosw_popup_loaded();
        });
    });
    $(document).on('click touch', '#woosw_add_wishlist', function(e) {
        e.preventDefault();
        woosw_popup_loading();
        var name = $('#woosw_wishlist_name').val();
        var data = {
            action: 'add_wishlist',
            name: name,
        };
        $.post(woosw_vars.ajax_url, data, function(response) {
            $('#woosw_manage').html(response);
            $('#woosw_wishlist').removeClass('woosw-loaded');
            woosw_popup_loaded();
        });
    });
    $(document).on('click touch', '.woosw-set-default', function(e) {
        e.preventDefault();
        woosw_popup_loading();
        var key = $(this).data('key');
        var data = {
            action: 'set_default',
            key: key,
        };
        $.post(woosw_vars.ajax_url, data, function(response) {
            response = JSON.parse(response);
            if (response['count'] != null) {
                woosw_change_count(response['count']);
            }
            $('.woosw-btn').removeClass('woosw-added').html(woosw_vars.button_text);
            if ((response['products'] != null) && response['products'].length) {
                response['products'].forEach((product_id) => {
                    $('.woosw-btn-' + product_id).addClass('woosw-added').html(woosw_vars.button_text_added);
                });
            }
            $('#woosw_manage').html(response['content']);
            $('#woosw_wishlist').removeClass('woosw-loaded');
            woosw_popup_loaded();
        });
    });
    $(document).on('click touch', '.woosw-delete-wishlist', function(e) {
        e.preventDefault();
        if (confirm(woosw_vars.delete_confirm)) {
            woosw_popup_loading();
            var key = $(this).data('key');
            var data = {
                action: 'delete_wishlist',
                key: key,
            };
            $.post(woosw_vars.ajax_url, data, function(response) {
                $('#woosw_manage').html(response);
                $('#woosw_wishlist').removeClass('woosw-loaded');
                woosw_popup_loaded();
            });
        }
    });
    $(document).on('click touch', '.woosw-view-wishlist', function(e) {
        e.preventDefault();
        woosw_popup_loading();
        var key = $(this).data('key');
        var data = {
            action: 'view_wishlist',
            key: key,
        };
        $.post(woosw_vars.ajax_url, data, function(response) {
            woosw_manage_hide();
            $('#woosw_wishlist').removeClass('woosw-loaded').html(response);
            woosw_wishlist_show();
            woosw_popup_loaded();
        });
    });
    $(document).on('click touch', '.woosw-menu-item a', function(e) {
        e.preventDefault();
        if (woosw_vars.menu_action === 'open_popup') {
            if ($('#woosw_wishlist').hasClass('woosw-loaded')) {
                woosw_wishlist_show();
            } else {
                woosw_wishlist_load();
            }
        }
    });
    $(document).on('click touch', '#woosw_copy_url, #woosw_copy_btn', function(e) {
        e.preventDefault();
        woosw_copy_to_clipboard('#woosw_copy_url');
    });
    $(document).on('click touch', '.woosw-item--note', function() {
        if ($(this).closest('.woosw-item').find('.woosw-item--note-add').length) {
            $(this).closest('.woosw-item').find('.woosw-item--note-add').show();
            $(this).hide();
        }
    });
    $(document).on('click touch', '.woosw_add_note', function(e) {
        e.preventDefault();
        woosw_popup_loading();
        var $this = $(this);
        var key = $this.closest('.woosw-popup-inner').data('key');
        var product_id = $this.closest('.woosw-item').attr('data-id');
        var note = $this.closest('.woosw-item').find('input[type="text"]').val();
        var data = {
            action: 'add_note',
            woosw_key: key,
            product_id: product_id,
            note: woosw_html_entities(note),
        };
        $.post(woosw_vars.ajax_url, data, function(response) {
            $this.closest('.woosw-item').find('.woosw-item--note').html(response).show();
            $this.closest('.woosw-item').find('.woosw-item--note-add').hide();
            woosw_popup_loaded();
        });
    });

    function woosw_wishlist_load() {
        var data = {
            action: 'wishlist_load',
        };
        $.post(woosw_vars.ajax_url, data, function(response) {
            $('#woosw_wishlist').removeClass('woosw-message');
            response = JSON.parse(response);
            if (response['content'] != null) {
                $('#woosw_wishlist').html(response['content']);
            }
            if (response['count'] != null) {
                woosw_change_count(response['count']);
            }
            if (response['notice'] != null) {
                woosw_notice(response['notice']);
            }
            $('#woosw_wishlist').addClass('woosw-loaded');
            woosw_perfect_scrollbar();
            woosw_wishlist_show();
        });
    }

    function woosw_load_count() {
        var data = {
            action: 'wishlist_load_count',
        };
        $.post(woosw_vars.ajax_url, data, function(response) {
            response = JSON.parse(response);
            if (response['count'] != null) {
                var count = response['count'];
                woosw_change_count(count);
                $(document.body).trigger('woosw_load_count', [count]);
            }
        });
    }

    function woosw_wishlist_show() {
        $('#woosw_wishlist').addClass('woosw-show');
        if ($('#woosw_wishlist').hasClass('woosw-message')) {
            var woosw_counter = 6;
            var woosw_interval = setInterval(function() {
                woosw_counter--;
                $('.woosw-popup-close').html('Close in ' + woosw_counter + 's');
                if (woosw_counter === 0) {
                    woosw_wishlist_hide();
                    $('.woosw-popup-close').html('');
                    clearInterval(woosw_interval);
                }
            }, 1000);
        }
        $(document.body).trigger('woosw_wishlist_show');
    }

    function woosw_wishlist_hide() {
        $('#woosw_wishlist').removeClass('woosw-show');
        $(document.body).trigger('woosw_wishlist_hide');
    }

    function woosw_manage_show() {
        $('#woosw_manage').addClass('woosw-show');
        $(document.body).trigger('woosw_manage_show');
    }

    function woosw_manage_hide() {
        $('#woosw_manage').removeClass('woosw-show');
        $(document.body).trigger('woosw_manage_hide');
    }

    function woosw_popup_loading() {
        $('.woosw-popup').addClass('woosw-loading');
    }

    function woosw_popup_loaded() {
        $('.woosw-popup').removeClass('woosw-loading');
    }

    function woosw_change_count(count) {
        $('#woosw_wishlist .woosw-count').html(count);
        if (parseInt(count) > 0) {
            $('.woosw-empty').show();
        } else {
            $('.woosw-empty').hide();
        }
        if ($('.woosw-menu-item .woosw-menu-item-inner').length) {
            $('.woosw-menu-item .woosw-menu-item-inner').attr('data-count', count);
        } else {
            $('.woosw-menu-item a').html('<span class="woosw-menu-item-inner" data-count="' + count + '"><i class="woosw-icon"></i><span>' + woosw_vars.menu_text + '</span></span>');
        }
        $(document.body).trigger('woosw_change_count', [count]);
    }

    function woosw_notice(notice) {
        $('.woosw-notice').html(notice);
        woosw_notice_show();
        setTimeout(function() {
            woosw_notice_hide();
        }, 3000);
    }

    function woosw_notice_show() {
        $('#woosw_wishlist .woosw-notice').addClass('woosw-notice-show');
    }

    function woosw_notice_hide() {
        $('#woosw_wishlist .woosw-notice').removeClass('woosw-notice-show');
    }

    function woosw_perfect_scrollbar() {
        if (woosw_vars.perfect_scrollbar === 'yes') {
            jQuery('#woosw_wishlist .woosw-popup-content-mid').perfectScrollbar({
                theme: 'wpc'
            });
        }
    }

    function woosw_copy_url() {
        var wooswURL = document.getElementById('woosw_copy_url');
        wooswURL.select();
        document.execCommand('copy');
        alert(woosw_vars.copied_text + ' ' + wooswURL.value);
    }

    function woosw_copy_to_clipboard(el) {
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
        alert(woosw_vars.copied_text + ' ' + el.value);
    }

    function woosw_html_entities(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function woosw_get_key() {
        var result = [];
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < 6; i++) {
            result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
        }
        return result.join('');
    }

    function woosw_set_cookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = 'expires=' + d.toUTCString();
        document.cookie = cname + '=' + cvalue + '; ' + expires + '; path=/';
    }

    function woosw_get_cookie(cname) {
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
})(jQuery);