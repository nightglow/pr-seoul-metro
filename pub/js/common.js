
$(function () {
     
    $("#header").load("../../html/header.html");

    Tab.init();
    DragDrop.init('#drag_drop');


    const bannerSwiper = new Swiper('.banner-swiper', {
        loop: true,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true
        }
    });
    
    password.init();
});


// Bottom Sheet
const BottomSheet = {
    getElements(id) {
        const dim = document.querySelector(`.dim[data-sheet="${id}"]`);
        return dim ? { dim, sheet: dim.querySelector('.sheet') } : null;
    },

    toggle(id, isShow) {
        const el = this.getElements(id);
        if (!el?.sheet) return;

        if (isShow) {
            el.dim.classList.add('act');
            setTimeout(() => el.sheet.classList.add('act'), 100);
        } else {
            el.sheet.classList.remove('act');
            setTimeout(() => el.dim.classList.remove('act'), 100);
        }
    },

    show(id) { this.toggle(id, true); },
    hide(id) { this.toggle(id, false); }
};


// tab
const Tab = {
    contents: null,
    nav: null,

    init: function () {
        this.nav = document.querySelector('.tab_nav');
        if(!this.nav) return;

        this.contents = document.querySelectorAll('div[id^="tab"]');
        this.bindEvents();
        this.showTab(this.nav.querySelector('a'));
    },

    showTab: function (link) {
        [...this.contents].map(div => div.style.display = 'none');
        this.nav.querySelector('.act')?.classList.remove('act');

        const target = document.querySelector(link.hash);
        if (target) target.style.display = 'block';
        link.classList.add('act');
    },

    bindEvents: function () {
        this.nav.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link) {
                e.preventDefault();
                this.showTab(link);
            }
        });
    }
};

// 
const Alert = {
    get: (id) => document.querySelector(`[data-alert="${id}"]`),
    open(id)  {this.get(id)?.classList.add('active');},
    close(id) {this.get(id)?.classList.remove('active');}
};


const Popup = {
    get: (id) => document.querySelector(`[data-popup="${id}"]`),
    open(id)  {this.get(id)?.classList.add('active');},
    close(id) {this.get(id)?.classList.remove('active');}
};


// 드래그엔 드롭
const DragDrop = {
    container: null,
    dragging: null,
    offsetX: 0,
    offsetY: 0,
    width: 0,

    init(selector) {
        this.container = document.querySelector(selector);
        if (!this.container) return;

        // 터치 이벤트
        this.container.addEventListener('touchstart', (e) => this.onStart(e), { passive: false });
        this.container.addEventListener('touchmove', (e) => this.onMove(e), { passive: false });
        this.container.addEventListener('touchend', (e) => this.onEnd(e));

        // 마우스 이벤트
        this.container.addEventListener('mousedown', (e) => this.onStart(e));
        document.addEventListener('mousemove', (e) => this.onMove(e));
        document.addEventListener('mouseup', (e) => this.onEnd(e));

        // 기본 드래그 방지
        this.container.addEventListener('dragstart', (e) => e.preventDefault());
    },

    getPointer(e) {return e.touches ? e.touches[0] : e;},
    getEndPointer(e) {return e.changedTouches ? e.changedTouches[0] : e;},

    onStart(e) {
        const item = e.target.closest('.app_item');
        if (!item) return;

        e.preventDefault();
        this.dragging = item;
        this.dragging.classList.add('dragging');

        const pointer = this.getPointer(e);
        const rect = item.getBoundingClientRect();

        this.offsetX = pointer.clientX - rect.left;
        this.offsetY = pointer.clientY - rect.top;
        this.width = rect.width;
    },

    onMove(e) {
        if (!this.dragging) return;
        e.preventDefault();

        const pointer = this.getPointer(e);

        this.dragging.style.position = 'fixed';
        this.dragging.style.left = `${pointer.clientX - this.offsetX}px`;
        this.dragging.style.top = `${pointer.clientY - this.offsetY}px`;
        this.dragging.style.width = `${this.width}px`;

        const target = this.getDropTarget(pointer.clientX, pointer.clientY);
        this.container.querySelectorAll('.app_item').forEach(el => el.classList.remove('over'));

        if (target && target !== this.dragging) {
            target.classList.add('over');
        }
    },

    onEnd(e) {
        if (!this.dragging) return;

        const pointer = this.getEndPointer(e);
        const target = this.getDropTarget(pointer.clientX, pointer.clientY);

        if (target && target !== this.dragging) {
            this.swapItems(this.dragging, target);
        }

        this.dragging.style.cssText = '';
        this.dragging.classList.remove('dragging');
        this.container.querySelectorAll('.app_item').forEach(el => el.classList.remove('over'));
        this.dragging = null;
    },

    getDropTarget(x, y) {
        const items = this.container.querySelectorAll('.app_item:not(.dragging)');
        for (const item of items) {
            const rect = item.getBoundingClientRect();
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                return item;
            }
        }
        return null;
    },

    swapItems(a, b) {
        const aNext = a.nextElementSibling === b ? a : a.nextElementSibling;
        b.parentNode.insertBefore(a, b);
        aNext ? b.parentNode.insertBefore(b, aNext) : b.parentNode.appendChild(b);
    }
};


// 패스워드
const password = {
    init() {
        this.bindEvents();
    },
    bindEvents() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn_pw');
            if (!btn) return;
            
            this.toggle(btn);
        });
    },
    toggle(btn) {
        const parent = btn.closest('div');
        const input = parent.querySelector('.inp_pw');
        
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        parent.classList.toggle('active', isPassword);
    }
};

//전체메뉴
$(document).ready(function () {

    var $menu = $("#all_menu");
    var DURATION = 400;

    function ensureDimmed() {
        var $dim = $(".dimmed");
        if ($dim.length) return $dim;

        // 필요할 때만 생성
        $dim = $('<div class="dimmed" aria-hidden="true"></div>');
        $("body").append($dim);

        // dimmed 클릭 시 닫기
        $dim.on("click", closeAllMenu);

        return $dim;
    }

    function slideTo(percent) {
        // percent: 0(열림) ~ 100(닫힘)
        $menu.stop(true, true).animate(
        { x: percent },
        {
            duration: DURATION,
            step: function (now) {
            $menu.css("transform", "translateX(" + now + "%)");
            }
        }
        );
    }

    function openAllMenu() {
        var $dim = ensureDimmed();
        $dim.stop(true, true).fadeIn(DURATION);
        slideTo(0);
        $("html, body").addClass("menu_open");
    }

    function closeAllMenu() {
        var $dim = $(".dimmed");
        if ($dim.length) {
        $dim.stop(true, true).fadeOut(DURATION, function () {
            // 완전히 필요 없으면 제거(원하면 제거하지 말고 유지해도 됨)
            $(this).remove();
        });
        }
        slideTo(100);
        $("html, body").removeClass("menu_open");
    }

    // 열기
    $(document).on("click", ".btn_hamburger", openAllMenu);

    // 닫기 버튼
    $(document).on("click", ".all_menu_close", closeAllMenu);

    // ESC 닫기
    $(document).on("keydown", function (e) {
        if (e.key === "Escape") closeAllMenu();
    });

    //큰글씨 스위치
    $('.swith_label.type02 .swith_check').on('change', function () {
        const $label = $(this).closest('.swith_label');
        const $span = $label.find('span');

        if ($(this).is(':checked')) {
            $span.text('일반');
        } else {
            $span.text('큰글');
        }
    });

    // 2depth 기본 닫힘
    $('.all_menu_2depth').hide();

    $('.all_menu_1depth > li > .item').on('click', function (e) {
        const $li = $(this).parent('li');
        const $subMenu = $li.children('.all_menu_2depth');

        // 2depth 없는 1depth는 아무 동작 안 함
        if ($subMenu.length === 0) return;

        e.preventDefault();

        // 다른 2depth 닫기 + active 제거
        $('.all_menu_2depth').not($subMenu).slideUp(200);
        $('.all_menu_1depth > li > .item').not(this).removeClass('active');

        // 현재 1depth만 active + 2depth 토글
        $(this).toggleClass('active');
        $subMenu.stop(true, true).slideToggle(200);
    });
});



