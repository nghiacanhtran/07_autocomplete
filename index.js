const autocompleteNtc = (function() {
  const global = {
    inputTarget: "",
    dataSource: [],
    idContainer: "autocompleteNtc",
    classContainer: "ntc-autocomplete"
  };

  const setGlobalSetting = (settings) => {
    global.inputTarget = settings.inputTarget;
    global.dataSource = settings.dataSource;
  };

  const compose = (...functions) => args => functions.reduceRight((arg, fn) => fn(arg), args);

  const debounce = (func, wait) => {
    var timeout;

    return function() {
      var context = this,
        args = arguments;

      var executeFunction = function() {
        func.apply(context, args);
      };

      clearTimeout(timeout);
      timeout = setTimeout(executeFunction, wait);
    };
  };


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
    }
  }

  const getContainerAutoComplete = () => {
    const container = document.getElementById(global.idContainer);
    const containerAutocomplete = container ? container : createNewContainer();
    containerAutocomplete.innerHTML = '';

    return containerAutocomplete;
  };

  const handleMouseOverLiNode = (e) => {
    const container = e.target.closest('ul');
    const liSelected = container.querySelectorAll('li.selected')[0] || undefined;
    liSelected && liSelected.classList.remove('selected');
    e.target.classList.add('selected');
  }

  const handleClickEventLiNode = (e) => {
    const value = e.target.getAttribute('data-value');
    
  }

  const registerEventLi = (liNode) => {
    return () => {
    liNode.addEventListener('mouseover',handleMouseOverLiNode);
    return liNode;
    }
  }

  const createLiNode = (object) => {
    const liNode = document.createElement('li');
    liNode.setAttribute('data-val',object.value);
    const textNode = document.createTextNode(`${object.text}`);
    liNode.appendChild(textNode);
    return liNode;
  }

  const getBuilderContent = (dataSource) => dataSource.map((object) => registerEventLi(createLiNode(object)));

  const appendToScreen = (container) => document.body.appendChild(container);

  const appendToElement = (parent) => {
    return (arrChild) => {
      arrChild.map((childNode) => parent.appendChild(childNode));
      return parent;
    }
  }

  const getSearchEngine = (dataSource) => {
    return (keyword) =>
      dataSource.filter((object) => object.text.includes(keyword));
  };

  const execEventKeyupInput = (e) => {
    const el = e.target;
    const keyword = el.value;
    const elHeight = el.clientHeight;

    const searchEngine = getSearchEngine(global.dataSource);
    const dataSourceFilter = searchEngine(keyword.trim());
    const container = compose(setPosition({top: elHeight + el.offsetTop,left: el.offsetLeft}), getContainerAutoComplete);
    const content = getBuilderContent(dataSourceFilter);
    appendToScreen(appendToElement(container())(content));
  };

  const handelEventKeyup = debounce(function(e) {
    const arrayArrowKey = [38, 40];
    !arrayArrowKey.includes(e.which) && execEventKeyupInput(e);
  }, 500);

  const handleEventBlur = (e) => {
     
  };

  const registerEventForInput = (inputTarget) => {
    const arrEl = Array.from(document.querySelectorAll(inputTarget));

    arrEl.forEach((node) => {
      node.addEventListener("keyup", handelEventKeyup);
      node.addEventListener("blur", handleEventBlur);
    });
  };

  const init = (settings) => {
    setGlobalSetting(settings);
    registerEventForInput(global.inputTarget);
  };

  return {
    init: init,
  };
})();
