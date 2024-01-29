export default class Anchors {
    constructor(options) {
        let defaultConfig = {
            linkAttribute: 'href'
        }
        
        this.config = Object.assign(defaultConfig, options)

        this.events()
    }

    events() {
        document.addEventListener('click', (e) => {
            const elem = e.target.closest('a')
            if(this.anchorValidate(elem))
                this.anchorScroll(e, elem)
        })
    }

    anchorValidate(elem) {
        return elem
               && elem.hasAttribute(this.config.linkAttribute)
               && elem.getAttribute(this.config.linkAttribute).startsWith('#')
               && elem.getAttribute(this.config.linkAttribute).replace('#', '').trim() !== ''
    }

    anchorScroll(e, anchor) {
        e.preventDefault()
        const blockID = anchor.getAttribute(this.config.linkAttribute)
        document.querySelector('' + blockID).scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        })
    }
}