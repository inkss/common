// 检查 Aplayer 对象状态
function checkAPlayer() {
	if (APlayerController.aplayer == undefined) {
		setAPlayerObject();
	} else {
		if (APlayerController.observer == undefined) {
			setAPlayerObserver();
		}
	}
}

// 设置全局播放器所对应的 aplyer 对象
function setAPlayerObject() {
	if (APlayerController.id == undefined) return;
	document.querySelectorAll('meting-js').forEach((item, index) => {
		if (item.meta.id == APlayerController.id) {
			if (document.querySelectorAll('meting-js')[index].aplayer != undefined) {
				APlayerController.aplayer = document.querySelectorAll('meting-js')[index].aplayer;
				setAPlayerObserver();
			}
		}
	})
}

// 事件监听
function setAPlayerObserver() {
	try {
		APlayerController.aplayer.on('play', function (e) {
			updateAPlayerControllerStatus();
			var index = document.querySelector('meting-js').aplayer.list.index;
			var title = document.querySelector('meting-js').aplayer.list.audios[index].title;
			var artist = document.querySelector('meting-js').aplayer.list.audios[index].artist;
			$.message({
				title: '音乐通知',
				message: '正在播放：' + title + ' - ' + artist,
				type: 'success'
			});
		});
		APlayerController.aplayer.on('pause', function (e) {
			updateAPlayerControllerStatus();
			var index = document.querySelector('meting-js').aplayer.list.index;
			var title = document.querySelector('meting-js').aplayer.list.audios[index].title;
			var artist = document.querySelector('meting-js').aplayer.list.audios[index].artist;
			$.message({
				title: '音乐通知',
				message: '暂停播放：' + title + ' - ' + artist,
				type: 'success'
			});
		});
		APlayerController.aplayer.on('error', function (e) { // 音乐加载失败
			$.message({
				title: "音乐通知",
				message: "音乐加载失败~ 潜在网络问题",
				type: 'warning'
			});
		});
		APlayerController.aplayer.on('volumechange', function (e) {
			onUpdateAPlayerVolume();
		});

		// 监听音量手势
		APlayerController.volumeBarWrap = document.getElementsByClassName('nav volume')[0].children[0];
		APlayerController.volumeBar = APlayerController.volumeBarWrap.children[0]

		function updateAPlayerVolume(e) {
			let percentage = ((e.clientX || e.changedTouches[0].clientX) - APlayerController.volumeBar.getBoundingClientRect().left) / APlayerController.volumeBar.clientWidth;
			percentage = Math.max(percentage, 0);
			percentage = Math.min(percentage, 1);
			APlayerController.aplayer.volume(percentage);
		}
		const thumbMove = (e) => {
			updateAPlayerVolume(e);
		};
		const thumbUp = (e) => {
			APlayerController.volumeBarWrap.classList.remove('aplayer-volume-bar-wrap-active');
			document.removeEventListener('mouseup', thumbUp);
			document.removeEventListener('mousemove', thumbMove);
			updateAPlayerVolume(e);
		};

		APlayerController.volumeBarWrap.addEventListener('mousedown', () => {
			APlayerController.volumeBarWrap.classList.add('aplayer-volume-bar-wrap-active');
			document.addEventListener('mousemove', thumbMove);
			document.addEventListener('mouseup', thumbUp);
		});


		// 设置完监听就立即更新一次
		updateAPlayerControllerStatus();
		onUpdateAPlayerVolume();
		APlayerController.observer = true;
		console.log('APlayerController ready!');
	} catch (error) {
		delete APlayerController.observer;
	}
}

// 更新控制器状态
function updateAPlayerControllerStatus() {
	try {
		if (APlayerController.aplayer.audio.paused) {
			document.getElementsByClassName('nav toggle')[0].children[0].classList.add("fa-play");
			document.getElementsByClassName('nav toggle')[0].children[0].classList.remove("fa-pause");
		} else {
			document.getElementsByClassName('nav toggle')[0].children[0].classList.remove("fa-play");
			document.getElementsByClassName('nav toggle')[0].children[0].classList.add("fa-pause");
		}
	} catch (error) {
		console.log(error);
	}
}

function onUpdateAPlayerVolume() {
	try {
		APlayerController.volumeBar.children[0].style.width = APlayerController.aplayer.audio.volume * 100 + '%'
	} catch (error) {
		console.log(error);
	}
}

// 播放/暂停
function aplayerToggle() {
	checkAPlayer();
	try {
		APlayerController.aplayer.toggle();
	} catch (error) {
		console.log(error);
	}
}

// 上一曲
function aplayerBackward() {
	checkAPlayer();
	try {
		APlayerController.aplayer.skipBack();
		APlayerController.aplayer.play();
	} catch (error) {
		console.log(error);
	}
}

// 下一曲
function aplayerForward() {
	checkAPlayer();
	try {
		APlayerController.aplayer.skipForward();
		APlayerController.aplayer.play();
	} catch (error) {
		console.log(error);
	}
}

// 调节音量
function aplayerVolume(percent) {
	checkAPlayer();
	try {
		APlayerController.aplayer.volume(percent);
	} catch (error) {
		console.log(error);
	}
}

// 自动播放音乐
function autoPlayMusic() {
	let autoPlayMusic = getCookie('autoPlayMusic') == null ? true : false;
	setTimeout(function () {
		if ($(window).width() > 500 && autoPlayMusic && APlayerController.autoPlay) {
			let isplay = true;
			$.message({
				title: "音乐通知",
				message: "即将自动播放，点击<a id='stopMusic' class='stopMusic fix-cursor-pointer'>停止播放</a>",
				type: 'warning'
			});
			setTimeout(function () {
				if (APlayerController.aplayer == undefined) {
					checkAPlayer();
				}
				if (isplay) {
					aplayerToggle();
				}
			}, 3500);

			$("#stopMusic").click(function () {
				isplay = false;
				$(".c-message--close").click();
				setTimeout(() => {
					$.message({
						title: "音乐通知",
						time: 999999,
						message: "是否永久关闭音乐自动播放?  <a id='dontPlayMusic' class='stopMusic fix-cursor-pointer'><b>确认</b></a>",
						type: 'warning'
					});
					$("#dontPlayMusic").click(function () {
						var expires = 7 * 24 * 60 * 60 * 1000;
						setCookie("autoPlayMusic", 'false', expires, '/');
						$(".c-message--close").click();
						setTimeout(() => {
							$.message({
								title: '音乐通知',
								time: 6000,
								message: '关闭成功，未来一周内将不再提醒~',
								type: 'success'
							});
						}, 1000);
					});
				}, 1000);
			})
		}
	}, 1500);
}

(function ($) {
	// 网速快
	checkAPlayer();
	// 网速一般
	setTimeout(function () {
		checkAPlayer();
	}, 3000);
	// 网速较慢
	setTimeout(function () {
		checkAPlayer();
	}, 10000);
	autoPlayMusic();
})(jQuery);