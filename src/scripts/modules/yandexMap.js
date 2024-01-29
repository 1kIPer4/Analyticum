import ymaps from 'ymaps'

export default class YandexMap {
    constructor(options, mediaParams) {
        this.key = options.key

        let defaultConfig = {
            addressAttribute: 'data-address',
            addressClass: 'address__text',
            phoneClass: 'phone__text',
            mapID: 'map',
            defaultAddress: 'г. Челябинск, ул. Доватора, 9 оф.27',
            zoom: 10,
            sizeMark: [58, 70],
            balloonContentHeader: '',
            classIconContentLayout: 'map__icon-caption',
            addressRow: '.address',
            addressesList: false
        }
        
        this.config = Object.assign(defaultConfig, options)
        this.mediaParams = mediaParams

        //пустой массив для меток
        this.placemarks = []

        //задаем default параметры для медиа опций
        this.mediaParams.default = {}
        this.mediaParams.default.zoom = this.config.zoom
        this.mediaParams.default.sizeMark = this.config.sizeMark

        //Удаляем с классов и id символы
        this.deleteCharsFromOptions()

        //ширина страницы (медиа-запросы)
        this.mediaQuery = window.matchMedia('(min-width: 1601px)')
        this.mediaQueryLaptopL = window.matchMedia('(max-width: 1600px) and (min-width: 1180px)')
        this.mediaQueryLaptop = window.matchMedia('(max-width: 1179px)')

        //установка параметров для Яндекс карты (Адаптив)
        this.yamapParamsInit()

        //Если задан ключ - инициализируем
        if (this.key)
            this.init()
    }

    init() {
        ymaps
        .load(this.key)
        .then(maps => {
            this.maps = maps

            //Инициализируем адреса
            this.initAdresses()
            
            //Если есть нужный адресс - создаем карту
            if (this.addressElem) {
                //Ищем координаты по адресу
                maps.geocode(this.addressElem.getAttribute(this.config.addressAttribute))
                    .then((response) => {
                        //задаем координаты
                        this.coords = this.getCoords(response)

                        //Создаем карту
                        this.map = new maps.Map(this.config.mapID, {
                            center: this.coords,
                            zoom: this.config.zoom,
                            controls: []
                        }, {
                            searchControlProvider: 'yandex#search',
                            suppressMapOpenBlock: true
                        })

                        //устанавливаем адрес (внутри создается метка)
                        this.setAddress(this.addressElem, this.coords)
                    })
                    .catch(error => console.log(error))
            }
        })
        .catch(error => console.log('Failed to load Yandex Maps', error))
    }

    events() {
        //при клике по адрессу переходим по карте на него
        this.addressesList.forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault()
                this.setAddress(element)
            })
        })

        // слушатели медиа-запросов 
        //> 1600px
        this.mediaQuery.addEventListener('change', (e) => {
            //изменение Яндекс карты (масштаб и размер метки)
            this.changeZoom(e.matches, this.mediaParams.default.zoom)
            this.changeSizeMark(e.matches, this.mediaParams.default.sizeMark)
        })

        // Laptop large 1180 - 1600
        this.mediaQueryLaptopL.addEventListener('change', (e) => {
            //изменение Яндекс карты (масштаб и размер метки)
            this.changeZoom(e.matches, this.mediaParams.laptopL.zoom)
            this.changeSizeMark(e.matches, this.mediaParams.laptopL.sizeMark)
        })

        // Laptop max 1179
        this.mediaQueryLaptop.addEventListener('change', (e) => {
            //изменение Яндекс карты (масштаб и размер метки)
            this.changeZoom(e.matches, this.mediaParams.laptop.zoom)
            this.changeSizeMark(e.matches, this.mediaParams.laptop.sizeMark)
        })
    }

    //функция для установки начальных значений (Адаптив)
    yamapParamsInit() {
        // <= 1600 px
        if (this.mediaQueryLaptopL.matches) {
            this.config.zoom = this.mediaParams.laptopL.zoom
            this.config.sizeMark = this.mediaParams.laptopL.sizeMark
        }
        // < 1180 px
        if (this.mediaQueryLaptop.matches) {
            this.config.zoom = this.mediaParams.laptop.zoom
            this.config.sizeMark = this.mediaParams.laptop.sizeMark    
        }
    }

    deleteCharsFromOptions() {
         //удаляем '#' с id
         this.config.mapID.replace('#', '')
         //удаляем '.' с class
         this.config.addressClass.replace('.', '')
         this.config.phoneClass.replace('.', '')
         this.config.classIconContentLayout.replace('.', '')
    }

    //Инициализация адресов
    initAdresses() {
        this.addressesList = document.querySelectorAll(`[${this.config.addressAttribute}]`)

        //Если есть список адресов
        if (this.addressesList.length > 0) {
            //пробегаемся по всем адресам и ищем нужный
            for (const el of this.addressesList) {
                const 
                    address = el.getAttribute(this.config.addressAttribute).trim().toLowerCase(),
                    defaultAddress = this.config.defaultAddress.trim().toLowerCase()

                //если элемент содержит дефолтный адрес
                if(address.includes(defaultAddress)) {
                    this.addressElem = el
                    break
                } 
            }
        }

        //если кол-во адресов больше 1 - вешаем обработчик событий
        if (this.addressesList.length > 1)
            this.events()
    }
 
    getCoords(response) { 
        return response.geoObjects.get(0).geometry.getCoordinates()
    }

    //Задем адресс
    setAddress(addressElem, coords = false) {
        if (addressElem) {
            this.addressElem = addressElem
            this.address = this.addressElem.getAttribute(this.config.addressAttribute)
        }
        
        if (this.address) {
            if(coords && coords instanceof Array)
                this.goToAddress(coords)
            else if(this.maps) {
                // получение координат по адресу - асинхронная функция
                this.maps.geocode(this.address)
                    .then(responce => this.goToAddress( this.getCoords(responce) ))
                    .catch(error => console.log(error))
            }
        }
    }

    //Переходим по адресу
    goToAddress(coords) {
        this.coords = coords

        if (this.map) {
            // переходим по координатам
            this.map.setCenter(this.coords)

            //если такой метки нет еще в списке
            if (!this.placemarks.find(placemark => placemark.geometry.getCoordinates() === this.coords)) {
                //создаем метку
                const placemark = this.createMarkWithContent(this.getBallonOptions())

                if (placemark) {
                    this.placemarks.push(placemark)
                    this.map.geoObjects.add(placemark)
                }  
           }
        }
    }

    getBallonOptions() {
        //Опции метки для ballon
        let ballonOptions = {
            balloonContentHeader: this.config.balloonContentHeader,
            balloonContentFooter: this.address,
            iconContent: this.address
        }

        if (this.addressElem) {
            //Ищем родительскую строку
            const addressRow = this.addressElem.closest(this.config.addressRow)

            if(addressRow) {
                //Ищем ближайший номер
                const balloonContentBody = addressRow.querySelector(`.${this.config.phoneClass}`)

                if (balloonContentBody)
                    ballonOptions.balloonContentBody = balloonContentBody.textContent
            }
        }

        return ballonOptions
    }

    //Функция создания маркера
    createMarkWithContent(ballonOptions) {
        if (!this.maps) return false

        //Получаем icon content
        return new this.maps.Placemark(this.map.getCenter(), ballonOptions, {
            // Опции.
            // Тип макета.
            iconLayout: 'default#imageWithContent',
            // Своё изображение иконки метки.
            iconImageHref: 'assets/img/icons/placemark.svg',
            // Размеры метки.
            iconImageSize: this.config.sizeMark,
            // Смещение левого верхнего угла иконки относительно её "ножки" (точки привязки).
            iconImageOffset: [- this.config.sizeMark[0] / 2, - this.config.sizeMark[1] / 2],
            //Смещение контента
            iconContentOffset: [this.config.sizeMark[0], this.config.sizeMark[1] / 3.5],
            //Шаблон контента
            iconContentLayout: this.maps.templateLayoutFactory.createClass(`<div class="${this.config.classIconContentLayout}">$[properties.iconContent]</div>`) 
        })
    }

    //изменение масштаба Яндекс карты
    changeZoom(mediaQueryMatches, zoom) {
        if(mediaQueryMatches && zoom) {
            if (zoom !== this.config.zoom) {
                this.config.zoom = zoom
    
                if (this.map)
                    this.map.setZoom(zoom)
            }
        }
    }

    //изменение размера метки Яндекс карты
    changeSizeMark(mediaQueryMatches, size) {
        if(mediaQueryMatches && size) {
            if (size !== this.config.sizeMark) {
                this.config.sizeMark = size
    
                this.placemarks.forEach(placemark => {
                    placemark.options.set('iconImageSize', size)
                    placemark.options.set('iconImageOffset', [-size[0] / 2, -size[1] / 2])
                    placemark.options.set('iconContentOffset', [size[0], size[1] / 3.5])
                })
            }
        }
    }
}