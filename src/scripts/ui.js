export class UI {
    constructor() {
        // A dictionary of variables to be controlled by the UI
        this.variables = {};
        this.elements = {};

        // Create the slider rack
        this.rack = document.createElement('div');
        this.rack.className = 'rack';
        document.body.appendChild(this.rack);
    }

    addSlider(variableName, value, min, max, step) {
        this.variables[variableName] = value;

        // Title
        let titleDiv = document.createElement('div');
        titleDiv.className = 'rack-element-title';
        titleDiv.innerHTML = variableName;
        this.rack.appendChild(titleDiv);

        // Slider input
        let sliderDiv = document.createElement('div');
        sliderDiv.className = 'slider-container';
        this.rack.appendChild(sliderDiv);

        let input = document.createElement('input');
        input.type = 'range';
        input.className = 'win10-thumb'
        input.min = min;
        input.max = max;
        input.step = step;
        input.value = value;
        input.id = variableName + 'SliderInput';
        sliderDiv.appendChild(input);

        // Output text
        let output = document.createElement('output');
        output.className = 'win10-output';
        output.id = variableName + 'SliderOutput';
        output.innerHTML = value;
        sliderDiv.appendChild(output);

        // Add event listener to update output text
        input.addEventListener('input', () => {
            this.variables[variableName] = Number(input.value);
            output.innerHTML = Number(input.value).toFixed(1);
        });

        this.elements[variableName] = {
            type: 'slider',
            input: input,
            output: output
        };
    }

    addCheckbox(variableName, value) {
        this.variables[variableName] = value;

        // Checkbox input
        let checkboxDiv = document.createElement('div');
        checkboxDiv.className = 'checkbox-container';
        this.rack.appendChild(checkboxDiv);

        // Title
        let titleDiv = document.createElement('div');
        titleDiv.className = 'rack-element-title';
        titleDiv.innerHTML = variableName;
        checkboxDiv.appendChild(titleDiv);

        let input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = value;
        input.id = variableName + 'CheckboxInput';
        checkboxDiv.appendChild(input);

        // Add event listener to update output text
        input.addEventListener('input', () => {
            this.variables[variableName] = input.checked;
        });

        this.elements[variableName] = {
            type: 'checkbox',
            input: input
        };
    }

    addFPSCounter() {
        let fpsDiv = document.createElement('div');
        fpsDiv.id = 'rack-element-title';
        fpsDiv.innerHTML = 'FPS: 0';
        this.rack.appendChild(fpsDiv);
        this.elements['fpsCounter'] = fpsDiv;
    }

    addText(variableName, value) {
        this.variables[variableName] = value;

        // Text input
        let textDiv = document.createElement('div');
        textDiv.className = 'text-container';
        this.rack.appendChild(textDiv);

        // Title
        let titleDiv = document.createElement('div');
        titleDiv.className = 'rack-element-title';
        titleDiv.innerHTML = variableName + ' : ' + value.toString();
        textDiv.appendChild(titleDiv);

        this.elements[variableName] = titleDiv;
    }

    addColorPicker(variableName, value) {
        this.variables[variableName] = value;


        // Color picker input
        let colorPickerDiv = document.createElement('div');
        colorPickerDiv.className = 'color-picker-container';
        this.rack.appendChild(colorPickerDiv);

        // Title
        let titleDiv = document.createElement('div');
        titleDiv.className = 'rack-element-title';
        titleDiv.innerHTML = variableName;
        colorPickerDiv.appendChild(titleDiv);

        let input = document.createElement('input');
        input.type = 'color';
        input.value = rgbToHex(value);
        input.id = variableName + 'ColorPickerInput';
        colorPickerDiv.appendChild(input);

        // Add event listener to update output text
        input.addEventListener('input', () => {
            // Convert ot rgb and store in variables
            this.variables[variableName] = hexToRgb(input.value);
        });

        this.elements[variableName] = {
            type: 'colorPicker',
            input: input
        };
    }

    updateVariable(variableName, value) {
        if (this.elements[variableName].type === 'slider') {
            this.elements[variableName].input.value = value;
            this.elements[variableName].output.innerHTML = value.toFixed(1);
        } else if (this.elements[variableName].type === 'checkbox') {
            this.elements[variableName].input.checked = value;
        } else if (this.elements[variableName].type === 'colorPicker') {
            this.elements[variableName].input.value = rgbToHex(value);
        } else {
            this.elements[variableName].innerHTML = variableName + ' : ' + value.toString();
        }
    }
}

function hexToRgb(hex) {
    // https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;

    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    // Return null if invalid hex string
    if (!result) {
        return null;
    }

    return [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255
    ];
}

function rgbToHex(rgb) {
    // https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    let r = Math.round(rgb[0] * 255);
    let g = Math.round(rgb[1] * 255);
    let b = Math.round(rgb[2] * 255);

    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function componentToHex(c) {
    // https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    let hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}