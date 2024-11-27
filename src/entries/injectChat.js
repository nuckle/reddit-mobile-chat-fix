(function () {
	'use strict';

	const shadowRoots = new Set();
	const listeners = new WeakMap();

	const originalAttachShadow = Element.prototype.attachShadow;

	Element.prototype.attachShadow = function () {
		const shadowRoot = originalAttachShadow.apply(this, arguments);

		// Remove duplicates
		let isDeleted = false;

		// Clean up
		shadowRoots.forEach((shadowRootSet) => {
			if (
				shadowRootSet.host.innerHTML === shadowRoot.host.innerHTML &&
				shadowRootSet.host.nodeName === shadowRoot.host.nodeName &&
				shadowRootSet.host.dataset.changed !== 'true'
			) {
				shadowRoots.delete(shadowRootSet);
				isDeleted = true;
			}
		});

		if (!isDeleted) shadowRoots.add(shadowRoot);

		return shadowRoot;
	};

	function debounce(func, delay) {
		let timer;
		return function (...args) {
			clearTimeout(timer);
			timer = setTimeout(() => func(...args), delay);
		};
	}

	function updateEventListener(element, eventType, callback) {
		if (
			!element ||
			typeof callback !== 'function' ||
			typeof eventType !== 'string'
		)
			return;

		const boundCallback = callback.bind(element);

		if (listeners.has(element)) {
			const existingListeners = listeners.get(element);
			if (
				existingListeners.some(
					(listener) => listener.callback.toString() === callback.toString(),
				)
			) {
				// Listener already registered.
				return;
			}
		}

		// Cleanup any duplicate listeners
		element.removeEventListener(eventType, boundCallback);
		element.addEventListener(eventType, boundCallback);

		// Track the listener for later removal
		if (!listeners.has(element)) {
			listeners.set(element, []);
		}
		listeners.get(element).push({ eventType, callback });
	}

	function adjustTextareaHeight(textarea) {
		setTimeout(function () {
			textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
		}, 1);
	}

	function updateTextareaHeight(textarea) {
		textarea.style.height = 'auto';
		textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
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

	// A function to track if shadowRoot was changed
	// (we don't want to delete changed shadowRoots)
	function setChanged(shadowRootHost) {
		shadowRootHost.dataset.changed = true;
	}

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
			if (!(shadow instanceof ShadowRoot)) {
				return;
			}
			const header = shadow?.querySelector('main header.flex');
			const container = shadow?.querySelector('div.container');
			const createRoomBtn = shadow?.querySelector('rs-room-creation-button');
			const existingBtnContainer = createRoomBtn?.parentNode;
			const composerTextArea = shadow?.querySelector(
				'rs-textarea-auto-size textarea',
			);

			const chatRoomLinks = shadow?.querySelectorAll('rs-rooms-nav-room');

			// Exclude aria-label to not interact with button from Chat settings
			const backBtn = shadow?.querySelector(
				'main > header > button.button-small.button-plain.icon.inline-flex.text-tone-2.back-icon-display:not([aria-label])',
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
				'div.border-solid > div.flex > li.relative.list-none.mt-0[role="presentation"]',
			);
			const requestBtn = btnElements[0];
			const threadsBtn = btnElements[1] || btnElements[0];

			const startChatBtn = shadow?.querySelector(
				'form div.buttons button.button-primary[type="submit"]',
			);

			const welcomeScreen = container?.querySelector('rs-welcome-screen');

			// Avoid getting "stuck"
			if (welcomeScreen) {
				setTimeout(() => {
					showChatWindow();
				}, 300);
			}

			// Fix scroll "jumping" when user is entering a message
			if (composerTextArea) {
				setChanged(shadow.host);
				composerTextArea.style.overflowY = 'auto';
				const inputCallback = (e) => {
					e.stopImmediatePropagation();

					debounce(() => {
						adjustTextareaHeight(composerTextArea);
					}, 150)();
				};

				const focusoutCallback = () => {
					updateTextareaHeight(composerTextArea);
				};
				updateEventListener(composerTextArea, 'input', inputCallback);
				updateEventListener(composerTextArea, 'focusout', focusoutCallback);
			}

			// Initialize the main container if not already set
			if (!existingMainContainer && container) {
				setChanged(shadow.host);
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
				setChanged(shadow.host);
				createToggleButton(header);
			}

			// Create and attach toggle button in navbar if it doesn't exist
			if (
				createRoomBtn &&
				existingBtnContainer &&
				!existingBtnContainer?.querySelector(`button.${toggleBtnClass}`)
			) {
				setChanged(shadow.host);
				createToggleButton(existingBtnContainer);
			}

			if (
				chatRoomLinks.length > 0 ||
				backBtn ||
				settingsBtn ||
				threadsBtn ||
				requestBtn ||
				createChatBtn ||
				startChatBtn ||
				cancelBtn
			) {
				function handleButtonClick(element, eventType, callback) {
					if (element) {
						updateEventListener(element, eventType, callback);
					}
				}

				setChanged(shadow.host);
				const showCallback = () => showChatWindow();
				const hideCallback = () => hideChatWindow();

				handleButtonClick(cancelBtn, 'click', showCallback);
				handleButtonClick(createChatBtn, 'click', hideCallback);
				handleButtonClick(settingsBtn, 'click', hideCallback);
				handleButtonClick(backBtn, 'click', showCallback);
				handleButtonClick(requestBtn, 'click', showCallback);
				handleButtonClick(threadsBtn, 'click', hideCallback);
				handleButtonClick(startChatBtn, 'click', hideCallback);

				chatRoomLinks?.forEach((chatRoomLink) => {
					handleButtonClick(chatRoomLink, 'click', hideCallback);
				});
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
