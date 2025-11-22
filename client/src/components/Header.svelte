<script>
  import { Link } from 'svelte-routing';
  import { auth } from '../stores/authStore';
  import { toast } from 'svelte-sonner';

  let isDarkMode = $state(false);

  $effect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    isDarkMode = mediaQuery.matches;

    const handleChange = (e) => {
      isDarkMode = e.matches;
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  });

  function handleLogout() {
    auth.logout();
    toast.success('Du er nu logget ud');
  }

  const logoSrc = $derived(isDarkMode ? '/images/favicons/favicon-darkmode.png' : '/images/favicons/favicon-lightmode.png');
</script>

<header>
  <div class="site-header">
    <img
      src={logoSrc}
      alt="Club Zappa Logo"
      class="site-logo"
    />
    <h1 class="site-title">Club Zappa</h1>
  </div>

  <nav>
    <Link to="/">Home</Link>

    {#if $auth}
      <Link to="/members">Members</Link>
      <button onclick={handleLogout}>Log ud</button>
    {:else}
      <Link to="/login">Login</Link>
    {/if}
  </nav>
</header>
