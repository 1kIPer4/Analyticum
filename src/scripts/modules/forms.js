import Inputmask from 'inputmask'

export default class Forms {
    static _inputPhones = false
    static _btnsPreloader = false

    constructor(options) {
        let defaultConfig = {
            emptyField: 'Поле не заполнено',
            correctEmail: 'Введите корректный E-mail',
            fullPhone: 'Заполните номер телефона полностью',
            confirmation: 'Требуется соглашение с условиями!',
            phoneMask: '+7 (999) 999-99-99',
            fieldsSelector: 'input, textarea',
            fieldErrorSelector: '.text-error',
            modalSuccessId: '#modal-success',
            modalMessageContainer: '.modal__title',
            modalMessageSuccess: 'Ваша заявка отправлена',
            modalMessageFailure: 'Что-то пошло не так',
            modalDurationTime: 3000
        }
        
        this.config = Object.assign(defaultConfig, options)

        this.init()
    }

    init() {
        //маска
        if (!Forms._inputPhones) {
            const 
                allInputPhones = document.querySelectorAll('input[type="tel"]'),
                formMask = new Inputmask(this.config.phoneMask, {showMaskOnHover: false})
                
            formMask.mask(allInputPhones)
            Forms._inputPhones = true
        }

        //модалка успеха
        if (this.config.modalInstance) {
            this.modalSuccess = document.querySelector(this.config.modalSuccessId)
            if (this.modalSuccess)
                this.modalSuccessContainer = this.modalSuccess.querySelector(this.config.modalMessageContainer)
        }

        //добавление прелоадера на кнопки
        if (!Forms._btnsPreloader) {
            const btns = document.querySelectorAll('button[type="submit"]')
            this._createBtnsPreloader(btns)
            Forms._btnsPreloader = true
        }

        this.events()
    }

    events() {
        document.addEventListener('submit', (e) => {
            this.formSubmit(e, e.target)
        })
    }

    async _postData(url, data) {
        const response = await fetch(url, {
            method: 'POST',
            body: data
        })

        return await response.json()
    }

    _createBtnsPreloader(btns) {
        btns.forEach(btn => {
            for (let i = 0; i < 3; i++) {
                const point = document.createElement('span')
                point.classList.add('loader-point')
                btn.append(point)
            }
        })
    }

    _loading(loading = true) {
        if (this.btnPreloader) {
            if (loading)
                this.btnPreloader.classList.add('loading-show')
            else
                this.btnPreloader.classList.remove('loading-show')
        } 
    }

    _emailCheck(input) {
        if (input.value.trim() !== '')
            return !/^\S+@\S+.\S+$/.test(input.value)
        return false
    }

    _phoneCheck(input) {
        if (input.value !== '' 
            && input.value.replace('_', '').length !== this.config.phoneMask.length)
            return true
        return false
    }

    _checkboxCheck(input) {
        return !input.checked
    }

    _showError(field, message) {
        field.classList.add('error')
        this._createError(field, message)
    }

    _createError(field, message ) {
        const newError = document.createElement('span')
        newError.classList.add('text-error')
        newError.textContent = message
        field.append(newError)
    }

    checkFields(fields) {
        let isSuccess = false
        if (fields.length) {
            isSuccess = true
            fields.forEach(field => {
                const 
                    input = field.querySelector('input, textarea') ?? field,
                    error = field.querySelector(this.config.fieldErrorSelector)
                
                let errorMessage = ''

                //удаление всех сообщений об ошибках
                if (error)
                    error.remove()

                field.classList.remove('error')

                //валидация обязательных полей
                if (input.hasAttribute('data-required')) {
                    if (input.type === 'checkbox') {
                        if (this._checkboxCheck(input))
                            errorMessage = this.config.confirmation
                    } else if (input.value.trim() === '')
                        errorMessage = this.config.emptyField
                }

                //валидация отдельных полей
                if (input.name === 'email' && this._emailCheck(input))
                    errorMessage = this.config.correctEmail
                else if (input.type === 'tel' && this._phoneCheck(input))
                    errorMessage = this.config.fullPhone

                //вызов ошибки если она есть
                if (errorMessage) {
                    this._showError(field, errorMessage)
                    isSuccess = false
                }
            })
        }
        return isSuccess
    }

    formDisabled(form, value) {
        for (const elem of form.elements) 
            elem.disabled = value
    }

    _afterSend(form)  {
        this._loading(false)
        
        //чистим поля
        const inputs = form.querySelectorAll('input, textarea')
        inputs.forEach(input => input.value = '')
        //убираем disable
        this.formDisabled(form, false)
        
        if (this.modalSuccess) {
            //показываем модалку успеха
            this.config.modalInstance.open(this.modalSuccess)

            //закрываем модалку успеха
            setTimeout(() => {
                //Поверяем если она еще не закрыта - закрываем
                if (document.querySelector(`${this.config.modalSuccessId}[${this.config.modalInstance.config.modalOpenAttribute}]`))
                    this.config.modalInstance.close(this.modalSuccess)
            }, this.config.modalDurationTime)
        }
    }

    formSubmit(e, form) {
        if (form) {
            e.preventDefault()
            const fields = form.querySelectorAll(this.config.fieldsSelector)

            if (this.checkFields(fields)) {
                const formData = new FormData(form)

                this.formDisabled(form, true)

                this.btnPreloader = form.querySelector('button[type="submit"]')
                this._loading()

                this._postData('https://swapi.dev/api/people/1/', formData)
                    .then(() => {
                        if (this.modalSuccessContainer)
                            this.modalSuccessContainer.textContent = this.config.modalMessageSuccess
                    })
                    .catch(() => {
                        if (this.modalSuccessContainer)
                            this.modalSuccessContainer.textContent = this.config.modalMessageFailure
                    })
                    .finally(() => {
                        this._afterSend(form)
                    })
            }
        }
    }
}