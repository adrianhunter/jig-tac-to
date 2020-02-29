<script>
  export let value;
  export let index;
</script>

<style>
  button {
    background: #fff;
    border: 1px solid #999;
    float: left;
    font-size: 24px;
    font-weight: bold;

    margin-right: -1px;
    margin-top: -1px;
    padding: 0;
    text-align: center;
    width: 64px;
    line-height: 64px;
    height: 64px;
  }
  button:focus {
    outline: none;
  }
</style>

<button data-index={index} on:click>{value || ' '}</button>
