/**
 * @author Nghiatc1
 * @description autocomple for kendo grid
 * @param nameGrid identify of kendogrid
 * @param mapDataSource dataSource for build autocomple
 * NAME_FIELD  name of field in dataSource kendo grid
 * @example
 * autoCompleteGrid.init({
 *     nameGrid: '#kendoGrid',
 *     mapDataSource: {'NAME_FIELD: [{text: '1234', value: '1'}]'}
 * })
 * **/
const autoCompleteGrid = (function () {
    let globalSettings = {
        idGrid: '',
        dataSource: {},
        arrayKeyName: [],
        idContainer: 'autocompleteNtc',
        classContainer: 'ntc-autocomplete',
        classActive: 'selected',
        textDisplay: '',
    };

    const setGlobalSettings = (settings) => {
        globalSettings.dataSource = settings.dataSourceMap;
        globalSettings.arrayKeyName = settings.arrayKeyName;
        globalSettings.idGrid = settings.idGrid;
        globalSettings.textDisplay = settings.textDisplay;
    };

    const init = (settings) => {
        setGlobalSettings(settings);
        registerArrayNameInput(globalSettings.dataSource);
        registerEventForInput(
            globalSettings.arrayKeyName,
            $(globalSettings.idGrid)
        );
    };

    const registerArrayNameInput = (mapDataSource) => {
        globalSettings.arrayKeyName = Object.keys(mapDataSource);
    };

    const compose =
        (...functions) =>
        (args) =>
            functions.reduceRight((arg, fn) => fn(arg), args);

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
        ul.id = globalSettings.idContainer;
        ul.setAttribute('class', globalSettings.classContainer);
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
        const container = document.getElementById(globalSettings.idContainer);
        const containerAutocomplete = container
            ? container
            : createNewContainer();
        containerAutocomplete.innerHTML = '';

        return containerAutocomplete;
    };

    const setActive = (node) => {
        node.classList.add(globalSettings.classActive);
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
        arrNode.find((node) =>
            node.classList.contains(globalSettings.classActive)
        );

    const handleMouseOverLiNode = (e) => {
        const container = e.target.closest('ul');
        removeAllActive(container);
        setActive(e.target);
    };

    const getKendoGrid = ($grid) => $grid.data('kendoGrid');

    const getDataSourceItemRow = (grid) => (row) => grid.dataItem(row);

    const setValueToInput = (input) => (value) => {
        input.value = value;
        return input;
    };

    const updateDataSoureKendoGrid = (kendoGrid) => (input) => {
        const item = getDataSourceItemRow(kendoGrid)(input.closest('tr'));
        item[input.getAttribute('name')] = input.value;
        kendoGrid.saveRow();
        return input;
    };

    const handleMouseEnterLiNode = (inputTarget) => {
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
                handleMouseEnterLiNode(inputTarget)
            );
            return liNode;
        };
    };

    const createLiNode = (object) => {
        const liNode = document.createElement('li');
        liNode.setAttribute('data-val', object.value);
        const textNode = document.createTextNode(`${object.text}`);
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

    const getSearchEngine = (dataSource) => (keyword) =>
        dataSource.filter((item) => item.text.includes(keyword));

    const execEventKeyupInput = (e) => {
        const el = e.target;
        const keyword = removeVietnamese(lowerString(el.value));
        const elHeight = el.clientHeight;
        const nameInput = el.getAttribute('name');
        const searchEngine = getSearchEngine(
            globalSettings.dataSource[nameInput]
        );
        const offsetInput = getOffset(el);

        const dataSourceFilter = searchEngine(keyword.trim());
        const container = compose(
            setPosition({
                top: elHeight * 2 - 10 + offsetInput.top,
                left: offsetInput.left,
            }),
            getContainerAutoComplete
        );
        const content = getBuilderContent(e.target)(dataSourceFilter);
        const showSuggest = compose(
            appendToScreen,
            appendToElement(container())
        );
        showElNode(showSuggest(content));
    };

    const handelEventKeyup = debounce(function (e) {
        const arrayArrowKey = [13, 38, 40];
        !arrayArrowKey.includes(e.which) && execEventKeyupInput(e);
        return false;
    }, 500);

    const getValueDislay = (node) =>
        globalSettings.textDisplay === 'value'
            ? node.getAttribute('data-val')
            : node.textContent;

    const handleEventBlur = (e) => {
        const containerAutocomplete = document.getElementById(
            globalSettings.idContainer
        );
        const saveDataSource = compose(updateDataSoureKendoGrid, getKendoGrid);
        saveDataSource($(globalSettings.idGrid))(e.target);
        hiddenElNode(emptyContentNode(containerAutocomplete));
    };

    const registerEventForInput = (arrKeyInputName, grid) => {
        arrKeyInputName.forEach((inputName) => {
            grid.off('keyup', `input[name="${inputName}"]`).on(
                'keyup',
                `input[name="${inputName}"]`,
                handelEventKeyup
            );
            grid.off('blur', `input[name="${inputName}"]`).on(
                'blur',
                `input[name="${inputName}"]`,
                handleEventBlur
            );
            grid.off('keydown', `input[name="${inputName}"]`).on(
                'keydown',
                `input[name="${inputName}"]`,
                handleEventKeydown
            );
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

        const container = document.getElementById(globalSettings.idContainer);
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
