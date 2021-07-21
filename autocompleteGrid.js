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
    let globalObject = {
        config: {},
        arrayKeyName: [],
    };

    const init = (param) => {
        const o = $.extend(
            {
                nameGrid: '',
                mapDataSource: {},
            },
            param
        );
        globalObject.config = o;
        registerArrayNameInput(o.mapDataSource);
        registerEventInput();
        registerEventKeyPress();
    };

    const getKendoGrid = (nameGrid) => {
        const kendoGrid = $(nameGrid).data('kendoGrid');
        return kendoGrid;
    };

    const getDataSourceItemRow = (grid) => {
        return (row) => grid.dataItem(row);
    };

    const getBuildingAutoComplete = (container) => {
        return (data) => {
            const dataSource = data.dataSource;
            const inputTarget = data.inputTarget;

            container.html('');
            $.each(dataSource, (index, object) => {
                let $li = $('<li/>')
                    .attr({
                        'data-val': object.value,
                        'data-input-name': $(inputTarget).attr('name'),
                    })
                    .append(`${object.text}`);
                $li.css({
                    padding: '5px 10px',
                    cursor: 'pointer',
                    'border-bottom': '1px solid',
                    'border-bottom-color': 'currentcolor',
                    'border-color': '#ccc6bd',
                    color: '#4f4646',
                    'text-overflow': 'ellipsis',
                    'white-space': 'nowrap',
                    overflow: 'hidden',
                });

                $li.on('mousedown', function () {
                    const value = $(this).attr('data-val');
                    const inputName = $(this).attr('data-input-name');
                    const gridName = globalObject.config.nameGrid;
                    const grid = $(gridName);
                    const kendoGrid = getKendoGrid(gridName);

                    grid.find(`input[name='${inputName}']`).val(value);
                    const td = grid
                        .find(`input[name='${inputName}']`)
                        .closest('td');

                    const row = td.closest('tr');
                    const item = getDataSourceItemRow(kendoGrid)(row);

                    item[inputName] = value;
                    hiddenContainerAutoComplete();
                });

                $li.on('mouseover', function () {
                    $(this)
                        .closest('ul')
                        .find('.ibank-active')
                        .removeClass('ibank-active');
                    $(this).addClass('ibank-active');
                });
                container.append($li);
            });

            return container;
        };
    };

    const getContainerAutoComplete = (inputTarget) => {
        const container = $('body').find('#grid-xyz-autocomplete');
        return container.length > 0
            ? container.removeClass('hidden').css({
                  top:
                      $(inputTarget).offset().top +
                      $(inputTarget).height() * 2 -
                      10,
                  left: $(inputTarget).offset().left,
              })
            : $('<ul></ul>')
                  .attr({ id: 'grid-xyz-autocomplete' })
                  .css({
                      'list-style': 'none',
                      background: '#ffffff',
                      padding: '5px',
                      overflow: 'auto',
                      height: '200px',
                      width: `${$(inputTarget).width() + 200}px`,
                      position: 'absolute',
                      'margin-top': '5px',
                      'border-radius': '5px',
                      border: '1px solid #ccc',
                      top:
                          $(inputTarget).offset().top +
                          $(inputTarget).height() * 2 -
                          10,
                      left: $(inputTarget).offset().left,
                  });
    };

    const hiddenContainerAutoComplete = () => {
        $('body').find('#grid-xyz-autocomplete').addClass('hidden');
    };

    const execAutoComplete = (data, inputTarget) => {
        let $ul = getContainerAutoComplete(inputTarget);

        const buildAutoComplete = getBuildingAutoComplete($ul);
        const autoComplete = buildAutoComplete({
            dataSource: data,
            inputTarget: inputTarget,
        });

        $('body').append(autoComplete);
    };

    const registerArrayNameInput = (mapDataSource) => {
        const arrayKeyName = Object.keys(mapDataSource);
        globalObject.arrayKeyName = arrayKeyName;
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

    const registerEventInput = () => {
        const arrayKeyName = globalObject.arrayKeyName;
        const config = globalObject.config;
        const nameGrid = config.nameGrid;
        for (let i = 0; i < arrayKeyName.length; i++) {
            $(nameGrid)
                .off('keyup', `input[name='${arrayKeyName[i]}']`)
                .on(
                    'keyup',
                    `input[name='${arrayKeyName[i]}']`,
                    handleEventInput
                );

            $(nameGrid)
                .off('blur', `input[name='${arrayKeyName[i]}']`)
                .on('blur', `input[name='${arrayKeyName[i]}']`, function () {
                    const gridName = globalObject.config.nameGrid;
                    const grid = $(gridName);
                    const kendoGrid = getKendoGrid(gridName);
                    const container = $('body').find('#grid-xyz-autocomplete');
                    const liActive = container.find('.ibank-active');
                    const value =
                        liActive.length > 0
                            ? liActive.attr('data-val')
                            : $(this).val();
                    const inputName = $(this).attr('name');

                    const td = grid
                        .find(`input[name='${arrayKeyName[i]}']`)
                        .closest('td');

                    const row = td.closest('tr');
                    const item = getDataSourceItemRow(kendoGrid)(row);

                    item[inputName] = value;
                    hiddenContainerAutoComplete();
                    const realTd = grid.find(td);
                    const next = realTd.next();
                    next.on('click');
                });
        }
    };

    const getScroll = (container) => {
        return (itemActive) => {
            const scrollTop = container.scrollTop();
            const itemActiveHeight =
                (itemActive && itemActive.outerHeight()) || 0;
            const viewPortSize = scrollTop + container.height();
            const indexItemActive = itemActive.index();
            const itemOffset = itemActiveHeight * indexItemActive;
            itemOffset < scrollTop ||
            itemOffset + itemActiveHeight > viewPortSize
                ? container.animate({ scrollTop: itemOffset }, 500)
                : undefined;
        };
    };

    const gotoUpList = (container) => {
        const activeClass = 'ibank-active';
        const scroll = getScroll(container);
        const liActive = container.find(`.${activeClass}`);
        const $liPrev =
            liActive.length > 0 ? liActive.prev() : container.find('li:first');

        liActive.removeClass(activeClass);
        $liPrev && $liPrev.addClass(activeClass);
        $liPrev.length > 0 ? scroll($liPrev) : undefined;
    };

    const gotoDownList = (container) => {
        const activeClass = 'ibank-active';
        const scroll = getScroll(container);
        const liActive = container.find(`.${activeClass}`);
        const $liNext =
            liActive.length > 0 ? liActive.next() : container.find('li:first');
        liActive.removeClass(activeClass);
        $liNext && $liNext.addClass(activeClass);
        $liNext.length > 0 ? scroll($liNext) : undefined;
    };

    const registerEventKeyPress = () => {
        $(document).on('keydown', function (e) {
            const action = {
                38: gotoUpList,
                40: gotoDownList,
            };
            const container = $('body').find('#grid-xyz-autocomplete');
            action[e.which]
                ? action[e.which].apply(this, [container])
                : undefined;
        });
    };

    const getSearchEngine = (dataSource) => {
        return (keyword) =>
            dataSource.filter((object) => object.text.includes(keyword));
    };

    const execEventInput = (e) => {
        const keyword = $.trim($(e.target).val());
        const config = globalObject.config;
        const nameInput = $(e.target).attr('name');
        const dataSource = config.mapDataSource[nameInput];
        const searchEngine = getSearchEngine(dataSource);
        const dataSourceSearch = searchEngine(keyword);
        execAutoComplete(dataSourceSearch, $(e.target));
    };

    const handleEventInput = debounce(function (e) {
        const arrayArrowKey = [38, 40];
        !arrayArrowKey.includes(e.which) && execEventInput(e);
    }, 500);

    return {
        init: init,
    };
})();
