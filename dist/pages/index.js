/* src/pages/index.svelte generated by Svelte v3.18.1 */
import { SvelteComponentDev, add_location, append_dev, attr_dev, create_component, destroy_component, detach_dev, dispatch_dev, element, init, insert_dev, mount_component, noop, safe_not_equal, transition_in, transition_out } from "/web_modules/svelte/internal.js";
import Item from "../components/Item.js";
import InfiniteScroll from "../components/InfiniteScroll.js"; // import { gql } from "simple-gql";

import { query } from "../lib/graphql.js";
const file = "src/pages/index.svelte";

function add_css() {
  var style = element("style");
  style.id = "svelte-6xs8g3-style";
  style.textContent = "div.svelte-6xs8g3{color:red}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguc3ZlbHRlIiwic291cmNlcyI6WyJpbmRleC5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5pbXBvcnQgSXRlbSBmcm9tICcuLi9jb21wb25lbnRzL0l0ZW0uc3ZlbHRlJztcbmltcG9ydCBJbmZpbml0ZVNjcm9sbCBmcm9tICcuLi9jb21wb25lbnRzL0luZmluaXRlU2Nyb2xsLnN2ZWx0ZSc7XG4vLyBpbXBvcnQgeyBncWwgfSBmcm9tIFwic2ltcGxlLWdxbFwiO1xuaW1wb3J0IHsgcXVlcnkgfSBmcm9tICcuLi9saWIvZ3JhcGhxbCc7XG5jb25zdCBxdWVyeVN0cmluZyA9IGBcbiAgICBxdWVyeSBnZXRCb29rICgkb2Zmc2V0OiBJbnQpIHtcbiAgICAgIG91dHB1dChsaW1pdDogMjAsIG9mZnNldDogJG9mZnNldCkge1xuICAgICAgICBzY3JpcHRcbiAgICAgICAgdHhIYXNoXG4gICAgICB9XG4gICAgfVxuICBgO1xubGV0IGl0ZW1zID0gcXVlcnkocXVlcnlTdHJpbmcpO1xuPC9zY3JpcHQ+XG5cbjxzdHlsZT5cbiAgZGl2IHtcbiAgICBjb2xvcjogcmVkO1xuICB9XG48L3N0eWxlPlxuXG48ZGl2PlxuXG4gIDxJbmZpbml0ZVNjcm9sbCB7aXRlbXN9IHtJdGVtfSAvPlxuXG48L2Rpdj5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFnQkUsR0FBRyxjQUFDLENBQUMsQUFDSCxLQUFLLENBQUUsR0FBRyxBQUNaLENBQUMifQ== */";
  append_dev(document.head, style);
}

function create_fragment(ctx) {
  let div;
  let current;
  const infinitescroll = new InfiniteScroll({
    props: {
      items:
      /*items*/
      ctx[0],
      Item
    },
    $$inline: true
  });
  const block = {
    c: function create() {
      div = element("div");
      create_component(infinitescroll.$$.fragment);
      attr_dev(div, "class", "svelte-6xs8g3");
      add_location(div, file, 21, 0, 435);
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      insert_dev(target, div, anchor);
      mount_component(infinitescroll, div, null);
      current = true;
    },
    p: noop,
    i: function intro(local) {
      if (current) return;
      transition_in(infinitescroll.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(infinitescroll.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching) detach_dev(div);
      destroy_component(infinitescroll);
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

function instance($$self) {
  const queryString = `
    query getBook ($offset: Int) {
      output(limit: 20, offset: $offset) {
        script
        txHash
      }
    }
  `;
  let items = query(queryString);

  $$self.$capture_state = () => {
    return {};
  };

  $$self.$inject_state = $$props => {
    if ("items" in $$props) $$invalidate(0, items = $$props.items);
  };

  return [items];
}

class Pages extends SvelteComponentDev {
  constructor(options) {
    super(options);
    if (!document.getElementById("svelte-6xs8g3-style")) add_css();
    init(this, options, instance, create_fragment, safe_not_equal, {});
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "Pages",
      options,
      id: create_fragment.name
    });
  }

}

export default Pages;