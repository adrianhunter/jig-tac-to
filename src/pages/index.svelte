<script lang="typescript">
  // import Board from "../components/Board.svelte";
  // import io from 'socket.io-client';
  import TopAppBar, { Row, Section, Title } from "@smui/top-app-bar";
  import IconButton from "@smui/icon-button";
  import Board from "../components/Board.svelte";
  let pubKey;
  import { gameState, DRAW } from "../stores/store.js";
  function onSquareClick(e) {
    let index = e.target.dataset.index;
    gameState.giveSquareToCurrentPlayer(index);
  }

  const socket = io(); 
  socket.on('jig', (jig) => {
    console.log(jig.location);
  });
});
</script>

<style>
  body {
    font: 14px "Century Gothic", Futura, sans-serif;
    margin: 20px;
  }

  ol,
  ul {
    padding-left: 30px;
  }
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
  .game {
    display: flex;
    flex-direction: row;
  }
  .game-info {
    margin-left: 20px;
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
    <Board squares={$gameState.squares} on:click={onSquareClick} />
  </div>

</div>
<div class="game-info">
  {#if $gameState.winningPlayer === DRAW}
    <p>GAME OVER: it's a draw!</p>
  {:else if $gameState.winningPlayer}
    <p>
      GAME OVER: Player
      <strong>{$gameState.winningPlayer}</strong>
      won!
    </p>
  {:else}
    <p>Current player is: {$gameState.currentPlayer}</p>
  {/if}

  <p>
    <button on:click={gameState.reset}>Start a new game</button>
  </p>

  <input type="text" bind:value={pubKey} />

  <button
    on:click={() => {
      fetch('http://localhost:3000/challenge', {
        method: 'POST',
        body: { pubKey }
      });
    }}>
    Challenge
  </button>

</div>
