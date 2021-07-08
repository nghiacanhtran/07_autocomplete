const autocompleteNtc = (function () {
  const global = {
    inputTarget: "",
    dataSource: [],
  };

  const setGlobalSetting = (settings) => {
    global.inputTarget = settings.inputTarget;
    global.dataSource = settings.dataSource;
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
  const getFirstCharacter = (inputTarget) => {
    const firstCharacter = inputTarget.charAt(0) || "";
    return firstCharacter.trim();
  };

  const execAutoComplete = (dataSource) => {};
  const getSearchEngine = (dataSource) => {
    return (keyword) =>
      dataSource.filter((object) => object.text.includes(keyword));
  };

  const execEventInput = (e) => {
    const keyword = e.target.value;
    const keywordTrim = keyword.trim();
    const dataSource = global.dataSource;
    const searchEngine = getSearchEngine(dataSource);
    const dataSourceFilter = searchEngine(keywordTrim);
  };

  const handelEventKeyup = debounce(function (e) {
    const arrayArrowKey = [38, 40];
    !arrayArrowKey.includes(e.which) && execEventInput(e);
  }, 500);

  const handleEventBlur = (e) => {
    console.log(e);
  };

  const handelEventId = (inputTarget, eventName) => {
    const el = document.querySelector(inputTarget);
    const eventAction = new Map([
      ["keyup", handelEventKeyup],
      ["blur", handleEventBlur],
    ]);
    el.addEventListener(eventName, eventAction.get(eventName));
  };

  const handelEventClass = (inputTarget, eventName) => {};
  const getProcessorRegisterEvent = (inputTarget) => {
    const firstCharacter = getFirstCharacter(inputTarget);
    const actionProcess = new Map([
      [".", handelEventClass],
      ["#", handelEventId],
    ]);
    return (eventName) => {
      actionProcess.get(firstCharacter).apply(this, [inputTarget, eventName]);
    };
  };

  const createEngineRegisterEvent = (inputTarget) => {
    const processorRegisterEvent = getProcessorRegisterEvent(inputTarget);
    const eventArray = ["keyup", "blur"];
    eventArray.forEach((event) => processorRegisterEvent(event));
  };

  const init = (settings) => {
    setGlobalSetting(settings);
    createEngineRegisterEvent(global.inputTarget);
  };

  return {
    init: init,
  };
})();
