const autocompleteNtc = (function () {
  const global = {
    inputTarget: "",
    dataSource: [],
    idContainer: "autocompleteNtc",
    classContainer: "ntc-autocomplete",
    classActive: "selected",
  };

  const removeVietnamese = (str) => {
    const strClone = str;
    const strLowCase = strClone.toLowerCase();
    const strA = strLowCase.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    const strE = strA.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    const strI = strE.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    const strO = strI.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    strClone = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    strClone = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    strClone = str.replace(/đ/g, "d");
    return strClone;
  };

  const init = (settings) => {
    setGlobalSetting(settings);
    registerEventForInput(global.inputTarget);
  };

  const setGlobalSetting = (settings) => {
    global.inputTarget = settings.inputTarget;
    global.dataSource = settings.dataSource;
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

  const scrollTopEl = (position) => (element) => (element.scrollTop = position);

  const createNewContainer = () => {
    const ul = document.createElement("ul");
    ul.id = global.idContainer;
    ul.setAttribute("class", global.classContainer);
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
    const containerAutocomplete = container ? container : createNewContainer();
    containerAutocomplete.innerHTML = "";

    return containerAutocomplete;
  };

  const setActive = (node) => {
    node.classList.add(global.classActive);
    return node;
  };

  const removeAllActive = (container) => {
    const liSelected =
      container.querySelectorAll("li.selected")[0] || undefined;
    liSelected && liSelected.classList.remove("selected");
  };

  const emptyContentNode = (node) => {
    node.innerHTML = "";
    return node;
  };

  const hiddenElNode = (node) => {
    node.style.display = "none";
    return node;
  };

  const showElNode = (node) => {
    node.style.display = "block";
    return node;
  };

  const lowerString = (string) => string.toLowerCase();

  const findNodeActive = (arrNode) =>
    arrNode.find((node) => node.classList.contains(global.classActive));

  const handleMouseOverLiNode = (e) => {
    const container = e.target.closest("ul");
    removeAllActive(container);
    setActive(e.target);
  };

  const setValueToInput = (input) => (value) => {
    input.value = value;
    return input;
  };

  const handleClickEventLiNode = (inputTarget) => {
    return (e) => {
      const liNode = e.target;
      const textDisplay = liNode.textContent;
      setValueToInput(inputTarget)(textDisplay);
    };
  };

  const registerEventLi = (inputTarget) => {
    return (liNode) => {
      liNode.addEventListener("mouseover", handleMouseOverLiNode);
      liNode.addEventListener("click", handleClickEventLiNode(inputTarget));
      return liNode;
    };
  };

  const createLiNode = (object) => {
    const liNode = document.createElement("li");
    liNode.setAttribute("data-val", object.value);
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

  const getSearchEngine = (dataSource) => {
    return (keyword) =>
      dataSource.filter((object) => object.text.includes(keyword));
  };

  const execEventKeyupInput = (e) => {
    const el = e.target;
    const keyword = lowerString(el.value);
    const elHeight = el.clientHeight;

    const searchEngine = getSearchEngine(global.dataSource);
    const dataSourceFilter = searchEngine(keyword.trim());
    const container = compose(
      setPosition({ top: elHeight + el.offsetTop, left: el.offsetLeft }),
      getContainerAutoComplete
    );
    const content = getBuilderContent(e.target)(dataSourceFilter);
    const showSuggest = compose(appendToScreen, appendToElement(container()));
    showElNode(showSuggest(content));
  };

  const handelEventKeyup = debounce(function (e) {
    const arrayArrowKey = [13, 38, 40];
    !arrayArrowKey.includes(e.which) && execEventKeyupInput(e);
    return false;
  }, 500);

  const handleEventBlur = (e) => {
    const inputTarget = e.target;
    const containerAutocomplete = document.getElementById(global.idContainer);
    const arrNode = Array.from(containerAutocomplete.querySelectorAll("li"));
    const nodeActive = findNodeActive(arrNode);
    nodeActive && setValueToInput(inputTarget)(nodeActive.textContent);
    hiddenElNode(emptyContentNode(containerAutocomplete));
  };

  const registerEventForInput = (inputTarget) => {
    const arrEl = Array.from(document.querySelectorAll(inputTarget));

    arrEl.forEach((node) => {
      node.addEventListener("keyup", handelEventKeyup);
      node.addEventListener("blur", handleEventBlur);
      node.addEventListener("keydown", handleEventKeydown);
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

    actions[e.which] &&
      actions[e.which].call(this, document.getElementById(global.idContainer));
  };

  const gotoUp = (inputTarget) => {
    return (container) => {
      const arrNode = Array.from(container.querySelectorAll("li"));
      const nodeActive = findNodeActive(arrNode) || arrNode[0];
      const previousNode = nodeActive.previousElementSibling || arrNode[0];
      removeAllActive(container);
      getScroll(container)(setActive(previousNode));
      setValueToInput(inputTarget)(previousNode.textContent);
    };
  };

  const gotoDown = (inputTarget) => {
    return (container) => {
      const arrNode = Array.from(container.querySelectorAll("li"));
      const nodeActive = findNodeActive(arrNode);
      const nextNode =
        (nodeActive && nodeActive.nextElementSibling) || arrNode[0];

      removeAllActive(container);
      getScroll(container)(setActive(nextNode));
      setValueToInput(inputTarget)(nextNode.textContent);
    };
  };

  const getScroll = (container) => {
    return (nodeActive) => {
      const scrollTopPosition = container.scrollTop;
      const nodeActiveHeight = nodeActive.clientHeight;
      const viewPortSize = scrollTopPosition + container.clientHeight;
      const arrNode = Array.from(container.querySelectorAll("li"));
      const indexNode = findIndex(arrNode)(nodeActive);
      const nodeOffset = nodeActiveHeight * indexNode;

      (nodeOffset < scrollTopPosition ||
        nodeOffset + nodeActiveHeight > viewPortSize) &&
        scrollTopEl(nodeOffset)(container);
    };
  };

  return {
    init: init,
  };
})();
