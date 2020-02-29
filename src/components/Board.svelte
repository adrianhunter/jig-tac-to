<script>
  import Square from "./Square.svelte";
  export let squares;
</script>

<style>
  .board-row {
    height: 64px;
    overflow: hidden;
    padding-right: 1px;
    padding-top: 1px;
  }
  .board-row:after {
    clear: both;
    content: "";
    display: table;
  }
  .board-row:last-child {
    border-bottom: 1px solid #999;
  }

  .board {
    /* width: 300px; */
  }
</style>

<div class="board">
  <div class="board-row">
    <Square value={squares[0]} index="0" on:click />
    <Square value={squares[1]} index="1" on:click />
    <Square value={squares[2]} index="2" on:click />
  </div>

  <div class="board-row">
    <Square value={squares[3]} index="3" on:click />
    <Square value={squares[4]} index="4" on:click />
    <Square value={squares[5]} index="5" on:click />
  </div>

  <div class="board-row">
    <Square value={squares[6]} index="6" on:click />
    <Square value={squares[7]} index="7" on:click />
    <Square value={squares[8]} index="8" on:click />
  </div>
</div>
