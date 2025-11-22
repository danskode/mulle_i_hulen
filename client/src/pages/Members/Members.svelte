<script>
    import { onMount } from "svelte";
    import { BASE_URL } from "../../stores/generalStore";
    import { auth } from "../../stores/authStore";
    import { navigate } from 'svelte-routing';
    import { toast } from 'svelte-sonner';

    let members = [];
    let loading = true;
    let error = null;

    // Admin form state variables
    let showCreateForm = false;
    let creating = false;
    let newMember = {
        username: '',
        email: '',
        password: '',
        role: 'USER'
    };

    async function loadMembers() {
        loading = true;
        error = null;
        try {
            const response = await fetch(`${$BASE_URL}/api/members`, {
                headers: {
                    'Authorization': `Bearer ${$auth.token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    toast.error('Din session er udløbet. Log venligst ind igen.');
                    auth.logout();
                    navigate('/login');
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            members = result.data;
        } catch (err) {
            if (err.message.includes('Load failed') || err.message.includes('Failed to fetch')) {
                toast.error('Din session er udløbet. Log venligst ind igen.');
                auth.logout();
                navigate('/login');
                return;
            }
            error = err.message;
        } finally {
            loading = false;
        }
    }

    async function handleCreateMember(event) {
        event.preventDefault();
        creating = true;

        try {
            const response = await fetch(`${$BASE_URL}/api/members`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${$auth.token}`
                },
                body: JSON.stringify(newMember)
            });

            // Check for auth errors before parsing JSON
            if (response.status === 401 || response.status === 403) {
                toast.error('Din session er udløbet. Log venligst ind igen.');
                auth.logout();
                navigate('/login');
                return;
            }

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Kunne ikke oprette medlem');
            }

            toast.success(`Medlem ${newMember.username} oprettet succesfuldt!`);

            // Reset form
            newMember = {
                username: '',
                email: '',
                password: '',
                role: 'USER'
            };
            showCreateForm = false;

            // Reload members list
            await loadMembers();

        } catch (err) {
            toast.error(err.message || 'Kunne ikke oprette medlem');
        } finally {
            creating = false;
        }
    }

    onMount(async () => {
        await loadMembers();
    });

    $: isAdmin = $auth && $auth.role === 'ADMIN';
</script>

<h1>Members of the secret society around Zappa</h1>

{#if isAdmin}
    <div class="admin-section">
        <button on:click={() => showCreateForm = !showCreateForm}>
            {showCreateForm ? 'Annuller' : '+ Opret nyt medlem'}
        </button>

        {#if showCreateForm}
            <form on:submit={handleCreateMember} class="create-member-form">
                <h3>Opret nyt medlem</h3>

                <div>
                    <label for="username">Brugernavn:</label>
                    <input
                        type="text"
                        id="username"
                        bind:value={newMember.username}
                        required
                        placeholder="fx: johndoe"
                    />
                </div>

                <div>
                    <label for="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        bind:value={newMember.email}
                        required
                        placeholder="fx: john@example.com"
                    />
                </div>

                <div>
                    <label for="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        bind:value={newMember.password}
                        required
                        minlength="8"
                        placeholder="Min 8 tegn, inkl. stort bogstav, lille bogstav og tal"
                    />
                </div>

                <div>
                    <label for="role">Rolle:</label>
                    <select id="role" bind:value={newMember.role} required>
                        <option value="PROSPECT">PROSPECT</option>
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>
                </div>

                <button type="submit" disabled={creating}>
                    {creating ? 'Opretter...' : 'Opret medlem'}
                </button>
            </form>
        {/if}
    </div>
{/if}

{#if loading}
    <p>Loading members...</p>
{:else if error}
    <p>Error: {error}</p>
{:else if members && members.length > 0}
    <div class="members-list">
        {#each members as member}
            <div class="member-card">
                <h3>{member.username}</h3>
                <p>Role: <strong>{member.role}</strong></p>
                {#if member.email}
                    <p>Email: {member.email}</p>
                {/if}
                <p class="created-at">Medlem siden: {new Date(member.created_at).toLocaleDateString('da-DK')}</p>
            </div>
        {/each}
    </div>
{:else}
    <p>No members found.</p>
{/if}