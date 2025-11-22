<script>
    import { BASE_URL } from "../../stores/generalStore";
    import { auth } from "../../stores/authStore";
    import { toast } from 'svelte-sonner';
    import { navigate, Link } from 'svelte-routing';

    let username = '';
    let password = '';
    let loading = false;

    async function handleSubmit(event) {
        event.preventDefault();
        loading = true;

        try {
            const response = await fetch(`${$BASE_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Login fejlede');
            }

            // Gem brugerdata og token i auth store
            auth.login(result.data);

            toast.success(`Velkommen ${result.data.username}!`);

            // Redirect til forsiden
            navigate('/');

        } catch (err) {
            toast.error(err.message || 'Login fejlede');
        } finally {
            loading = false;
        }
    }
</script>

<h1>Medlemmer kan logge ind i hulen</h1>

<form on:submit={handleSubmit}>
    <div>
        <label for="username">Navn:</label>
        <input type="text" id="username" bind:value={username} required />
    </div>

    <div>
        <label for="password">Adgangskode:</label>
        <input type="password" id="password" bind:value={password} required />
    </div>

    <button type="submit" disabled={loading}>
        {loading ? 'Logger ind...' : 'Log ind i hulen'}
    </button>
</form>

<p>
    <Link to="/forgot-password">Glemt password?</Link>
</p>