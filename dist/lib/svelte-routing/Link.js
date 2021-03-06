/* src/lib/svelte-routing/Link.svelte generated by Svelte v3.18.1 */
import { SvelteComponentDev, add_location, assign, component_subscribe, create_slot, detach_dev, dispatch_dev, element, get_slot_changes, get_slot_context, get_spread_update, init, insert_dev, listen_dev, safe_not_equal, set_attributes, transition_in, transition_out, validate_store } from "/web_modules/svelte/internal.js";
import { getContext, createEventDispatcher } from "/web_modules/svelte.js";
import { ROUTER, LOCATION } from "./contexts.js";
import { navigate } from "./history.js";
import { startsWith, resolve, shouldNavigate } from "./utils.js";
const file = "src/lib/svelte-routing/Link.svelte";

function create_fragment(ctx) {
  let a;
  let current;
  let dispose;
  const default_slot_template =
  /*$$slots*/
  ctx[16].default;
  const default_slot = create_slot(default_slot_template, ctx,
  /*$$scope*/
  ctx[15], null);
  let a_levels = [{
    href:
    /*href*/
    ctx[0]
  }, {
    "aria-current":
    /*ariaCurrent*/
    ctx[2]
  },
  /*props*/
  ctx[1]];
  let a_data = {};

  for (let i = 0; i < a_levels.length; i += 1) {
    a_data = assign(a_data, a_levels[i]);
  }

  const block = {
    c: function create() {
      a = element("a");
      if (default_slot) default_slot.c();
      set_attributes(a, a_data);
      add_location(a, file, 40, 0, 1249);
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      insert_dev(target, a, anchor);

      if (default_slot) {
        default_slot.m(a, null);
      }

      current = true;
      dispose = listen_dev(a, "click",
      /*onClick*/
      ctx[5], false, false, false);
    },
    p: function update(ctx, [dirty]) {
      if (default_slot && default_slot.p && dirty &
      /*$$scope*/
      32768) {
        default_slot.p(get_slot_context(default_slot_template, ctx,
        /*$$scope*/
        ctx[15], null), get_slot_changes(default_slot_template,
        /*$$scope*/
        ctx[15], dirty, null));
      }

      set_attributes(a, get_spread_update(a_levels, [dirty &
      /*href*/
      1 && {
        href:
        /*href*/
        ctx[0]
      }, dirty &
      /*ariaCurrent*/
      4 && {
        "aria-current":
        /*ariaCurrent*/
        ctx[2]
      }, dirty &
      /*props*/
      2 &&
      /*props*/
      ctx[1]]));
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
      if (detaching) detach_dev(a);
      if (default_slot) default_slot.d(detaching);
      dispose();
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
  let $base;
  let $location;
  let {
    to = "#"
  } = $$props;
  let {
    replace = false
  } = $$props;
  let {
    state = {}
  } = $$props;
  let {
    getProps = () => ({})
  } = $$props;
  const {
    base
  } = getContext(ROUTER);
  validate_store(base, "base");
  component_subscribe($$self, base, value => $$invalidate(12, $base = value));
  const location = getContext(LOCATION);
  validate_store(location, "location");
  component_subscribe($$self, location, value => $$invalidate(13, $location = value));
  const dispatch = createEventDispatcher();
  let href, isPartiallyCurrent, isCurrent, props;

  function onClick(event) {
    dispatch("click", event);

    if (shouldNavigate(event)) {
      event.preventDefault(); // Don't push another entry to the history stack when the user
      // clicks on a Link to the page they are currently on.

      const shouldReplace = $location.pathname === href || replace;
      navigate(href, {
        state,
        replace: shouldReplace
      });
    }
  }

  const writable_props = ["to", "replace", "state", "getProps"];
  Object.keys($$props).forEach(key => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Link> was created with unknown prop '${key}'`);
  });
  let {
    $$slots = {},
    $$scope
  } = $$props;

  $$self.$set = $$props => {
    if ("to" in $$props) $$invalidate(6, to = $$props.to);
    if ("replace" in $$props) $$invalidate(7, replace = $$props.replace);
    if ("state" in $$props) $$invalidate(8, state = $$props.state);
    if ("getProps" in $$props) $$invalidate(9, getProps = $$props.getProps);
    if ("$$scope" in $$props) $$invalidate(15, $$scope = $$props.$$scope);
  };

  $$self.$capture_state = () => {
    return {
      to,
      replace,
      state,
      getProps,
      href,
      isPartiallyCurrent,
      isCurrent,
      props,
      $base,
      $location,
      ariaCurrent
    };
  };

  $$self.$inject_state = $$props => {
    if ("to" in $$props) $$invalidate(6, to = $$props.to);
    if ("replace" in $$props) $$invalidate(7, replace = $$props.replace);
    if ("state" in $$props) $$invalidate(8, state = $$props.state);
    if ("getProps" in $$props) $$invalidate(9, getProps = $$props.getProps);
    if ("href" in $$props) $$invalidate(0, href = $$props.href);
    if ("isPartiallyCurrent" in $$props) $$invalidate(10, isPartiallyCurrent = $$props.isPartiallyCurrent);
    if ("isCurrent" in $$props) $$invalidate(11, isCurrent = $$props.isCurrent);
    if ("props" in $$props) $$invalidate(1, props = $$props.props);
    if ("$base" in $$props) base.set($base = $$props.$base);
    if ("$location" in $$props) location.set($location = $$props.$location);
    if ("ariaCurrent" in $$props) $$invalidate(2, ariaCurrent = $$props.ariaCurrent);
  };

  let ariaCurrent;

  $$self.$$.update = () => {
    if ($$self.$$.dirty &
    /*to, $base*/
    4160) {
      $: $$invalidate(0, href = to === "/" ? $base.uri : resolve(to, $base.uri));
    }

    if ($$self.$$.dirty &
    /*$location, href*/
    8193) {
      $: $$invalidate(10, isPartiallyCurrent = startsWith($location.pathname, href));
    }

    if ($$self.$$.dirty &
    /*href, $location*/
    8193) {
      $: $$invalidate(11, isCurrent = href === $location.pathname);
    }

    if ($$self.$$.dirty &
    /*isCurrent*/
    2048) {
      $: $$invalidate(2, ariaCurrent = isCurrent ? "page" : undefined);
    }

    if ($$self.$$.dirty &
    /*getProps, $location, href, isPartiallyCurrent, isCurrent*/
    11777) {
      $: $$invalidate(1, props = getProps({
        location: $location,
        href,
        isPartiallyCurrent,
        isCurrent
      }));
    }
  };

  return [href, props, ariaCurrent, base, location, onClick, to, replace, state, getProps, isPartiallyCurrent, isCurrent, $base, $location, dispatch, $$scope, $$slots];
}

class Link extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance, create_fragment, safe_not_equal, {
      to: 6,
      replace: 7,
      state: 8,
      getProps: 9
    });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "Link",
      options,
      id: create_fragment.name
    });
  }

  get to() {
    throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }

  set to(value) {
    throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }

  get replace() {
    throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }

  set replace(value) {
    throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }

  get state() {
    throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }

  set state(value) {
    throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }

  get getProps() {
    throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }

  set getProps(value) {
    throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }

}

export default Link;