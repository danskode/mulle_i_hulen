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

            // Save user data and token in authStore
            auth.login(result.data);

            toast.success(`Velkommen i hulen, ${result.data.username}!`);

            // Redirect to home page ...
            navigate('/');

        } catch (err) {
            toast.error(err.message || 'Login fejlede - prøv igen senere');
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
    <Link to="/forgot-password">Har du glemt dit password?</Link>
</p>