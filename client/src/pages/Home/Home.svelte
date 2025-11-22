<script>
    import { auth } from '../../stores/authStore';
    import { Link } from 'svelte-routing';
</script>

<h1>Velkommen til hulen</h1>

{#if $auth}
    <p>Velkommen i hulen, {$auth.username}!</p>
{:else}
    <p>Er du medlem, så <Link to="/login">log ind!</Link></p>
{/if}