<template>
    <div class="home">
        <div class="search-box" @mouseenter="openSearchInput" v-clickoutside="closeSearchInput">
            <input type="text" class="search-input" v-model="keyWord" :class="{'open-search-input': openInputClass}" spellcheck="false" @keyup.enter="doSearch(1)">
            <span class="search-btn" @click="doSearch(1)" title="开始搜索">🔍</span>
            <div class="limit" v-clickoutside="closeLimit">
                <div class="select" @click="openLimit">
                    <span class="title">修改每页数据量 {{limit}}</span>
                </div>
                <ul class="list" v-show="showLimit">
                    <li @click="getLimit(item)" v-for="(item, index) in tableData" :key="`${index}_limit`">{{ item }}</li>
                </ul>
            </div>
        </div>
        <div class="info-box" v-if="count > 0">
            <span>总共搜索到 {{count}} 个结果</span>
            &nbsp;&nbsp;
            <span>这是第 {{currentPage * limit - limit + 1}} ~ {{currentPage === lastPage ? count : (currentPage * limit)}} 个结果</span>
            &nbsp;&nbsp;
            <span>当前已经选择了 {{Object.keys(selectedLinkObject).length}} 个链接</span>
        </div>
        <div class="select-all-box" v-if="count > 0">
            <span class="select-all" @click="selectAll">全选本页所有</span>
            <span class="cancel-all" @click="cancelAllSelected">取消所有选择</span>
            <span class="select-all-ed2k" @click="selectAllEd2kMagnet(['1'])">全选本页所有ed2k链接</span>
            <span class="select-all-magnet" @click="selectAllEd2kMagnet(['2'])">全选本页所有磁力链接</span>
            <span class="select-all-ed2k-magnet" @click="selectAllEd2kMagnet(['1', '2'])">全选本页所有ed2k和磁力链接</span>
        </div>
        <div class="copy-all-box" v-if="count > 0">
            <span class="copy-all" @click="copyAll">复制所有已选中到剪贴板</span>
            <span class="copy-all-to-file" @click="exportToFile">导出所有已选中到本地文件</span>
        </div>
        <div class="search-result">
            <div class="film-result" v-for="item in film" :key="item.id">
                <div>
                    <input type="checkbox" :value="item.id" v-model="selectedFilm" @change="filmChange($event, item)">
                    <span v-html="item.name"></span>
                </div>
                <div class="channel">{{item.channel}}</div>
                <div class="renren-url">
                    <a href="javascript:;" @click="openRenRenUrl(item.url)">{{item.url}}</a>
                </div>
                <div class="file-list">
                    <div class="file" v-for="data in item.file" :key="`${item.id}_${data.info.format}_${data.info.id}`">
                        <div class="file-link" v-for="link in data" :key="`${link.way}_${data.info.id}`">
                            <input type="checkbox" :value="link.address" v-model="selectedLink" @change="linkChange($event, link, item.id)">
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
const { Menu, MenuItem, dialog } = remote;

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
            openInputClass: false, //显示隐藏输入框
            keyWord: '', //搜索关键字
            result: '', //搜索结果
            count: 0, //搜索结果总条数
            pageArray: [], //分页按钮
            currentPage: 1, //当前分页
            lastPage: 1, //最后一页
            limit: 2, //一页有几条数据
            film: [], //处理好的搜索结果数据
            selectedLink: [], //当前勾选的链接组成的数组
            selectedFilm: [], //当前勾选的电影的id
            selectedLinkObject: {}, //当前勾选的链接组成的对象
            tableData: [2, 5, 10, 15, 20],
            showLimit: false,

        }
    },
    directives: {
        clickoutside
    },
    methods: {
        closeLimit () {
            this.showLimit = false;
        },
        openLimit () {
            this.showLimit = !this.showLimit;
        },
        getLimit (item) {
            this.limit = item;
            this.showLimit = false;
        },
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
                alert('啥都没找到！')
                this.result = '';
                this.count = 0;
                this.pageArray = [],
                this.currentPage = 1
                this.lastPage = 1;

            } else {
                this.result = result.rows;
                this.count = result.count;
                this.lastPage = Math.ceil(this.count / this.limit);
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
        },
        computeAllLink () {
            let copyArray = Object.keys(this.selectedLinkObject);
            if (copyArray.length === 0) {
                alert('你还没有选中任何链接！');
                return false;
            }

            let allLink = copyArray.reduce((acc, item) => {
                return `${acc} \n ${item}`;
            }, '');

            console.log(allLink, 'allLink');
            return allLink;
        },
        copyAll () {
            let allLink = this.computeAllLink();

            clipboard.writeText(allLink);

            dialog.showMessageBox({
                type: 'info',
                title: '复制成功！',
                message: '复制到剪贴板成功！请复制到下载软件中下载！'
            });
        },
        exportToFile () {
            let allLink = this.computeAllLink();

            ipcRenderer.send('exportToFile', allLink);
        },
        selectAll () {
            this.film.forEach(item => {
                this.selectedFilm.push(item.id);
                item.file.forEach(partItem => {
                    partItem.forEach(i => {
                        this.selectedLinkObject[i.address] = i;
                    });
                });
            });
            
            let temp = Object.keys(this.selectedLinkObject);
            this.selectedLink = temp;
            this.selectedFilm = [...new Set([...this.selectedFilm])];
        },
        selectAllEd2kMagnet (optionArray) {
            this.film.forEach(item => {
                item.file.forEach(partItem => {
                    partItem.forEach(i => {
                        if (optionArray.includes(i.way)) {
                            this.selectedLinkObject[i.address] = i;
                        }
                    });
                });

                let hasNoSelected = false;
                for (let i = 0; i < item.file.length; i++) {
                    for (let j = 0; j < item.file[i].length; j++) {
                        if (!this.selectedLinkObject[item.file[i][j].address]) {
                            hasNoSelected = true;
                            break;
                        }
                    }
                }

                if (!hasNoSelected) {
                    this.selectedFilm = [...new Set([...this.selectedFilm, item.id])];
                }
            });
            
            let temp = Object.keys(this.selectedLinkObject);
            this.selectedLink = temp;
        },
        cancelAllSelected () {
            this.selectedLinkObject = {};
            this.selectedLink = [];
            this.selectedFilm = [];
        },
        filmChange (e, film) {
            console.log(e.target.checked)
            if (e.target.checked) {
                film.file.forEach(item => {
                    item.forEach(partItem => {
                        if (!this.selectedLinkObject[partItem.address]) {
                            this.selectedLinkObject[partItem.address] = partItem;
                        }
                    })
                });
                let temp = Object.keys(this.selectedLinkObject);
                console.log(temp, 'temp')
                this.selectedLink = temp;
            } else {
                film.file.forEach(item => {
                    item.forEach(partItem => {
                        if (this.selectedLinkObject[partItem.address]) {
                            delete this.selectedLinkObject[partItem.address];
                        }
                    })
                });
                let temp = Object.keys(this.selectedLinkObject);
                console.log(temp, 'temp')
                this.selectedLink = temp;
            }
        },
        linkChange (e, link, filmId) {
            if (e.target.checked) {
                if (!this.selectedLinkObject[link.address]) {
                    this.selectedLinkObject[link.address] = link;
                }
            } else {
                if (this.selectedLinkObject[link.address]) {
                    delete this.selectedLinkObject[link.address];
                }
                
                let index = this.selectedFilm.indexOf(filmId);
                if (index >= 0) {
                    this.selectedFilm.splice(index, 1);
                }
                return false
            }

            let film = this.film.find(item => item.id === filmId);
            
            let hasNoSelected = false;
            for (let i = 0; i < film.file.length; i++) {
                for (let j = 0; j < film.file[i].length; j++) {
                    if (!this.selectedLinkObject[film.file[i][j].address]) {
                        hasNoSelected = true;
                        break;
                    }
                }
            }

            if (!hasNoSelected) {
                this.selectedFilm = [...new Set([...this.selectedFilm, filmId])];
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
        -webkit-user-select: none;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
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
    .limit {
        margin-left: 20px;
        position: relative;
        .select {
            color: #9582ea;
            width: 140px;
            height: 20px;
            line-height: 20px;
            position: relative;
            .title {
                font-size: 12px;
            }
        }
        .list {
            position: absolute;
            top: 21px;
            left: 0;
            overflow: hidden;
            margin: 0;
            padding: 0;
            background-color: #fff;
            li {
                color: #9582ea;
                font-size: 12px;
                width: 140px;
                height: 20px;
                line-height: 20px;
                cursor: pointer;
                list-style: none;
                &:hover {
                    color: #fff;
                    background-color: #9582ea;
                }
            }
        }
    }

    .info-box {
        -webkit-user-select: none;
        text-align: center;
        margin-top: 10px;
        margin-bottom: 10px;
    }
    .select-all-box {
        -webkit-user-select: none;
        text-align: center;
        margin-top: 20px;
        margin-bottom: 20px;
        span {
            cursor: pointer;
            margin: 10px;
            &:hover {
                color: #9582ea;
            }
        }
    }
    .copy-all-box {
        -webkit-user-select: none;
        text-align: center;
        margin-top: 20px;
        margin-bottom: 20px;
        span {
            cursor: pointer;
            margin: 10px;
            color: red;
            &:hover {
                color: #cf6d6d;
            }
        }
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
        -webkit-user-select: none;
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
