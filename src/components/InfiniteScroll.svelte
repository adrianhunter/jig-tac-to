<script>
  import VirtualList from "../lib/VirtualList.svelte";

  export let items;
  export let Item;
  $: realItems = [];
  let offset = 0;

  if (items.subscribe) {
    items.subscribe(r => r.then(updateItems));
    console.error("must have sub function");
  } else {
    realItems = items;
  }

  let globalNextGroupKey = 1;
  let globalNextKey = 0;

  async function updateItems(result) {
    if (!result.data) return;

    realItems = [...realItems, ...result.data[Object.keys(result.data)[0]]];

    // result.data.reverse();
    // const keys = result.data[Object.keys(result.data)[0]];
    // keys.reverse();
    // const foo = keys.map((r, i) => {
    //   r.key = globalNextKey + i;

    //   if (i > 0 && i % limit == 0) {
    //     globalNextGroupKey++;
    //   }

    //   r.groupKey = globalNextGroupKey;

    //   return r;
    // });
    // loading = false;
    // console.log("foofoofoofoo", foo);
    // // ig.getInstance().clear();
    // realItems = [...realItems, ...foo];
  }

  let start;
  let end;

  let timeout;

  $: console.log("realItems", realItems);

  $: if (end > realItems.length - 13) {
    offset += 30;

    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      items.fetchMore({
        variables: {
          offset
        }
        // updateQuery: (prev, { fetchMoreResult }) => {
        //   if (!fetchMoreResult) return prev;
        //   const firstKey = Object.keys(prev)[0];
        //   const obj = {};
        //   obj[firstKey] = [...prev[firstKey], ...fetchMoreResult[firstKey]];
        //   return Object.assign({}, prev, obj);
        // }
      });
    }, 300);
  }
</script>

<style>
  div {
    height: 100vh;
  }
</style>

<div>
  <VirtualList items={realItems} bind:start bind:end let:item>

    <Item {item} />

    <!-- <slot {item}>
      <div>not item slot</div>

      {#if Item}
      {:else}
      {/if}
    </slot> -->
  </VirtualList>
</div>
