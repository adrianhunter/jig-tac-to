<script>
  import TopAppBar, { Row, Section, Title } from "@smui/top-app-bar";
  import IconButton from "@smui/icon-button";
</script>

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
