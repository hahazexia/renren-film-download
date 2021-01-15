<template>
    <div class="home">
        <div class="search-box" @mouseenter="openSearchInput" v-clickoutside="closeSearchInput">
            <input type="text" class="search-input" v-model="keyWord" :class="{'open-search-input': openInputClass}" spellcheck="false" @keyup.enter="doSearch(1)">
            <span class="search-btn" @click="doSearch(1)" title="开始搜索">🔍</span>
        </div>
        <div class="info-box" v-if="count > 0">
            <span>总共搜索到 {{count}} 个结果</span>
            &nbsp;&nbsp;
            <span>这是第 {{currentPage * limit - limit + 1}} ~ {{currentPage === lastPage ? count : (currentPage * limit)}} 个结果</span>
        </div>
        <div class="search-result">
            <div class="film-result" v-for="item in film" :key="item.id">
                <div v-html="item.name"></div>
                <div class="channel">{{item.channel}}</div>
                <div class="renren-url">
                    <a href="javascript:;" @click="openRenRenUrl(item.url)">{{item.url}}</a>
                </div>
                <div class="file-list">
                    <div class="file" v-for="data in item.file" :key="`${item.id}_${data.info.format}_${data.info.id}`">
                        <div class="file-link" v-for="link in data" :key="`${link.way}_${data.info.id}`">
                            <input type="checkbox">
                            <span class="link" v-text="`${data.info.format} | ${link.way_cn} | ${data.info.name} | ${data.info.size}`" :title="link.address" @click.right="rightMenuOpen(link, $event)"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="page-box" v-if="count > 0">
            <span class="page-btn" :class="{'current-page-btn': currentPage === item}" v-for="(item) in pageArray" :key="item" @click="doSearch(item === '...' ? -1 : item)">
                {{item}}
            </span>
        </div>
    </div>
</template>

<script>
import { ipcRenderer, shell, remote, clipboard } from 'electron'
const { Menu, MenuItem } = remote;

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
            currentPage: 1,
            lastPage: 1,
            limit: 2,
            film: []
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
        openRenRenUrl (path) {
            shell.openPath(path);
        },
        rightMenuOpen (link, e) {
            console.log(link, 'link', e)
            const linkMenu = new Menu();

            linkMenu.append(new MenuItem({
                label: '复制',
                click () {
                    console.log(link.address)
                    clipboard.writeText(link.address);
                }
            }));

            linkMenu.popup({
                windows: remote.getCurrentWindow(),
                x: e.clientX,
                y: e.clientY,
                callback: () => {
                    console.log('复制成功！');
                }
            })
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
                limit: this.limit
            });
            console.log('结果', result)

            if (result.count === 0) {
                alert('啥都没找到，谢谢搜索！')
                this.result = '';
                this.count = 0;
                this.pageArray = [],
                this.currentPage = 1
                this.lastPage = 1;

            } else {
                this.result = result.rows;
                this.count = result.count;
                this.lastPage = Math.ceil(this.count / 2);
                let tempArray = new Array(this.lastPage).fill(1).map((item, index) => {
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

                let filmTempArray = [];

                result.rows.forEach(item => {
                    try {
                        let film = {};

                        let temp = JSON.parse(item.data)
                        console.log(temp, 'temp')

                        film.name = item.name.replace(/\n/g, '&nbsp;');
                        film.id = item.id;
                        film.url = item.url;

                        let channel = temp?.data?.info.channel;
                        film.channel = channel || '未知';

                        let finalResult = [];

                        let list = temp?.data?.list;
                        if (list) {
                            list.forEach(item => {
                                let format = item.formats.filter(i => i !== 'APP');
                                format.forEach(partItem => {
                                    item.items[partItem].forEach(i => {
                                        let files = null;
                                        if (i.files) {
                                            files = i.files.filter(filesItem => filesItem.way !== '9');
                                            files.info = {
                                                format: partItem,
                                                id: i.itemid,
                                                name: i.name,
                                                size: i.size
                                            };
                                        }
                                        finalResult.push(files);
                                    });
                                });
                            })
                        }
                        finalResult = finalResult.filter(Boolean);
                        film.file = finalResult;

                        filmTempArray.push(film);
                    } catch (err) {
                        console.log(err, 'parse 结果')
                        let film = {};
                        film.name = item.name.replace(/\n/g, '&nbsp;');
                        film.id = item.id;
                        film.url = item.url;


                        film.file = [];
                        filmTempArray.push(film);
                    }
                });
                this.film = filmTempArray;
                console.log(this.film, 'film 哈哈')
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
    .search-box {
        text-align: center;
    }
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
    .info-box {
        text-align: center;
        margin-top: 10px;
        margin-bottom: 10px;
    }
    .search-result {
        word-break: break-all;
        .film-result {
            margin: 20px 0;
            .renren-url {
                a {
                    text-decoration: none;
                }
            }
            .file-link {
                margin: 10px 0;
                input {
                    cursor: pointer;
                }
                .link {
                    cursor: pointer;
                }
            }
        }
    }
    .page-box {
        text-align: center;
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
