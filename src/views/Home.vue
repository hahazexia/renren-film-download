<template>
    <div class="home">
        <div @mouseenter="openSearchInput" v-clickoutside="closeSearchInput">
            <input type="text" class="search-input" v-model="keyWord" :class="{'open-search-input': openInputClass}" spellcheck="false" @keyup.enter="search">
            <span class="search-btn" @click="search">🔍</span>
        </div>
        <div class="search-result" v-text="result">

        </div>
        <div class="page-box" v-if="count > 0">
            <span class="page-btn" :class="{'current-page-btn': currentPage === item}" v-for="(item) in pageArray" :key="item" @click="doSearch(item === '...' ? -1 : item)">
                {{item}}
            </span>
        </div>
    </div>
</template>

<script>
import { ipcRenderer } from 'electron'

const clickoutside = {
    bind (el, binding, vnode) {
        function documentHandler(e) {
            if (el.contains(e.target)) {
                return false;
            }
            if (binding.expression) {
                binding.value(e);
            }
        }
        el.__vueClickOutside__ = documentHandler;
        document.addEventListener('click', documentHandler);
    },
    unbind (el, binding) {
        document.removeEventListener('click', el.__vueClickOutside__);
        delete el.__vueClickOutside__;
    },
};

export default {
    name: 'Home',
    data () {
        return {
            openInputClass: false,
            keyWord: '',
            result: '',
            count: 0,
            pageArray: [],
            currentPage: 1
        }
    },
    directives: {
        clickoutside
    },
    methods: {
        openSearchInput () {
            this.openInputClass = true;
        },
        closeSearchInput () {
            this.openInputClass = false;
        },
        async doSearch (page = 1) {
            console.log(page, 'page 会话')
            if (page === -1) {
                return false;
            }
            this.currentPage = page;
            await this.search();
        },
        async search () {
            if (!this.keyWord) {
                alert('请输入关键词搜索！')
                return false;
            }
            const result = await ipcRenderer.invoke('searchFilm', {
                keyWord: this.keyWord,
                page: this.currentPage,
                limit: 2
            });
            console.log('结果', result)

            if (result.count === 0) {
                alert('啥都没找到，谢谢搜索！')
            } else {
                this.result = result.rows;
                this.count = result.count;
                let tempArray = new Array(Math.ceil(this.count / 2)).fill(1).map((item, index) => {
                    return index + 1;
                });

                if (tempArray.length < 10) {
                    this.pageArray = tempArray;
                } else {
                    if (this.currentPage <= 5) {
                        this.pageArray = [1, 2, 3, 4, 5, '...', ...tempArray.slice(tempArray.length - 5)];
                    } else {
                        if (this.currentPage < tempArray.length - 5) {
                            this.pageArray = [...tempArray.slice(this.currentPage - 4, this.currentPage + 1), '...', ...tempArray.slice(tempArray.length - 5)];
                        } else {
                            this.pageArray = [...tempArray.slice(tempArray.length - 10)];
                        }
                    }
                }

                result.rows.forEach(item => {
                    try {
                        let temp = JSON.parse(item.data)
                        console.log(temp, 'temp')
                    } catch (err) {
                        console.log(err, 'parse 结果')
                    }
                })
            }
        }
    },
    mounted () {
        this.openSearchInput();
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
        color: #9582ea;
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
    .search-btn {
        cursor: pointer;
    }
    .search-result {
        word-break: break-all;
    }
    .page-box {
        margin-top: 20px;
        line-height: 30px;
        .page-btn {
            cursor: pointer;
            margin: 5px;
            &:hover {
                border-bottom: 1px solid #9582ea;
            }
        }
        .current-page-btn {
            border-bottom: 1px solid #9582ea;
        }
    }
}

</style>
