/* import */
$(function () {
    /* 헤더 */
    $("#header").load("../../html/admin/header.html");
});


/* lnb 아코디언 */
$(function () {
    
    var $lnb = $(".lnb_1depth_list");

    // 2depth 기본 숨김(초기 open 상태만 열어두기)
    $lnb.find(".lnb_1depth").each(function () {
        var $depth1 = $(this);
        var $sub = $depth1.children(".lnb_2depth_list");
        if ($sub.length) {
            if ($depth1.children(".lnb_item").hasClass("open")) $sub.show();
            else $sub.hide();
        }
    });

    // 1depth 클릭 이벤트(이벤트 위임)
    $lnb.on("click", ".lnb_1depth > .lnb_item", function (e) {
        var $item = $(this);
        var $depth1 = $item.closest(".lnb_1depth");
        var $sub = $depth1.children(".lnb_2depth_list");

        // 2depth가 있는 경우만 open 토글 + 열고 닫기
        if ($sub.length) {
            e.preventDefault();
            $item.toggleClass("open");
            $sub.stop(true, true).slideToggle(200);
            return;
        }

        // 2depth 없는 경우(원하면 act만 처리)
        // e.preventDefault(); // 링크 이동 막고 싶으면 주석 해제
        $lnb.find(".lnb_1depth > .lnb_item").removeClass("act");
        $item.addClass("act");
    });

    // 2depth 클릭 시 act 처리(선택 표시용)
    $lnb.on("click", ".lnb_2depth_list .lnb_item", function (e) {
        // e.preventDefault(); // 필요하면 주석 해제
        $lnb.find(".lnb_2depth_list .lnb_item").removeClass("act");
        $(this).addClass("act");
    });
});

/* 팝업 */
const Popup = {
    get: (id) => document.querySelector(`[data-popup="${id}"]`),

    open(id) {
        const popup = this.get(id);
        if (!popup) return;

        popup.classList.add('active');
        document.documentElement.classList.add('popup_open');
        document.body.classList.add('popup_open');
    },

    close(id) {
        const popup = this.get(id);
        if (!popup) return;

        popup.classList.remove('active');
        document.documentElement.classList.remove('popup_open');
        document.body.classList.remove('popup_open');
    }
};

/* 첨부파일 */
$(function () {
    const LIMITS = {
        maxFiles: 5,
        maxSingleBytes: 10 * 1024 * 1024,
        maxTotalBytes: 50 * 1024 * 1024
    };

    let items = []; 
    // { id, name, size, kind: "seed" | "file", file?: File }

    const $root   = $("#attach");
    const $input  = $("#attachInput");
    const $list   = $root.find(".js-list");
    const $count  = $root.find(".js-count");
    const $total  = $root.find(".js-total");
    const $search = $root.find(".attach_searchInput");

    function bytesToMB(bytes) {
        return (bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, "") + "MB";
    }

    function getTotalBytes(arr) {
        return arr.reduce((sum, x) => sum + (x.size || 0), 0);
    }

    function updateMeta() {
        $count.text(items.length);
        $total.text(bytesToMB(getTotalBytes(items)));
    }

    // 초기 HTML에 들어있는 첨부 목록을 상태로 읽기
    function hydrateFromHTML() {
        items = [];
        $list.find(".attach_item").each(function () {
        const $li = $(this);
        const id = String($li.data("id") || ("seed-" + Math.random()));
        const name = $li.find(".attach_name").text().trim();
        const size = Number($li.data("size") || 0);

        items.push({ id, name, size, kind: "seed" });
        });
        updateMeta();
    }

    function render() {
        const q = ($search.val() || "").trim().toLowerCase();
        const filtered = q ? items.filter(x => x.name.toLowerCase().includes(q)) : items;

        $list.empty();

        filtered.forEach(x => {
        $list.append(`
            <li class="attach_item" data-id="${x.id}" data-size="${x.size}">
            <a href="javascript:;" class="attach_name" title="${escapeHtml(x.name)}">${escapeHtml(x.name)}</a>
            <button type="button" class="attach_remove" aria-label="첨부파일 삭제"></button>
            </li>
        `);
        });

        updateMeta();
    }

    function escapeHtml(str) {
        return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    function addFiles(fileList) {
        const incoming = Array.from(fileList);

        const tooBig = incoming.find(f => f.size > LIMITS.maxSingleBytes);
        if (tooBig) {
            alert(`단일 파일은 10MB 이하만 첨부할 수 있어요.\n문제 파일: ${tooBig.name}`);
            return;
        }

        if (items.length + incoming.length > LIMITS.maxFiles) {
            alert(`최대 ${LIMITS.maxFiles}개까지 첨부할 수 있어요.`);
            return;
        }

        const newTotal = getTotalBytes(items) + incoming.reduce((s, f) => s + f.size, 0);
        if (newTotal > LIMITS.maxTotalBytes) {
            alert(`전체 첨부 용량은 50MB 이하만 가능해요.\n현재 추가 시: ${bytesToMB(newTotal)}`);
            return;
        }

        incoming.forEach(f => {
            // (선택) 중복 방지
            const dup = items.some(x => x.name === f.name && x.size === f.size);
            if (!dup) {
                const id = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));
                items.push({ id, name: f.name, size: f.size, kind: "file", file: f });
            }
        });

        render();
    }

    // 파일 선택 추가
    $input.on("change", function () {
        if (!this.files || !this.files.length) return;
        addFiles(this.files);
        $(this).val("");
    });

    // 삭제
    $list.on("click", ".attach_remove", function () {
        const id = String($(this).closest(".attach_item").data("id"));
        items = items.filter(x => x.id !== id);
        render();
    });

    // 검색
    $search.on("input", function () {
        render();
    });

    // 초기: HTML 목록 → 상태로 동기화 (초기 모양 유지)
    hydrateFromHTML();
    // hydrate 이후에도 “검색/삭제 시 필터 렌더”가 필요하면 첫 렌더로 통일
    render();

    // (옵션) 실제 업로드 가능한 File만 얻기
    window.getAttachFiles = () => items.filter(x => x.kind === "file").map(x => x.file);
});

// 패스워드 보기/숨김
const password = {
    init() {
        this.bindEvents();
    },
    bindEvents() {
        document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn_pw');
        if (!btn) return;

        e.preventDefault();
        this.toggle(btn);
        });
    },
    toggle(btn) {
        const parent = btn.closest('.common_inp02');
        if (!parent) return;

        const input = parent.querySelector('.inp_pw');
        if (!input) return;

        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        parent.classList.toggle('active', isPassword);

        //(선택) 접근성
        btn.setAttribute('aria-pressed', String(isPassword));
    }
    };
    // DOM 로드 후 실행 보장
    document.addEventListener('DOMContentLoaded', () => {
    password.init();
});

/* 테이블 add, del */
$(function () {
    // 행 추가
    $('.btn_row_add').on('click', function () {
        // 이 버튼과 연결된 테이블 영역 찾기
        const $wrap  = $(this).closest('.btn_box01').prev('.tbl_box01');
        const $tbody = $wrap.find('.tbl_row tbody');

        // 추가될 행 템플릿
        const newRowHtml = `
            <tr>
                <td class="row_td01">
                </td>
                <td class="row_td01">
                    <div class="inp_box01">
                        <select name="" class="sel_box01 w100p">
                            <option value="0">선택</option>
                        </select>
                    </div>
                </td>
                <td class="row_td01">
                    <div class="inp_box01">
                        <input type="text" name="inp_name" class="inp_txt01" value="">
                    </div>
                </td>
                <td class="row_td01">
                    <div class="inp_box01">
                        <input type="text" name="inp_phone" class="inp_txt01" value="">
                    </div>
                </td>
            </tr>
        `;

        $tbody.append(newRowHtml);
    });

    // 체크박스 선택된 행만 삭제
    $('.btn_row_del').on('click', function () {
        // 이 버튼과 짝인 tbl_box01 찾기
        const $wrap  = $(this).closest('.btn_box01').prev('.tbl_box01');
        const $tbody = $wrap.find('.tbl_row tbody');

        const $checked = $tbody.find('input[type="checkbox"]:checked');

        // if ($checked.length === 0) {
        //     alert('삭제할 행을 선택해 주세요.');
        //     return;
        // }

        $checked.each(function () {
            const $row = $(this).closest('tr');

            // 체크박스 있는 행만 삭제
            $row.remove();

            // 만약 "표시 행 + 입력 행" 2줄이 한 세트라면 아래도 같이 사용
            // $row.next('tr').remove();
        });
    });
});

/* 사용자 통계 조회기간 선택 */
$(function () {
    const $selPeriod    = $('#sel_period');
    const $inquiryMonth = $('.inquiry_month');
    const $inquiryDate  = $('.inquiry_date');

    function togglePeriod() {
        const val = $selPeriod.val();   // "1" 또는 "2"

        if (val === '1') {              // 조회월
            $inquiryMonth.show();
            $inquiryDate.hide();
        } else if (val === '2') {       // 조회일
            $inquiryMonth.hide();
            $inquiryDate.show();
        }
    }

    // 초기 상태 세팅
    togglePeriod();

    // 선택 변경될 때마다 실행
    $selPeriod.on('change', togglePeriod);
});