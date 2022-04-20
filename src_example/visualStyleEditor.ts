import { ColorStyleStrict, Units } from '@metoceanapi/wxtiles-leaflet';
import { WxGetColorSchemes, WxGetColorStyles } from '@metoceanapi/wxtiles-leaflet';
import { ColorStyleWeak } from '@metoceanapi/wxtiles-leaflet/dist/es/utils/wxtools';
import L from 'leaflet';

function createEl<K extends keyof HTMLElementTagNameMap>(container: HTMLElement, tag: K, params?: any): HTMLElementTagNameMap[K] {
	const el = document.createElement(tag);
	Object.assign(el, params);
	container?.appendChild(el);
	return el;
}

export class Editor {
	onchange?: (style: ColorStyleStrict) => void;

	editorTextAreaEl: HTMLTextAreaElement;
	editorDivEl: HTMLDivElement;

	// inputs
	parentInput: HTMLInputElement; // string

	nameInput: HTMLInputElement; // string

	fillSelect: HTMLSelectElement; // string

	isolineColorSelect: HTMLSelectElement; // string
	isolineColorInput: HTMLInputElement;

	isolineTextInput: HTMLInputElement; // boolean

	vectorTypeSelect: HTMLSelectElement; // string

	vectorColorSelect: HTMLSelectElement; // string
	vectorColorInput: HTMLInputElement;

	vectorFactorInput: HTMLInputElement; // number

	streamLineColorInput: HTMLInputElement; // string
	streamLineColorVisibleInput: HTMLInputElement; // boolean

	streamLineSpeedFactorInput: HTMLInputElement; // number

	streamLineStaticInput: HTMLInputElement; // boolean

	showBelowMinInput: HTMLInputElement; // boolean

	showAboveMaxInput: HTMLInputElement; // boolean

	colorSchemeSelect: HTMLSelectElement; // string

	colorsInput: HTMLInputElement; // string[];

	colorMapInput: HTMLInputElement; // [number, string][];

	levelsInput: HTMLInputElement; // number[];

	blurRadiusInput: HTMLInputElement; // number

	addDegreesInput: HTMLInputElement; // number

	unitsInput: HTMLInputElement; // string

	extraUnitsInput: HTMLInputElement; // Units as { [name: string]: [string, number, ?number] };

	maskSelect: HTMLSelectElement; // string

	styleBase: ColorStyleStrict;

	constructor(map: L.Map, parent: HTMLElement, selectStyleEl: HTMLSelectElement, opts: { id: string; className: string }) {
		this.styleBase = WxGetColorStyles()['base'];

		// helpers
		const onwheel = L.DomEvent.stopPropagation;
		const onmousedown = (e: MouseEvent) => map.dragging.disable() && onwheel(e);
		const onmouseup = (e: MouseEvent) => map.dragging.enable() && onwheel(e);
		// Top level container
		const topmostDivEl = createEl(parent, 'div', { onclick: onwheel, ondblclick: onwheel, onwheel, onmousedown, onmouseup });
		// Button to open/close editor
		const customStyleButtonEl = createEl(topmostDivEl, 'button', {
			id: 'customStyleButton',
			style: 'height: 1.5em; background-color: gray',
			innerText: 'Custom Style',
		});
		// Editor container
		const customStyleHiddableDivEl = createEl(topmostDivEl, 'div', {
			id: 'customStyleDiv',
			style: 'display: none; border-color: black; border-style: solid; border-width: 2px; background-color: rgba(135, 206, 250, 0.8)',
		});
		customStyleButtonEl.addEventListener('click', () => {
			if (customStyleHiddableDivEl.style.display !== 'none') {
				customStyleHiddableDivEl.style.display = 'none';
				customStyleButtonEl.innerHTML = 'show Custom Style Editor';
			} else {
				customStyleHiddableDivEl.style.display = 'block';
				customStyleButtonEl.innerHTML = 'update Custom Style & Hide';
				selectStyleEl.value = 'custom';
			}
		});

		// Text area to edit custom style
		this.editorTextAreaEl = createEl(customStyleHiddableDivEl, 'textarea', { id: 'customStyleTextArea', style: 'width: 20vw; height: 5vh' });
		this.editorTextAreaEl.addEventListener('change', () => this._onTextChange());
		// Editor container
		this.editorDivEl = createEl(customStyleHiddableDivEl, 'div', opts);
		// Helpers
		const addLabel = (id: string, br: boolean = true) => {
			createEl(this.editorDivEl, 'label', { htmlFor: id, id: id + 'Label', className: id + 'LabelClass', textContent: id.replace(/Input|Select$/i, '') });
			br && createEl(this.editorDivEl, 'br', {});
		};

		const addInput = ({
			id,
			type,
			min,
			max,
			step,
			onEvent = 'change',
			br = true,
		}: {
			id: string;
			type: string;
			onEvent?: string;
			min?: string;
			max?: string;
			step?: string;
			br?: boolean;
		}): HTMLInputElement => {
			const el = createEl(this.editorDivEl, 'input', { id, className: id + 'Class', type, min, max, step });
			onEvent !== 'none' && el.addEventListener(onEvent, () => this._onDivChange());
			addLabel(id, br);
			return el;
		};

		const addSelect = ({ id, opts, br = true }: { id: string; opts: string[]; br?: boolean }) => {
			const el = createEl(this.editorDivEl, 'select', { id, className: id + 'Class' });
			el.addEventListener('change', () => this._onDivChange());
			opts.forEach((name) => el.options.add(createEl(el, 'option', { value: name, text: name })));
			addLabel(id, br);
			el.selectedIndex = 0;
			return el;
		};

		this.parentInput = addInput({ id: 'parentInput', type: 'text' });
		this.nameInput = addInput({ id: 'nameInput', type: 'text' });
		this.fillSelect = addSelect({ id: 'fillSelect', opts: ['', 'gradient', 'solid', 'none'] });
		this.isolineColorSelect = addSelect({ id: 'isolineColorSelect', br: false, opts: ['', 'inverted', 'fill', 'none', 'custom'] });
		this.isolineColorSelect.addEventListener('change', () => (this.isolineColorInput.disabled = this.isolineColorSelect.value !== 'custom'));
		this.isolineColorInput = addInput({ id: 'isolineColorInput', type: 'color', onEvent: 'none' });
		this.isolineColorInput.addEventListener('change', () => {
			this.isolineColorSelect.value = 'custom';
			this._onDivChange();
		});
		this.isolineTextInput = addInput({ id: 'isolineTextInput', type: 'checkbox' });
		this.vectorTypeSelect = addSelect({ id: 'vectorTypeSelect', opts: ['', 'arrows', 'barbs', 'none'] });
		this.vectorColorSelect = addSelect({ id: 'vectorColorSelect', br: false, opts: ['', 'inverted', 'fill', 'none', 'custom'] });
		this.vectorColorSelect.addEventListener('change', () => (this.vectorColorInput.disabled = this.vectorColorSelect.value !== 'custom'));
		this.vectorColorInput = addInput({ id: 'vectorColorInput', type: 'color', onEvent: 'none' });
		this.vectorColorInput.addEventListener('change', () => {
			this.vectorColorSelect.value = 'custom';
			this._onDivChange();
		});
		this.vectorFactorInput = addInput({ id: 'vectorFactorInput', type: 'number', min: '0.1', max: '10', step: '0.1' });
		this.streamLineColorVisibleInput = addInput({ id: 'streamLineColorVisibleInput', br: false, type: 'checkbox' });
		this.streamLineColorVisibleInput.addEventListener('change', () => (this.streamLineColorInput.disabled = !this.streamLineColorVisibleInput.checked));
		this.streamLineColorInput = addInput({ id: 'streamLineColorInput', type: 'color' });
		this.streamLineSpeedFactorInput = addInput({ id: 'streamLineSpeedFactorInput', type: 'number', min: '0.1', max: '10', step: '0.1' });
		this.streamLineStaticInput = addInput({ id: 'streamLineStaticInput', type: 'checkbox' });
		this.showBelowMinInput = addInput({ id: 'showBelowMinInput', type: 'checkbox' });
		this.showAboveMaxInput = addInput({ id: 'showAboveMaxInput', type: 'checkbox' });
		this.colorSchemeSelect = addSelect({ id: 'colorSchemeSelect', opts: Object.keys(WxGetColorSchemes()) }); // TODO: add more schemes
		this.colorsInput = addInput({ id: 'colorsInput', type: 'text' }); // TODO:
		this.colorMapInput = addInput({ id: 'colorMapInput', type: 'text' }); // TODO:
		this.levelsInput = addInput({ id: 'levelsInput', type: 'text' }); // TODO:
		this.blurRadiusInput = addInput({ id: 'blurRadiusInput', type: 'range', onEvent: 'input', min: '0', max: '10', step: '1' });
		this.addDegreesInput = addInput({ id: 'addDegreesInput', type: 'number', min: '0', max: '360', step: '1' });
		this.unitsInput = addInput({ id: 'unitsInput', type: 'text' });
		this.extraUnitsInput = addInput({ id: 'extraUnitsInput', type: 'text' });
		this.maskSelect = addSelect({ id: 'maskSelect', opts: ['', 'none', 'sea', 'land'] });
	}

	getStyle(): ColorStyleStrict {
		// deep copy
		return Object.assign({}, this.styleBase, this._getStyleFromTextArea() /*, this._getStyleFromDiv()*/);
	}

	// this.editorTextAreaEl is always modifyed by StyleFromDiv at any changes in the div
	protected _getStyleFromTextArea(): ColorStyleWeak {
		return JSON.parse(this.editorTextAreaEl.value);
	}

	protected _getStyleFromDiv(): ColorStyleWeak {
		let extraUnits: Units = {};
		try {
			const extraUnitsObj = this.extraUnitsInput.value && JSON.parse(this.extraUnitsInput.value);
			const isUnits = extraUnitsObj && !Object.keys(extraUnitsObj).some((key) => extraUnitsObj[key].length < 2);
			if (isUnits) extraUnits = extraUnitsObj;
			console.log('ExtraUnits: incorrect object');
		} catch (e) {
			console.log('ExtraUnits: parsing error: ', e);
		}

		const style: ColorStyleWeak = {
			parent: this.parentInput.value || 'base', // string;
			name: this.nameInput.value || undefined, //string;
			fill: this.fillSelect.value || undefined, //string;
			isolineColor: this.isolineColorSelect.value === 'custom' ? this.isolineColorInput.value : this.isolineColorSelect.value || undefined, //string;
			isolineText: this.isolineTextInput.checked, //boolean;
			vectorType: this.vectorTypeSelect.value || undefined, //string;
			vectorColor: this.vectorColorSelect.value === 'custom' ? this.vectorColorInput.value : this.vectorColorSelect.value || undefined, //string;
			vectorFactor: +this.vectorFactorInput.value, //number;
			streamLineColor: this.streamLineColorVisibleInput.checked ? this.streamLineColorInput.value : 'none', //string;
			streamLineSpeedFactor: +this.streamLineSpeedFactorInput.value, //number;
			streamLineStatic: this.streamLineStaticInput.checked, //boolean;
			showBelowMin: this.showBelowMinInput.checked, //boolean;
			showAboveMax: this.showAboveMaxInput.checked, //boolean;
			colorScheme: this.colorSchemeSelect.value, //string;
			// colors?:, // string[];
			// colorMap?:, // [number, string][];
			// levels?:, // number[];
			blurRadius: +this.blurRadiusInput.value, //number;
			addDegrees: +this.addDegreesInput.value, //number;
			units: this.unitsInput.value, //string;
			extraUnits, // Units; //{ [name: string]: [string, number, ?number] };
			mask: this.maskSelect.value, // string;
		};

		return style;
	}

	setStyle(style: ColorStyleWeak): void {
		this.editorTextAreaEl.value = JSON.stringify(style, null, 2);
		this.parentInput.value = style.parent || ''; // string;
		this.nameInput.value = style.name || ''; //string;
		this.fillSelect.value = style.fill || ''; //string;
		this.isolineColorSelect.value = style.isolineColor || ''; //string;
		this.isolineTextInput.checked = style.isolineText || false; //boolean;
		this.vectorTypeSelect.value = style.vectorType || ''; //string;
		this.vectorColorSelect.value = style.vectorColor || ''; //string;
		this.vectorFactorInput.value = style.vectorFactor?.toString() || '1'; //number;
		this.streamLineColorVisibleInput.checked = style.streamLineColor !== 'none'; //boolean;
		this.streamLineColorInput.value = style.streamLineColor || ''; //string;
		this.streamLineSpeedFactorInput.value = style.streamLineSpeedFactor?.toString() || '1'; //number;
		this.streamLineStaticInput.checked = style.streamLineStatic || false; //boolean;
		this.showBelowMinInput.checked = style.showBelowMin || false; //boolean;
		this.showAboveMaxInput.checked = style.showAboveMax || false; //boolean;
		this.colorSchemeSelect.value = style.colorScheme || ''; //string;
		// colors?:, // string[];
		// colorMap?:, // [number, string][];
		// levels?:, // number[];
		this.blurRadiusInput.value = style.blurRadius?.toString() || '0'; //number;
		this.addDegreesInput.value = style.addDegrees?.toString() || '0'; //number;
		this.unitsInput.value = style.units || ''; //string;
		this.extraUnitsInput.value = JSON.stringify(style.extraUnits, null, 2); // Units; //{ [name: string]: [string, number, ?number] };
		this.maskSelect.value = style.mask || ''; // string;
	}

	protected _onDivChange(): void {
		// update text
		const style = this.getStyle();
		this.editorTextAreaEl.value = JSON.stringify(style, null, 2);
		this.onchange?.(this.getStyle());
	}
	protected _onTextChange(): void {
		// update div
		const style = this._getStyleFromTextArea();
		this.setStyle(style);
		this.onchange?.(this.getStyle());
	}
}

function checkExtraUnits(units: Units): boolean {
	return Object.keys(units).every((key) => {
		return units[key].length > 1;
	});
}
