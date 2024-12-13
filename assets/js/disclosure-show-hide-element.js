class DisclosureShowHideElement extends HTMLElement {
    constructor() {
        super();

		const self = this;

		if (false === self.isValid(self)) return;

		let button = CustomElementHelpers.createElementFromString(`<button type="button" aria-expanded="false"></button>`),
			svg = CustomElementHelpers.createElementFromString(`
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 12 7"
					width="10"
					height="6"
					aria-hidden="true"
					class="icon"
				>
					<path
						d="M10.8727 0.2925C10.4827 -0.0975 9.85274 -0.0975001 9.46274 0.2925L5.58274 4.1725L1.70274 0.2925C1.31274 -0.0975004 0.682741 -0.0975005 0.292741 0.2925C-0.0972596 0.6825 -0.0972596 1.3125 0.292741 1.7025L4.88274 6.2925C5.27274 6.6825 5.90274 6.6825 6.29274 6.2925L10.8827 1.7025C11.2627 1.3225 11.2627 0.6825 10.8727 0.2925Z"
						fill="currentColor"
						data-d="M10.8727 0.2925C10.4827 -0.0975 9.85274 -0.0975001 9.46274 0.2925L5.58274 4.1725L1.70274 0.2925C1.31274 -0.0975004 0.682741 -0.0975005 0.292741 0.2925C-0.0972596 0.6825 -0.0972596 1.3125 0.292741 1.7025L4.88274 6.2925C5.27274 6.6825 5.90274 6.6825 6.29274 6.2925L10.8827 1.7025C11.2627 1.3225 11.2627 0.6825 10.8727 0.2925Z"
						data-d-alt="M10.8725 6.29246C10.4825 6.68246 9.8525 6.68246 9.4625 6.29246L5.5825 2.41246L1.7025 6.29246C1.3125 6.68246 0.682497 6.68246 0.292497 6.29246C-0.0975033 5.90246 -0.0975034 5.27246 0.292497 4.88246L4.8825 0.292461C5.2725 -0.0975388 5.9025 -0.0975388 6.2925 0.292461L10.8825 4.88246C11.2625 5.26246 11.2625 5.90246 10.8725 6.29246Z"
					>
				</svg>
			`),
			content = CustomElementHelpers.createElementFromString(`<div class="content"></div>`),
			contentElements = [],
			heading = this.querySelector(`#${this.getAttribute('aria-labelledby')}`),
			headingChildNodes = [];

		while (heading.childNodes[0]) {
			headingChildNodes.push(heading.removeChild(heading.childNodes[0]));
		}

		heading.appendChild(button);

		button = heading.childNodes[0];

		button.addEventListener('click', (e) => {
			this.toggle(e, self);
		});

		for (const node of headingChildNodes) {
			button.appendChild(node);
		}

		button.appendChild(svg);

		while (this.children[1]) {
			contentElements.push(this.removeChild(this.children[1]));
		}

		this.appendChild(content);

		content = this.children[1];

		for (const element of contentElements) {
			content.appendChild(element);
		}

		if (self.dataset.expanded === 'true') {
			self.expand(self);
		} else {
			self.collapse(self);
		}
	}

	isValid(self) {
		try {
			let errors = [];

			// Element does not have an accessible name assigned via an `aria-labelledby` attribute value referencing an `id` attribute value on a child heading element within the element.

			if (
				// Element doesn't have the `aria-labelledby` attribute set
				!self.getAttribute('aria-labelledby')

				// Element has the `aria-labelledby` attribute set, but the `id` value that it references does not exist
				|| (self.hasAttribute('aria-labelledby') && !self.querySelector(`#${self.getAttribute('aria-labelledby')}`))
				
				// Element has the `aria-labelledby` attribute set, but the element whose `id` attribute value it references is not a heading element
				|| (self.hasAttribute('aria-labelledby') && !CustomElementHelpers.headings.includes(self.querySelector(`#${self.getAttribute('aria-labelledby')}`).tagName))
				
			) {
				errors.push(new Error(`\`${self.constructor.name}\` does not have an accessible name assigned via an \`aria-labelledby\` attribute value referencing an \`id\` attribute value on a child heading element within the element.\r\n\r\nCompliant Code Example: \r\n\r\n<section id="some-unique-id" aria-labelledby="some-unique-heading-id" is="${self.getAttribute('is')}">\r\n\t/* Note: any heading element between \`<h2>\` and \`<h6>\` is valid here */\r\n\t<h2 id="some-unique-heading-id">[…]</h2>\r\n\t[…]\r\n</section>`));
			}

			// Element's heading element's `id` attribute value is not unique
			
			if (1 < document.querySelectorAll(`#${self.getAttribute('aria-labelledby')}`).length) {
				let headingElement = self.querySelector(`#${self.getAttribute('aria-labelledby')}`);

				errors.push(new Error(`\`${self.constructor.name}\`'s heading element's \`id\` attribute value (\`${headingElement.id}\`) is not unique.\r\n\r\nCompliant Code Example: \r\n\r\n<section id="some-unique-id" aria-labelledby="some-unique-heading-id" is="${self.getAttribute('is')}">\r\n\t/* Note: any heading element between \`<h2>\` and \`<h6>\` is valid here */\r\n\t<h2 id="some-unique-heading-id">[…]</h2>\r\n\t[…]\r\n</section>`));
			}

			if (errors.length) {
				throw errors;
			}
		} catch (errors) {
			let idText = self.id ? ` (#${self.id})` : '';

			console.group(`Errors (${errors.length}) - ${self.constructor.name}${idText}`);

			console.log(self);

			errors.forEach(error => {
				console.error(`${error.name}: ${error.message}`);
			});

			console.groupEnd();

			return false;
		}

		return true;
	}

	collapse(instance) {
		let button = instance.querySelector(`#${instance.getAttribute('aria-labelledby')} > button[aria-expanded]`),
			children = Array.from(instance.children),
			iconPath = button.querySelector('svg.icon > path');

		children.forEach((element, i) => {
			if (0 === i) return;

			CustomElementHelpers.hide(element);
		});

		button.setAttribute('aria-expanded', 'false');

		iconPath.setAttribute('d', iconPath.dataset.d);
	}

	expand(instance) {
		let button = instance.querySelector(`#${instance.getAttribute('aria-labelledby')} > button[aria-expanded]`),
			children = Array.from(instance.children),
			iconPath = button.querySelector('svg.icon > path');

		children.forEach((element, i) => {
			if (0 === i) return;

			CustomElementHelpers.show(element);
		});

		button.setAttribute('aria-expanded', 'true');

		iconPath.setAttribute('d', iconPath.dataset.dAlt);
	}

	toggle(e, self) {
		let button = e.currentTarget,
			instance = button.closest('[is="disclosure-show-hide-element"]');

		switch (button.getAttribute('aria-expanded')) {
			case 'false':
				self.expand(instance);
				self.dataset.expanded = 'true';

				break;
			case 'true':
				self.collapse(instance);
				self.dataset.expanded = 'false';

		}
	}
}

customElements.define(
    'disclosure-show-hide-element',
    DisclosureShowHideElement,
    {
        extends: 'section'
    }
);