
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

    open(id) {
        this.get(id)?.classList.add('active');
    },

    close(id) {
        this.get(id)?.classList.remove('active');
    }
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

    getPointer(e) {
        return e.touches ? e.touches[0] : e;
    },

    getEndPointer(e) {
        return e.changedTouches ? e.changedTouches[0] : e;
    },

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
        this.toggleBtn = document.querySelector('.btn_pw');
        if (!this.toggleBtn) return;
        
        this.input = document.querySelector('.inp_pw');
        if (!this.input) return;
        
        this.bindEvents();
    },
    bindEvents() {
        this.toggleBtn.addEventListener('click', () => this.toggle());
    },
    toggle() {
        const isPassword = this.input.type === 'password';
        this.input.type = isPassword ? 'text' : 'password';
        this.toggleBtn.closest('.common_inp02').classList.toggle('active', isPassword);
    }
};


