/**
 *
 * @param option
 * @returns {*}
 * @constructor
 */
let JsMiniAnalysis = function (option) {
    /**
     *
     * @type {HTMLElement || null}
     */
    let dom = null;
    if (typeof option.dom === "string") {
        dom = document.querySelector(option.dom);
    } else if (option.dom instanceof HTMLElement) {
        dom = option.dom;
    } else {
        throw new Error("");
    }

    Object.defineProperty(this, "$option", {
        configurable: false,
        enumerable: false,
        get() {
            return option;
        }
    });

    Object.defineProperty(this, "$Dom", {
        configurable: false,
        enumerable: false,
        get() {
            return dom;
        }
    });
    let doms = [];
    Object.defineProperty(this, "$Doms", {
        configurable: false,
        enumerable: false,
        get() {
            return doms;
        }
    });
    Object.defineProperty(this, "$Attr", {
        configurable: false,
        enumerable: false,
        get() {
            return dom.attributes;
        }
    });
    let depth = 100;
    if (option.depth > 0) {
        depth = option.depth;
    }
    Object.defineProperty(this, "$depth", {
        configurable: false,
        enumerable: false,
        get() {
            return depth;//option.depth;
        }
    });
    {
        let Url = null;
        if (this.$Attr.hasOwnProperty("data-include")) {
            Url = this.$Attr["data-include"].nodeValue;
            dom.removeAttribute("data-include");
        } else
            Url = option.Url;
        Object.defineProperty(this, "Url", {
            configurable: false,
            enumerable: true,
            get() {
                return Url;
            }
        });
    }
    {
        let isReplace = this.$Attr.hasOwnProperty("data-replace");
        if (isReplace)
            dom.removeAttribute("data-replace");
        else {
            if (option.isReplace) {
                isReplace = true;
            }
        }
        isReplace = this.Url !== undefined;

        Object.defineProperty(this, "isReplace", {
            configurable: false,
            enumerable: true,
            get() {
                return isReplace;
            }
        });
    }

};

JsMiniAnalysis.prototype = {
    run: function () {
        let self = this;
        if (this.Url === undefined) {
            if (this.$depth !== 1)
                this.Next();
        } else {
            if (this.$option.data === undefined) {
                this.GetData(this.Url, function (htmlTxt) {
                    self.$run(htmlTxt);
                }, console.log);
            } else {
                this.PutJson(this.Url, this.$option.data, function (htmlTxt) {
                    self.$run(htmlTxt);
                }, console.log);
            }
        }
        return this;
    },
    $run: function (htmlTxt) {
        let frameElement = document.createDocumentFragment();
        let div = document.createElement("div");
        frameElement.appendChild(div);
        div.innerHTML = htmlTxt;

        if (this.isReplace) {
            let nodeList = div.childNodes;
            let parentNode = this.$Dom.parentNode;
            if (parentNode == null) throw new Error("无父节点！");
            for (let i = 0; i < nodeList.length; i++) {
                this.$Doms.push(nodeList[i]);
                parentNode.insertBefore(nodeList[i], this.$Dom);
            }
            parentNode.removeChild(this.$Dom);
        } else {
            let nodeList = div.childNodes;
            for (let i = 0; i < nodeList.length; i++) {
                this.$Dom.appendChild(nodeList[i]);
            }
        }
        this.$Dom.removeAttribute("data-JsMiniAnalysis");
        if (this.$depth !== 1)
            this.Next();
        else {
            (this.$option.cb || console.log)();
        }
    },
    Next: function () {
        let dom = [];
        if (this.isReplace) {
            for (let i = 0; i < this.$Doms.length; i++) {
                if (this.$Doms[i].hasAttribute("data-JsMiniAnalysis")) {
                    dom.push(this.$Doms[i]);
                    continue;
                }
                dom = dom.concat([].slice.call(this.$Doms[i].querySelectorAll("*[data-JsMiniAnalysis]")));
            }
        } else {
            dom = dom.concat([].slice.call(document.querySelectorAll("*[data-JsMiniAnalysis]")));
        }
        if (dom.length === 0) {
            (this.$option.cb || console.log)();
            return;
        }
        let dLen = dom.length;
        let self = this;
        for (let i = 0; i < dom.length; i++) {
            if (dom.hasOwnProperty(i))
                delete new JsMiniAnalysis({
                    dom: dom[i]
                    , isReplace: true
                    , data: this.$option.data
                    , depth: this.$depth - 1
                    , cb: function () {
                        dLen--;
                        if (dLen === 0) {
                            (self.$option.cb || console.log)();
                        }
                    }
                    , err: this.$option.err
                }).run();
        }
    },

    GetData: function (url, callback, err) {
        fetch(url,
            {
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, same-origin, *omit
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                mode: 'cors', // no-cors, cors, *same-origin
                redirect: 'follow', // manual, *follow, error
                referrer: 'no-referrer', // *client, no-referrer
            }
        )
            .then(function (response) {
                return response.text()
            }).then(callback || console.log).catch(err || console.log).catch(err || console.log)
    },
    PutJson: function (url, data, callback, err) {
        fetch(url,
            {
                body: JSON.stringify(data), // must match 'Content-Type' header
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, same-origin, *omit
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'post', // *GET, POST, PUT, DELETE, etc.
                mode: 'cors', // no-cors, cors, *same-origin
                redirect: 'follow', // manual, *follow, error
                referrer: 'no-referrer', // *client, no-referrer
            }
        )
            .then(function (response) {
                return response.text()
            }).then(callback || console.log).catch(err || console.log).catch(err || console.log)
    }
};

JsMiniAnalysis.InitAll = function (depth) {
    try {
        delete new JsMiniAnalysis({
            dom: document.body
            , isReplace: true
            , depth: (depth || 100) + 1
        }).run();
    } catch (e) {

    }
};
