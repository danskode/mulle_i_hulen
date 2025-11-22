<script>
    import { BASE_URL } from "../../stores/generalStore";
    import { toast } from 'svelte-sonner';
    import { Link } from 'svelte-routing';

    let email = '';
    let loading = false;
    let emailSent = false;

    async function handleSubmit(event) {
        event.preventDefault();
        loading = true;

        try {
            const response = await fetch(`${$BASE_URL}/api/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Der skete en fejl');
            }

            emailSent = true;
            toast.success('Reset link sendt! Tjek din email.');

        } catch (err) {
            toast.error(err.message || 'Der skete en fejl');
        } finally {
            loading = false;
        }
    }
</script>

<h1>Glemt password</h1>

{#if emailSent}
    <div class="success-message">
        <p>Et reset link er blevet sendt til din email!</p>
        <Link to="/login">Tilbage til login</Link>
    </div>
{:else}
    <p>Indtast din email for at modtage et password reset link.</p>

    <form on:submit={handleSubmit}>
        <div>
            <label for="email">Email:</label>
            <input
                type="email"
                id="email"
                bind:value={email}
                required
                placeholder="din@email.dk"
            />
        </div>

        <button type="submit" disabled={loading}>
            {loading ? 'Sender...' : 'Send reset link'}
        </button>
    </form>

    <p>
        <Link to="/login">Tilbage til login</Link>
    </p>
{/if}
