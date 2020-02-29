
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    const seen_callbacks = new Set();
    function flush() {
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.18.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const beforeUrlChange = {
      _hooks: [],
      subscribe(listener) {
        const hooks = this._hooks;
        const index = hooks.length;
        listener(callback => { hooks[index] = callback; });
        return () => delete hooks[index]
      }
    };

    function _isActive(url, route) {
      return function (path, keepIndex = true) {
        path = url(path, null, keepIndex);
        const currentPath = url(route.path, null, keepIndex);
        const re = new RegExp('^' + path);
        return currentPath.match(re)
      }
    }

    function _goto(url) {
      return function goto(path, params, _static, shallow) {
        const href = url(path, params);
        if (!_static) history.pushState({}, null, href);
        else getContext('routifyupdatepage')(href, shallow);
      }
    }

    function _url(context, route, routes) {
      return function url(path, params, preserveIndex) {
        path = path || './';

        if (!preserveIndex) path = path.replace(/index$/, '');

        if (path.match(/^\.\.?\//)) {
          //RELATIVE PATH
          // get component's dir
          let dir = context.path;
          // traverse through parents if needed
          const traverse = path.match(/\.\.\//g) || [];
          traverse.forEach(() => {
            dir = dir.replace(/\/[^\/]+\/?$/, '');
          });

          // strip leading periods and slashes
          path = path.replace(/^[\.\/]+/, '');
          dir = dir.replace(/\/$/, '') + '/';
          path = dir + path;
        } else if (path.match(/^\//)) ; else {
          // NAMED PATH
          const matchingRoute = routes.find(route => route.meta.name === path);
          if(matchingRoute) path = matchingRoute.shortPath;
        }

        params = Object.assign({}, route.params, context.params, params);
        for (const [key, value] of Object.entries(params)) {
          path = path.replace(`:${key}`, value);
        }
        return path
      }
    }

    const route = writable({});
    const routes = writable([]);

    var config = {
      "pages": "/Users/davidcase/Source/jig-tac-to/src/pages",
      "sourceDir": "public",
      "routifyDir": "node_modules/@sveltech/routify/tmp",
      "ignore": [],
      "unknownPropWarnings": true,
      "dynamicImports": false,
      "singleBuild": false,
      "scroll": false,
      "extensions": [
        "html",
        "svelte",
        "md"
      ],
      "distDir": "dist",
      "noPrerender": false,
      "unusedPropWarnings": true
    };

    const MATCH_PARAM = RegExp(/\:[^\/\()]+/g);

    function handleScroll(element) {
      scrollAncestorsToTop(element);
      handleHash();
    }


    function handleHash() {
      const { scroll } = config;
      const options = ['auto', 'smooth', 'smooth'];
      const { hash } = window.location;
      if (scroll && hash) {
        const behavior = options.includes(scroll) && scroll || 'auto';
        const el = document.querySelector(hash);
        if (hash && el) el.scrollIntoView({ behavior });
      }
    }


    function scrollAncestorsToTop(element) {
      if (element && element.scrollTo && element.dataset.routify !== 'scroll-lock') {
        element.scrollTo(0, 0);
        scrollAncestorsToTop(element.parentElement);
      }
    }

    const pathToRegex = (str, recursive) => {
      const suffix = recursive ? '' : '/?$'; //fallbacks should match recursively
      str = str.replace(/\/_fallback?$/, '(/|$)');
      str = str.replace(/\/index$/, '(/index)?'); //index files should be matched even if not present in url
      str = '^' + str.replace(MATCH_PARAM, '([^/]+)') + suffix;
      return str
    };

    const pathToParams = string => {
      const matches = string.match(MATCH_PARAM);
      if (matches) return matches.map(str => str.substr(1, str.length - 2))
    };

    const pathToRank = ({ path }) => {
      return path
        .split('/').filter(Boolean)
        .map(str => (str === '_fallback' ? 'A' : str.startsWith(':') ? 'B' : 'C'))
        .join('')
    };

    /* node_modules/@sveltech/routify/runtime/Route.svelte generated by Svelte v3.18.1 */
    const file = "node_modules/@sveltech/routify/runtime/Route.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	return child_ctx;
    }

    // (79:0) {#if component}
    function create_if_block_1(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = [0];
    	const get_key = ctx => /*key*/ ctx[5];
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < 1; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const each_value = [0];
    			group_outros();
    			validate_each_keys(ctx, each_value, get_each_context, get_key);
    			each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block, each_1_anchor, get_each_context);
    			check_outros();
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < 1; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 1; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(79:0) {#if component}",
    		ctx
    	});

    	return block;
    }

    // (88:6) {#if remainingLayouts.length}
    function create_if_block_2(ctx) {
    	let current;

    	const route_1 = new Route({
    			props: {
    				layouts: [.../*remainingLayouts*/ ctx[8]],
    				Decorator: typeof /*decorator*/ ctx[26] !== "undefined"
    				? /*decorator*/ ctx[26]
    				: /*_passthroughDecorator*/ ctx[2],
    				_passthroughDecorator: /*Decorator*/ ctx[1],
    				scoped: {
    					.../*scoped*/ ctx[0],
    					.../*scopeToChild*/ ctx[10]
    				}
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route_1_changes = {};
    			if (dirty & /*remainingLayouts*/ 256) route_1_changes.layouts = [.../*remainingLayouts*/ ctx[8]];

    			if (dirty & /*decorator, _passthroughDecorator*/ 67108868) route_1_changes.Decorator = typeof /*decorator*/ ctx[26] !== "undefined"
    			? /*decorator*/ ctx[26]
    			: /*_passthroughDecorator*/ ctx[2];

    			if (dirty & /*Decorator*/ 2) route_1_changes._passthroughDecorator = /*Decorator*/ ctx[1];

    			if (dirty & /*scoped, scopeToChild*/ 1025) route_1_changes.scoped = {
    				.../*scoped*/ ctx[0],
    				.../*scopeToChild*/ ctx[10]
    			};

    			route_1.$set(route_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(88:6) {#if remainingLayouts.length}",
    		ctx
    	});

    	return block;
    }

    // (81:4) <svelte:component        this={component}        let:scoped={scopeToChild}        let:decorator        {scoped}        {scopedSync}        {...propFromParam}>
    function create_default_slot(ctx) {
    	let t;
    	let current;
    	let if_block = /*remainingLayouts*/ ctx[8].length && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*remainingLayouts*/ ctx[8].length) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(81:4) <svelte:component        this={component}        let:scoped={scopeToChild}        let:decorator        {scoped}        {scopedSync}        {...propFromParam}>",
    		ctx
    	});

    	return block;
    }

    // (80:2) {#each [0] as dummy (key)}
    function create_each_block(key_2, ctx) {
    	let first;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ scoped: /*scoped*/ ctx[0] },
    		{ scopedSync: /*scopedSync*/ ctx[6] },
    		/*propFromParam*/ ctx[4]
    	];

    	var switch_value = /*component*/ ctx[7];

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: {
    				default: [
    					create_default_slot,
    					({ scoped: scopeToChild, decorator }) => ({ 10: scopeToChild, 26: decorator }),
    					({ scoped: scopeToChild, decorator }) => (scopeToChild ? 1024 : 0) | (decorator ? 67108864 : 0)
    				]
    			},
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		key: key_2,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*scoped, scopedSync, propFromParam*/ 81)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*scoped*/ 1 && { scoped: /*scoped*/ ctx[0] },
    					dirty & /*scopedSync*/ 64 && { scopedSync: /*scopedSync*/ ctx[6] },
    					dirty & /*propFromParam*/ 16 && get_spread_object(/*propFromParam*/ ctx[4])
    				])
    			: {};

    			if (dirty & /*$$scope, remainingLayouts, decorator, _passthroughDecorator, Decorator, scoped, scopeToChild*/ 201327879) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*component*/ ctx[7])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(80:2) {#each [0] as dummy (key)}",
    		ctx
    	});

    	return block;
    }

    // (100:0) {#if !parentElement}
    function create_if_block(ctx) {
    	let span;
    	let setParent_action;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			add_location(span, file, 100, 2, 2700);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			dispose = action_destroyer(setParent_action = /*setParent*/ ctx[9].call(null, span));
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(100:0) {#if !parentElement}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*component*/ ctx[7] && create_if_block_1(ctx);
    	let if_block1 = !/*parentElement*/ ctx[3] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*component*/ ctx[7]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!/*parentElement*/ ctx[3]) {
    				if (!if_block1) {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $route;
    	let $routes;
    	validate_store(route, "route");
    	component_subscribe($$self, route, $$value => $$invalidate(16, $route = $$value));
    	validate_store(routes, "routes");
    	component_subscribe($$self, routes, $$value => $$invalidate(17, $routes = $$value));

    	let { layouts = [] } = $$props,
    		{ scoped = {} } = $$props,
    		{ Decorator = undefined } = $$props,
    		{ _passthroughDecorator = undefined } = $$props;

    	let scopeToChild,
    		props = {},
    		parentElement,
    		propFromParam = {},
    		key = 0,
    		scopedSync = {};

    	const context = writable({});
    	setContext("routify", context);

    	function setParent(el) {
    		$$invalidate(3, parentElement = el.parentElement);
    	}

    	let _lastLayout, _Component;

    	function onComponentLoaded() {
    		$$invalidate(12, _lastLayout = layout);
    		if (layoutIsUpdated) $$invalidate(5, key++, key);
    		if (remainingLayouts.length === 0) onLastComponentLoaded();
    		const url = _url(layout, $route, $routes);

    		context.set({
    			route: $route,
    			path: layout.path,
    			url,
    			goto: _goto(url),
    			isActive: _isActive(url, $route)
    		});
    	}

    	let component;

    	function setComponent(layout) {
    		if (layoutIsUpdated) _Component = layout.component();

    		if (_Component.then) _Component.then(res => {
    			$$invalidate(7, component = res);
    			$$invalidate(6, scopedSync = { ...scoped });
    			onComponentLoaded();
    		}); else {
    			$$invalidate(7, component = _Component);
    			$$invalidate(6, scopedSync = { ...scoped });
    			onComponentLoaded();
    		}
    	}

    	async function onLastComponentLoaded() {
    		await tick();
    		handleScroll(parentElement);

    		if (!window.routify.stopAutoReady) {
    			// Let every know the last child has rendered
    			dispatchEvent(new CustomEvent("app-loaded"));
    		}
    	}

    	const writable_props = ["layouts", "scoped", "Decorator", "_passthroughDecorator"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Route> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("layouts" in $$props) $$invalidate(11, layouts = $$props.layouts);
    		if ("scoped" in $$props) $$invalidate(0, scoped = $$props.scoped);
    		if ("Decorator" in $$props) $$invalidate(1, Decorator = $$props.Decorator);
    		if ("_passthroughDecorator" in $$props) $$invalidate(2, _passthroughDecorator = $$props._passthroughDecorator);
    	};

    	$$self.$capture_state = () => {
    		return {
    			layouts,
    			scoped,
    			Decorator,
    			_passthroughDecorator,
    			scopeToChild,
    			props,
    			parentElement,
    			propFromParam,
    			key,
    			scopedSync,
    			_lastLayout,
    			_Component,
    			component,
    			layout,
    			remainingLayouts,
    			layoutIsUpdated,
    			$route,
    			$routes
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("layouts" in $$props) $$invalidate(11, layouts = $$props.layouts);
    		if ("scoped" in $$props) $$invalidate(0, scoped = $$props.scoped);
    		if ("Decorator" in $$props) $$invalidate(1, Decorator = $$props.Decorator);
    		if ("_passthroughDecorator" in $$props) $$invalidate(2, _passthroughDecorator = $$props._passthroughDecorator);
    		if ("scopeToChild" in $$props) $$invalidate(10, scopeToChild = $$props.scopeToChild);
    		if ("props" in $$props) props = $$props.props;
    		if ("parentElement" in $$props) $$invalidate(3, parentElement = $$props.parentElement);
    		if ("propFromParam" in $$props) $$invalidate(4, propFromParam = $$props.propFromParam);
    		if ("key" in $$props) $$invalidate(5, key = $$props.key);
    		if ("scopedSync" in $$props) $$invalidate(6, scopedSync = $$props.scopedSync);
    		if ("_lastLayout" in $$props) $$invalidate(12, _lastLayout = $$props._lastLayout);
    		if ("_Component" in $$props) _Component = $$props._Component;
    		if ("component" in $$props) $$invalidate(7, component = $$props.component);
    		if ("layout" in $$props) $$invalidate(14, layout = $$props.layout);
    		if ("remainingLayouts" in $$props) $$invalidate(8, remainingLayouts = $$props.remainingLayouts);
    		if ("layoutIsUpdated" in $$props) layoutIsUpdated = $$props.layoutIsUpdated;
    		if ("$route" in $$props) route.set($route = $$props.$route);
    		if ("$routes" in $$props) routes.set($routes = $$props.$routes);
    	};

    	let layout;
    	let remainingLayouts;
    	let layoutIsUpdated;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*Decorator, layouts*/ 2050) {
    			$: if (Decorator) {
    				$$invalidate(11, layouts = [
    					{
    						component: () => Decorator,
    						path: layouts[0].path + "__decorator"
    					},
    					...layouts
    				]);
    			}
    		}

    		if ($$self.$$.dirty & /*layouts*/ 2048) {
    			$: $$invalidate(14, [layout, ...remainingLayouts] = layouts, layout, (($$invalidate(8, remainingLayouts), $$invalidate(11, layouts)), $$invalidate(1, Decorator)));
    		}

    		if ($$self.$$.dirty & /*layout*/ 16384) {
    			$: if (layout && layout.param) $$invalidate(4, propFromParam = layout.param);
    		}

    		if ($$self.$$.dirty & /*_lastLayout, layout*/ 20480) {
    			$: layoutIsUpdated = !_lastLayout || _lastLayout.path !== layout.path;
    		}

    		if ($$self.$$.dirty & /*layout*/ 16384) {
    			$: setComponent(layout);
    		}
    	};

    	return [
    		scoped,
    		Decorator,
    		_passthroughDecorator,
    		parentElement,
    		propFromParam,
    		key,
    		scopedSync,
    		component,
    		remainingLayouts,
    		setParent,
    		scopeToChild,
    		layouts
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			layouts: 11,
    			scoped: 0,
    			Decorator: 1,
    			_passthroughDecorator: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get layouts() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set layouts(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scoped() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scoped(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Decorator() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Decorator(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get _passthroughDecorator() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set _passthroughDecorator(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const { _hooks } = beforeUrlChange;

    function init$1(routes, callback) {
      let prevRoute = false;

      function updatePage(url, shallow) {

        const currentUrl = window.location.pathname;
        url = url || currentUrl;

        const route$1 = urlToRoute(url, routes);
        const currentRoute = shallow && urlToRoute(currentUrl, routes);
        const contextRoute = currentRoute || route$1;
        const layouts = [...contextRoute.layouts, route$1];
        delete prevRoute.prev;
        route$1.prev = prevRoute;
        prevRoute = route$1;

        //set the route in the store
        route.set(route$1);

        //run callback in Router.svelte
        callback(layouts);
      }

      createEventListeners(updatePage);

      return updatePage
    }

    /**
     * svelte:window events doesn't work on refresh
     * @param {Function} updatePage 
     */
    function createEventListeners(updatePage) {
    ['pushState', 'replaceState'].forEach(eventName => {
        const fn = history[eventName];
        history[eventName] = async function (state, title, url) {
          const event = new Event(eventName.toLowerCase());
          Object.assign(event, { state, title, url });

          if (await runHooksBeforeUrlChange(event)) {
            fn.apply(this, [state, title, url]);
            return dispatchEvent(event)
          }
        };
      });

      // click
      addEventListener('click', handleClick)
        ;['pushstate', 'popstate', 'replacestate'].forEach(e =>
          addEventListener(e, () => updatePage())
        );
    }

    function handleClick(event) {
      const el = event.target.closest('a');
      const href = el && el.getAttribute('href');

      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey ||
        event.button ||
        event.defaultPrevented
      )
        return
      if (!href || el.target || el.host !== location.host) return

      event.preventDefault();
      history.pushState({}, '', href);
    }

    async function runHooksBeforeUrlChange(event) {
      const route$1 = get_store_value(route);
      for (const hook of _hooks.filter(Boolean)) {
        // return false if the hook returns false
        if (await !hook(event, route$1)) return false
      }
      return true
    }


    function urlToRoute(url, routes) {
      const mockUrl = (new URL(location)).searchParams.get('__mock-url');
      url = mockUrl || url;

      const route = routes.find(route => url.match(route.regex));
      if (!route)
        throw new Error(
          `Route could not be found. Make sure ${url}.svelte or ${url}/index.svelte exists. A restart may be required.`
        )

      if (route.paramKeys) {
        const layouts = layoutByPos(route.layouts);
        const fragments = url.split('/').filter(Boolean);
        const routeProps = getRouteProps(route.path);

        routeProps.forEach((prop, i) => {
          if (prop) {
            route.params[prop] = fragments[i];
            if (layouts[i]) layouts[i].param = { [prop]: fragments[i] };
            else route.param = { [prop]: fragments[i] };
          }
        });
      }

      route.leftover = url.replace(new RegExp(route.regex), '');

      return route
    }

    function layoutByPos(layouts) {
      const arr = [];
      layouts.forEach(layout => {
        arr[layout.path.split('/').filter(Boolean).length - 1] = layout;
      });
      return arr
    }

    function getRouteProps(url) {
      return url
        .split('/')
        .filter(Boolean)
        .map(f => f.match(/\:(.+)/))
        .map(f => f && f[1])
    }

    /* node_modules/@sveltech/routify/runtime/Router.svelte generated by Svelte v3.18.1 */

    function create_fragment$1(ctx) {
    	let current;

    	const route = new Route({
    			props: { layouts: /*layouts*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(route, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const route_changes = {};
    			if (dirty & /*layouts*/ 1) route_changes.layouts = /*layouts*/ ctx[0];
    			route.$set(route_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $routesStore;
    	validate_store(routes, "routesStore");
    	component_subscribe($$self, routes, $$value => $$invalidate(3, $routesStore = $$value));
    	window.routify = {};
    	let { routes: routes$1 } = $$props;
    	routes.set(routes$1);
    	let layouts = [];
    	const callback = res => $$invalidate(0, layouts = res);
    	const writable_props = ["routes"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("routes" in $$props) $$invalidate(1, routes$1 = $$props.routes);
    	};

    	$$self.$capture_state = () => {
    		return {
    			routes: routes$1,
    			layouts,
    			updatePage,
    			$routesStore
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(1, routes$1 = $$props.routes);
    		if ("layouts" in $$props) $$invalidate(0, layouts = $$props.layouts);
    		if ("updatePage" in $$props) $$invalidate(2, updatePage = $$props.updatePage);
    		if ("$routesStore" in $$props) routes.set($routesStore = $$props.$routesStore);
    	};

    	let updatePage;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$routesStore*/ 8) {
    			$: $$invalidate(2, updatePage = init$1($routesStore, callback));
    		}

    		if ($$self.$$.dirty & /*updatePage*/ 4) {
    			$: updatePage();
    		}

    		if ($$self.$$.dirty & /*updatePage*/ 4) {
    			$: setContext("routifyupdatepage", updatePage);
    		}
    	};

    	return [layouts, routes$1];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { routes: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*routes*/ ctx[1] === undefined && !("routes" in props)) {
    			console.warn("<Router> was created without expected prop 'routes'");
    		}
    	}

    	get routes() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function buildRoutes(routes, routeKeys) {
      return (
        routes
          // .map(sr => deserializeRoute(sr, routeKeys))
          .map(decorateRoute)
          .sort((c, p) => (c.ranking >= p.ranking ? -1 : 1))
      )
    }

    const decorateRoute = function(route) {
      route.paramKeys = pathToParams(route.path);
      route.regex = pathToRegex(route.path, route.isFallback);
      route.name = route.path.match(/[^\/]*\/[^\/]+$/)[0].replace(/[^\w\/]/g, ''); //last dir and name, then replace all but \w and /
      route.ranking = pathToRank(route);
      route.layouts.map(l => {
        l.param = {};
        return l
      });
      route.params = {};

      return route
    };

    function calculateWinner(squares) {
      const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
      ];
      for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
          return squares[a];
        }
      }
      return null;
    }

    class History {
      constructor() {
        this.history = new Array();
        this.current = -1;
      }

      currentState() {
        return this.history[this.current];
      }

      push(state) {
        // remove all redo states
        if (this.canRedo()) this.history.splice(this.current + 1);

        // add a new state
        this.current++;
        this.history.push(state);
      }

      canUndo() {
        return this.current > 0;
      }

      canRedo() {
        return this.current < this.history.length - 1;
      }

      undo() {
        if (this.canUndo()) this.current--;
      }

      redo() {
        if (this.canRedo()) this.current++;
      }

      setCurrent(current) {
        if (current >= 0 && current < this.history.length) this.current = current;
      }
    }

    function createHistory() {
      const { subscribe, set, update } = writable(new History());

      return {
        subscribe,
        push: state =>
          update(h => {
            h.push(state);
            console.log(h);
            return h;
          }),
        undo: () =>
          update(h => {
            h.undo();
            return h;
          }),
        redo: () =>
          update(h => {
            h.redo();
            return h;
          }),
        setCurrent: current =>
          update(h => {
            h.setCurrent(current);
            return h;
          })
      };
    }

    const history$1 = createHistory();

    const status = derived(history$1, $history => {
      if ($history.currentState()) {
        if (calculateWinner($history.currentState().squares)) return 1;
        else if ($history.current == 9) return 2;
      }
      return 0;
    });

    /* src/components/Board.svelte generated by Svelte v3.18.1 */
    const file$1 = "src/components/Board.svelte";

    function create_fragment$2(ctx) {
    	let canvas_1;
    	let dispose;

    	const block = {
    		c: function create() {
    			canvas_1 = element("canvas");
    			attr_dev(canvas_1, "width", /*boardWidth*/ ctx[1]);
    			attr_dev(canvas_1, "height", /*boardHeight*/ ctx[2]);
    			add_location(canvas_1, file$1, 90, 0, 2032);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, canvas_1, anchor);
    			/*canvas_1_binding*/ ctx[12](canvas_1);
    			dispose = listen_dev(canvas_1, "click", /*handleClick*/ ctx[3], false, false, false);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(canvas_1);
    			/*canvas_1_binding*/ ctx[12](null);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $history;
    	let $status;
    	validate_store(history$1, "history");
    	component_subscribe($$self, history$1, $$value => $$invalidate(9, $history = $$value));
    	validate_store(status, "status");
    	component_subscribe($$self, status, $$value => $$invalidate(10, $status = $$value));
    	let { width = 3 } = $$props;
    	let { height = 3 } = $$props;
    	let { cellWidth = 34 } = $$props;
    	let { cellHeight = 34 } = $$props;
    	let { colorStroke = "#999" } = $$props;
    	let boardWidth = 1 + width * cellWidth;
    	let boardHeight = 1 + height * cellHeight;
    	let canvas;

    	let state = {
    		squares: Array(9).fill(""),
    		xIsNext: true
    	};

    	history$1.push(state);

    	function handleClick(event) {
    		let x = Math.trunc((event.offsetX + 0.5) / cellWidth);
    		let y = Math.trunc((event.offsetY + 0.5) / cellHeight);
    		let i = y * width + x;
    		const state = $history.currentState();
    		if ($status == 1 || state.squares[i]) return;
    		const squares = state.squares.slice();
    		squares[i] = state.xIsNext ? "X" : "O";
    		let newState = { squares, xIsNext: !state.xIsNext };
    		history$1.push(newState);
    	}

    	onMount(() => {
    		const ctx = canvas.getContext("2d");

    		function draw() {
    			ctx.clearRect(0, 0, boardWidth, boardHeight);

    			// draw board
    			ctx.beginPath();

    			// vertical lines
    			for (let x = 0; x <= boardWidth; x += cellWidth) {
    				ctx.moveTo(0.5 + x, 0);
    				ctx.lineTo(0.5 + x, boardHeight);
    			}

    			// horizontal lines
    			for (let y = 0; y <= boardHeight; y += cellHeight) {
    				ctx.moveTo(0, 0.5 + y);
    				ctx.lineTo(boardWidth, 0.5 + y);
    			}

    			// draw the board
    			ctx.strokeStyle = colorStroke;

    			ctx.stroke();
    			ctx.closePath();

    			// draw cells
    			ctx.beginPath();

    			ctx.font = "bold 22px Century Gothic";
    			let d = 8;
    			let k = 0;

    			for (let i = 0; i < height; i += 1) {
    				for (let j = 0; j < width; j += 1) {
    					ctx.fillText($history.currentState().squares[k], j * cellWidth + d + 1, (i + 1) * cellHeight - d);
    					k++;
    				}
    			}

    			ctx.closePath();
    			requestAnimationFrame(draw);
    		}

    		draw();
    	});

    	const writable_props = ["width", "height", "cellWidth", "cellHeight", "colorStroke"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Board> was created with unknown prop '${key}'`);
    	});

    	function canvas_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(0, canvas = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("width" in $$props) $$invalidate(4, width = $$props.width);
    		if ("height" in $$props) $$invalidate(5, height = $$props.height);
    		if ("cellWidth" in $$props) $$invalidate(6, cellWidth = $$props.cellWidth);
    		if ("cellHeight" in $$props) $$invalidate(7, cellHeight = $$props.cellHeight);
    		if ("colorStroke" in $$props) $$invalidate(8, colorStroke = $$props.colorStroke);
    	};

    	$$self.$capture_state = () => {
    		return {
    			width,
    			height,
    			cellWidth,
    			cellHeight,
    			colorStroke,
    			boardWidth,
    			boardHeight,
    			canvas,
    			state,
    			$history,
    			$status
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("width" in $$props) $$invalidate(4, width = $$props.width);
    		if ("height" in $$props) $$invalidate(5, height = $$props.height);
    		if ("cellWidth" in $$props) $$invalidate(6, cellWidth = $$props.cellWidth);
    		if ("cellHeight" in $$props) $$invalidate(7, cellHeight = $$props.cellHeight);
    		if ("colorStroke" in $$props) $$invalidate(8, colorStroke = $$props.colorStroke);
    		if ("boardWidth" in $$props) $$invalidate(1, boardWidth = $$props.boardWidth);
    		if ("boardHeight" in $$props) $$invalidate(2, boardHeight = $$props.boardHeight);
    		if ("canvas" in $$props) $$invalidate(0, canvas = $$props.canvas);
    		if ("state" in $$props) state = $$props.state;
    		if ("$history" in $$props) history$1.set($history = $$props.$history);
    		if ("$status" in $$props) status.set($status = $$props.$status);
    	};

    	return [
    		canvas,
    		boardWidth,
    		boardHeight,
    		handleClick,
    		width,
    		height,
    		cellWidth,
    		cellHeight,
    		colorStroke,
    		$history,
    		$status,
    		state,
    		canvas_1_binding
    	];
    }

    class Board extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			width: 4,
    			height: 5,
    			cellWidth: 6,
    			cellHeight: 7,
    			colorStroke: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Board",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get width() {
    		throw new Error("<Board>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Board>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Board>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Board>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cellWidth() {
    		throw new Error("<Board>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cellWidth(value) {
    		throw new Error("<Board>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cellHeight() {
    		throw new Error("<Board>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cellHeight(value) {
    		throw new Error("<Board>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get colorStroke() {
    		throw new Error("<Board>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colorStroke(value) {
    		throw new Error("<Board>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/index.svelte generated by Svelte v3.18.1 */
    const file$2 = "src/pages/index.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (37:6) {:else}
    function create_else_block_3(ctx) {
    	let t0;
    	let t1_value = (/*$history*/ ctx[1].currentState().xIsNext ? "X" : "O") + "";
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text("Next player: ");
    			t1 = text(t1_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$history*/ 2 && t1_value !== (t1_value = (/*$history*/ ctx[1].currentState().xIsNext ? "X" : "O") + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_3.name,
    		type: "else",
    		source: "(37:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (35:30) 
    function create_if_block_4(ctx) {
    	let b;

    	const block = {
    		c: function create() {
    			b = element("b");
    			b.textContent = "Draw";
    			add_location(b, file$2, 35, 8, 649);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, b, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(b);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(35:30) ",
    		ctx
    	});

    	return block;
    }

    // (33:6) {#if $status === 1}
    function create_if_block_3(ctx) {
    	let b;
    	let t0;
    	let t1_value = (!/*$history*/ ctx[1].currentState().xIsNext ? "X" : "O") + "";
    	let t1;

    	const block = {
    		c: function create() {
    			b = element("b");
    			t0 = text("Winner: ");
    			t1 = text(t1_value);
    			add_location(b, file$2, 33, 8, 548);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, b, anchor);
    			append_dev(b, t0);
    			append_dev(b, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$history*/ 2 && t1_value !== (t1_value = (!/*$history*/ ctx[1].currentState().xIsNext ? "X" : "O") + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(b);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(33:6) {#if $status === 1}",
    		ctx
    	});

    	return block;
    }

    // (42:6) {:else}
    function create_else_block_2(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Undo";
    			button.disabled = true;
    			add_location(button, file$2, 42, 8, 866);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(42:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (40:6) {#if $history.canUndo()}
    function create_if_block_2$1(ctx) {
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Undo";
    			add_location(button, file$2, 40, 8, 798);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			dispose = listen_dev(button, "click", history$1.undo, false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(40:6) {#if $history.canUndo()}",
    		ctx
    	});

    	return block;
    }

    // (47:6) {:else}
    function create_else_block_1(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Redo";
    			button.disabled = true;
    			add_location(button, file$2, 47, 8, 1016);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(47:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (45:6) {#if $history.canRedo()}
    function create_if_block_1$1(ctx) {
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Redo";
    			add_location(button, file$2, 45, 8, 948);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			dispose = listen_dev(button, "click", history$1.redo, false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(45:6) {#if $history.canRedo()}",
    		ctx
    	});

    	return block;
    }

    // (59:8) {:else}
    function create_else_block(ctx) {
    	let li;
    	let button;
    	let t0;
    	let t1;
    	let t2;
    	let dispose;

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[3](/*i*/ ctx[6], ...args);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			button = element("button");
    			t0 = text("Go to move #");
    			t1 = text(/*i*/ ctx[6]);
    			t2 = space();
    			add_location(button, file$2, 60, 12, 1330);
    			add_location(li, file$2, 59, 10, 1313);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, button);
    			append_dev(button, t0);
    			append_dev(button, t1);
    			append_dev(li, t2);
    			dispose = listen_dev(button, "click", click_handler_1, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(59:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (53:8) {#if i == 0}
    function create_if_block$1(ctx) {
    	let li;
    	let button;
    	let t1;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[2](/*i*/ ctx[6], ...args);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			button = element("button");
    			button.textContent = "Go to game start";
    			t1 = space();
    			add_location(button, file$2, 54, 12, 1170);
    			add_location(li, file$2, 53, 10, 1153);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, button);
    			append_dev(li, t1);
    			dispose = listen_dev(button, "click", click_handler, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(53:8) {#if i == 0}",
    		ctx
    	});

    	return block;
    }

    // (52:6) {#each $history.history as value, i}
    function create_each_block$1(ctx) {
    	let if_block_anchor;

    	function select_block_type_3(ctx, dirty) {
    		if (/*i*/ ctx[6] == 0) return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_3(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if_block.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(52:6) {#each $history.history as value, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div4;
    	let div0;
    	let t0;
    	let div3;
    	let div1;
    	let t1;
    	let div2;
    	let show_if_1;
    	let t2;
    	let show_if;
    	let t3;
    	let ol;
    	let current;
    	const board = new Board({ $$inline: true });

    	function select_block_type(ctx, dirty) {
    		if (/*$status*/ ctx[0] === 1) return create_if_block_3;
    		if (/*$status*/ ctx[0] === 2) return create_if_block_4;
    		return create_else_block_3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (show_if_1 == null || dirty & /*$history*/ 2) show_if_1 = !!/*$history*/ ctx[1].canUndo();
    		if (show_if_1) return create_if_block_2$1;
    		return create_else_block_2;
    	}

    	let current_block_type_1 = select_block_type_1(ctx, -1);
    	let if_block1 = current_block_type_1(ctx);

    	function select_block_type_2(ctx, dirty) {
    		if (show_if == null || dirty & /*$history*/ 2) show_if = !!/*$history*/ ctx[1].canRedo();
    		if (show_if) return create_if_block_1$1;
    		return create_else_block_1;
    	}

    	let current_block_type_2 = select_block_type_2(ctx, -1);
    	let if_block2 = current_block_type_2(ctx);
    	let each_value = /*$history*/ ctx[1].history;
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			create_component(board.$$.fragment);
    			t0 = space();
    			div3 = element("div");
    			div1 = element("div");
    			if_block0.c();
    			t1 = space();
    			div2 = element("div");
    			if_block1.c();
    			t2 = space();
    			if_block2.c();
    			t3 = space();
    			ol = element("ol");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "game-board");
    			add_location(div0, file$2, 27, 2, 415);
    			attr_dev(div1, "class", "status svelte-t83zct");
    			add_location(div1, file$2, 31, 4, 493);
    			add_location(div2, file$2, 38, 4, 753);
    			attr_dev(ol, "class", "svelte-t83zct");
    			add_location(ol, file$2, 50, 4, 1074);
    			attr_dev(div3, "class", "game-info svelte-t83zct");
    			add_location(div3, file$2, 30, 2, 465);
    			attr_dev(div4, "class", "game svelte-t83zct");
    			add_location(div4, file$2, 26, 0, 394);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			mount_component(board, div0, null);
    			append_dev(div4, t0);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			if_block0.m(div1, null);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			if_block1.m(div2, null);
    			append_dev(div2, t2);
    			if_block2.m(div2, null);
    			append_dev(div3, t3);
    			append_dev(div3, ol);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ol, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div1, null);
    				}
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx, dirty)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div2, t2);
    				}
    			}

    			if (current_block_type_2 === (current_block_type_2 = select_block_type_2(ctx, dirty)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type_2(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div2, null);
    				}
    			}

    			if (dirty & /*history, $history*/ 2) {
    				each_value = /*$history*/ ctx[1].history;
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ol, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(board.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(board.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(board);
    			if_block0.d();
    			if_block1.d();
    			if_block2.d();
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $status;
    	let $history;
    	validate_store(status, "status");
    	component_subscribe($$self, status, $$value => $$invalidate(0, $status = $$value));
    	validate_store(history$1, "history");
    	component_subscribe($$self, history$1, $$value => $$invalidate(1, $history = $$value));
    	const click_handler = i => history$1.setCurrent(i);
    	const click_handler_1 = i => history$1.setCurrent(i);

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("$status" in $$props) status.set($status = $$props.$status);
    		if ("$history" in $$props) history$1.set($history = $$props.$history);
    	};

    	return [$status, $history, click_handler, click_handler_1];
    }

    class Index extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Index",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/pages/about.svelte generated by Svelte v3.18.1 */

    const file$3 = "src/pages/about.svelte";

    function create_fragment$4(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			t0 = text("hello aksjhdkjlasa::aftera aslkdjhlakjhslkdhja");
    			t1 = text(/*counter*/ ctx[0]);
    			t2 = space();
    			button = element("button");
    			button.textContent = "hallo";
    			attr_dev(button, "class", "svelte-1ssv5uz");
    			add_location(button, file$3, 11, 0, 155);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, button, anchor);
    			dispose = listen_dev(button, "click", /*click_handler*/ ctx[1], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*counter*/ 1) set_data_dev(t1, /*counter*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let counter = 1;

    	const click_handler = () => {
    		$$invalidate(0, counter++, counter);
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("counter" in $$props) $$invalidate(0, counter = $$props.counter);
    	};

    	return [counter, click_handler];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    //raw routes
    const _routes = [
      {
        "component": () => Index,
        "meta": {},
        "isIndex": true,
        "isFallback": false,
        "hasParam": false,
        "path": "/index",
        "shortPath": "",
        "layouts": []
      },
      {
        "component": () => About,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/about",
        "shortPath": "/about",
        "layouts": []
      }
    ];

    //routes
    const routes$1 = buildRoutes(_routes);

    /* src/App.svelte generated by Svelte v3.18.1 */

    function create_fragment$5(ctx) {
    	let current;
    	const router = new Router({ props: { routes: routes$1 }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {
            name: "world"
        }
    });

    return app;

}());
//# sourceMappingURL=main.js.map
