//css селекторы c фокусом
const focusElements = [
    'a[href]',
    'area[href]',
    'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
    'select:not([disabled]):not([aria-hidden])',
    'textarea:not([disabled]):not([aria-hidden])',
    'button:not([disabled]):not([aria-hidden])',
    'iframe',
    'object',
    'embed',
    '[contenteditable]',
    '[tabindex]:not([tabindex^="-"])'
]

//Переносит фокус в окно и из него на открывающий элемент
const focusContol = (elem, isOpen = false, elemOpening = false, timing = 500) => {
    if (!isOpen && elemOpening)
        elemOpening.focus()
    else if (elem) {
        const nodes = elem.querySelectorAll(focusElements)
        if (nodes.length)
            setTimeout(() => nodes[0].focus(), timing)
    }
}

//Фокус по элементам в открытом окне зацикленный
const focusCatcher = (e, elem) =>  {
    const nodes = elem ? elem.querySelectorAll(focusElements) : []
    const nodesArray = nodes.length ? Array.prototype.slice.call(nodes) : []

    if (nodesArray.length) {
        if (!elem.contains(document.activeElement)) {
            nodesArray[0].focus()
            e.preventDefault()
        } else {
            const focusedItemIndex = nodesArray.indexOf(document.activeElement)
            if (e.shiftKey && focusedItemIndex === 0) {
                //перенос фокуса на последний элемент
                nodesArray[nodesArray.length - 1].focus()
                e.preventDefault()
            }
            if (!e.shiftKey && focusedItemIndex === nodesArray.length - 1) {
                //перерос фокуса на первый элемент
                nodesArray[0].focus()
                e.preventDefault()
            }
        }
    }
}

export {focusContol, focusCatcher}