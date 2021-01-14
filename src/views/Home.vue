<template>
    <div class="home">
        <input type="text" class="search-input" :class="{'open-search-input': openInputClass}">
        <span @click="openSearchInput">search</span>
    </div>
</template>

<script>

export default {
    name: 'Home',
    data () {
        return {
            openInputClass: false
        }
    },
    methods: {
        openSearchInput () {
            this.openInputClass = !this.openInputClass;
        }
    }
}
</script>

<style lang="scss" scoped>
.home {
    .search-input {
        font-family: inherit;
        font-size: 12px;
        line-height: 14px;
        display: inline-block;
        box-sizing: border-box;
        width: 300px;
        padding: 0.05em 0;
        color: #eaba82;
        border: none;
        border-bottom: 1px solid;
        outline: none;
    }

    .search-input {
        transform: scale3d(0,1,1);
        transform-origin: 0% 50%;
        transition: transform 0.3s;
    }
    .open-search-input {
        transform: scale3d(1,1,1);
        transition-duration: 0.5s;
    }
}

</style>
