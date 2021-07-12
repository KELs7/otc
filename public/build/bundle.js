
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
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
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
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
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
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
        flushing = false;
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
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
        }
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
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
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
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.35.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\upnav.svelte generated by Svelte v3.35.0 */

    const file$7 = "src\\upnav.svelte";

    function create_fragment$7(ctx) {
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let span;
    	let t2;
    	let div0;
    	let a0;
    	let t4;
    	let a1;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			span = element("span");
    			span.textContent = "Crowfer";
    			t2 = space();
    			div0 = element("div");
    			a0 = element("a");
    			a0.textContent = "Donate";
    			t4 = space();
    			a1 = element("a");
    			a1.textContent = "Offers";
    			if (img.src !== (img_src_value = "crowfer.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "logo");
    			attr_dev(img, "class", "svelte-c49j5r");
    			add_location(img, file$7, 40, 1, 525);
    			attr_dev(span, "class", "svelte-c49j5r");
    			add_location(span, file$7, 41, 1, 562);
    			attr_dev(a0, "href", "#/");
    			attr_dev(a0, "class", "svelte-c49j5r");
    			add_location(a0, file$7, 43, 2, 611);
    			attr_dev(a1, "href", "#/");
    			attr_dev(a1, "class", "svelte-c49j5r");
    			add_location(a1, file$7, 44, 2, 638);
    			attr_dev(div0, "class", "menu-nav svelte-c49j5r");
    			add_location(div0, file$7, 42, 1, 585);
    			attr_dev(div1, "class", "u-nav svelte-c49j5r");
    			add_location(div1, file$7, 39, 0, 503);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, span);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, a0);
    			append_dev(div0, t4);
    			append_dev(div0, a1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Upnav", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Upnav> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Upnav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Upnav",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\card.svelte generated by Svelte v3.35.0 */

    const file$6 = "src\\card.svelte";

    function create_fragment$6(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "shade-area1 svelte-1xtjjyg");
    			add_location(div0, file$6, 40, 1, 688);
    			attr_dev(div1, "class", "shade-area2 svelte-1xtjjyg");
    			add_location(div1, file$6, 43, 1, 728);
    			attr_dev(div2, "class", "border-case svelte-1xtjjyg");
    			add_location(div2, file$6, 39, 0, 659);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div2, t1);

    			if (default_slot) {
    				default_slot.m(div2, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Card", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\inputs.svelte generated by Svelte v3.35.0 */

    const file$5 = "src\\inputs.svelte";

    function create_fragment$5(ctx) {
    	let input0;
    	let t0;
    	let input1;
    	let t1;
    	let input2;
    	let t2;
    	let input3;
    	let t3;
    	let input4;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input0 = element("input");
    			t0 = space();
    			input1 = element("input");
    			t1 = space();
    			input2 = element("input");
    			t2 = space();
    			input3 = element("input");
    			t3 = space();
    			input4 = element("input");
    			attr_dev(input0, "class", "mc svelte-1vkdt23");
    			attr_dev(input0, "placeholder", "What token do you offer?");
    			add_location(input0, file$5, 81, 0, 1354);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "class", "ma svelte-1vkdt23");
    			attr_dev(input1, "placeholder", "How much?");
    			add_location(input1, file$5, 82, 0, 1436);
    			attr_dev(input2, "class", "tc svelte-1vkdt23");
    			attr_dev(input2, "placeholder", "What token to receive?");
    			add_location(input2, file$5, 83, 0, 1516);
    			attr_dev(input3, "type", "number");
    			attr_dev(input3, "class", "ta svelte-1vkdt23");
    			attr_dev(input3, "placeholder", "How much?");
    			add_location(input3, file$5, 84, 0, 1596);
    			attr_dev(input4, "class", "ofd svelte-1vkdt23");
    			attr_dev(input4, "placeholder", "offer id");
    			add_location(input4, file$5, 85, 0, 1676);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input0, anchor);
    			set_input_value(input0, makerCont);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, input1, anchor);
    			set_input_value(input1, makerAmt);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, input2, anchor);
    			set_input_value(input2, takerCont);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, input3, anchor);
    			set_input_value(input3, takerAmt);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, input4, anchor);
    			set_input_value(input4, offerID);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[0]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[1]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[2]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[3]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[4])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*makerCont*/ 0 && input0.value !== makerCont) {
    				set_input_value(input0, makerCont);
    			}

    			if (dirty & /*makerAmt*/ 0 && to_number(input1.value) !== makerAmt) {
    				set_input_value(input1, makerAmt);
    			}

    			if (dirty & /*takerCont*/ 0 && input2.value !== takerCont) {
    				set_input_value(input2, takerCont);
    			}

    			if (dirty & /*takerAmt*/ 0 && to_number(input3.value) !== takerAmt) {
    				set_input_value(input3, takerAmt);
    			}

    			if (dirty & /*offerID*/ 0 && input4.value !== offerID) {
    				set_input_value(input4, offerID);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(input1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(input2);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(input3);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(input4);
    			mounted = false;
    			run_all(dispose);
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

    let makerCont = "";
    let makerAmt;
    let takerCont = "";
    let takerAmt;
    let offerID = "";

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Inputs", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Inputs> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		makerCont = this.value;
    	}

    	function input1_input_handler() {
    		makerAmt = to_number(this.value);
    	}

    	function input2_input_handler() {
    		takerCont = this.value;
    	}

    	function input3_input_handler() {
    		takerAmt = to_number(this.value);
    	}

    	function input4_input_handler() {
    		offerID = this.value;
    	}

    	$$self.$capture_state = () => ({
    		makerCont,
    		makerAmt,
    		takerCont,
    		takerAmt,
    		offerID
    	});

    	return [
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler
    	];
    }

    class Inputs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Inputs",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    class WalletController {
        /**
         * Lamden Wallet Controller Class
         *
         * This Class interfaces with the Lamden Wallet's content script. It provids helper methods for creating a connection,
         * getting wallet info, sending transactions and retreiving tx information.
         *
         * The connection information for your DAPP can be supplied now or later by calling "sendConnection" manually.
         *
         * IMPORTANT: The window object needs to be available when creating this instance as it will attempt to create listeners.
         *
         *
         * @param {Object|undefined} connectionRequest  A connection request object
         * @param {string} connectionRequest.appName The name of your dApp
         * @param {string} connectionRequest.version Connection version. Older version will be over-written in the uers's wallet.
         * @param {string} connectionRequest.contractName The smart contract your DAPP will transact to
         * @param {string} connectionRequest.networkType Which Lamden network the approval is for (mainnet or testnet) are the only options
         * @param {string} connectionRequest.logo The reletive path of an image on your webserver to use as a logo for your Lamden Wallet Linked Account
         * @param {string=} connectionRequest.background The reletive path of an image on your webserver to use as a background for your Lamden Wallet Linked Account
         * @param {string=} connectionRequest.charms.name Charm name
         * @param {string=} connectionRequest.charms.variableName Smart contract variable to pull data from
         * @param {string=} connectionRequest.charms.key Key assoicated to the value you want to lookup
         * @param {string=} connectionRequest.charms.formatAs What format the data is
         * @param {string=} connectionRequest.charms.iconPath An icon to display along with your charm
         * @fires newInfo
         * @return {WalletController}
         */
        constructor(connectionRequest = undefined) {
            this.connectionRequest = connectionRequest ? new WalletConnectionRequest(connectionRequest) : null;
            this.events = new MyEventEmitter();
            this.installed = null;
            this.locked = null;
            this.approvals = {};
            this.approved = false;
            this.autoTransactions = false;
            this.walletAddress = "";
            this.callbacks = {};
            document.addEventListener('lamdenWalletInfo', (e) => {
                this.installed = true;
                let data = e.detail;

                if (data){
                    if (!data.errors){
                        if (typeof data.locked !== 'undefined') this.locked = data.locked;

                        if (data.wallets.length > 0) this.walletAddress = data.wallets[0];
                        if (typeof data.approvals !== 'undefined') {
                            this.approvals = data.approvals;
                            let approval = this.approvals[this.connectionRequest?.networkType];
                            if (approval){
                                if (approval.contractName === this.connectionRequest.contractName){
                                    this.approved = true;
                                    this.autoTransactions = approval.trustedApp;
                                }
                            }
                        }
                    }else {
                        data.errors.forEach(err => {
                            if (err === "Wallet is Locked") this.locked = true;
                        });
                    }
                    this.events.emit('newInfo', e.detail);
                }
            });
            document.addEventListener('lamdenWalletTxStatus', (e) => {
                let txResult = e.detail.data;
                if (txResult.errors){
                    if (txResult.errors.length > 0) {
                        let uid = txResult?.txData?.uid;
                        if (txResult.status === "Transaction Cancelled"){
                            let txData = JSON.parse(txResult.rejected);
                            uid = txData.uid;
                        }
                        if (this.callbacks[uid]) this.callbacks[uid](e.detail);
                    }
                }else {
                    if (Object.keys(txResult.txBlockResult).length > 0){
                        if (this.callbacks[txResult.uid]) this.callbacks[txResult.uid](e.detail);
                    }
                }
                this.events.emit('txStatus', e.detail);
            });
        }
        /**
         * Creates a "lamdenWalletGetInfo" CustomEvent to ask the Lamden Wallet for the current information.
         * This will fire the "newInfo" events.on event
         *
         * @fires newInfo
         */
        getInfo(){
            document.dispatchEvent(new CustomEvent('lamdenWalletGetInfo'));
        }
        /**
         * Check if the Lamden Wallet extention is installed in the user's broswer.
         *
         * This will fire the "newInfo" events.on event
         * @fires newInfo
         * @return {Promise} Wallet is Installed.
         */
        walletIsInstalled(){
            return new Promise((resolve, reject) => {
                const handleWalletInstalled = (e) => {
                    this.installed = true;
                    this.events.emit('installed', true);
                    document.removeEventListener("lamdenWalletInfo", handleWalletInstalled);
                    if (this.connectionRequest !== null) this.sendConnection();
                    resolve(true);
                };
                document.addEventListener('lamdenWalletInfo', handleWalletInstalled, { once: true });
                this.getInfo();
                setTimeout(() => {
                    if (!this.installed) resolve(false);
                }, 1000);
            })
        }
        /**
         * Store connectionRequest information but don't sent
         * If the connectionRequest object wasn't supplied to the construtor then it can be supplied or updated here
         *
         * @param {Object} connectionRequest  A connection request object
         * @return {undefined}
         */
        storeConnectionRequest(connectionRequest){
            if (!connectionRequest) throw new Error("no connection request provided")
            this.connectionRequest = new WalletConnectionRequest(connectionRequest);
        }
        /**
         * Send a connection to the Lamden Wallet for approval.
         * If the connectionRequest object wasn't supplied to the construtor then it must be supplied here.
         *
         * This will fire the "newInfo" events.on event
         * @param {Object|undefined} connectionRequest  A connection request object
         * @param {string} connectionRequest.appName The name of your dApp
         * @param {string} connectionRequest.version Connection version. Older version will be over-written in the uers's wallet.
         * @param {string} connectionRequest.contractName The smart contract your dApp will transact through
         * @param {string} connectionRequest.networkType Which Lamden network the approval is for (Mainnet or testnet)
         * @param {string=} connectionRequest.background A reletive path to an image to override the default lamden wallet account background
         * @param {string} connectionRequest.logo A reletive path to an image to use as a logo in the Lamden Wallet
         * @param {string=} connectionRequest.charms.name Charm name
         * @param {string=} connectionRequest.charms.variableName Smart contract variable to pull data from
         * @param {string=} connectionRequest.charms.key Key assoicated to the value you want to lookup
         * @param {string=} connectionRequest.charms.formatAs What format the data is
         * @param {string=} connectionRequest.charms.iconPath An icon to display along with your charm
         * @fires newInfo
         * @return {Promise} The User's Lamden Wallet Account details or errors from the wallet
         */
        sendConnection(connectionRequest = undefined){
            if (connectionRequest) this.connectionRequest = new WalletConnectionRequest(connectionRequest);
            if (this.connectionRequest === null) throw new Error('No connetionRequest information.')
            return new Promise((resolve) => {
                const handleConnecionResponse = (e) => {
                    this.events.emit('newInfo', e.detail);
                    resolve(e.detail);
                    document.removeEventListener("lamdenWalletInfo", handleConnecionResponse);
                };
                document.addEventListener('lamdenWalletInfo', handleConnecionResponse, { once: true });
                document.dispatchEvent(new CustomEvent('lamdenWalletConnect', {detail: this.connectionRequest.getInfo()}));
            })
        }
        /**
         * Creates a "lamdenWalletSendTx" event to send a transaction request to the Lamden Wallet.
         * If a callback is specified here then it will be called with the transaction result.
         *
         * This will fire the "txStatus" events.on event
         * @param {Object} tx  A connection request object
         * @param {string} tx.networkType Which Lamden network the tx is for (Mainnet or testnet)
         * @param {string} tx.stampLimit The max Stamps this tx is allowed to use. Cannot be more but can be less.
         * @param {string} tx.methodName The method on your approved smart contract to call
         * @param {Object} tx.kwargs A keyword object to supply arguments to your method
         * @param {Function=} callback A function that will called and passed the tx results.
         * @fires txStatus
         */
        sendTransaction(tx, callback = undefined){
            tx.uid = new Date().toISOString();
            if (typeof callback === 'function') this.callbacks[tx.uid] = callback;
            document.dispatchEvent(new CustomEvent('lamdenWalletSendTx', {detail: JSON.stringify(tx)}));
        }
      }

    class WalletConnectionRequest {
        /**
         * Wallet Connection Request Class
         *
         * Validates and stores the information from a connectionRequest object.  See WalletController constructor for connection request params.
         * @param {Object} connectionRequest  - request object
         * @return {WalletConnectionRequest}
         */
        constructor(connectionRequest = {}) {
            const isUndefined = (value) => typeof value === "undefined";
            const populate = (request) => {
                Object.keys(request).forEach(p => {
                    if (!isUndefined(this[p])) this[p] = request[p];
                });
            };
            this.request = connectionRequest;
            this.appName = "";
            this.version = "";
            this.contractName = "";
            this.networkType = "";
            this.logo = "";
            this.background = "";
            this.charms = [];
            try{
                populate(connectionRequest);
            }catch (e){
                console.log(e);
                throw new Error(e.message)
            }
        }
        /**
         * Get a JSON string of the approval request information
         * @return {string} - JSON string of all request information
         */
        getInfo(){
            let info = {
                appName: this.appName,
                version: this.version,
                contractName: this.contractName,
                networkType: this.networkType, logo: this.logo};
            if (this.background.length > 0) info.background = this.background;
            if (this.charms.length > 0) info.charms = this.charms;
            return JSON.stringify(info)
        }
    }


    class MyEventEmitter {
        constructor() {
          this._events = {};
        }
      
        on(name, listener) {
          if (!this._events[name]) {
            this._events[name] = [];
          }
      
          this._events[name].push(listener);
        }
      
        removeListener(name, listenerToRemove) {
          if (!this._events[name]) {
            return
          }
      
          const filterListeners = (listener) => listener !== listenerToRemove;
      
          this._events[name] = this._events[name].filter(filterListeners);
        }

      
        emit(name, data) {
          if (!this._events[name]) {
            return
          }
      
          const fireCallbacks = (callback) => {
            callback(data);
          };
      
          this._events[name].forEach(fireCallbacks);
        }
      }

    var walletController = WalletController;

    /* src\lwc.svelte generated by Svelte v3.35.0 */

    const connectionRequest = {
    	appName: "otc dApp",
    	version: "1.0.0",
    	logo: "crowfer.png",
    	contractName: "con_otc17",
    	networkType: "testnet"
    };

    const lwc = new walletController(connectionRequest);

    /* src\spinner.svelte generated by Svelte v3.35.0 */

    const file$4 = "src\\spinner.svelte";

    // (55:0) {#if loading}
    function create_if_block$3(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let t;
    	let div1;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "svelte-fgzxbu");
    			add_location(div0, file$4, 57, 3, 1173);
    			attr_dev(div1, "class", "svelte-fgzxbu");
    			add_location(div1, file$4, 58, 3, 1189);
    			attr_dev(div2, "class", "spinner svelte-fgzxbu");
    			add_location(div2, file$4, 56, 2, 1147);
    			attr_dev(div3, "class", "backdrop svelte-fgzxbu");
    			add_location(div3, file$4, 55, 1, 1121);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t);
    			append_dev(div2, div1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(55:0) {#if loading}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let if_block_anchor;
    	let if_block = /*loading*/ ctx[0] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*loading*/ ctx[0]) {
    				if (if_block) ; else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Spinner", slots, []);
    	let loading = false;

    	const showSpinner = () => {
    		$$invalidate(0, loading = !loading);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Spinner> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ loading, showSpinner });

    	$$self.$inject_state = $$props => {
    		if ("loading" in $$props) $$invalidate(0, loading = $$props.loading);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [loading, showSpinner];
    }

    class Spinner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { showSpinner: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Spinner",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get showSpinner() {
    		return this.$$.ctx[1];
    	}

    	set showSpinner(value) {
    		throw new Error("<Spinner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\modal.svelte generated by Svelte v3.35.0 */

    const file$3 = "src\\modal.svelte";

    // (38:0) {#if shown}
    function create_if_block$2(ctx) {
    	let div1;
    	let div0;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "modal svelte-kmlq0c");
    			add_location(div0, file$3, 39, 4, 646);
    			attr_dev(div1, "class", "modal-wrapper svelte-kmlq0c");
    			add_location(div1, file$3, 38, 2, 613);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(38:0) {#if shown}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*shown*/ ctx[1] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "keydown", /*keydown_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*shown*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*shown*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Modal", slots, ['default']);
    	let shown = false;

    	function show() {
    		$$invalidate(1, shown = true);
    	}

    	function hide() {
    		$$invalidate(1, shown = false);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	const keydown_handler = e => {
    		if (e.keyCode == 27) {
    			hide();
    		}
    	};

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ shown, show, hide });

    	$$self.$inject_state = $$props => {
    		if ("shown" in $$props) $$invalidate(1, shown = $$props.shown);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [hide, shown, show, $$scope, slots, keydown_handler];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { show: 2, hide: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get show() {
    		return this.$$.ctx[2];
    	}

    	set show(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hide() {
    		return this.$$.ctx[0];
    	}

    	set hide(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\main.svelte generated by Svelte v3.35.0 */

    const { Object: Object_1$1, console: console_1 } = globals;
    const file$2 = "src\\main.svelte";

    // (410:23) 
    function create_if_block_6(ctx) {
    	let b;
    	let t0;
    	let t1;
    	let t2;
    	let span;
    	let button_1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			b = element("b");
    			t0 = text(/*title*/ ctx[13]);
    			t1 = text("!");
    			t2 = space();
    			span = element("span");
    			button_1 = element("button");
    			button_1.textContent = "close";
    			add_location(b, file$2, 410, 2, 9019);
    			attr_dev(button_1, "id", "modal-button");
    			set_style(button_1, "float", "right");
    			attr_dev(button_1, "class", "svelte-gg6fxx");
    			add_location(button_1, file$2, 411, 8, 9044);
    			add_location(span, file$2, 411, 2, 9038);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, b, anchor);
    			append_dev(b, t0);
    			append_dev(b, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, button_1);

    			if (!mounted) {
    				dispose = listen_dev(button_1, "click", /*click_handler_6*/ ctx[31], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*title*/ 8192) set_data_dev(t0, /*title*/ ctx[13]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(b);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(410:23) ",
    		ctx
    	});

    	return block;
    }

    // (406:22) 
    function create_if_block_5(ctx) {
    	let h2;
    	let t0;
    	let t1;
    	let p;
    	let t2;
    	let t3;
    	let button_1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t0 = text(/*title*/ ctx[13]);
    			t1 = space();
    			p = element("p");
    			t2 = text(/*modalContent*/ ctx[14]);
    			t3 = space();
    			button_1 = element("button");
    			button_1.textContent = "close";
    			add_location(h2, file$2, 406, 2, 8893);
    			add_location(p, file$2, 407, 2, 8913);
    			add_location(button_1, file$2, 408, 2, 8938);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, button_1, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button_1, "click", /*click_handler_5*/ ctx[30], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*title*/ 8192) set_data_dev(t0, /*title*/ ctx[13]);
    			if (dirty[0] & /*modalContent*/ 16384) set_data_dev(t2, /*modalContent*/ ctx[14]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(button_1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(406:22) ",
    		ctx
    	});

    	return block;
    }

    // (403:24) 
    function create_if_block_4(ctx) {
    	let b;
    	let t1;
    	let span;
    	let button_1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			b = element("b");
    			b.textContent = "OFFER ID DOESN'T EXIST!";
    			t1 = space();
    			span = element("span");
    			button_1 = element("button");
    			button_1.textContent = "close";
    			add_location(b, file$2, 403, 2, 8725);
    			attr_dev(button_1, "id", "modal-button");
    			set_style(button_1, "float", "right");
    			attr_dev(button_1, "class", "svelte-gg6fxx");
    			add_location(button_1, file$2, 404, 8, 8766);
    			add_location(span, file$2, 404, 2, 8760);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, b, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, button_1);

    			if (!mounted) {
    				dispose = listen_dev(button_1, "click", /*click_handler_4*/ ctx[29], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(b);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(403:24) ",
    		ctx
    	});

    	return block;
    }

    // (387:21) 
    function create_if_block_3(ctx) {
    	let p0;
    	let b0;
    	let t1;
    	let t2;
    	let t3;
    	let div0;
    	let t4;
    	let p1;
    	let b1;
    	let t6;
    	let t7;
    	let t8;
    	let div1;
    	let t9;
    	let p2;
    	let b2;
    	let t11;
    	let t12;
    	let t13;
    	let div2;
    	let t14;
    	let p3;
    	let b3;
    	let t16;
    	let t17;
    	let t18;
    	let div3;
    	let t19;
    	let p4;
    	let b4;
    	let t21;
    	let t22;
    	let t23;
    	let div4;
    	let t24;
    	let p5;
    	let b5;
    	let t26;
    	let t27;
    	let t28;
    	let button0;
    	let t30;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			b0 = element("b");
    			b0.textContent = "STATE";
    			t1 = text(" : ");
    			t2 = text(/*state*/ ctx[5]);
    			t3 = space();
    			div0 = element("div");
    			t4 = space();
    			p1 = element("p");
    			b1 = element("b");
    			b1.textContent = "MAKER";
    			t6 = text(" : ");
    			t7 = text(/*maker*/ ctx[6]);
    			t8 = space();
    			div1 = element("div");
    			t9 = space();
    			p2 = element("p");
    			b2 = element("b");
    			b2.textContent = "OFFER AMOUNT";
    			t11 = text(" : ");
    			t12 = text(/*offer_amt*/ ctx[7]);
    			t13 = space();
    			div2 = element("div");
    			t14 = space();
    			p3 = element("p");
    			b3 = element("b");
    			b3.textContent = "OFFER TOKEN";
    			t16 = text(" : ");
    			t17 = text(/*offer_token*/ ctx[8]);
    			t18 = space();
    			div3 = element("div");
    			t19 = space();
    			p4 = element("p");
    			b4 = element("b");
    			b4.textContent = "TOKEN AMOUNT";
    			t21 = text(" : ");
    			t22 = text(/*take_amt*/ ctx[9]);
    			t23 = space();
    			div4 = element("div");
    			t24 = space();
    			p5 = element("p");
    			b5 = element("b");
    			b5.textContent = "TAKE TOKEN";
    			t26 = text(" : ");
    			t27 = text(/*take_token*/ ctx[10]);
    			t28 = space();
    			button0 = element("button");
    			button0.textContent = "confirm";
    			t30 = space();
    			button1 = element("button");
    			button1.textContent = "close";
    			add_location(b0, file$2, 387, 5, 8184);
    			add_location(p0, file$2, 387, 2, 8181);
    			attr_dev(div0, "id", "line");
    			attr_dev(div0, "class", "svelte-gg6fxx");
    			add_location(div0, file$2, 388, 2, 8214);
    			add_location(b1, file$2, 389, 5, 8242);
    			add_location(p1, file$2, 389, 2, 8239);
    			attr_dev(div1, "id", "line");
    			attr_dev(div1, "class", "svelte-gg6fxx");
    			add_location(div1, file$2, 390, 2, 8272);
    			add_location(b2, file$2, 391, 5, 8300);
    			add_location(p2, file$2, 391, 2, 8297);
    			attr_dev(div2, "id", "line");
    			attr_dev(div2, "class", "svelte-gg6fxx");
    			add_location(div2, file$2, 392, 2, 8341);
    			add_location(b3, file$2, 393, 5, 8369);
    			add_location(p3, file$2, 393, 2, 8366);
    			attr_dev(div3, "id", "line");
    			attr_dev(div3, "class", "svelte-gg6fxx");
    			add_location(div3, file$2, 394, 2, 8411);
    			add_location(b4, file$2, 395, 5, 8439);
    			add_location(p4, file$2, 395, 2, 8436);
    			attr_dev(div4, "id", "line");
    			attr_dev(div4, "class", "svelte-gg6fxx");
    			add_location(div4, file$2, 396, 2, 8479);
    			add_location(b5, file$2, 397, 5, 8507);
    			add_location(p5, file$2, 397, 2, 8504);
    			attr_dev(button0, "id", "modal-button");
    			attr_dev(button0, "class", "svelte-gg6fxx");
    			add_location(button0, file$2, 399, 2, 8550);
    			attr_dev(button1, "id", "modal-button");
    			attr_dev(button1, "class", "svelte-gg6fxx");
    			add_location(button1, file$2, 400, 2, 8621);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			append_dev(p0, b0);
    			append_dev(p0, t1);
    			append_dev(p0, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, b1);
    			append_dev(p1, t6);
    			append_dev(p1, t7);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, p2, anchor);
    			append_dev(p2, b2);
    			append_dev(p2, t11);
    			append_dev(p2, t12);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, p3, anchor);
    			append_dev(p3, b3);
    			append_dev(p3, t16);
    			append_dev(p3, t17);
    			insert_dev(target, t18, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, p4, anchor);
    			append_dev(p4, b4);
    			append_dev(p4, t21);
    			append_dev(p4, t22);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t24, anchor);
    			insert_dev(target, p5, anchor);
    			append_dev(p5, b5);
    			append_dev(p5, t26);
    			append_dev(p5, t27);
    			insert_dev(target, t28, anchor);
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t30, anchor);
    			insert_dev(target, button1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*confirmCancel*/ ctx[20], false, false, false),
    					listen_dev(button1, "click", /*click_handler_3*/ ctx[28], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*state*/ 32) set_data_dev(t2, /*state*/ ctx[5]);
    			if (dirty[0] & /*maker*/ 64) set_data_dev(t7, /*maker*/ ctx[6]);
    			if (dirty[0] & /*offer_amt*/ 128) set_data_dev(t12, /*offer_amt*/ ctx[7]);
    			if (dirty[0] & /*offer_token*/ 256) set_data_dev(t17, /*offer_token*/ ctx[8]);
    			if (dirty[0] & /*take_amt*/ 512) set_data_dev(t22, /*take_amt*/ ctx[9]);
    			if (dirty[0] & /*take_token*/ 1024) set_data_dev(t27, /*take_token*/ ctx[10]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t18);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t24);
    			if (detaching) detach_dev(p5);
    			if (detaching) detach_dev(t28);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t30);
    			if (detaching) detach_dev(button1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(387:21) ",
    		ctx
    	});

    	return block;
    }

    // (371:21) 
    function create_if_block_2(ctx) {
    	let p0;
    	let b0;
    	let t1;
    	let t2;
    	let t3;
    	let div0;
    	let t4;
    	let p1;
    	let b1;
    	let t6;
    	let t7;
    	let t8;
    	let div1;
    	let t9;
    	let p2;
    	let b2;
    	let t11;
    	let t12;
    	let t13;
    	let div2;
    	let t14;
    	let p3;
    	let b3;
    	let t16;
    	let t17;
    	let t18;
    	let div3;
    	let t19;
    	let p4;
    	let b4;
    	let t21;
    	let t22;
    	let t23;
    	let div4;
    	let t24;
    	let p5;
    	let b5;
    	let t26;
    	let t27;
    	let t28;
    	let button0;
    	let t30;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			b0 = element("b");
    			b0.textContent = "STATE";
    			t1 = text(" : ");
    			t2 = text(/*state*/ ctx[5]);
    			t3 = space();
    			div0 = element("div");
    			t4 = space();
    			p1 = element("p");
    			b1 = element("b");
    			b1.textContent = "MAKER";
    			t6 = text(" : ");
    			t7 = text(/*maker*/ ctx[6]);
    			t8 = space();
    			div1 = element("div");
    			t9 = space();
    			p2 = element("p");
    			b2 = element("b");
    			b2.textContent = "OFFER AMOUNT";
    			t11 = text(" : ");
    			t12 = text(/*offer_amt*/ ctx[7]);
    			t13 = space();
    			div2 = element("div");
    			t14 = space();
    			p3 = element("p");
    			b3 = element("b");
    			b3.textContent = "OFFER TOKEN";
    			t16 = text(" : ");
    			t17 = text(/*offer_token*/ ctx[8]);
    			t18 = space();
    			div3 = element("div");
    			t19 = space();
    			p4 = element("p");
    			b4 = element("b");
    			b4.textContent = "TOKEN AMOUNT";
    			t21 = text(" : ");
    			t22 = text(/*take_amt*/ ctx[9]);
    			t23 = space();
    			div4 = element("div");
    			t24 = space();
    			p5 = element("p");
    			b5 = element("b");
    			b5.textContent = "TAKE TOKEN";
    			t26 = text(" : ");
    			t27 = text(/*take_token*/ ctx[10]);
    			t28 = space();
    			button0 = element("button");
    			button0.textContent = "confirm";
    			t30 = space();
    			button1 = element("button");
    			button1.textContent = "close";
    			add_location(b0, file$2, 371, 5, 7645);
    			add_location(p0, file$2, 371, 2, 7642);
    			attr_dev(div0, "id", "line");
    			attr_dev(div0, "class", "svelte-gg6fxx");
    			add_location(div0, file$2, 372, 2, 7675);
    			add_location(b1, file$2, 373, 5, 7703);
    			add_location(p1, file$2, 373, 2, 7700);
    			attr_dev(div1, "id", "line");
    			attr_dev(div1, "class", "svelte-gg6fxx");
    			add_location(div1, file$2, 374, 2, 7733);
    			add_location(b2, file$2, 375, 5, 7761);
    			add_location(p2, file$2, 375, 2, 7758);
    			attr_dev(div2, "id", "line");
    			attr_dev(div2, "class", "svelte-gg6fxx");
    			add_location(div2, file$2, 376, 2, 7802);
    			add_location(b3, file$2, 377, 5, 7830);
    			add_location(p3, file$2, 377, 2, 7827);
    			attr_dev(div3, "id", "line");
    			attr_dev(div3, "class", "svelte-gg6fxx");
    			add_location(div3, file$2, 378, 2, 7872);
    			add_location(b4, file$2, 379, 5, 7900);
    			add_location(p4, file$2, 379, 2, 7897);
    			attr_dev(div4, "id", "line");
    			attr_dev(div4, "class", "svelte-gg6fxx");
    			add_location(div4, file$2, 380, 2, 7940);
    			add_location(b5, file$2, 381, 5, 7968);
    			add_location(p5, file$2, 381, 2, 7965);
    			attr_dev(button0, "id", "modal-button");
    			attr_dev(button0, "class", "svelte-gg6fxx");
    			add_location(button0, file$2, 383, 2, 8011);
    			attr_dev(button1, "id", "modal-button");
    			attr_dev(button1, "class", "svelte-gg6fxx");
    			add_location(button1, file$2, 384, 2, 8080);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			append_dev(p0, b0);
    			append_dev(p0, t1);
    			append_dev(p0, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, b1);
    			append_dev(p1, t6);
    			append_dev(p1, t7);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, p2, anchor);
    			append_dev(p2, b2);
    			append_dev(p2, t11);
    			append_dev(p2, t12);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, p3, anchor);
    			append_dev(p3, b3);
    			append_dev(p3, t16);
    			append_dev(p3, t17);
    			insert_dev(target, t18, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, p4, anchor);
    			append_dev(p4, b4);
    			append_dev(p4, t21);
    			append_dev(p4, t22);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t24, anchor);
    			insert_dev(target, p5, anchor);
    			append_dev(p5, b5);
    			append_dev(p5, t26);
    			append_dev(p5, t27);
    			insert_dev(target, t28, anchor);
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t30, anchor);
    			insert_dev(target, button1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*confirmTake*/ ctx[19], false, false, false),
    					listen_dev(button1, "click", /*click_handler_2*/ ctx[27], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*state*/ 32) set_data_dev(t2, /*state*/ ctx[5]);
    			if (dirty[0] & /*maker*/ 64) set_data_dev(t7, /*maker*/ ctx[6]);
    			if (dirty[0] & /*offer_amt*/ 128) set_data_dev(t12, /*offer_amt*/ ctx[7]);
    			if (dirty[0] & /*offer_token*/ 256) set_data_dev(t17, /*offer_token*/ ctx[8]);
    			if (dirty[0] & /*take_amt*/ 512) set_data_dev(t22, /*take_amt*/ ctx[9]);
    			if (dirty[0] & /*take_token*/ 1024) set_data_dev(t27, /*take_token*/ ctx[10]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t18);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t24);
    			if (detaching) detach_dev(p5);
    			if (detaching) detach_dev(t28);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t30);
    			if (detaching) detach_dev(button1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(371:21) ",
    		ctx
    	});

    	return block;
    }

    // (360:24) 
    function create_if_block_1(ctx) {
    	let h2;
    	let t0;
    	let t1;
    	let div;
    	let input;
    	let t2;
    	let button0;
    	let t3;
    	let t4;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t0 = text(/*title*/ ctx[13]);
    			t1 = space();
    			div = element("div");
    			input = element("input");
    			t2 = space();
    			button0 = element("button");
    			t3 = text(/*v*/ ctx[0]);
    			t4 = space();
    			button1 = element("button");
    			button1.textContent = "close";
    			add_location(h2, file$2, 360, 2, 7335);
    			add_location(input, file$2, 365, 3, 7405);
    			attr_dev(button0, "id", "modal-button");
    			attr_dev(button0, "class", "svelte-gg6fxx");
    			add_location(button0, file$2, 366, 3, 7455);
    			attr_dev(button1, "id", "modal-button");
    			attr_dev(button1, "class", "svelte-gg6fxx");
    			add_location(button1, file$2, 367, 3, 7533);
    			attr_dev(div, "class", "tooltip svelte-gg6fxx");
    			add_location(div, file$2, 364, 2, 7379);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			set_input_value(input, /*otcId*/ ctx[1]);
    			/*input_binding*/ ctx[24](input);
    			append_dev(div, t2);
    			append_dev(div, button0);
    			append_dev(button0, t3);
    			/*button0_binding*/ ctx[25](button0);
    			append_dev(div, t4);
    			append_dev(div, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[23]),
    					listen_dev(button0, "click", /*copy*/ ctx[15], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[26], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*title*/ 8192) set_data_dev(t0, /*title*/ ctx[13]);

    			if (dirty[0] & /*otcId*/ 2 && input.value !== /*otcId*/ ctx[1]) {
    				set_input_value(input, /*otcId*/ ctx[1]);
    			}

    			if (dirty[0] & /*v*/ 1) set_data_dev(t3, /*v*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			/*input_binding*/ ctx[24](null);
    			/*button0_binding*/ ctx[25](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(360:24) ",
    		ctx
    	});

    	return block;
    }

    // (356:1) {#if r == 'mErr'}
    function create_if_block$1(ctx) {
    	let h2;
    	let t0;
    	let t1;
    	let p;
    	let t2;
    	let t3;
    	let button_1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t0 = text(/*title*/ ctx[13]);
    			t1 = space();
    			p = element("p");
    			t2 = text(/*modalContent*/ ctx[14]);
    			t3 = space();
    			button_1 = element("button");
    			button_1.textContent = "close";
    			add_location(h2, file$2, 356, 2, 7189);
    			add_location(p, file$2, 357, 2, 7209);
    			attr_dev(button_1, "id", "modal-button");
    			attr_dev(button_1, "class", "svelte-gg6fxx");
    			add_location(button_1, file$2, 358, 2, 7234);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, button_1, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button_1, "click", /*click_handler*/ ctx[22], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*title*/ 8192) set_data_dev(t0, /*title*/ ctx[13]);
    			if (dirty[0] & /*modalContent*/ 16384) set_data_dev(t2, /*modalContent*/ ctx[14]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(button_1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(356:1) {#if r == 'mErr'}",
    		ctx
    	});

    	return block;
    }

    // (355:0) <Modal bind:this={modal}>
    function create_default_slot$1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*r*/ ctx[12] == "mErr") return create_if_block$1;
    		if (/*r*/ ctx[12] == "mSucc") return create_if_block_1;
    		if (/*r*/ ctx[12] == "tf") return create_if_block_2;
    		if (/*r*/ ctx[12] == "cf") return create_if_block_3;
    		if (/*r*/ ctx[12] == "idErr") return create_if_block_4;
    		if (/*r*/ ctx[12] == "err") return create_if_block_5;
    		if (/*r*/ ctx[12] == "succ") return create_if_block_6;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(355:0) <Modal bind:this={modal}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let button0;
    	let t1;
    	let button1;
    	let t3;
    	let button2;
    	let t5;
    	let spinner;
    	let t6;
    	let modal_1;
    	let current;
    	let mounted;
    	let dispose;
    	let spinner_props = {};
    	spinner = new Spinner({ props: spinner_props, $$inline: true });
    	/*spinner_binding*/ ctx[21](spinner);

    	let modal_1_props = {
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	};

    	modal_1 = new Modal({ props: modal_1_props, $$inline: true });
    	/*modal_1_binding*/ ctx[32](modal_1);

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			button0.textContent = "Make offer";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Take offer";
    			t3 = space();
    			button2 = element("button");
    			button2.textContent = "Cancel";
    			t5 = space();
    			create_component(spinner.$$.fragment);
    			t6 = space();
    			create_component(modal_1.$$.fragment);
    			attr_dev(button0, "id", "MakeOfferBtn");
    			attr_dev(button0, "class", "svelte-gg6fxx");
    			add_location(button0, file$2, 343, 0, 6884);
    			attr_dev(button1, "id", "TakeOfferBtn");
    			attr_dev(button1, "class", "svelte-gg6fxx");
    			add_location(button1, file$2, 345, 0, 6956);
    			attr_dev(button2, "id", "CancelOfferBtn");
    			attr_dev(button2, "class", "svelte-gg6fxx");
    			add_location(button2, file$2, 347, 0, 7026);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, button2, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(spinner, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(modal_1, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*submitOffer*/ ctx[16], false, false, false),
    					listen_dev(button1, "click", /*takeOffer*/ ctx[17], false, false, false),
    					listen_dev(button2, "click", /*cancelOffer*/ ctx[18], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const spinner_changes = {};
    			spinner.$set(spinner_changes);
    			const modal_1_changes = {};

    			if (dirty[0] & /*modal, modalContent, title, r, button, v, otcId, copyId, take_token, take_amt, offer_token, offer_amt, maker, state*/ 32751 | dirty[1] & /*$$scope*/ 16) {
    				modal_1_changes.$$scope = { dirty, ctx };
    			}

    			modal_1.$set(modal_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spinner.$$.fragment, local);
    			transition_in(modal_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spinner.$$.fragment, local);
    			transition_out(modal_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(button2);
    			if (detaching) detach_dev(t5);
    			/*spinner_binding*/ ctx[21](null);
    			destroy_component(spinner, detaching);
    			if (detaching) detach_dev(t6);
    			/*modal_1_binding*/ ctx[32](null);
    			destroy_component(modal_1, detaching);
    			mounted = false;
    			run_all(dispose);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Main", slots, []);
    	let url = "https://testnet-master-1.lamden.io/contracts/con_otc17/data?key=";
    	let v = "copy id";
    	let otcId;
    	let copyId;
    	let button;
    	let spinnerComp;
    	let otc_form;
    	let state;
    	let maker;
    	let offer_amt;
    	let offer_token;
    	let take_amt;
    	let take_token;
    	let modal;
    	let r;
    	let title;
    	let modalContent;

    	const copy = () => {
    		copyId.select();
    		copyId.setSelectionRange(0, 64);
    		document.execCommand("copy");
    		$$invalidate(3, button.style.backgroundColor = "#b6c172", button);
    		$$invalidate(3, button.style.color = "#493e8d", button);
    		$$invalidate(0, v = "✓");
    	};

    	const submitOffer = () => {
    		spinnerComp.showSpinner();

    		setTimeout(
    			() => {
    				lwc.events.on("newInfo", walletInfo => {
    					if (walletInfo.setup) {
    						const offerTxInfo = {
    							networkType: "testnet",
    							methodName: "make_offer",
    							kwargs: {
    								offer_token: makerCont,
    								offer_amount: { "__fixed__": makerAmt.toString() },
    								take_token: takerCont,
    								take_amount: { "__fixed__": takerAmt.toString() }
    							},
    							stampLimit: 100
    						};

    						lwc.sendTransaction(offerTxInfo);

    						lwc.events.on("txStatus", txResults => {
    							if (txResults.data.resultInfo.type == "error") {
    								$$invalidate(12, r = "mErr");
    								$$invalidate(13, title = txResults.data.resultInfo.title);
    								$$invalidate(14, modalContent = txResults.data.resultInfo.errorInfo + " " + txResults.data.resultInfo.stampsUsed + " stamps used.");
    								spinnerComp.showSpinner();
    								modal.show();
    							} else {
    								$$invalidate(12, r = "mSucc");
    								$$invalidate(13, title = txResults.data.resultInfo.title);
    								console.log(txResults.data.resultInfo);
    								$$invalidate(1, otcId = txResults.data.resultInfo.returnResult.replace(/['"]+/g, ""));

    								//otcId = otc_id.replace(/['"]+/g, '');
    								spinnerComp.showSpinner();

    								modal.show();
    							}
    						});
    					}
    				});

    				lwc.getInfo();
    			},
    			2500
    		);
    	};

    	const takeOffer = () => {
    		$$invalidate(12, r = "tf");
    		spinnerComp.showSpinner();

    		setTimeout(
    			() => {
    				otc_form = url + offerID;

    				fetch(otc_form).then(response => response.json()).then(obj => {
    					if (JSON.stringify(obj.value) == "null") {
    						$$invalidate(12, r = "idErr");
    						spinnerComp.showSpinner();
    						modal.show();
    					} else {
    						$$invalidate(5, state = JSON.stringify(obj.value.state));
    						$$invalidate(6, maker = JSON.stringify(obj.value.maker));
    						$$invalidate(7, offer_amt = Object.values(obj.value.offer_amount));
    						$$invalidate(8, offer_token = JSON.stringify(obj.value.offer_token));
    						$$invalidate(9, take_amt = Object.values(obj.value.take_amount));
    						$$invalidate(10, take_token = JSON.stringify(obj.value.take_token));
    						spinnerComp.showSpinner();
    						modal.show();
    					}
    				});
    			},
    			2500
    		);
    	};

    	const cancelOffer = () => {
    		$$invalidate(12, r = "cf");
    		spinnerComp.showSpinner();

    		setTimeout(
    			() => {
    				otc_form = url + offerID;

    				fetch(otc_form).then(response => response.json()).then(obj => {
    					if (JSON.stringify(obj.value) == "null") {
    						$$invalidate(12, r = "idErr");
    						spinnerComp.showSpinner();
    						modal.show();
    					} else {
    						$$invalidate(5, state = JSON.stringify(obj.value.state));
    						$$invalidate(6, maker = JSON.stringify(obj.value.maker));
    						$$invalidate(7, offer_amt = Object.values(obj.value.offer_amount));
    						$$invalidate(8, offer_token = JSON.stringify(obj.value.offer_token));
    						$$invalidate(9, take_amt = Object.values(obj.value.take_amount));
    						$$invalidate(10, take_token = JSON.stringify(obj.value.take_token));
    						spinnerComp.showSpinner();
    						modal.show();
    					}
    				});
    			},
    			2500
    		);
    	};

    	const confirmTake = () => {
    		spinnerComp.showSpinner();

    		setTimeout(
    			() => {
    				lwc.events.on("newInfo", walletInfo => {
    					if (walletInfo.setup) {
    						const offerTxInfo = {
    							networkType: "testnet",
    							methodName: "take_offer",
    							kwargs: { offer_id: offerID },
    							stampLimit: 100
    						};

    						lwc.sendTransaction(offerTxInfo);

    						lwc.events.on("txStatus", txResults => {
    							if (txResults.data.resultInfo.type == "error") {
    								$$invalidate(12, r = "err");
    								$$invalidate(13, title = txResults.data.resultInfo.title);
    								$$invalidate(14, modalContent = txResults.data.resultInfo.errorInfo + " " + txResults.data.resultInfo.stampsUsed + " stamps used.");
    								spinnerComp.showSpinner();
    								modal.show();
    							} else {
    								$$invalidate(12, r = "succ");
    								$$invalidate(13, title = "SUCCESS");
    								spinnerComp.showSpinner();
    								modal.show();
    							}
    						});
    					}
    				});

    				lwc.getInfo();
    			},
    			2500
    		);
    	};

    	const confirmCancel = () => {
    		spinnerComp.showSpinner();

    		setTimeout(
    			() => {
    				lwc.events.on("newInfo", walletInfo => {
    					if (walletInfo.setup) {
    						const offerTxInfo = {
    							networkType: "testnet",
    							methodName: "cancel_offer",
    							kwargs: { offer_id: offerID },
    							stampLimit: 100
    						};

    						lwc.sendTransaction(offerTxInfo);

    						lwc.events.on("txStatus", txResults => {
    							if (txResults.data.resultInfo.type == "error") {
    								$$invalidate(12, r = "err");
    								$$invalidate(13, title = txResults.data.resultInfo.title);
    								$$invalidate(14, modalContent = txResults.data.resultInfo.errorInfo + " " + txResults.data.resultInfo.stampsUsed + " stamps used.");
    								spinnerComp.showSpinner();
    								modal.show();
    							} else {
    								$$invalidate(12, r = "succ");
    								$$invalidate(13, title = "OFFER CANCELLED!");
    								spinnerComp.showSpinner();
    								modal.show();
    							}
    						});
    					}
    				});

    				lwc.getInfo();
    			},
    			2500
    		);
    	};

    	const writable_props = [];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Main> was created with unknown prop '${key}'`);
    	});

    	function spinner_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			spinnerComp = $$value;
    			$$invalidate(4, spinnerComp);
    		});
    	}

    	const click_handler = () => modal.hide();

    	function input_input_handler() {
    		otcId = this.value;
    		$$invalidate(1, otcId);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			copyId = $$value;
    			$$invalidate(2, copyId);
    		});
    	}

    	function button0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			button = $$value;
    			$$invalidate(3, button);
    		});
    	}

    	const click_handler_1 = () => modal.hide();
    	const click_handler_2 = () => modal.hide();
    	const click_handler_3 = () => modal.hide();
    	const click_handler_4 = () => modal.hide();
    	const click_handler_5 = () => modal.hide();
    	const click_handler_6 = () => modal.hide();

    	function modal_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			modal = $$value;
    			$$invalidate(11, modal);
    		});
    	}

    	$$self.$capture_state = () => ({
    		lwc,
    		offerID,
    		makerCont,
    		makerAmt,
    		takerCont,
    		takerAmt,
    		Spinner,
    		Modal,
    		url,
    		v,
    		otcId,
    		copyId,
    		button,
    		spinnerComp,
    		otc_form,
    		state,
    		maker,
    		offer_amt,
    		offer_token,
    		take_amt,
    		take_token,
    		modal,
    		r,
    		title,
    		modalContent,
    		copy,
    		submitOffer,
    		takeOffer,
    		cancelOffer,
    		confirmTake,
    		confirmCancel
    	});

    	$$self.$inject_state = $$props => {
    		if ("url" in $$props) url = $$props.url;
    		if ("v" in $$props) $$invalidate(0, v = $$props.v);
    		if ("otcId" in $$props) $$invalidate(1, otcId = $$props.otcId);
    		if ("copyId" in $$props) $$invalidate(2, copyId = $$props.copyId);
    		if ("button" in $$props) $$invalidate(3, button = $$props.button);
    		if ("spinnerComp" in $$props) $$invalidate(4, spinnerComp = $$props.spinnerComp);
    		if ("otc_form" in $$props) otc_form = $$props.otc_form;
    		if ("state" in $$props) $$invalidate(5, state = $$props.state);
    		if ("maker" in $$props) $$invalidate(6, maker = $$props.maker);
    		if ("offer_amt" in $$props) $$invalidate(7, offer_amt = $$props.offer_amt);
    		if ("offer_token" in $$props) $$invalidate(8, offer_token = $$props.offer_token);
    		if ("take_amt" in $$props) $$invalidate(9, take_amt = $$props.take_amt);
    		if ("take_token" in $$props) $$invalidate(10, take_token = $$props.take_token);
    		if ("modal" in $$props) $$invalidate(11, modal = $$props.modal);
    		if ("r" in $$props) $$invalidate(12, r = $$props.r);
    		if ("title" in $$props) $$invalidate(13, title = $$props.title);
    		if ("modalContent" in $$props) $$invalidate(14, modalContent = $$props.modalContent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		v,
    		otcId,
    		copyId,
    		button,
    		spinnerComp,
    		state,
    		maker,
    		offer_amt,
    		offer_token,
    		take_amt,
    		take_token,
    		modal,
    		r,
    		title,
    		modalContent,
    		copy,
    		submitOffer,
    		takeOffer,
    		cancelOffer,
    		confirmTake,
    		confirmCancel,
    		spinner_binding,
    		click_handler,
    		input_input_handler,
    		input_binding,
    		button0_binding,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		modal_1_binding
    	];
    }

    class Main extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\walletPannel.svelte generated by Svelte v3.35.0 */

    const { Object: Object_1 } = globals;
    const file$1 = "src\\walletPannel.svelte";

    // (104:1) {:else}
    function create_else_block(ctx) {
    	let a;
    	let t;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(/*state*/ ctx[0]);
    			attr_dev(a, "class", "btn svelte-10zd0jl");
    			attr_dev(a, "href", "#/");
    			add_location(a, file$1, 104, 2, 1888);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*state*/ 1) set_data_dev(t, /*state*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(104:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (100:1) {#if state == ">>Install Wallet<<"}
    function create_if_block(ctx) {
    	let a;
    	let t;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(/*state*/ ctx[0]);
    			attr_dev(a, "class", "btn-install svelte-10zd0jl");
    			attr_dev(a, "href", /*WalletUrl*/ ctx[1]);
    			add_location(a, file$1, 100, 2, 1814);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*state*/ 1) set_data_dev(t, /*state*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(100:1) {#if state == \\\">>Install Wallet<<\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*state*/ ctx[0] == ">>Install Wallet<<") return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "d-nav svelte-10zd0jl");
    			add_location(div, file$1, 98, 0, 1753);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);

    			if (!mounted) {
    				dispose = listen_dev(window, "load", /*cw*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    			mounted = false;
    			dispose();
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("WalletPannel", slots, []);
    	let url = "https://testnet-master-1.lamden.io/contracts/currency/balances?key=";
    	let WalletUrl = "https://chrome.google.com/webstore/detail/lamden-wallet-browser-ext/fhfffofbcgbjjojdnpcfompojdjjhdim";
    	let interState;
    	let state = "Wait...";
    	let addr;
    	let balUrl;

    	const cw = () => {
    		lwc.walletIsInstalled().then(installed => {
    			if (!installed) {
    				$$invalidate(0, state = ">>Install Wallet<<");
    			}

    			
    		});

    		lwc.events.on("newInfo", walletInfo => {
    			if (walletInfo.locked) {
    				$$invalidate(0, state = "Unlock Wallet");
    			} else {
    				addr = walletInfo.wallets[0];
    				balUrl = url + addr;

    				fetch(balUrl).then(response => response.json()).then(obj => {
    					if (Object.values(obj.value) == null) {
    						$$invalidate(0, state = "0 TAU");
    					} else {
    						$$invalidate(0, state = Object.values(obj.value) + " TAU");
    					}

    					
    				});
    			}
    		});
    	};

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<WalletPannel> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		lwc,
    		url,
    		WalletUrl,
    		interState,
    		state,
    		addr,
    		balUrl,
    		cw
    	});

    	$$self.$inject_state = $$props => {
    		if ("url" in $$props) url = $$props.url;
    		if ("WalletUrl" in $$props) $$invalidate(1, WalletUrl = $$props.WalletUrl);
    		if ("interState" in $$props) interState = $$props.interState;
    		if ("state" in $$props) $$invalidate(0, state = $$props.state);
    		if ("addr" in $$props) addr = $$props.addr;
    		if ("balUrl" in $$props) balUrl = $$props.balUrl;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [state, WalletUrl, cw];
    }

    class WalletPannel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WalletPannel",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.35.0 */
    const file = "src\\App.svelte";

    // (15:0) <Card>
    function create_default_slot(ctx) {
    	let inputs;
    	let t;
    	let main;
    	let current;
    	inputs = new Inputs({ $$inline: true });
    	main = new Main({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(inputs.$$.fragment);
    			t = space();
    			create_component(main.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(inputs, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(main, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(inputs.$$.fragment, local);
    			transition_in(main.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inputs.$$.fragment, local);
    			transition_out(main.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(inputs, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(main, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(15:0) <Card>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let upnav;
    	let t0;
    	let card;
    	let t1;
    	let wp_1;
    	let current;
    	upnav = new Upnav({ $$inline: true });

    	card = new Card({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(upnav.$$.fragment);
    			t0 = space();
    			create_component(card.$$.fragment);
    			t1 = space();
    			wp_1 = element("wp");
    			add_location(wp_1, file, 21, 0, 265);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(upnav, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(card, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, wp_1, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const card_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(upnav.$$.fragment, local);
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(upnav.$$.fragment, local);
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(upnav, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(card, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(wp_1);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ UpNav: Upnav, Card, Inputs, Main, wp: WalletPannel });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
