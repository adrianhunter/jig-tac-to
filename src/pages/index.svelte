<script>
  import Board from "../components/Board.svelte";
  import { history, status } from "../stores/store.js";
  import TopAppBar, { Row, Section, Title } from "@smui/top-app-bar";
  import IconButton from "@smui/icon-button";
</script>

<style>
  .game {
    font: 14px "Century Gothic", Futura, sans-serif;
    margin: 20px;
    display: flex;
    flex-direction: row;
  }

  .game-info {
    margin-left: 20px;
  }

  .status {
    margin-bottom: 10px;
  }

  .game-board {
    margin-left: auto;
    margin-right: auto;
  }

  ol {
    padding-left: 30px;
  }
</style>

<svelte:head>
  <title>Jig Tac To</title>
</svelte:head>

<TopAppBar variant="static" color="primary">
  <Row>
    <Section>
      <!-- <IconButton class="material-icons">menu</IconButton> -->
      <Title>Jig Tac To</Title>
    </Section>
    <Section align="end" toolbar />
  </Row>
</TopAppBar>

<div class="game">
  <div class="game-board">
    <Board />
  </div>

  <br />

</div>

<div class="game-info">
  <div class="status">
    {#if $status === 1}
      <b>Winner: {!$history.currentState().xIsNext ? 'X' : 'O'}</b>
    {:else if $status === 2}
      <b>Draw</b>
    {:else}Next player: {$history.currentState().xIsNext ? 'X' : 'O'}{/if}
  </div>
  <div>
    {#if $history.canUndo()}
      <button on:click={history.undo}>Undo</button>
    {:else}
      <button disabled>Undo</button>
    {/if}
    {#if $history.canRedo()}
      <button on:click={history.redo}>Redo</button>
    {:else}
      <button disabled>Redo</button>
    {/if}
  </div>
  <ol>
    {#each $history.history as value, i}
      {#if i == 0}
        <li>
          <button on:click={() => history.setCurrent(i)}>
            Go to game start
          </button>
        </li>
      {:else}
        <li>
          <button on:click={() => history.setCurrent(i)}>
            Go to move #{i}
          </button>
        </li>
      {/if}
    {/each}
  </ol>
</div>
