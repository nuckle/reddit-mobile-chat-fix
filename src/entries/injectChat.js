(function () {
	'use strict';

	const shadowRoots = new Set();
	const styles = new Map();

	const originalAttachShadow = Element.prototype.attachShadow;

	Element.prototype.attachShadow = function () {
		const shadowRoot = originalAttachShadow.apply(this, arguments);

		styles.forEach((style) => {
			const clonedStyle = style.cloneNode(true);
			shadowRoot.appendChild(clonedStyle);
		});

		shadowRoots.add(shadowRoot);
		return shadowRoot;
	};

	function updateEventListener(element, eventType, callback) {
		if (
			!element ||
			typeof callback !== 'function' ||
			typeof eventType !== 'string'
		)
			return;

		const eventListener = (e) => {
			callback(e);
		};

		element.removeEventListener(eventType, eventListener);

		element.addEventListener(eventType, eventListener);
	}

	function adjustTextareaHeight(textarea) {
		setTimeout(function () {
			textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
		}, 1);
	}

	function createCustomDesktopStyleClass(shadow, className, styles) {
		const styleElement = document.createElement('style');
		let styleString = '@media (min-width: 768px) {';
		styleString += `.${className} {`;

		for (const [property, value] of Object.entries(styles)) {
			styleString += `${property}: ${value}!important; `;
		}

		styleString += '}}';
		styleElement.textContent = styleString;
		shadow.appendChild(styleElement);
	}

	function createCustomMobileStyleClass(shadow, className, styles) {
		const styleElement = document.createElement('style');
		let styleString = '@media (max-width: 768px) {';
		styleString += `.${className} {`;

		for (const [property, value] of Object.entries(styles)) {
			styleString += `${property}: ${value}!important; `;
		}

		styleString += '}}';
		styleElement.textContent = styleString;
		shadow.appendChild(styleElement);
	}

	// Styles for div.container (under shadow DOM)

	const hiddenChatStyles = {
		'grid-template-columns': 'auto 0',
	};

	const visibleChatStyles = {
		'grid-template-columns': '0 auto',
	};

	const hiddenStyles = {
		display: 'none',
	};

	const containerVisibleClass = 'container--navbar-visible';
	const containerHiddenClass = 'container--navbar-hidden';
	const toggleBtnClass = 'custom-js-hide-button';
	const hiddenElClass = 'hidden';
	const toggleBtnText = 'Toggle';

	let existingMainContainer = null;

	function applyStyles() {
		const toggleChatWindow = () => {
			if (existingMainContainer) {
				const isVisible = existingMainContainer?.classList.contains(
					containerVisibleClass,
				);

				const chatOverlay = existingMainContainer?.querySelector(
					'rs-room-overlay-manager',
				);

				const chatThreads = existingMainContainer?.querySelector('rs-threads-view');

				// To avoid a blank screen
				if (chatOverlay || chatThreads) {
					// To prevent 'Read more' messages when chat overlay has 0 width
					chatOverlay?.classList.toggle(hiddenElClass, !isVisible);

					existingMainContainer?.classList.toggle(containerHiddenClass, isVisible);
					existingMainContainer?.classList.toggle(containerVisibleClass, !isVisible);
				}
			}
		};

		const showChatWindow = () => {
			if (existingMainContainer) {
				existingMainContainer?.classList.remove(containerHiddenClass);
				existingMainContainer?.classList.add(containerVisibleClass);

				const chatOverlay = existingMainContainer?.querySelector(
					'rs-room-overlay-manager',
				);
				chatOverlay?.classList.add(hiddenElClass);
			}
		};

		const hideChatWindow = () => {
			if (existingMainContainer) {
				existingMainContainer?.classList.add(containerHiddenClass);
				existingMainContainer?.classList.remove(containerVisibleClass);

				const chatOverlay = existingMainContainer?.querySelector(
					'rs-room-overlay-manager',
				);
				chatOverlay?.classList.remove(hiddenElClass);
			}
		};

		const createToggleButton = (parentElement) => {
			const button = document.createElement('button');
			button.textContent = toggleBtnText;
			button.classList.add(toggleBtnClass);
			updateEventListener(button, 'click', toggleChatWindow);
			parentElement.appendChild(button);
			createCustomDesktopStyleClass(parentElement, toggleBtnClass, hiddenStyles);
			return button;
		};

		shadowRoots.forEach((shadow) => {
			const header = shadow?.querySelector('main header.flex');
			const container = shadow?.querySelector('div.container');
			const createRoomBtn = shadow?.querySelector('rs-room-creation-button');
			const existingBtnContainer = createRoomBtn?.parentNode;
			const composerTextArea = shadow?.querySelector(
				'rs-textarea-auto-size textarea',
			);

			const chatRoomLink = shadow?.querySelector('rs-rooms-nav-room');
			const backBtn = shadow?.querySelector(
				'header > button.button-small.button-plain.icon.inline-flex.text-tone-2',
			);
			const settingsBtn = shadow?.querySelector(
				'button.text-tone-2.button-small.button-plain.button.inline-flex[aria-label="Open chat settings"]',
			);
			const createChatBtn = shadow?.querySelector(
				'a.button-plain[href="/room/create"]',
			);
			const cancelBtn = Array.from(
				shadow.querySelectorAll('form .buttons button.button-secondary'),
			).find((btn) => btn.textContent.trim() === 'Cancel');

			const btnElements = shadow?.querySelectorAll(
				'li.relative.list-none.mt-0[role="presentation"]',
			);
			const requestBtn = btnElements[0];
			const threadsBtn = btnElements[1] || btnElements[0];

			// Fix scroll "jumping" when user is entering a message
			if (composerTextArea) {
				composerTextArea.style.overflowY = 'auto';
				const inputCallback = (e) => {
					e.stopImmediatePropagation();
					adjustTextareaHeight(composerTextArea);
				};
				updateEventListener(composerTextArea, 'input', inputCallback);
			}

			// Initialize the main container if not already set
			if (!existingMainContainer && container) {
				existingMainContainer = container;
				createCustomMobileStyleClass(
					shadow,
					containerVisibleClass,
					hiddenChatStyles,
				);

				// hide overlay to fix false truncated messages
				createCustomMobileStyleClass(
					shadow,
					'container--navbar-visible rs-room-overlay-manager',
					hiddenStyles,
				);

				createCustomMobileStyleClass(
					shadow,
					containerHiddenClass,
					visibleChatStyles,
				);
				createCustomMobileStyleClass(shadow, hiddenElClass, hiddenStyles);
				if (!container?.classList.contains(containerVisibleClass)) {
					container?.classList.add(containerVisibleClass);
				}
			}

			// Create and attach toggle button in header if it doesn't exist
			if (header && !header?.querySelector(`button.${toggleBtnClass}`)) {
				createToggleButton(header);
			}

			// Create and attach toggle button in navbar if it doesn't exist
			if (
				createRoomBtn &&
				existingBtnContainer &&
				!existingBtnContainer?.querySelector(`button.${toggleBtnClass}`)
			) {
				createToggleButton(existingBtnContainer);
			}

			// Add event listener to chat room link
			if (
				chatRoomLink ||
				backBtn ||
				settingsBtn ||
				threadsBtn ||
				requestBtn ||
				createChatBtn ||
				cancelBtn
			) {
				function handleButtonClick(element, eventType, callback) {
					if (element) {
						updateEventListener(element, eventType, callback);
					}
				}

				const showCallback = () => showChatWindow();
				const hideCallback = () => hideChatWindow();

				handleButtonClick(cancelBtn, 'click', showCallback);
				handleButtonClick(createChatBtn, 'click', hideCallback);
				handleButtonClick(chatRoomLink, 'click', hideCallback);
				handleButtonClick(settingsBtn, 'click', hideCallback);
				handleButtonClick(backBtn, 'click', showCallback);
				handleButtonClick(requestBtn, 'click', showCallback);
				handleButtonClick(threadsBtn, 'click', hideCallback);
			}
		});
	}

	window.Element.prototype.attachShadowOri =
		window.Element.prototype.attachShadow;

	window.Element.prototype.attachShadow = function (obj) {
		obj.mode = 'open';

		applyStyles();

		return this.attachShadowOri(obj);
	};
})();
