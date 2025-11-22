<script>
    import { BASE_URL } from "../../stores/generalStore";
    import { toast } from 'svelte-sonner';
    import { navigate, Link } from 'svelte-routing';
    import { onMount } from 'svelte';

    let newPassword = '';
    let confirmPassword = '';
    let loading = false;
    let token = '';

    onMount(() => {
        // Hent token fra URL query parameter
        const params = new URLSearchParams(window.location.search);
        token = params.get('token') || '';

        if (!token) {
            toast.error('Ingen reset token fundet');
            navigate('/login');
        }
    });

    async function handleSubmit(event) {
        event.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('Passwords matcher ikke');
            return;
        }

        if (newPassword.length < 8) {
            toast.error('Password skal være mindst 8 tegn med stort bogstav, lille bogstav og tal');
            return;
        }

        loading = true;

        try {
            const response = await fetch(`${$BASE_URL}/api/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token, newPassword })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Reset fejlede');
            }

            toast.success('Password nulstillet! Du kan nu logge ind.');
            navigate('/login');

        } catch (err) {
            toast.error(err.message || 'Reset fejlede');
        } finally {
            loading = false;
        }
    }
</script>

<h1>Nulstil password</h1>

<p>Indtast dit nye password nedenfor.</p>

<form on:submit={handleSubmit}>
    <div>
        <label for="newPassword">Nyt password:</label>
        <input
            type="password"
            id="newPassword"
            bind:value={newPassword}
            required
            minlength="8"
            placeholder="Min 8 tegn, inkl. stort bogstav, lille bogstav og tal"
        />
    </div>

    <div>
        <label for="confirmPassword">Bekræft password:</label>
        <input
            type="password"
            id="confirmPassword"
            bind:value={confirmPassword}
            required
            minlength="8"
            placeholder="Gentag password"
        />
    </div>

    <button type="submit" disabled={loading}>
        {loading ? 'Nulstiller...' : 'Nulstil password'}
    </button>
</form>

<p>
    <Link to="/login">Tilbage til login</Link>
</p>
