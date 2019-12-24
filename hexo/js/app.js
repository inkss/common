/* eslint-disable */
var customSearch;
(function ($) {
	"use strict";
	var scrollCorrection = 80; // (header height = 64px) + (gap = 16px)
	const $headerAnchor = $('.l_header', '.cover-wrapper');
	if ($headerAnchor[0]) {
		scrollCorrection = $headerAnchor[0].clientHeight + 16;
	}

	function scrolltoElement(elem, e) {
		e.stopImmediatePropagation();
		// 停止一个事件继续执行，即使当前的对象上还绑定了其它处理函数
		// return false 等价于 => event.preventDefault(); && event.stopPropagation();  -> 停止了事件冒泡
		var correction = scrollCorrection;
		const $elem = elem.href ? $(elem.getAttribute('href')) : $(elem);
		$('html, body').animate({
			'scrollTop': $elem.offset().top - correction
		}, 400);
	}

	function setScrollAnchor() {
		// button
		const $topBtn = $('.s-top'); // 向上滚动
		const $titleBtn = $('h1.title', '#header-meta'); // 文章标题
		const $bodyAnchor = $('.l_body'); // 页面主体

		if ($titleBtn.length && $bodyAnchor) {
			$titleBtn.click(e => {
				e.preventDefault();
				e.stopPropagation();
				scrolltoElement($bodyAnchor, e);
			});
		}
		if ($topBtn.length && $bodyAnchor) {
			$topBtn.click(e => {
				e.preventDefault();
				e.stopPropagation();
				scrolltoElement($bodyAnchor, e);
			});
		}

		var showHeaderPoint = 0;

		var pos = document.body.scrollTop;
		$(document, window).scroll(() => {
			const scrollTop = $(window).scrollTop();
			const del = scrollTop - pos;
			pos = scrollTop;
			if (scrollTop > 150) {
				$topBtn.addClass('show');
				if (del > 0) {
					$topBtn.removeClass('hl');
				} else {
					$topBtn.addClass('hl');
				}
			} else {
				$topBtn.removeClass('show').removeClass('hl');
			}
			if (scrollTop > showHeaderPoint) {
				$headerAnchor.addClass('show');
			} else {
				$headerAnchor.removeClass('show');
			}
		});
	}

	function setHeader() {
		if (!window.subData) return;
		const $wrapper = $('header .wrapper');
		const $comment = $('.s-comment', $wrapper);
		const $toc = $('.s-toc', $wrapper);
		const pathname = window.location.pathname;
		const parm1 = pathname == "/" ? "index" : pathname.split('/')[1];
		const parm2 = HEXO_PERMALINK.split('/')[0];
		const isArticle = (parm1 == "" || parm1 == parm2) ? true : false;
		$wrapper.find('.nav-sub .logo').text(window.subData.title);

		var pos = document.body.scrollTop;
		$(document, window).scroll(() => {
			$('#header-fix').removeClass('z_search-open'); // 移除导航栏搜索菜单的激活
			$('body').removeClass('z_menu-open');   // 移除导航栏菜单的激活
			if (isArticle) {
				const scrollTop = $(window).scrollTop();
				const del = scrollTop - pos;
				if (del >= 100 && scrollTop > 150) {
					$wrapper.addClass('sub');
					pos = scrollTop;
				//} else if (del == 0 || del <= -50) {
				} else if (del <= -100) {
					$wrapper.removeClass('sub');
					pos = scrollTop;
				}
			}
		});

		// 评论按钮
		if ($('#comments').length) {
			$comment.click(e => {
				e.preventDefault();
				e.stopPropagation();
				scrolltoElement($('#comments'), e);
			});
		} else $comment.remove();

		// 目录按钮
		if ($('.toc-wrapper').length && $('.toc-wrapper').children().length) {
			$toc.click((e) => {
				e.stopPropagation();
				$('.toc-wrapper').toggleClass('active');
			});
		} else $toc.remove();
	}

	// 仅重载即可，pjax ；用途：桌面端菜单激活
	function setHeaderMenuSelection() {
		var $headerMenu = $('body .navgation');
		// 先把已经激活的取消激活
		$headerMenu.find('li a.active').removeClass('active');
		function setUnderline($item) {
			if ($item && $item.length) {
				$item.addClass('active').siblings().removeClass('active');
			}
		}
		
		var $active_link = null;
		var idname = location.pathname.replace(/\/|%/g, "");
		if (idname.length == 0) {
			idname = "home";
		}
		var page = idname.match(/page\d{0,}$/g);
		if (page) {
			page = page[0];
			idname = idname.split(page)[0];
		}
		var index = idname.match(/index.html/);
		if (index) {
			index = index[0];
			idname = idname.split(index)[0];
		}
		if (idname && $headerMenu) {
			$active_link = $('#' + idname, $headerMenu);
			setUnderline($active_link);
		}
	}

	// 无需重载 pjax ；用途：手机端下的导航栏菜单按钮
	function setHeaderMenuPhone() {
		var $switcher = $('.l_header .switcher .s-menu');
		$switcher.click(function (e) {
			e.stopPropagation();
			$('body').toggleClass('z_menu-open');
			$switcher.toggleClass('active');
		});
		$(document).click(function (e) {
			$('body').removeClass('z_menu-open');
			$switcher.removeClass('active');
		});
	}

	// 无需重载 pjax ；用途：手机端下的导航栏搜索按钮
	function setHeaderSearch() {
		var $switcher = $('.l_header .switcher .s-search');
		var $header = $('.l_header');
		var $search = $('.l_header .m_search');
		if ($switcher.length === 0) return;
		$switcher.click(function (e) {
			e.stopPropagation();
			$header.toggleClass('z_search-open');
			$search.find('input').focus();
		});
		$(document).click(function (e) {
			$header.removeClass('z_search-open');
		});
		$search.click(function (e) {
			e.stopPropagation();
		});
		$header.ready(function () {
			$header.bind('keydown', function (event) {
				if (event.keyCode == 9) {
					return false;
				} else {
					var isie = (document.all) ? true : false;
					var key;
					var ev;
					if (isie) { //IE浏览器
						key = window.event.keyCode;
						ev = window.event;
					} else { //火狐浏览器
						key = event.which;
						ev = event;
					}
					if (key == 9) { //IE浏览器
						if (isie) {
							ev.keyCode = 0;
							ev.returnValue = false;
						} else { //火狐浏览器
							ev.which = 0;
							ev.preventDefault();
						}
					}
				}
			});
		});
	}

	// 已修复，测试完成 pjax ；用途：1.点击 TOC 条目时平滑滚动到指定高度 2.跟随滚动高度激活相应 TOC 高亮
	function setTocToggle() {
		const  $toc = $('.toc-wrapper');
		if ($toc.length === 0) return;

		$(document).click(() => $toc.removeClass('active'));

		// 平滑滚动
		$toc.on('click', 'a', (e) => {
			e.preventDefault();
			e.stopPropagation();
			if (e.target.tagName === 'A') {
				scrolltoElement(e.target, e);
			} else if (e.target.tagName === 'SPAN') {
				scrolltoElement(e.target.parentElement, e);
			}
			$toc.removeClass('active');
		});

		const liElements = Array.from($toc.find('li a'));
		const getAnchor = () => liElements.map(elem => Math.floor($(elem.getAttribute('href')).offset().top - scrollCorrection));
		
		let anchor = getAnchor(); // 记录的是各个 TOC 的高度
		const scrollListener = () => {
			const scrollTop = $('html').scrollTop() || $('body').scrollTop();
			if (!anchor) return;
			let l = 0,
				r = anchor.length - 1,
				mid;
			while (l < r) {
				mid = (l + r + 1) >> 1;
				if (anchor[mid] === scrollTop) l = r = mid;
				else if (anchor[mid] < scrollTop) l = mid;
				else r = mid - 1;
			}
			$(liElements).removeClass('active').eq(l).addClass('active');
		};

		$(window).resize(() => {
			anchor = getAnchor();
			scrollListener();
		}).scroll(() => {
			scrollListener()
		});
		scrollListener();
	}

	// 无需重载 pjax ；用途：搜索服务的对象初始化
	function setSearchService() {
		if (SEARCH_SERVICE === 'algolia') {
			customSearch = new AlgoliaSearch({
				apiKey: ALGOLIA_API_KEY,
				appId: ALGOLIA_APP_ID,
				indexName: ALGOLIA_INDEX_NAME,
				imagePath: "/img/"
			});
		} else if (SEARCH_SERVICE === 'hexo') {
			customSearch = new HexoSearch({
				imagePath: "/img/"
			});
		}
	}

	$(function () {
		setHeader();
		setHeaderMenuSelection();
		setHeaderMenuPhone(); // 手机端下的导航栏菜单按钮
		setHeaderSearch(); // 手机端下的导航栏搜索按钮
		setTocToggle(); // 点击TOC中的目录时，实现动画滚动，以及跟随着滚动激活条目
		setScrollAnchor(); // 全局滚动动画
		setSearchService();

		// setTimeout(function () {
		// 	$('#loading-bar-wrapper').fadeOut(500);
		// }, 300);

		// addEventListener是先绑定先执行，此处的绑定后执行
		document.addEventListener('pjax:complete', function () {
			try {
				setHeader();
				setHeaderMenuSelection();
				//setHeaderMenuPhone();  // 无需重载，body 未变动
				//setHeaderSearch();    // 无需重载，body 未变动
				setTocToggle();
				setScrollAnchor();
			} catch (error) {
				console.log(error);
			}
		});
	});

})(jQuery);