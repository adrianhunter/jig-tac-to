/* src/App.svelte generated by Svelte v3.18.1 */
import { SvelteComponentDev, add_location, append_dev, create_component, destroy_component, detach_dev, dispatch_dev, element, init, insert_dev, mount_component, safe_not_equal, space, text, transition_in, transition_out } from "/web_modules/svelte/internal.js";
import Router from "./lib/svelte-routing/Router.js";
import Link from "./lib/svelte-routing/Link.js";
import Route from "./lib/svelte-routing/Route.js";
import Home from "./pages/index.js";
import About from "./pages/About.js";
const file = "src/App.svelte"; // (14:4) <Link to="/">

function create_default_slot_3(ctx) {
  let t;
  const block = {
    c: function create() {
      t = text("Home");
    },
    m: function mount(target, anchor) {
      insert_dev(target, t, anchor);
    },
    d: function destroy(detaching) {
      if (detaching) detach_dev(t);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot_3.name,
    type: "slot",
    source: "(14:4) <Link to=\\\"/\\\">",
    ctx
  });
  return block;
} // (15:4) <Link to="/about">


function create_default_slot_2(ctx) {
  let t;
  const block = {
    c: function create() {
      t = text("About");
    },
    m: function mount(target, anchor) {
      insert_dev(target, t, anchor);
    },
    d: function destroy(detaching) {
      if (detaching) detach_dev(t);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot_2.name,
    type: "slot",
    source: "(15:4) <Link to=\\\"/about\\\">",
    ctx
  });
  return block;
} // (20:4) <Route path="/">


function create_default_slot_1(ctx) {
  let current;
  const home = new Home({
    $$inline: true
  });
  const block = {
    c: function create() {
      create_component(home.$$.fragment);
    },
    m: function mount(target, anchor) {
      mount_component(home, target, anchor);
      current = true;
    },
    i: function intro(local) {
      if (current) return;
      transition_in(home.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(home.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(home, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot_1.name,
    type: "slot",
    source: "(20:4) <Route path=\\\"/\\\">",
    ctx
  });
  return block;
} // (12:0) <Router {url}>


function create_default_slot(ctx) {
  let nav;
  let t0;
  let t1;
  let div;
  let t2;
  let current;
  const link0 = new Link({
    props: {
      to: "/",
      $$slots: {
        default: [create_default_slot_3]
      },
      $$scope: {
        ctx
      }
    },
    $$inline: true
  });
  const link1 = new Link({
    props: {
      to: "/about",
      $$slots: {
        default: [create_default_slot_2]
      },
      $$scope: {
        ctx
      }
    },
    $$inline: true
  });
  const route0 = new Route({
    props: {
      path: "about",
      component: About
    },
    $$inline: true
  });
  const route1 = new Route({
    props: {
      path: "/",
      $$slots: {
        default: [create_default_slot_1]
      },
      $$scope: {
        ctx
      }
    },
    $$inline: true
  });
  const block = {
    c: function create() {
      nav = element("nav");
      create_component(link0.$$.fragment);
      t0 = space();
      create_component(link1.$$.fragment);
      t1 = space();
      div = element("div");
      create_component(route0.$$.fragment);
      t2 = space();
      create_component(route1.$$.fragment);
      add_location(nav, file, 12, 2, 320);
      add_location(div, file, 17, 2, 402);
    },
    m: function mount(target, anchor) {
      insert_dev(target, nav, anchor);
      mount_component(link0, nav, null);
      append_dev(nav, t0);
      mount_component(link1, nav, null);
      insert_dev(target, t1, anchor);
      insert_dev(target, div, anchor);
      mount_component(route0, div, null);
      append_dev(div, t2);
      mount_component(route1, div, null);
      current = true;
    },
    p: function update(ctx, dirty) {
      const link0_changes = {};

      if (dirty &
      /*$$scope*/
      2) {
        link0_changes.$$scope = {
          dirty,
          ctx
        };
      }

      link0.$set(link0_changes);
      const link1_changes = {};

      if (dirty &
      /*$$scope*/
      2) {
        link1_changes.$$scope = {
          dirty,
          ctx
        };
      }

      link1.$set(link1_changes);
      const route1_changes = {};

      if (dirty &
      /*$$scope*/
      2) {
        route1_changes.$$scope = {
          dirty,
          ctx
        };
      }

      route1.$set(route1_changes);
    },
    i: function intro(local) {
      if (current) return;
      transition_in(link0.$$.fragment, local);
      transition_in(link1.$$.fragment, local);
      transition_in(route0.$$.fragment, local);
      transition_in(route1.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(link0.$$.fragment, local);
      transition_out(link1.$$.fragment, local);
      transition_out(route0.$$.fragment, local);
      transition_out(route1.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching) detach_dev(nav);
      destroy_component(link0);
      destroy_component(link1);
      if (detaching) detach_dev(t1);
      if (detaching) detach_dev(div);
      destroy_component(route0);
      destroy_component(route1);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot.name,
    type: "slot",
    source: "(12:0) <Router {url}>",
    ctx
  });
  return block;
}

function create_fragment(ctx) {
  let current;
  const router = new Router({
    props: {
      url:
      /*url*/
      ctx[0],
      $$slots: {
        default: [create_default_slot]
      },
      $$scope: {
        ctx
      }
    },
    $$inline: true
  });
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
    p: function update(ctx, [dirty]) {
      const router_changes = {};
      if (dirty &
      /*url*/
      1) router_changes.url =
      /*url*/
      ctx[0];

      if (dirty &
      /*$$scope*/
      2) {
        router_changes.$$scope = {
          dirty,
          ctx
        };
      }

      router.$set(router_changes);
    },
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
    id: create_fragment.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}

function instance($$self, $$props, $$invalidate) {
  let {
    url = ""
  } = $$props;
  const writable_props = ["url"];
  Object.keys($$props).forEach(key => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
  });

  $$self.$set = $$props => {
    if ("url" in $$props) $$invalidate(0, url = $$props.url);
  };

  $$self.$capture_state = () => {
    return {
      url
    };
  };

  $$self.$inject_state = $$props => {
    if ("url" in $$props) $$invalidate(0, url = $$props.url);
  };

  return [url];
}

class App extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance, create_fragment, safe_not_equal, {
      url: 0
    });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "App",
      options,
      id: create_fragment.name
    });
  }

  get url() {
    throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }

  set url(value) {
    throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }

}

export default App;