(function () {
    'use strict';
  
    var attributesObserver = (whenDefined, MutationObserver) => {
  
      const attributeChanged = records => {
        for (let i = 0, {length} = records; i < length; i++)
          dispatch(records[i]);
      };
  
      const dispatch = ({target, attributeName, oldValue}) => {
        target.attributeChangedCallback(
          attributeName,
          oldValue,
          target.getAttribute(attributeName)
        );
      };
  
      return (target, is) => {
        const {observedAttributes: attributeFilter} = target.constructor;
        if (attributeFilter) {
          whenDefined(is).then(() => {
            new MutationObserver(attributeChanged).observe(target, {
              attributes: true,
              attributeOldValue: true,
              attributeFilter
            });
            for (let i = 0, {length} = attributeFilter; i < length; i++) {
              if (target.hasAttribute(attributeFilter[i]))
                dispatch({target, attributeName: attributeFilter[i], oldValue: null});
            }
          });
        }
        return target;
      };
    };
  
    const {keys} = Object;
  
    const expando = element => {
      const key = keys(element);
      const value = [];
      const ignore = new Set;
      const {length} = key;
      for (let i = 0; i < length; i++) {
        value[i] = element[key[i]];
        try {
          delete element[key[i]];
        }
        catch (SafariTP) {
          ignore.add(i);
        }
      }
      return () => {
        for (let i = 0; i < length; i++)
          ignore.has(i) || (element[key[i]] = value[i]);
      };
    };
  
    /*! (c) Andrea Giammarchi - ISC */
    const TRUE = true, FALSE = false, QSA$1 = 'querySelectorAll';
  
    /**
     * Start observing a generic document or root element.
     * @param {(node:Element, connected:boolean) => void} callback triggered per each dis/connected element
     * @param {Document|Element} [root=document] by default, the global document to observe
     * @param {Function} [MO=MutationObserver] by default, the global MutationObserver
     * @param {string[]} [query=['*']] the selectors to use within nodes
     * @returns {MutationObserver}
     */
    const notify = (callback, root = document, MO = MutationObserver, query = ['*']) => {
      const loop = (nodes, selectors, added, removed, connected, pass) => {
        for (const node of nodes) {
          if (pass || (QSA$1 in node)) {
            if (connected) {
              if (!added.has(node)) {
                added.add(node);
                removed.delete(node);
                callback(node, connected);
              }
            }
            else if (!removed.has(node)) {
              removed.add(node);
              added.delete(node);
              callback(node, connected);
            }
            if (!pass)
              loop(node[QSA$1](selectors), selectors, added, removed, connected, TRUE);
          }
        }
      };
  
      const mo = new MO(records => {
        if (query.length) {
          const selectors = query.join(',');
          const added = new Set, removed = new Set;
          for (const {addedNodes, removedNodes} of records) {
            loop(removedNodes, selectors, added, removed, FALSE, FALSE);
            loop(addedNodes, selectors, added, removed, TRUE, FALSE);
          }
        }
      });
  
      const {observe} = mo;
      (mo.observe = node => observe.call(mo, node, {subtree: TRUE, childList: TRUE}))(root);
  
      return mo;
    };
  
    const QSA = 'querySelectorAll';
  
    const {document: document$2, Element: Element$1, MutationObserver: MutationObserver$2, Set: Set$2, WeakMap: WeakMap$1} = self;
  
    const elements = element => QSA in element;
    const {filter} = [];
  
    var qsaObserver = options => {
      const live = new WeakMap$1;
      const drop = elements => {
        for (let i = 0, {length} = elements; i < length; i++)
          live.delete(elements[i]);
      };
      const flush = () => {
        const records = observer.takeRecords();
        for (let i = 0, {length} = records; i < length; i++) {
          parse(filter.call(records[i].removedNodes, elements), false);
          parse(filter.call(records[i].addedNodes, elements), true);
        }
      };
      const matches = element => (
        element.matches ||
        element.webkitMatchesSelector ||
        element.msMatchesSelector
      );
      const notifier = (element, connected) => {
        let selectors;
        if (connected) {
          for (let q, m = matches(element), i = 0, {length} = query; i < length; i++) {
            if (m.call(element, q = query[i])) {
              if (!live.has(element))
                live.set(element, new Set$2);
              selectors = live.get(element);
              if (!selectors.has(q)) {
                selectors.add(q);
                options.handle(element, connected, q);
              }
            }
          }
        }
        else if (live.has(element)) {
          selectors = live.get(element);
          live.delete(element);
          selectors.forEach(q => {
            options.handle(element, connected, q);
          });
        }
      };
      const parse = (elements, connected = true) => {
        for (let i = 0, {length} = elements; i < length; i++)
          notifier(elements[i], connected);
      };
      const {query} = options;
      const root = options.root || document$2;
      const observer = notify(notifier, root, MutationObserver$2, query);
      const {attachShadow} = Element$1.prototype;
      if (attachShadow)
        Element$1.prototype.attachShadow = function (init) {
          const shadowRoot = attachShadow.call(this, init);
          observer.observe(shadowRoot);
          return shadowRoot;
        };
      if (query.length)
        parse(root[QSA](query));
      return {drop, flush, observer, parse};
    };
  
    const {
      customElements, document: document$1,
      Element, MutationObserver: MutationObserver$1, Object: Object$1, Promise: Promise$1,
      Map, Set: Set$1, WeakMap, Reflect
    } = self;
  
    const {createElement} = document$1;
    const {define, get, upgrade} = customElements;
    const {construct} = Reflect || {construct(HTMLElement) {
      return HTMLElement.call(this);
    }};
  
    const {defineProperty, getOwnPropertyNames, setPrototypeOf} = Object$1;
  
    const shadowRoots = new WeakMap;
    const shadows = new Set$1;
  
    const classes = new Map;
    const defined = new Map;
    const prototypes = new Map;
    const registry = new Map;
  
    const shadowed = [];
    const query = [];
  
    const getCE = is => registry.get(is) || get.call(customElements, is);
  
    const handle = (element, connected, selector) => {
      const proto = prototypes.get(selector);
      if (connected && !proto.isPrototypeOf(element)) {
        const redefine = expando(element);
        override = setPrototypeOf(element, proto);
        try { new proto.constructor; }
        finally {
          override = null;
          redefine();
        }
      }
      const method = `${connected ? '' : 'dis'}connectedCallback`;
      if (method in proto)
        element[method]();
    };
  
    const {parse} = qsaObserver({query, handle});
  
    const {parse: parseShadowed} = qsaObserver({
      query: shadowed,
      handle(element, connected) {
        if (shadowRoots.has(element)) {
          if (connected)
            shadows.add(element);
          else
            shadows.delete(element);
          if (query.length)
            parseShadow.call(query, element);
        }
      }
    });
  
    // qsaObserver also patches attachShadow
    // be sure this runs *after* that
    const {attachShadow} = Element.prototype;
    if (attachShadow)
      Element.prototype.attachShadow = function (init) {
        const root = attachShadow.call(this, init);
        shadowRoots.set(this, root);
        return root;
      };
  
    const whenDefined = name => {
      if (!defined.has(name)) {
        let _, $ = new Promise$1($ => { _ = $; });
        defined.set(name, {$, _});
      }
      return defined.get(name).$;
    };
  
    const augment = attributesObserver(whenDefined, MutationObserver$1);
  
    let override = null;
  
    getOwnPropertyNames(self)
      .filter(k => /^HTML.*Element$/.test(k))
      .forEach(k => {
        const HTMLElement = self[k];
        function HTMLBuiltIn() {
          const {constructor} = this;
          if (!classes.has(constructor))
            throw new TypeError('Illegal constructor');
          const {is, tag} = classes.get(constructor);
          if (is) {
            if (override)
              return augment(override, is);
            const element = createElement.call(document$1, tag);
            element.setAttribute('is', is);
            return augment(setPrototypeOf(element, constructor.prototype), is);
          }
          else
            return construct.call(this, HTMLElement, [], constructor);
        }
        setPrototypeOf(HTMLBuiltIn, HTMLElement);
        defineProperty(
          HTMLBuiltIn.prototype = HTMLElement.prototype,
          'constructor',
          {value: HTMLBuiltIn}
        );
        defineProperty(self, k, {value: HTMLBuiltIn});
      });
  
    document$1.createElement = function (name, options) {
      const is = options && options.is;
      if (is) {
        const Class = registry.get(is);
        if (Class && classes.get(Class).tag === name)
          return new Class;
      }
      const element = createElement.call(document$1, name);
      if (is)
        element.setAttribute('is', is);
      return element;
    };
  
    customElements.get = getCE;
    customElements.whenDefined = whenDefined;
    customElements.upgrade = function (element) {
      const is = element.getAttribute('is');
      if (is) {
        const constructor = registry.get(is);
        if (constructor) {
          augment(setPrototypeOf(element, constructor.prototype), is);
          // apparently unnecessary because this is handled by qsa observer
          // if (element.isConnected && element.connectedCallback)
          //   element.connectedCallback();
          return;
        }
      }
      upgrade.call(customElements, element);
    };
    customElements.define = function (is, Class, options) {
      if (getCE(is))
        throw new Error(`'${is}' has already been defined as a custom element`);
      let selector;
      const tag = options && options.extends;
      classes.set(Class, tag ? {is, tag} : {is: '', tag: is});
      if (tag) {
        selector = `${tag}[is="${is}"]`;
        prototypes.set(selector, Class.prototype);
        registry.set(is, Class);
        query.push(selector);
      }
      else {
        define.apply(customElements, arguments);
        shadowed.push(selector = is);
      }
      whenDefined(is).then(() => {
        if (tag) {
          parse(document$1.querySelectorAll(selector));
          shadows.forEach(parseShadow, [selector]);
        }
        else
          parseShadowed(document$1.querySelectorAll(selector));
      });
      defined.get(is)._(Class);
    };
  
    function parseShadow(element) {
      const root = shadowRoots.get(element);
      parse(root.querySelectorAll(this), element.isConnected);
    }
  
  })();