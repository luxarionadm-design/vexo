class UIElement {
    constructor(dom) {
        this.dom = dom;
    }

    add(...elements) {
        for (const el of elements) {
            if (el instanceof UIElement) {
                this.dom.appendChild(el.dom);
            }
        }
        return this;
    }

    remove(...elements) {
        for (const el of elements) {
            if (el instanceof UIElement) {
                this.dom.removeChild(el.dom);
            }
        }
        return this;
    }

    clear() {
        while (this.dom.children.length) {
            this.dom.removeChild(this.dom.lastChild);
        }
        return this;
    }

    setId(id) {
        this.dom.id = id;
        return this;
    }

    getId() {
        return this.dom.id;
    }

    setClass(className) {
        this.dom.className = className;
        return this;
    }

    addClass(className) {
        this.dom.classList.add(className);
        return this;
    }

    removeClass(className) {
        this.dom.classList.remove(className);
        return this;
    }

    setStyle(property, value) {
        this.dom.style[property] = value;
        return this;
    }

    setDisplay(display) {
        this.dom.style.display = display;
        return this;
    }

    setHidden(hidden) {
        this.dom.hidden = hidden;
        return this;
    }

    setTextContent(text) {
        this.dom.textContent = text;
        return this;
    }

    setInnerHTML(html) {
        this.dom.innerHTML = html;
        return this;
    }

    onClick(callback) {
        this.dom.addEventListener('click', callback.bind(this));
        return this;
    }

    onChange(callback) {
        this.dom.addEventListener('change', callback.bind(this));
        return this;
    }

    onInput(callback) {
        this.dom.addEventListener('input', callback.bind(this));
        return this;
    }

    onKeyDown(callback) {
        this.dom.addEventListener('keydown', callback.bind(this));
        return this;
    }

    onMouseOver(callback) {
        this.dom.addEventListener('mouseover', callback.bind(this));
        return this;
    }

    onMouseOut(callback) {
        this.dom.addEventListener('mouseout', callback.bind(this));
        return this;
    }
}

class UIDiv extends UIElement {
    constructor() {
        super(document.createElement('div'));
    }
}

class UISpan extends UIElement {
    constructor() {
        super(document.createElement('span'));
    }
}

class UIPanel extends UIDiv {
    constructor() {
        super();
        this.setClass('Panel');
    }
}

class UIRow extends UIDiv {
    constructor() {
        super();
        this.setClass('Row');
    }
}

class UIText extends UISpan {
    constructor(text = '') {
        super();
        this.setClass('Text');
        this.setDisplay('inline-block');
        this.setTextContent(text);
    }

    getValue() {
        return this.dom.textContent;
    }

    setValue(text) {
        this.setTextContent(text);
        return this;
    }
}

class UIInput extends UIElement {
    constructor(value = '') {
        super(document.createElement('input'));
        this.setClass('Input');
        this.dom.setAttribute('autocomplete', 'off');
        this.setValue(value);
    }

    getValue() {
        return this.dom.value;
    }

    setValue(value) {
        this.dom.value = value;
        return this;
    }

    setPlaceholder(text) {
        this.dom.placeholder = text;
        return this;
    }

    setType(type) {
        this.dom.type = type;
        return this;
    }

    setRequired(required) {
        this.dom.required = required;
        return this;
    }

    focus() {
        this.dom.focus();
        return this;
    }

    select() {
        this.dom.select();
        return this;
    }
}

class UIButton extends UIElement {
    constructor(text = '') {
        super(document.createElement('button'));
        this.setClass('Button');
        this.setTextContent(text);
    }

    setText(text) {
        this.setTextContent(text);
        return this;
    }

    setDisabled(disabled) {
        this.dom.disabled = disabled;
        return this;
    }

    isDisabled() {
        return this.dom.disabled;
    }
}

class UICheckbox extends UIElement {
    constructor(checked = false) {
        super(document.createElement('input'));
        this.dom.type = 'checkbox';
        this.setClass('Checkbox');
        this.setValue(checked);
    }

    getValue() {
        return this.dom.checked;
    }

    setValue(checked) {
        this.dom.checked = checked;
        return this;
    }
}

class UISelect extends UIElement {
    constructor() {
        super(document.createElement('select'));
        this.setClass('Select');
        this.dom.setAttribute('autocomplete', 'off');
    }

    setOptions(options) {
        while (this.dom.children.length) {
            this.dom.removeChild(this.dom.firstChild);
        }

        for (const [value, label] of Object.entries(options)) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = label;
            this.dom.appendChild(option);
        }

        return this;
    }

    getValue() {
        return this.dom.value;
    }

    setValue(value) {
        this.dom.value = value;
        return this;
    }
}

class UIProgress extends UIElement {
    constructor(value = 0) {
        super(document.createElement('progress'));
        this.setValue(value);
    }

    getValue() {
        return this.dom.value;
    }

    setValue(value) {
        this.dom.value = value;
        return this;
    }

    setMax(max) {
        this.dom.max = max;
        return this;
    }
}

export {
    UIElement,
    UIDiv,
    UISpan,
    UIPanel,
    UIRow,
    UIText,
    UIInput,
    UIButton,
    UICheckbox,
    UISelect,
    UIProgress
};
