const autocompleteNtc = (function () {
    let global = {
        inputTarget: '',
        dataSource: [],
        idContainer: 'autocompleteNtc',
        classContainer: 'ntc-autocomplete',
        classActive: 'selected',
        textDisplay: '',
        text: 'text',
        value: 'value',
        ajax: undefined,
        onRenderText: '',
        onSelect: '',
    };

    const init = (settings) => {
        setGlobalSetting(settings);
        registerEventForInput(global.inputTarget);
    };

    const setGlobalSetting = (settings) => {
        global = Object.assign({}, global, settings);
    };

    const getOffset = (element) => {
        if (!element.getClientRects().length) {
            return { top: 0, left: 0 };
        }

        let rect = element.getBoundingClientRect();
        let win = element.ownerDocument.defaultView;
        return {
            top: rect.top + win.pageYOffset,
            left: rect.left + win.pageXOffset,
        };
    };

    const removeVietnamese = (str) => {
        const strLowCase = str.toLowerCase();
        const strA = strLowCase.replace(
            /à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,
            'a'
        );
        const strE = strA.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
        const strI = strE.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
        const strO = strI.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
        const strU = strO.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
        const strY = strU.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
        const strD = strY.replace(/đ/g, 'd');
        return strD;
    };

    const compose =
        (...functions) =>
        (args) =>
            functions.reduceRight((arg, fn) => fn(arg), args);

    const debounce = (func, wait) => {
        var timeout;

        return function () {
            var context = this,
                args = arguments;

            var executeFunction = function () {
                func.apply(context, args);
            };

            clearTimeout(timeout);
            timeout = setTimeout(executeFunction, wait);
        };
    };

    const findIndex = (arrNode) => (node) => arrNode.indexOf(node);

    const scrollTopEl = (position) => (element) =>
        (element.scrollTop = position);

    const createNewContainer = () => {
        const ul = document.createElement('ul');
        ul.id = global.idContainer;
        ul.setAttribute('class', global.classContainer);
        return ul;
    };

    const setPosition = (settings) => {
        return (component) => {
            component.style.top = `${settings.top}px`;
            component.style.left = `${settings.left}px`;
            return component;
        };
    };

    const getContainerAutoComplete = () => {
        const container = document.getElementById(global.idContainer);
        const containerAutocomplete = container
            ? container
            : createNewContainer();
        containerAutocomplete.innerHTML = '';

        return containerAutocomplete;
    };

    const setActive = (node) => {
        node.classList.add(global.classActive);
        return node;
    };

    const removeAllActive = (container) => {
        const liSelected =
            container.querySelectorAll('li.selected')[0] || undefined;
        liSelected && liSelected.classList.remove('selected');
    };

    const emptyContentNode = (node) => {
        node.innerHTML = '';
        return node;
    };

    const hiddenElNode = (node) => {
        node.style.display = 'none';
        return node;
    };

    const showElNode = (node) => {
        node.style.display = 'block';
        return node;
    };

    const lowerString = (string) => string.toLowerCase();

    const findNodeActive = (arrNode) =>
        arrNode.find((node) => node.classList.contains(global.classActive));

    const handleMouseOverLiNode = (e) => {
        const container = e.target.closest('ul');
        removeAllActive(container);
        setActive(e.target);
    };

    const setValueToInput = (input) => (value) => {
        input.value = value;
        return input;
    };

    const handleMouseEnterEventLiNode = (inputTarget) => {
        return (e) => {
            const liNode = e.target;
            setValueToInput(inputTarget)(getValueDislay(liNode));
        };
    };

    const registerEventLi = (inputTarget) => {
        return (liNode) => {
            liNode.addEventListener('mouseover', handleMouseOverLiNode);
            liNode.addEventListener(
                'mouseenter',
                handleMouseEnterEventLiNode(inputTarget)
            );
            return liNode;
        };
    };

    const createLiNode = (object) => {
        const liNode = document.createElement('li');
        liNode.setAttribute('data-val', object[global.value]);
        liNode.setAttribute('data-text', object[global.text]);
        const textNode = document.createTextNode(
            global.onRenderText
                ? global.onRenderText({
                      text: object[global.text],
                      value: object[global.value],
                  })
                : `${object[global.text]}`
        );
        liNode.appendChild(textNode);
        return liNode;
    };

    const getBuilderContent = (inputTarget) => (dataSource) =>
        dataSource.map((object) =>
            registerEventLi(inputTarget)(createLiNode(object))
        );

    const appendToScreen = (container) => {
        document.body.appendChild(container);
        return container;
    };

    const appendToElement = (parent) => {
        return (arrChild) => {
            arrChild.map((childNode) => parent.appendChild(childNode));
            return parent;
        };
    };

    const getSearchEngine = (dataSource) => {
        return (keyword) => {
            const arrItemFilterText = dataSource.filter((object) =>
                object.text.includes(keyword)
            );
            const arrItemFilterValue = dataSource.filter((object) =>
                object.value.includes(keyword)
            );
            const arrNew = arrItemFilterText.concat(arrItemFilterValue);
            return arrNew.filter(
                (val, index, arr) =>
                    arr.findIndex(
                        (t) => t.text === val.text && t.value === val.value
                    ) === index
            );
        };
    };

    const execSearchAjax = (input) => (container) => (dataSource) => {
        const content = getBuilderContent(input)(dataSource);
        const showSuggest = compose(appendToScreen, appendToElement(container));
        showElNode(showSuggest(content));
    };

    const execSearchNormal = (input) => (container) => (keyword) => {
        const searchEngine = getSearchEngine(global.dataSource);
        const dataSourceFilter = searchEngine(keyword.trim());
        const content = getBuilderContent(input)(dataSourceFilter);
        const showSuggest = compose(
            appendToScreen,
            appendToElement(container())
        );
        showElNode(showSuggest(content));
    };

    const execEventKeyupInput = (e) => {
        const el = e.target;
        const keyword = removeVietnamese(lowerString(el.value));
        const elHeight = el.clientHeight;
        const offsetInput = getOffset(e.target);
        const container = compose(
            setPosition({
                top: elHeight * 2 - 15 + offsetInput.top,
                left: offsetInput.left,
            }),
            getContainerAutoComplete
        );

        global.ajax
            ? global.ajax(keyword.trim(), execSearchAjax(e.target)(container()))
            : execSearchNormal(e.target)(container)(keyword.trim());
    };

    const handelEventKeyup = debounce(function (e) {
        const arrayArrowKey = [13, 38, 40];
        !arrayArrowKey.includes(e.which) && execEventKeyupInput(e);
        return false;
    }, 500);

    const getValueDislay = (node) =>
        global.textDisplay === 'value'
            ? node.getAttribute('data-val')
            : node.textContent;

    const handleEventBlur = (e) => {
        const inputTarget = e.target;
        const containerAutocomplete = document.getElementById(
            global.idContainer
        );
        const arrNode = Array.from(
            containerAutocomplete.querySelectorAll('li')
        );
        const nodeActive = findNodeActive(arrNode);
        nodeActive &&
            setValueToInput(inputTarget)(getValueDislay(nodeActive)) &&
            global.onSelect &&
            global.onSelect({
                text: nodeActive.getAttribute('data-text'),
                value: nodeActive.getAttribute('data-val'),
            });
        hiddenElNode(emptyContentNode(containerAutocomplete));
    };

    const registerEventForInput = (inputTarget) => {
        const arrEl = Array.from(document.querySelectorAll(inputTarget));

        arrEl.forEach((node) => {
            node.addEventListener('keyup', handelEventKeyup);
            node.addEventListener('blur', handleEventBlur);
            node.addEventListener('keydown', handleEventKeydown);
        });
    };

    const handleEventKeydown = (e) => {
        const actions = {
            38: gotoUp(e.target),
            40: gotoDown(e.target),
            13: () => {
                handleEventBlur(e);
            },
        };

        const container = document.getElementById(global.idContainer);
        container && actions[e.which] && actions[e.which].call(this, container);
    };

    const gotoUp = (inputTarget) => {
        return (container) => {
            const arrNode = Array.from(container.querySelectorAll('li'));
            const nodeActive = findNodeActive(arrNode) || arrNode[0];
            const previousNode =
                nodeActive.previousElementSibling || arrNode[0];
            removeAllActive(container);
            getScroll(container)(setActive(previousNode));
            setValueToInput(inputTarget)(getValueDislay(previousNode));
        };
    };

    const gotoDown = (inputTarget) => {
        return (container) => {
            const arrNode = Array.from(container.querySelectorAll('li'));
            const nodeActive = findNodeActive(arrNode);
            const nextNode =
                (nodeActive && nodeActive.nextElementSibling) || arrNode[0];

            removeAllActive(container);
            getScroll(container)(setActive(nextNode));
            setValueToInput(inputTarget)(getValueDislay(nextNode));
        };
    };

    const getScroll = (container) => {
        return (nodeActive) => {
            const scrollTopPosition = container.scrollTop;
            const nodeActiveHeight = nodeActive.offsetHeight;
            const viewPortSize = scrollTopPosition + container.offsetHeight;
            const arrNode = Array.from(container.querySelectorAll('li'));
            const indexNode = findIndex(arrNode)(nodeActive);
            const arrNodeToActive = arrNode.slice(0, indexNode);
            const totalOldHeigh = arrNodeToActive.reduce(
                (totalHeight, currentNode) => {
                    return totalHeight + currentNode.offsetHeight;
                },
                0
            );
            const nodeOffset = totalOldHeigh;

            (nodeOffset < scrollTopPosition ||
                nodeOffset + nodeActiveHeight > viewPortSize) &&
                scrollTopEl(nodeOffset)(container);
        };
    };

    return {
        init: init,
    };
})();
