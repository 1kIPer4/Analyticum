export default class ScrollAnimation {
    constructor(elements, options) {
        //Начальные значения
        let defaultConfig = {
            observerOptions: {
                threshold: [0.25]
            },
            hide: false,
            animationClass: '_show',
            noHideClass: '_anim-no-hide'
        }
        
        this.config = Object.assign(defaultConfig, options)

        //Ищем элементы для анимирования
        if (elements instanceof Array) {
            //если массив строк
            if (typeof elements[0] === 'string') {
                //ищем элементы по селектору и добавляем в массив
                elements.forEach(element => {
                    this.elements.push(document.querySelectorAll(element))
                })
            } 
            //если массив элементов
            else if (elements[0] instanceof Element)
                this.elements = elements
        }
        //Если передали строку ищем по селектору
        else if ( typeof elements === 'string')
            this.elements = document.querySelectorAll(elements)
        
        //Если элементы есть
        if (this.elements && this.elements.length > 0)
            this.init()
    }

    init() {
        this.observer = new IntersectionObserver(this.onEntry.bind(this), this.config.observerOptions)

        this.events()
    }

    events() {
        this.elements.forEach(element => this.observer.observe(element))
    }

    onEntry(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting)
                entry.target.classList.add(this.config.animationClass)
            //если стоит опция прятать класс
            else if(this.config.hide) {
                //если у элемента нет класса "не прятать"
                if(!entry.target.classList.contains(this.config.noHideClass))
                    entry.target.classList.remove(this.config.animationClass)
            }
        })
    }
}