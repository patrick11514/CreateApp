<script lang="ts">
    import { API } from '$/lib/api';
    import { onMount } from 'svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();

    let message = $state('');

    const handleData = (response: (typeof data)['hi']) => {
        message = response;
    };

    handleData(data.hi);

    onMount(async () => {
        const res = await API.example();
        console.log(res);

        handleData(
            await API.sayHi({
                name: 'Patrick',
                age: 21
            })
        );
    });
</script>

<h1>Welcome to SvelteKit</h1>
<p>
    Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
    <span class="text-red-500">text-red-500</span>
    {message}
</p>
