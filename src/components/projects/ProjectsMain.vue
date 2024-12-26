<template>
    <section class="github animate__animated animate__zoomInUp">
        <h2>github</h2>
        <table class="github-table">
            <tbody>
                <tr v-for="project in projects" :key="project.name" @click="redirectToProject(project.url)" style="cursor: pointer;">
                    <td>
                        <h3><a :href="project.url" @click.stop>{{ project.name }}</a></h3>
                        <p>✩ {{ project.stars }}</p>
                        <p>{{ project.description }}</p>
                    </td>
                </tr>
            </tbody>
        </table>
    </section>
</template>

<script>
export default {
    name: 'ProjectList',
    props: {
        projects: {
            type: Array,
            required: true
        },
    },
    methods: {
        redirectToProject(url) {
            window.location.href = url;
        }
    }
};
</script>

<style scoped>
.github {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 0 auto;
    width: 520px;
}
.github h2 {
    font-size: 40px;
    font-family: 'Gotham XNarrow A', 'Gotham XNarrow B', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif;
    text-transform: uppercase;
    font-weight: 500;
    font-style: normal;
    color: #fff;
}
.github-table {
    border-collapse: collapse;
    margin-top: 32px;
}
.github-table td p {
    font-size: 18px;
    line-height: 1.6;
    margin-bottom: 15px;
}
.github-table td:hover {
    filter: brightness(150%);
    transition: all 0.7s ease;
}
.github-table td {
    border-bottom: 1px solid #4b4a4a;
    padding: 0.8rem 0.4rem;
    text-align: left;
}

.github-table tr:last-child td {
    border-bottom: none;
}
.github-table td h3 {
    padding-bottom: 5px;
    font-size: 25px;
    font-family: 'Gotham XNarrow A', 'Gotham XNarrow B', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif;
    text-transform: uppercase;
    font-weight: 500;
    font-style: normal;
    color: #fff;
}
.github h3 a {
    color: #dcdbdb;
    font-weight: 700;
}
a, a:active, a:visited, p a, p a:active, p a:visited {
    text-decoration: none;
    color: #fff;
    font-weight: 700;
}
li, p {
    color: #b5b3b3;
    font-size: 18px;
}
@media (max-width: 780px) {
    .github {
        max-width: 345px;
    }
}
</style>