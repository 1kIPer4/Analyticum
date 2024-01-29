import {getStyle, getElement} from '@actions/index'

export default class ColorTheme {
    constructor(range, color, btn, listStylesRange, listStylesColor) {

        this.range = getElement(range)
        this.color = getElement(color)
        this.btn = getElement(btn)

        this.listStylesRange = listStylesRange
        this.listStylesColor = listStylesColor

        this.root = document.querySelector(':root')

        this.init()
    }

    init() {
        this.events()
    }

    events() {
        if (this.range) {
            this.range.addEventListener('input', (e) => {
                this.rangeListener(e)
            })
        }
        if (this.color) {
            this.color.addEventListener('input', (e) => {
                this.colorListener(e)
            })
        }
        if(this.btn) {
            this.btn.addEventListener('click', () => {
                this.btnListener()
            })
        }
    }

    btnListener() {
        const frame = this.btn.parentNode
        frame.classList.toggle('_open', !frame.classList.contains('_open'))
    }

    //first option (change only "deg")
    rangeListener(e) {
        this.listStylesRange.forEach(style => {
            let value = getStyle(this.root, style)

            //Если изначально hex код меняем на hsl
            if(value.split(',').length === 1) {
                let hsl = this.hexToHSL(value)
                value = `hsl(${hsl.h}deg, ${hsl.s}%, ${hsl.l}%)`
            }

            value = this.formatColor(value, e)

            document.documentElement.style.setProperty(style, value)
        })        
    }

    formatColor(value, e) {
        value = value.split(',')
        value[0] = `hsl(${e.target.value}deg`
        return value.join(',')
    }

    //second option (change only "deg")
    colorListener(e) {
        let hsl = this.hexToHSL(e.target.value),
        value = `hsl(${hsl.h}deg, ${hsl.s}%, ${hsl.l}%)`

        //primary 300, 200, 100
        document.documentElement.style.setProperty(this.listStylesRange[2], value)
        value = `hsl(${hsl.h}deg, ${hsl.s + 8}%, ${hsl.l - 10}%)`
        document.documentElement.style.setProperty(this.listStylesRange[1], value)
        value = `hsl(${hsl.h}deg, ${hsl.s + 37}%, ${hsl.l - 25}%)`
        document.documentElement.style.setProperty(this.listStylesRange[0], value)

        //button [color, light]
        value = `hsl(${hsl.h + 34}deg, ${hsl.s + 30}%, ${hsl.l + 13}%)`
        document.documentElement.style.setProperty(this.listStylesColor[0], value)
        value = `hsla(${hsl.h + 2}deg, ${hsl.s + 43}%, ${hsl.l + 24}%, .42)`
        document.documentElement.style.setProperty(this.listStylesColor[1], value)

        //link
        value = `hsl(${hsl.h + 52}deg, ${hsl.s + 43}%, ${hsl.l + 24}%)`
        document.documentElement.style.setProperty(this.listStylesColor[2], value)
    }

    hexToHSL(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      
        if (!result) {
          throw new Error("Could not parse Hex Color")
        }
      
        const rHex = parseInt(result[1], 16)
        const gHex = parseInt(result[2], 16)
        const bHex = parseInt(result[3], 16)
      
        const r = rHex / 255
        const g = gHex / 255
        const b = bHex / 255
      
        const max = Math.max(r, g, b)
        const min = Math.min(r, g, b)
      
        let h = (max + min) / 2
        let s = h
        let l = h
      
        if (max === min) {
            // Achromatic
            return { h: 0, s: 0, l }
        }
      
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0)
                break
            case g:
                h = (b - r) / d + 2
                break
            case b:
                h = (r - g) / d + 4
                break
        }
        h /= 6
      
        s = s * 100
        s = Math.round(s)
        l = l * 100
        l = Math.round(l)
        h = Math.round(360 * h)
      
        return { h, s, l }
    }
}