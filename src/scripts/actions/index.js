const getStyle = (object, style) => {
    let value = window.getComputedStyle(object).getPropertyValue(style)
    
    if (style === 'transition-duration' || style === 'transition-delay') {
        if (value.includes('ms'))
            value = Number(value.replace('ms', ''))
        else if (value.includes('s'))
            value = Number(value.replace('s', '')) * 1000
    }
    return value
}

const getElement = (element) => {
    if (element && element instanceof Element)
        return element
    else if (element && typeof element === 'string')
        return document.querySelector(element)
    return null
}

export {getStyle, getElement}