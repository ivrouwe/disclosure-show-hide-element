class CustomElementHelpers {
    static headings = [
        'H1',
        'H2',
        'H3',
        'H4',
        'H5',
        'H6',
    ];
    
    static focusableSelectors = [
        'a[href]',
        'area[href]',
        'input:not([type="hidden"])',
        'select',
        'textarea',
        'button',
        'iframe',
        'object',
        'embed',
        '[tabindex]',
        '[contenteditable]',
    ];

    static changeTag(element, newTagName, keepAttributes) {
        let newElement = document.createElement(newTagName);

        while (element.firstChild) {
            newElement.appendChild(element.firstChild);
        }

        if (keepAttributes) {
            for (let i = element.attributes.length - 1; i >= 0; --i) {
                newElement.attributes.setNamedItem(element.attributes[i].cloneNode());
            }
        }

        element.parentNode.replaceChild(newElement, element);
    }

    static createElementFromString(stringLiteral) {
        return document.createRange().createContextualFragment(stringLiteral);
    }

    static hide(element) {
        element.hidden = true;
        element.setAttribute('aria-hidden', 'true');

        let focusableDescendants = element.querySelectorAll(this.focusableSelectors.toString());

        focusableDescendants.forEach((element) => {
            if (element.hasAttribute('tabindex')) {
                element.dataset.originalTabindex = element.getAttribute('tabindex');
            }

            element.setAttribute('tabindex', '-1');
        });
    }

    static show(element) {
        let focusableDescendants = element.querySelectorAll(this.focusableSelectors.toString());

        focusableDescendants.forEach((element) => {
            if (!element.hasAttribute('data-original-tabindex')) {
                element.removeAttribute('tabindex');
            } else {
                element.setAttribute('tabindex', element.dataset.originalTabindex);
                element.removeAttribute('data-original-tabindex');
            }
        });

        element.hidden = false;
        element.removeAttribute('aria-hidden');
    }
}